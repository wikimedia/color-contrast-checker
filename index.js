const puppeteer = require( 'puppeteer' );
const fs = require( 'fs' );
const path = require( 'path' );
const { program } = require( 'commander' );
const { runAccessibilityChecksForURLs } = require( './modules/accessibility.test.js' );

// Main function to run the application
async function main( options ) {
	console.time( 'Application ran successfully.' );
	try {
		// Run accessibility checks and generate reports
		await runAccessibilityChecksForURLs( options.project,
			options.query, options.mobile, options.source, options.limit,
			parseInt( options.zleep, 10 ),
			options.alpha
		);

		console.timeEnd( 'Application ran successfully.' );
	} catch ( error ) {
		console.error( 'An error occurred:', error );
	}
}

const projectOpt = [
	'-p, --project <project>',
	'Project to run color contrast checker on. Defaults to en.wikipedia',
	'en.wikipedia'
];

const queryOpt = [
	'-q, --query <query>',
	'Query string to apply to all URLs'
];

const mobileOpt = [
	'-m, --mobile',
	'Force mobile mode'
];

const sourceOpt = [
	'-s, --source <query>',
	'Either "random", "static" or "pageviews"',
	'pageviews'
];

const limitOpt = [
	'-l, --limit <query>',
	'Default: 100',
	'100'
];

const sleepOpt = [
	'-z, --zleep <duration>',
	'Default: 5000',
	'5000'
];

const alphaOpt = [
	'-a, --alpha',
	'Forces the addition of alpha styles from the beta cluster.'
];

program
	.description( 'Welcome to the pixel CLI to perform visual regression testing' )
	.option( ...projectOpt )
	.option( ...queryOpt )
	.option( ...mobileOpt )
	.option( ...sourceOpt )
	.option( ...limitOpt )
	.option( ...sleepOpt )
	.option( ...alphaOpt )
	.requiredOption( ...projectOpt )
	.action( async ( opts ) => {
		main( opts );
	} );
program.parse();
