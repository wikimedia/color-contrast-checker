const puppeteer = require( 'puppeteer' );
const axeCore = require( 'axe-core' );
const { createTestCases } = require( './topArticles' );
const { writeSimplifiedListToCSV } = require( './csvWriter' );
const { generateHTMLPage } = require( './htmlGenerator' ); // Import the generateHTMLTable function
const fs = require( 'fs' );
const path = require( 'path' );

async function runAccessibilityCheck( url ) {
	const browser = await puppeteer.launch();
	const page = await browser.newPage();

	try {
		await page.goto( url );

		// Inject axe-core script into the page.
		await page.evaluate( axeCore.source );

		// Run axe on the page.
		const results = await page.evaluate( () => axe.run() );

		// Filter violations based on id.
		const colorContrastViolation = results.violations.find(
			( violation ) => violation.id === 'color-contrast'
		);

		// Log the specific violation or null if not found.
		if ( colorContrastViolation ) {
			console.error( 'Color contrast violation found' );

			// Array to store nodeDetails.
			const nodeDetailsArray = colorContrastViolation.nodes.map( ( node ) => ( {
				context: node.html,
				selector: node.target.join( ', ' ),
			} ) );

			// Return the array of nodeDetails if it exists.
			return nodeDetailsArray.length > 0 ? nodeDetailsArray : null;
		} else {
			console.log( 'No color contrast violation found.' );
		}

		// Return the specific violation or null if not found.
		return colorContrastViolation || null;
	} finally {
		// Close the browser
		await browser.close();
	}
}

// Wrap the code in an async function
async function runAccessibilityChecksForURLs() {
	try {
		// Example usage:
		const testCases = await createTestCases();

		// Run accessibility checks for each URL concurrently.
		const accessibilityChecks = testCases.map( ( testCase ) =>
			runAccessibilityCheck( testCase.url )
		);

		// Wait for all checks to complete
		const results = await Promise.all( accessibilityChecks );

		// Handle the results (each result corresponds to one URL).
		const allSimplifiedLists = [];
		results.forEach( ( result, index ) => {
			const testCase = testCases[index]; // Access the current object in testCases
			if ( result ) {
				const simplifiedList = result.map( ( node ) => ( {
					selector: node.selector,
					context: node.context,
					pageUrl: testCase.url, // Accessing the url property of the current object
					title: testCase.title
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
		const htmlTable = generateHTMLPage( allSimplifiedLists.flat() );

		// Writing HTML table to a file
		const filePath = path.join( __dirname, '../report/index.html' ); // Full path to the desired location
		fs.writeFileSync( filePath, htmlTable );

		// Writing to CSV using the function from csvWriter.js
		writeSimplifiedListToCSV( allSimplifiedLists );

	} catch ( error ) {
		console.error( 'Error during accessibility checks:', error );
	}
}

// Call the async function.
runAccessibilityChecksForURLs();
