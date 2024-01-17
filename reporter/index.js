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
    if ( text.indexOf( '#cite_note' ) === 0 ) {
        return '#cite_note* [[phab:TBC]]';
    } else if ( text.indexOf( '#CITEREF' ) === 0 ) {
        return '#CITEREF* [[phab:TBC]]';
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
            // ignore any errors that only impact one selector.
            if ( number < 2 ) {
                return;
            }
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