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

    if ( text.match( /\[style\].*\.reference > a/ ) ) {
        return 'Reference link inside element with [style] styling [[phab:TBC]]';
    } else if ( text.match( /\.alternance/ ) ) {
        return '.alternance [[phab:TBC]]';
    } else if ( text.match( /table\.sidebar/ ) ) {
        return 'table.sidebar template [[phab:TBC]]';
    // e.g. https://en.wikipedia.org/wiki/Portal%3ACurrent_events
    } else if ( text.match( /\.(current-events-sidebar)/ ) ) {
        return 'current-events-sidebar (portal pages) [[phab:TBC]]';
    // e.g. https://en.wikipedia.org/wiki/Pakistan
    } else if ( text.match( /\.(quotebox)/ ) ) {
        return '.quotebox [[phab:TBC]]';
    }
    else if ( text.match( /\.(hatnote)/ ) ) {
        return 'Problem involving .hatnote [[phab:TBC]]';
    }
    else if ( text.match( /\.(bandeau-container)/ ) ) {
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
        return 'Table with style attribute [[phab:TBC]]'
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
    } else if ( text.match( /(noprint|\.external|cite\.citation|\.nowrap|span\.ouvrage > span\.italique|\.reference-accessdate|small\.cachelinks)/ ) ) {
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
            const cols = row.split('...').map((col) => col.replace(/"/g, ''));
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
        selectorTableNode.classList.add( 'table-summary' );
        const row = document.createElement('tr');
        row.appendChild(
            makeColumn('selector', 'th' )
        );
        row.appendChild(
            makeColumn('total', 'th' )
        );
        selectorTableNode.appendChild(row);
        Object.keys(selectors).sort((a, b) => selectors[a] < selectors[b] ? 1 : -1).forEach((selector) => {
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