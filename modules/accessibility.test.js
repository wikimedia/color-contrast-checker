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
let browser;

async function newPage( url ) {
	const page = await browser.newPage();
	await page.goto( url );
	return page;
}

// Function to run accessibility check on a given URL
async function runAccessibilityCheck( url ) {
	try {
		const page = await newPage( url );
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
			console.error( 'Color contrast violation found in:', url );
			colorContrastViolationCount++;

			const anotherPage = await newPage( url );
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
			console.log( 'No color contrast violation found in:', url );
			noColorContrastViolationCount++;
		}

		// Return the specific violation or null if not found
		return colorContrastViolation || null;
	} catch ( e ) {
		if ( e.name === 'TimeoutError' ) {
			console.error( 'Navigation timeout occurred for URL:', url );
			return null;
		} else {
			console.error( 'An error occurred during accessibility check:', e );
			throw e;
		}
	}
}

async function runAccessibilityChecksForURLs( project ) {

	try {
		const testCases = await createTestCases( { project } );

		if ( testCases.length === 0 ) {
			console.log( "No test cases found." );
			return;
		}

		browser = await puppeteer.launch( {
			args: ['--no-sandbox'],
			timeout: 60000
		} );

		const accessibilityChecks = testCases.map( async ( testCase ) =>
			await runAccessibilityCheck( testCase.url )
		);

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

				allSimplifiedLists.push( simplifiedList );
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
	} finally {
		if ( browser ) {
			await browser.close();
		}
	}
}

// Export the function
module.exports = {
	runAccessibilityChecksForURLs,
};
