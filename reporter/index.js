/** Click handler for toggles */
function toggleTable(name) {
    const content = document.getElementById(name);
    if (content.style.display === 'block') {
        content.style.display = 'none';
    } else {
        content.style.display = 'block';
    }
}

const app = document.getElementById('summary');

const createParagraph = (text) => {
    const reportNode = document.createElement( 'p' );
    reportNode.textContent = text;
    return reportNode;
};
const makeColumn = (text, tagName) => {
    let colNode = document.createElement(tagName||'td');
    colNode.textContent = text;
    return colNode;
};

const generalizeSelector = (text) => {
    if ( text.match( /a\.external/ ) ) {
        return 'a.external [[phab:TBC]]';
    } else if ( text.match( /\.wikitable.sortable/ ) ) {
        return 'Sortable wikitable [[phab:TBC]]';
    } else if ( text.match( /\.(bandeau-container)/ ) ) {
        return 'bandeau-container template [[phab:TBC]]';
    } else if ( text.match( /\.(autres-projets)/ ) ) {
        return 'Other projects template [[phab:TBC]]';
    } else if ( text.match( /\.navbox-abovebelow/ ) ) {
        return 'navbox related issue [phab:TBC]';
    } else if ( text.match( /table[^\ ]*\[style\]/ ) ) {
        return 'Table with style attribute [[phab:TBC]]';
    } else if ( text.indexOf( '#cite_note' ) > -1 ) {
        return '#cite_note* [[phab:TBC]]';
    } else if ( text.indexOf( '#CITEREF' ) > -1 ) {
        return '#CITEREF* [[phab:TBC]]';
    } else if ( text.match( /\.colonnes\.liste-simple:/ ) ) {
        return '.colonnes.liste-simple [[phab:TBC]]';
    } else if ( text.match( /\[style\]/ ) ) {
        return 'Undiagnosed style issue [[phab:TBC]]';
    } else if ( text.match( /table[: ]/ ) ) {
        return 'Undiagnosed table issue [[phab:TBC]]';
    } else {
        return text;
    }
};

fetch('simplifiedList.csv').then((r) => r.text())
    .then((text) => {
        const rows = text.split('\n');
        const selectors = {};
        const titles = {};
        rows.forEach((row, i) => {
            const cols = row.split(',').map((col) => col.replace(/"/g, ''));
            cols.forEach(( text, j ) => {
                if (i > 0) {
                    if ( j === 0 ) {
                        if ( !titles[text] ) {
                            titles[text] = 0;
                        }
                        titles[text]++;
                    } else if ( j ===1 ) {
                        const selector = generalizeSelector(text);
                        if ( !selectors[selector] ) {
                            selectors[selector] = 0;
                        }
                        selectors[selector]++;
                    }
                }
            } );
        })
        const selectorTableNode = document.createElement('table');
        const row = document.createElement('tr');
        row.appendChild(
            makeColumn('selector', 'th' )
        );
        row.appendChild(
            makeColumn('total', 'th' )
        );
        selectorTableNode.appendChild(row);
        Object.keys(selectors).forEach((selector) => {
            const row = document.createElement('tr');
            const number = selectors[selector];
            row.appendChild(
                makeColumn( selector )
            );
            row.appendChild(
                makeColumn( number )
            );
            selectorTableNode.appendChild(row);
        })
        app.appendChild(
            createParagraph( `The following table groups known issues.` )
        );
        app.appendChild(selectorTableNode);
        app.appendChild(
            createParagraph( `The following lists articles on a per page basis for investigation.` )
        );
    });