// Required modules
const puppeteer = require( 'puppeteer' );
const axeCore = require( 'axe-core' );
const { createTestCases } = require( './topArticles' );
const { writeSimplifiedListToCSV } = require( './csvWriter' );
const { generateHTMLPage } = require( './htmlGenerator' );
const fs = require( 'fs' );
const path = require( 'path' );
const decorateSelector = require( './decorateSelector' );

// Counters and variables
let noColorContrastViolationCount = 0;
let colorContrastViolationCount = 0;
let pagesScanned = 0;


async function newPage( browser, url ) {
	const page = await browser.newPage();
	await page.goto( url );
	return page;
}

// Function to run accessibility check on a given URL
async function runAccessibilityCheck( browser, url, stylesheet = null ) {
	let page;
	try {
		page = await newPage( browser, url );
		// Inject axe-core script into the page
		await page.evaluate( axeCore.source );
		if ( stylesheet ) {
			await page.addStyleTag({url: stylesheet})
		}

		// Run axe on the page
		const results = await page.evaluate( () => axe.run() );

		pagesScanned++;

		// Filter violations based on id
		const colorContrastViolation = results.violations.find(
			violation => violation.id === 'color-contrast'
		);

		// Log the specific violation or null if not found
		if ( colorContrastViolation ) {
			console.error( `Color contrast violation found on ${url}` );
			colorContrastViolationCount++;

			const anotherPage = await newPage( browser, url );
			// Array to store nodeDetails
			const nodeDetailsArray = await Promise.all(
				colorContrastViolation.nodes.map( async ( node ) => {
					const selector = await decorateSelector( anotherPage, node.target.join( ', ' ) );
					return {
						context: node.html,
						selector
					};
				} )
			);

			// Return the array of nodeDetails if it exists
			return nodeDetailsArray.length > 0 ? nodeDetailsArray : null;
		} else {
			console.log( `No color contrast violation found on ${url}.` );
			noColorContrastViolationCount++;
		}

		// Return the specific violation or null if not found
		return colorContrastViolation || null;
	} catch ( e ) {
		console.error( e );
	}
	if ( page ) {
		page.close();
	}
}

function sleep( time ) {
	return new Promise( ( resolve ) => {
		setTimeout( () => {
			resolve();
		}, time );
	} );
}

async function runAccessibilityChecksForURLs( project, query, mobile, source, limit, sleepDuration = 5000, addBetaClusterStyles = false ) {
	const testCases = await createTestCases( { project, query, mobile, source, limit } );

	// Run accessibility checks for each URL concurrently
	const browser = await puppeteer.launch( {
		args: ['--no-sandbox'],
		timeout: 60000
	} );
	const accessibilityChecks = testCases.map( async ( testCase, i ) => {
		// queue a query every 5s.
		await sleep( sleepDuration * i );
		try {
			console.log(`Run accessibility check ${i} on ${testCase.url}`);
			let styleUrl = null;
			if ( addBetaClusterStyles && mobile ) {
				styleUrl = 'https://en.wikipedia.beta.wmflabs.org/w/load.php?modules=skins.minerva.base.styles&only=styles';
			}
			return await runAccessibilityCheck( browser, testCase.url, styleUrl );
		} catch ( e ) {
			console.log( `Failed to run accessibility check on ${test.url}` );
			return Promise.resolve( null );
		}
	} );

	// Wait for all checks to complete
	const results = await Promise.all( accessibilityChecks );
	browser.close();

	// Handle the results (each result corresponds to one URL)
	const allSimplifiedLists = [];
	// First filter out failed runs then loop through the successful ones.
	results.forEach( ( result, index ) => {
		const testCase = testCases[index];
		if ( result ) {
			const simplifiedList = result.map( node => ( {
				selector: node.selector,
				context: node.context,
				pageUrl: testCase.url,
				title: testCase.title,
			} ) );

			console.log( `Result for URL ${testCase.url}:`, {
				simplifiedList,
				colorContrastErrorNum: simplifiedList ? simplifiedList.length : 0,
			} );

			allSimplifiedLists.push( simplifiedList );
		} else {
			console.log( `No result for URL ${testCase.url}` );
		}
	} );

	// Generating HTML table
	const htmlTable = generateHTMLPage(
		allSimplifiedLists.flat(),
		noColorContrastViolationCount,
		colorContrastViolationCount,
		pagesScanned
	);

	// Writing HTML table to a file
	const filePath = path.join( __dirname, '../report/index.html' );
	fs.writeFileSync( filePath, htmlTable );
	fs.copyFileSync( 'scripts/collapsible.js', 'report/collapsible.js' );
	fs.copyFileSync( 'scripts/summarizer.js', 'report/summarizer.js' );

	// Writing to CSV using the function from csvWriter.js
	writeSimplifiedListToCSV( allSimplifiedLists );
}

// Export the function
module.exports = {
	runAccessibilityChecksForURLs,
};
