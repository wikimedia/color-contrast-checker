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
async function runAccessibilityCheck( browser, url, stylesheet = null, title, includeScreenshots ) {
	let page;
	const pending = setInterval(() => {
		console.log(`	⏳ Still checking contrast on ${url}`);
	}, 5000);

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

	const checkContrast = async ( type, title ) => {
		// Run axe on the page
		console.time(`	Axe ran successfully for page ${title}:`);
		const results = await page.evaluate( () => {
			axe.cleanup();
			return axe.run( {
				runOnly: {
					type: 'rule',
					values: ['color-contrast']
				}
			} );
		} );
		console.timeEnd(`	Axe ran successfully for page ${title}:`);
		// Filter violations based on id
		const colorContrastViolation = results.violations.find(
			violation => violation.id === 'color-contrast'
		);

		// Log the specific violation or null if not found
		if ( colorContrastViolation ) {
			const anotherPage = await newPage( browser, url );
			if ( includeScreenshots ) {
				const urlObject = new URL( url );
				const screenshotBasePath = path.join( __dirname, '../report/screenshots/', urlObject.host, type );

				if (!fs.existsSync(screenshotBasePath)){
					fs.mkdirSync(screenshotBasePath, { recursive: true } );
				}

				for ( const node of colorContrastViolation.nodes ) {
					const index = colorContrastViolation.nodes.indexOf( node );
					const screenshotFilename = title + '-' + index + '.png';
					const screenshotFilePath = path.join( screenshotBasePath, screenshotFilename );
					try {
						const element = await page.$( node.target[0] );
						await element.screenshot( { path: screenshotFilePath } );
						await page.screenshot( {  fullPage: true, path:  path.join( screenshotBasePath, title + '.png' ) } );
						colorContrastViolation.nodes[ index ].screenshot = path.relative ( __dirname, screenshotFilePath );
					} catch( err ) {
						console.error( `	📸 Error creating screenshot. ${screenshotFilePath}` );
					}
				}
			}

			// Array to store nodeDetails
			const nodeDetailsArray = await Promise.all(
				colorContrastViolation.nodes.map( async ( node ) => {
					let selector = node.target.join( ', ' );
					try {
						selector = await decorateSelector( anotherPage, selector );
					} catch ( e ) {
						// pass
						console.log('(Error decorating selector)')
					}
					return {
						context: node.html,
						selector,
						title: title,
						type: type,
						failureSummary: node.failureSummary,
						screenshot: ( node.screenshot ) ? node.screenshot.replace( '../report/', '') : null
					};
				} )
			);

			clearTimeout( pending );
			console.error( `	✖️ Color contrast violation found on ${url} (${type}).` );
			// Return the array of nodeDetails if it exists
			return nodeDetailsArray.length > 0 ? nodeDetailsArray : null;
		} else {
			clearTimeout( pending );
			console.log( `	\x1b[32m✔️ No color contrast violation found on ${url} (${type}).\x1b[0m` );
			return false;
		}
	};
	let result = [];
	try {
		pagesScanned++;
		console.log(`	🌞 Checking standard theme...${pagesScanned}`);
		const day = await checkContrast( 'default', title );
		if ( day === false ) {
			noColorContrastViolationCount++;
		} else {
			colorContrastViolationCount++;
		}
		await page.evaluate( () => {
			document.documentElement.classList.remove( 'skin-theme-clientpref-day', 'skin-theme-clientpref--excluded' );
			document.documentElement.classList.add('skin-theme-clientpref-night')
		} );
		console.log(`	🌚 Checking dark theme...${pagesScanned}`);
		const night = await checkContrast( 'dark', title );
		if ( night === false ) {
			noColorContrastViolationCountDark++;
		} else {
			colorContrastViolationCountDark++;
		}
		console.log(`Finished.`);
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

async function runAccessibilityChecksForURLs( project, query, mobile, source, limit, sleepDuration = 5000, addBetaClusterStyles = false, includeScreenshots = false ) {
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
			return await runAccessibilityCheck( browser, testCase.url, styleUrl, testCase.title, includeScreenshots );
		} catch ( e ) {
			console.log( `Failed to run accessibility check on ${test.url}` );
			return Promise.resolve( [ null, null ] );
		}
	} );

	console.log('Compiling results...');
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
					pageUrl: `${testCase.url}${queryOverride}`,
					title: testCase.title,
					type: node.type,
					screenshot: node.screenshot,
					message: node.failureSummary
				} ) );

				console.log( `Result for URL ${testCase.title}:`, {
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
			pagesScanned,
			includeScreenshots
		);
		// Writing HTML table to a file
		fs.writeFileSync( filePath, htmlTable );
		// Writing to CSV using the function from csvWriter.js
		writeSimplifiedListToCSV( allSimplifiedLists, `${file}.csv` );
	};

	console.log('Writing report 1...');
	writeColorContrastReport(
		'light',
		noColorContrastViolationCount,
		colorContrastViolationCount,
		allResults.map( ( a ) => a[ 0 ] ),
		''
	);
	console.log('Writing report 2...');
	writeColorContrastReport(
		'night',
		noColorContrastViolationCountDark,
		colorContrastViolationCountDark,
		allResults.map( ( a ) => a[ 1 ] ),
		'?vectornightmode=1&minervanightmode=1'
	);
	console.log('Copy remaining files.');
	fs.copyFileSync( 'scripts/collapsible.js', 'report/collapsible.js' );
	fs.copyFileSync( 'scripts/summarizer.js', 'report/summarizer.js' );
}

// Export the function
module.exports = {
	runAccessibilityChecksForURLs,
};
