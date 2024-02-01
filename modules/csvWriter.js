const fs = require( 'fs' );
const path = require( 'path' );

function writeSimplifiedListToCSV( simplifiedLists ) {
	const allData = simplifiedLists.reduce( ( acc, list ) => {
		if ( list && list.length > 0 ) {
			acc.push( ...list );
		}
		return acc;
	}, [] );

	if ( allData.length > 0 ) {
		// Use "..." as a delimiter so it doesn't interfere with "," which may appear in certain selectors.
		const csvContent = allData.map( entry => `${entry.pageUrl}...${entry.selector}...${entry.context}` ).join( '\n' );
		const directoryPath = path.join( __dirname, '../report' ); // Go up two levels
		const filePath = path.join( directoryPath, 'simplifiedList.csv' );

		fs.writeFileSync( filePath, csvContent );
		console.log( `CSV file generated with all simplified lists` );
	} else {
		console.log( `No simplifiedList data to write` );
	}
}

module.exports = {
	writeSimplifiedListToCSV
};
