const fs = require( 'fs' );
const path = require( 'path' );
const mustache = require( 'mustache' );

// Define a custom function to escape HTML.
function escapeHTML( text ) {
	return text.replace( /</g, '&lt;' ).replace( />/g, '&gt;' );
}

function generateHTMLPage( file, simplifiedLists, noColorContrastViolationCount, colorContrastViolationCount, pagesScanned, mobile, type ) {
	try {
		// Read the template file.
		const templatePath = path.join( __dirname, '../views/template.mustache' );
		const template = fs.readFileSync( templatePath, 'utf8' );

		// Organize items by pageURL.
		const groupedItems = simplifiedLists.reduce( ( acc, item ) => {
			if ( !acc[item.pageUrl] ) {
				acc[item.pageUrl] = [];
			}
			acc[item.pageUrl].push( item );
			return acc;
		}, {} );

		// Generate separate tables for each pageURL.
		const tableSections = Object.keys( groupedItems ).map( pageUrl => {
			const items = groupedItems[pageUrl].map( item => `
				<tr>
					<td>${item.selector}</td>
					<td>${escapeHTML( item.context )}</td>
					<td><img src="${item.screenshot}"/></td>
				</tr>
			`).join( '' );
			const totalItemsForPageUrl = groupedItems[pageUrl].length;
			const pageTitle = groupedItems[pageUrl][0].title; // Assuming title is present in all items

			return `
				<h2 class="collapsible"><a href="${pageUrl}">${pageTitle}</a> - Total Errors: ${totalItemsForPageUrl}</h2>
				<table>
					<thead>
						<tr>
							<th>Selector</th>
							<th>Context</th>
							<th>Screenshot</th>
						</tr>
					</thead>
					<tbody>
						${items}
					</tbody>
				</table>
			`;
		} ).join( '' );

		// Calculate total number of items.
		const totalItems = simplifiedLists.length;

		const passingPages = noColorContrastViolationCount;

		const failingPages = colorContrastViolationCount;

		// Render the template with dynamic content
		const htmlContent = mustache.render( template, {
			pageTitle: "Wikipedia Color Contrast Errors",
			pagesScanned: pagesScanned,
			totalItems: totalItems,
			tableSections: tableSections,
			passingPages: passingPages,
			failingPages: failingPages
		} );

		// Determine the output directory based on the location of the script.
		const outputDir = path.join( __dirname, '../report' );

		// Check if the directory exists, if not create it recursively.
		if ( !fs.existsSync( outputDir ) ) {
			fs.mkdirSync( outputDir, { recursive: true } );
		}

		// Write the generated HTML to the specified path.
		const outputPath = path.join( outputDir, `${file}.html` );
		fs.writeFileSync( outputPath, htmlContent );

		console.log( `HTML page generated successfully at ${outputPath}` );

		return htmlContent;
	} catch ( error ) {
		console.error( 'Error generating HTML page:', error );
		throw error; // Rethrow the error to propagate it upwards.
	}
}

module.exports = {
	generateHTMLPage
};
