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
	const articles = [];
	let remaining = limit;
	let offset = 0;

	while ( remaining > 0 ) {
		const batchSize = remaining > 500 ? 500 : remaining;
		const endpoint = `https://wikimedia.org/api/rest_v1/metrics/pageviews/top/${project}/all-access/${getFormattedDate( oneDayAgo )}?limit=${batchSize}&offset=${offset}`;

		try {
			const response = await fetch( endpoint );

			if ( response.ok ) {
				const data = await response.json();
				const batchArticles = data.items[0].articles.slice( 0, batchSize );
				articles.push( ...batchArticles );
				remaining -= batchSize;
				offset += batchSize;
			} else {
				console.error( `Error: ${response.status}` );
				break;
			}
		} catch ( error ) {

			// eslint-disable-next-line no-console
			console.error( 'Error:', error );
			break;
		}
	}
	return articles.map( a => Object.assign( {}, a, {
		project: `https://${project}.org`
	} ) );
}

async function randomPages( project, limit ) {
	const endpoint = `https://${project}.org/w/api.php?action=query&format=json&prop=&list=random&formatversion=2&rnnamespace=0&rnlimit=${limit}`;

	try {
		const response = await fetch( endpoint );

		if ( response.ok ) {
			return response.json().then( ( r ) => {
				return r.query.random.map( ( page ) => ( {
					article: page.title,
					project: `https://${project}.org`
				} ) );
			} );
		}
	} catch ( error ) {
		return null;
	}
}

/**
 * 
 * @param {string} source
 * @param {string} project
 * @param {number} limit
 * @returns 
 */
const getPages = ( source, project, limit ) => {
	switch ( source ) {
		case 'random':
			return randomPages( project, limit );
		case 'static':
			const examples = require( './examples.json' );
			const STATIC_TEST_SET = ( examples[ project ] || [] ).map(
				( example ) => {
					return Object.assign( {}, example, {
						project: example.project || `https://${project}.org`
					} );
				}
			);
			return Promise.resolve( STATIC_TEST_SET );
		default:
			return getTopWikipediaArticles( project, limit );

	}
}

// Creates test cases based on the top Wikipedia articles obtained from getTopWikipediaArticles.
/**
 * @param {Object} options
 * @param {string} [options.project]
 * @param {string} [options.query]
 * @param {string} [options.mobile]
 * @param {string} [options.source]
 * @param {number} [options.limit]
 * @return {array}
 */
async function createTestCases( options = {
	mobile: true,
	project: 'en.wikipedia',
	query: '',
	source: 'pageviews',
	limit: 100
} ) {
	const { project, mobile, source, limit } = options;
	const topArticles = await Promise.all(
		[
			getPages( source, project, limit )
		]
	);

	if ( !topArticles ) {
		console.error( 'Failed to fetch.' );
		return null;
	}

	// Use the production URL directly
	const query = options.query ? `?${options.query}` : '';
	const testCases = topArticles.flat( 1 ).map( ( article ) => {
		let host = article.project.replace( /https:\/\/([^\.]*)\.wiki/, 'https://$1.wiki' );
		if ( mobile ) {
			if ( host.indexOf( 'www.' ) > -1 ) {
				host = host.replace( 'www.', 'm.' );
			} else {
				host = host.replace( /https:\/\/([^\.]*)\.wiki/, 'https://$1.m.wiki' );
			}
		}
		const encodedTitle = encodeURIComponent( article.article );
		const url = `${host}/wiki/${encodedTitle}${query}`;
		return { url, title: article.article, query };
	} );

	return testCases;
}

// Export the function
module.exports = { createTestCases };
