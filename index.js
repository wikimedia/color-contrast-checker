const puppeteer = require( 'puppeteer' );
const fs = require( 'fs' );
const path = require( 'path' );
const { runAccessibilityChecksForURLs } = require( './modules/accessibility.test.js' );

// Main function to run the application
async function main() {
	try {
		// Get the project name from command line arguments
		const args = process.argv.slice( 2 ); // Exclude 'node' and the script name
		const projectIndex = args.findIndex( arg => arg === '--project' );
		if ( projectIndex === -1 ) {
			throw new Error( 'Project name not provided. Usage: node index.js --project <projectName>' );
		}
		const project = args[projectIndex + 1];
		if ( !project ) {
			throw new Error( 'Project name not provided. Usage: node index.js --project <projectName>' );
		}

		// Run accessibility checks and generate reports
		await runAccessibilityChecksForURLs( project );

		console.log( 'Application ran successfully.' );
	} catch ( error ) {
		console.error( 'An error occurred:', error );
	}
}

// Call the main function to start the application
main();
