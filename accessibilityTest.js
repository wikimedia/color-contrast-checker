// accessibility-check.js
const puppeteer = require( 'puppeteer' );
const axeCore = require( 'axe-core' );

async function runAccessibilityCheck( url ) {
	const browser = await puppeteer.launch();
	const page = await browser.newPage();

	try {
		await page.goto( url );

		// Inject axe-core script into the page
		await page.evaluate( axeCore.source );

		// Run axe on the page
		const results = await page.evaluate( () => axe.run() );

		// Filter violations based on id
		const colorContrastViolation = results.violations.find( violation => violation.id === 'color-contrast' );

		// Log the specific violation or null if not found
		if ( colorContrastViolation ) {
			console.error( 'Color contrast violation found:', colorContrastViolation );

			colorContrastViolation.nodes.forEach( ( node, index ) => {
				console.log( `Details for Node ${index + 1}:`, node );
			} );
		} else {
			console.log( 'No color contrast violation found.' );
		}

		// Return the specific violation or null if not found
		return colorContrastViolation || null;
	} finally {
		// Close the browser
		await browser.close();
	}
}

// Export the function
module.exports = runAccessibilityCheck;
