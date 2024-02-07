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
// Use two days ago to avoid 404 (there are sometimes delays in generating the stats)
oneDayAgo.setDate( oneDayAgo.getDate() - 2 );

// Retrieve the top Wikipedia articles using the Wikimedia API.
async function getTopWikipediaArticles( project, limit = 1 ) {
	const endpoint = `https://wikimedia.org/api/rest_v1/metrics/pageviews/top/${project}/all-access/${getFormattedDate( oneDayAgo )}`;

	try {
		const response = await fetch( endpoint );

		if ( response.ok ) {
			const data = await response.json();
			const articles = data.items[0].articles.slice( 0, limit );
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
/**
 * @param {Object} options
 * @param {string} [options.project]
 * @param {string} [options.query]
 * @param {string} [options.mobile]
 * @return {array}
 */
async function createTestCases( options = {
	mobile: true,
	project: 'en.wikipedia',
	query: ''
} ) {
	const { project, mobile } = options;
	const topArticles = await Promise.all(
		[
			getTopWikipediaArticles( project, 100 )
		]
	);
	const examples = require( './examples.json' );
	const STATIC_TEST_SET = ( examples[ project ] || [] ).map(
		( example ) => Object.assign( {}, example, {
			project: `https://${project}.org`
		} )
	);

	if ( !topArticles ) {
		console.error( 'Failed to fetch top articles.' );
		return null;
	}

	// Use the production URL directly
	const query = options.query ? `?${options.query}` : '';
	const testCases = topArticles.flat( 1 ).concat( STATIC_TEST_SET ).map( ( article ) => {
		let host = article.project.replace( /https:\/\/([^\.]*)\.wiki/, 'https://$1.wiki' );
		if ( mobile ) {
			host = host.replace( /https:\/\/([^\.]*)\.wiki/, 'https://$1.m.wiki' );
		}
		const encodedTitle = encodeURIComponent( article.article );
		const url = `${host}/wiki/${encodedTitle}${query}`;
		return { url, title: article.article, query };
	} );

	return testCases;
}

// createTestCases();
module.exports = { createTestCases };
