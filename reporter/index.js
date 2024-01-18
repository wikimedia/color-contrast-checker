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
    // only worry about content post parser output.
    const potext = text.split( '.mw-parser-output')[1] || '';
    if ( potext.indexOf('.') === -1 && potext.indexOf('[') === -1 ) {
        // the selector contains no classes or style attributes so must be a false positive
        return '';
    }

    if ( text.match( /\.mw-references-wrap/ ) ) {
        return 'mw-references-wrap [[phab:TBC]]';
    } else if ( text.match( /\[style\].*\.reference > a/ ) ) {
        return 'Reference link inside element with [style] styling [[phab:TBC]]';
    } else if ( text.match( /\.alternance/ ) ) {
        return '.alternance [[phab:TBC]]';
    } else if ( text.match( /table\.sidebar/ ) ) {
        return 'table.sidebar template [[phab:TBC]]';
    } else if ( text.match( /\.(bandeau-container)/ ) ) {
        return '.bandeau-container [[phab:TBC]]';
    } else if ( text.match( /\.(autres-projets)/ ) ) {
        return 'Other projects template (.autres-projets) [[phab:TBC]]';
    } else if ( text.match( /id='mp-/ ) ) {
        return 'main page template issue [phab:TBC]';
    } else if ( text.match( /\.(infobox|infobox_v2)/ ) ) {
        return 'infobox related issue [phab:TBC]';
    } else if ( text.match( /\.(navbox-even|navbox-abovebelow|navbox-title)/ ) ) {
        return 'navbox related issue [phab:TBC]';
    } else if ( text.match( /table[^\ ]*\[style\]/ ) ) {
        return 'Table with style attribute [[phab:TBC]]';
    } else if ( text.match( /id='cite_note/ ) ) {
        return '#cite_note* [[phab:TBC]]';
    } else if ( text.match( /[#=]CITEREF/ ) ) {
        return '#CITEREF* [[phab:TBC]]';
    } else if ( text.match( /sup.ext-phonos-attribution.noexcerpt.navigation-not-searchable > a/ ) ) {
        // Phonos false positive
        return '';
    } else if ( text.match( /\.colonnes/ ) ) {
        return '.colonnes.liste-simple [[phab:TBC]]';
    } else if ( text.match( /a\.mw-redirect/ ) ) {
        return 'a.mw-redirect [[phab:TBC]]';
    } else if ( text.match( /(table|\.wikitable)/ ) ) {
        return 'Undiagnosed table issue table or .wikitable [[phab:TBC]]';
    } else if ( text.match( /(noprint|\.external\.(text|free)|\.nowrap|span\.ouvrage > span\.italique)/ ) ) {
        // these are false positives and do not impact dark mode.
        return '';
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
            const cols = row.split('😱').map((col) => col.replace(/"/g, ''));
            cols.forEach(( text, j ) => {
                if (i > 0) {
                    if ( j === 0 ) {
                        if ( !titles[text] ) {
                            titles[text] = 0;
                        }
                        titles[text]++;
                    } else if ( j ===1 ) {
                        const selector = generalizeSelector(text);
                        if ( selector ) {
                            if ( !selectors[selector] ) {
                                selectors[selector] = 0;
                            }
                            selectors[selector]++;
                        }
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