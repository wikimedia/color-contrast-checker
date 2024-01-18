// WORK IN PROGRESS

const path = require( 'path' );
const fetch = require( 'node-fetch' );

/**
 * Returns a formatted date string in the "YYYY/MM/DD" format.
 *
 * @param {Date} date - The input date.
 * @return {string} The formatted date string.
 */

function getFormattedDate( date ) {
	const year = date.getFullYear();
// eslint-disable-next-line es-x/no-string-prototype-padstart-padend
	const month = ( date.getMonth() + 1 ).toString().padStart( 2, '0' );
// eslint-disable-next-line es-x/no-string-prototype-padstart-padend
	const day = date.getDate().toString().padStart( 2, '0' );
	return `${year}/${month}/${day}`;
}

const currentDate = new Date();
const oneDayAgo = new Date( currentDate );
oneDayAgo.setDate( oneDayAgo.getDate() - 1 );

// Retrieve the top Wikipedia articles using the Wikimedia API.
async function getTopWikipediaArticles( project, limit = 50 ) {
	const endpoint = `https://wikimedia.org/api/rest_v1/metrics/pageviews/top/${project}/all-access/${getFormattedDate( oneDayAgo )}`;

	try {
		const response = await fetch( endpoint );

		if ( response.ok ) {
			const data = await response.json();
			const articles = data.items[ 0 ].articles.slice( 0, limit );
			return articles.map( ( a ) => Object.assign( {}, a, {
				project: `https://${project}.org`
			} ) );
		} else {
// eslint-disable-next-line no-console
			console.error( `Error: ${response.status}` );
			return null;
		}
	} catch ( error ) {
// eslint-disable-next-line no-console
		console.error( 'Error:', error );
		return null;
	}
}

// Creates test cases based on the top Wikipedia articles obtained from getTopWikipediaArticles.
async function createTestCases() {
	const topArticles = await Promise.all(
		[
			getTopWikipediaArticles( 'en.wikipedia' ),
			getTopWikipediaArticles( 'fr.wikipedia' )
		]
	);
	const STATIC_TEST_SET = [
		{
			article: '81st_Golden_Globe_Awards',
			project: 'https://en.wikipedia.org'
		},
		{
			article: 'Saltburn_(film)',
			project: 'https://en.wikipedia.org'
		}
	];
	if ( !topArticles ) {
		console.error( 'Failed to fetch top articles.' );
		return null;
	}

	// Use the production URL directly
	const testCases = topArticles.flat( 1 ).concat( STATIC_TEST_SET ).map( ( article ) => {
		const encodedTitle = encodeURIComponent( article.article );
		return {
			name: `${encodedTitle}`,
			url: `${article.project}/wiki/${encodedTitle}`,
			actions: [],
			rules: ['Principle1.Guideline1_3.1_3_1_AAA'],
			// head: '<link rel="stylesheet" href="/path/to/your/stylesheet.css">'
		};
	} );

	return testCases;
}

module.exports = async () => {
	const testCases = await createTestCases();

	if ( !testCases ) {
		// Handle the case where test case creation fails
		return null;
	}

	const reportDir = process.env.LOG_DIR || path.join( process.cwd(), 'a11y/' );

	const namespace = 'SkinName';

	const defaults = {
		viewport: {
			width: 1200,
			height: 1080
		},
		runners: [ 'axe', 'htmlcs' ],
		includeWarnings: true,
		includeNotices: true,
		rootElement: '#bodyContent',
		chromeLaunchConfig: {
			headless: true,
			args: [ '--no-sandbox', '--disable-setuid-sandbox' ]
		},
		timeout: 600000
	};

	return {
		reportDir,
		namespace,
		defaults,
		tests: testCases
	};
};

// Specify test case.

// /**
//  * Creates a single test case with a predefined URL.
//  *
//  * @return {Object} The test case object.
//  */
// function createSpecificTestCase() {
// 	// Use the production URL directly
// 	const prodUrl = 'https://en.wikipedia.org/wiki/';
// 	const encodedTitle = encodeURIComponent( 'Cleopatra' ); // Replace with your specific title
// 	return {
// 		name: `Specific Test Case: ${encodedTitle}`,
// 		url: `${prodUrl}${encodedTitle}`,
// 		actions: []
// 	};
// }

// module.exports = async () => {
// 	const specificTestCase = createSpecificTestCase();

// 	const reportDir = process.env.LOG_DIR || path.join( process.cwd(), 'a11y/' );

// 	const namespace = 'SkinName';

// 	const defaults = {
// 		viewport: {
// 			width: 1200,
// 			height: 1080
// 		},
// 		runners: ['axe'],
// 		includeWarnings: true,
// 		includeNotices: true,
// 		rootElement: '#bodyContent',
// 		chromeLaunchConfig: {
// 			headless: false,
// 			args: ['--no-sandbox', '--disable-setuid-sandbox']
// 		},
// 		timeout: 600000
// 	};

// 	return {
// 		reportDir,
// 		namespace,
// 		defaults,
// 		tests: [specificTestCase]
// 	};
// };
