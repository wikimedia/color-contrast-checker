const puppeteer = require( 'puppeteer' );
const fs = require( 'fs' );
const path = require( 'path' );
const { program } = require( 'commander' );
const { runAccessibilityChecksForURLs } = require( './modules/accessibility.test.js' );

// Main function to run the application
async function main( options ) {
	try {
		// Run accessibility checks and generate reports
		await runAccessibilityChecksForURLs( options.project );

		console.log( 'Application ran successfully.' );
	} catch ( error ) {
		console.error( 'An error occurred:', error );
	}
}

const projectOpt = [
	'-p, --project <project>',
	'Project to run color contrast checker on. Defaults to en.wikipedia',
	'en.wikipedia'
];
program
	.description( 'Welcome to the pixel CLI to perform visual regression testing' )
	.option( ...projectOpt )
	.requiredOption( ...projectOpt )
	.action( async ( opts ) => {
		main( opts );
	} );
program.parse();
