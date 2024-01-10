const app = document.getElementById('report');

const tableNode = document.createElement('table');

const createParagraph = (text) => {
    const reportNode = document.createElement( 'p' );
    reportNode.textContent = text;
    return reportNode;
};
const makeColumn = (text, tagName, url) => {
    const colNode = document.createElement(tagName||'td');
    const child = document.createElement( url ? 'a' : 'span');
    if ( url ) {
        child.href = url;
    }
    child.textContent = text;
    colNode.appendChild(child);
    return colNode;
};
const generalizeSelector = (text) => {
    if ( text.indexOf( '#CITEREF' ) === 0 ) {
        return '#CITEREF*';
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
            const rowNode = document.createElement('tr');
            const cols = row.split(',').map((col) => col.replace(/"/g, ''));
            cols.forEach(( text, j ) => {
                rowNode.appendChild(
                    makeColumn(
                        text,
                        i === 0 ? 'th' : 'td',
                        j === 0 ? `https://en.wikipedia.org/wiki/${encodeURIComponent(text)}` : null
                    )
                );
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
            tableNode.appendChild(rowNode);
        })
        app.appendChild(
            createParagraph( `${rows.length - 1} total errors across ${Object.keys(titles).length} pages.` )
        );
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
            row.appendChild(
                makeColumn( selector )
            );
            row.appendChild(
                makeColumn( selectors[selector] )
            );
            selectorTableNode.appendChild(row);
        })
        app.appendChild(selectorTableNode);
        app.appendChild(tableNode);
    });