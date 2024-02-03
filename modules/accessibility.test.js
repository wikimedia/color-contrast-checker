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
async function runAccessibilityCheck( browser, url ) {
	let page;
	try {
		page = await newPage( browser, url );
		// Inject axe-core script into the page
		await page.evaluate( axeCore.source );

		// Run axe on the page
		const results = await page.evaluate( () => axe.run() );

		pagesScanned++;

		// Filter violations based on id
		const colorContrastViolation = results.violations.find(
			violation => violation.id === 'color-contrast'
		);

		// Log the specific violation or null if not found
		if ( colorContrastViolation ) {
			console.error( 'Color contrast violation found' );
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
			console.log( 'No color contrast violation found.' );
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

async function runAccessibilityChecksForURLs( project ) {

	try {
		const testCases = await createTestCases( { project } );

		// Run accessibility checks for each URL concurrently
		const browser = await puppeteer.launch( {
			args: ['--no-sandbox'],
			timeout: 60000
		} );
		const accessibilityChecks = testCases.map( async ( testCase, i ) => {
			// every 10 wait for 10s - this makes sure we don't hit ip rate limits.
			if ( i > 0 && i % 5 === 0 ) {
				await sleep( 10000 );
			}
			const result = await runAccessibilityCheck( browser, testCase.url );
			return result;
		} );

		// Wait for all checks to complete
		const results = await Promise.all( accessibilityChecks );
		browser.close();

		// Handle the results (each result corresponds to one URL)
		const allSimplifiedLists = [];
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
	} catch ( error ) {
		console.error( 'Error during accessibility checks:', error );
	}
}

// Export the function
module.exports = {
	runAccessibilityChecksForURLs,
};
