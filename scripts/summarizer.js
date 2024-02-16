(function () {
const app = document.getElementById('summary');
app.innerHTML = '';

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

const matches = {
    'div\.toc > div.toctitle': 'TOC [[phab:T357590]]',
    '\\.extiw': '.extiw [[phab:T356825]]',
    '.helpbox-content': '.helpbox-content',
    'div\.tech-header-tabs': 'div.tech-header-tabs',
    '.tech-header-intro': '.tech-header-intro',
    '.warning-message.warning': '.warning-message.warning',
    'font[color]': '.ambox-notice',
    '.ambox-notice': '.ambox-notice',
    '.ombox-content': '.ombox-content',
    'div\\[style\\] >': 'Inline style div[style] no classes',
    'div.rlicense-text': 'div.rlicense-text',
    '\.(mw-pt-languages|mw-pt-translate-header|mw-translate-fuzzy)': 'Language [[phab:T356821]]',
    '\.mw-highlight': 'Syntax highlight [[phab:T356956]]',
    '\.CategoryTreeSection': 'CategoryTreeSection [[phab:???]]',
    '\.flow-board': 'Flow [[phab:T357600]]',
    '\.template-pd-help-page': '.template-pd-help-page [[phab:???]]',
    '\.hatnote': '.hatnote [[phab:T357721]]',
    '\.dablink': 'color palette (.dablink) [[phab:T356427]]',
    '\.ambox': '.ambox [[phab:T357733]]',
    'div\.cytat': 'div.cytat',
    '\.p-current-events': '.p-current-events [[phab:T357717]]',
    '\.NavFrame': '.NavFrame',
    '\.citation-needed-content': '\.citation-needed-content',
    '\.toccolours': '.toccolours',
    '(div\.MainPageBG\.mp-box|h2\.mp-h2|div\.mp-box|h1 \> \\[id\\=\'Welcome_to_Wikipedia)': 'Issue with main page (div.MainPageBG.mp-box) [[phab:T356344]]',
    '\.track-listing': '\.track-listing [[phab:T357730]]',
    '\.side-box': '\.side-box [[phab:T357726]]',
    '\.cs1-visible-error.': '\.cs1-visible-error',
    'div.mw-references-wrap': 'div.mw-references-wrap',
    '(\.ext-discussiontools-init-replylink-buttons|\.ext-discussiontools-init-section-bar|\.autocomment|\.ext-discussiontools-init-timestamplink)': 'color-subtle (T357699)',
    '\.(autres-projets|\.tpl-sisproj|.sistersitebox)': 'Other projects template (.autres-projets or .tpl-sisproj or .sistersitebox) [[phab:TBC]]'
}

const generalizeSelector = (text) => {
    // only worry about content post parser output.
    const base = text.indexOf( 'section.mf-section-0' ) > text.indexOf( '.mw-parser-output' ) ?
        'section.mf-section-0' : '.mw-parser-output';
    const potext = text.split(base)[1] || '';
    
    if ( potext.indexOf('.') === -1 && potext.indexOf('[') === -1 ) {
        // the selector contains no classes or style attributes so must be a false positive
        return '';
    }


    for ( var regex in matches ) {
        if ( text.match( new RegExp( regex ) ) ) {
            return matches[regex];
        }
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
        return '.quotebox [[phab:T357735]]';
    } else if ( text.match( /\.(bandeau-container)/ ) ) {
        return '.bandeau-container [[phab:TBC]]';
    } else if ( text.match( /id='mp-/ ) ) {
        return 'main page template issue [phab:TBC]';
    } else if ( text.match( /\.(infobox|infobox_v2)/ ) ) {
        return 'infobox related issue [[phab:T357453]]';
    } else if ( text.match( /\.(navbox-even|navbox-abovebelow|navbox-title)/ ) ) {
        return 'navbox related issue [phab:TBC]';
    } else if ( text.match( /table[^\ ]*\[style\]/ ) ) {
        return 'Table with style attribute [[phab:T357585]]'
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
}());
