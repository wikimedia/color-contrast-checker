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
let noColorContrastViolationCountDark = 0;
let colorContrastViolationCountDark = 0;
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
	} catch ( e ) {
		console.error( e );
	}

	const checkContrast = async ( type ) => {
		// Run axe on the page
		const results = await page.evaluate( () => axe.run() );

		// Filter violations based on id
		const colorContrastViolation = results.violations.find(
			violation => violation.id === 'color-contrast'
		);

		// Log the specific violation or null if not found
		if ( colorContrastViolation ) {
			console.error( `Color contrast violation found on ${url} (${type}).` );
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
			console.log( `No color contrast violation found on ${url} (${type}).` );
			return false;
		}
	};
	let result = [];
	try {
		pagesScanned++;
		console.log('Checking standard theme...');
		const day = await checkContrast( 'default' );
		if ( day === false ) {
			noColorContrastViolationCount++;
		} else {
			colorContrastViolationCount++;
		}
		await page.evaluate( () => {
			document.documentElement.classList.remove( 'skin-theme-clientpref-day', 'skin-theme-clientpref--excluded' );
			document.documentElement.classList.add('skin-theme-clientpref-night')
		} );
		console.log('Checking dark theme...');
		const night = await checkContrast( 'dark' );
		if ( night === false ) {
			noColorContrastViolationCountDark++;
		} else {
			colorContrastViolationCountDark++;
		}
		result = [ day, night ];
	} catch ( e ) {
		console.error( e );
	}
	if ( page ) {
		page.close();
	}
	return result;
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
		args: [
			'--no-sandbox',
			'--disable-gpu',
			'--headless',
			'--disable-dev-shm-usage',
			'--disable-extensions',
			'--disable-plugins'
		],
		timeout: sleepDuration
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
			return Promise.resolve( [ null, null ] );
		}
	} );

	// Wait for all checks to complete
	const allResults = await Promise.all( accessibilityChecks );
	browser.close();

	const writeColorContrastReport = ( file, a, b, results, queryOverride = '' ) => {
		// Handle the results (each result corresponds to one URL)
		const allSimplifiedLists = [];
		// First filter out failed runs then loop through the successful ones.
		( results || [] ).forEach( ( result, index ) => {
			const testCase = testCases[index];
			if ( result ) {
				const simplifiedList = result.map( node => ( {
					selector: node.selector,
					context: node.context,
					pageUrl: `${testCase.url}${queryOverride ? `?${queryOverride}` : ''}`,
					title: testCase.title,
				} ) );

				console.log( `Result for URL ${testCase.article}:`, {
					simplifiedList,
					colorContrastErrorNum: simplifiedList ? simplifiedList.length : 0,
				} );

				allSimplifiedLists.push( simplifiedList );
			}
		} );
		const filePath = path.join( __dirname, `../report/${file}.html` );
		// Generating HTML table
		const htmlTable = generateHTMLPage(
			file,
			allSimplifiedLists.flat(),
			a,
			b,
			pagesScanned
		);
		// Writing HTML table to a file
		fs.writeFileSync( filePath, htmlTable );
		// Writing to CSV using the function from csvWriter.js
		writeSimplifiedListToCSV( allSimplifiedLists, `${file}.csv` );
	};
	writeColorContrastReport(
		'light',
		noColorContrastViolationCount,
		colorContrastViolationCount,
		allResults.map( ( a ) => a[ 0 ] ),
		query ? '' : ''
	);
	writeColorContrastReport(
		'night',
		noColorContrastViolationCountDark,
		colorContrastViolationCountDark,
		allResults.map( ( a ) => a[ 1 ] ),
		query ? '' : 'vectornightmode=1&minervanightmode=1'
	);

	fs.copyFileSync( 'scripts/collapsible.js', 'report/collapsible.js' );
	fs.copyFileSync( 'scripts/summarizer.js', 'report/summarizer.js' );
}

// Export the function
module.exports = {
	runAccessibilityChecksForURLs,
};
