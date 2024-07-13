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
    colNode.innerHTML = text;
    return colNode;
};

const matches = {
    '\\.module-shortcutboxplain': 'module-shortcutboxplain',
    '\\.template-text-text': 'template-text-text',
    '\\.portal': '.portal',
    'cite\\.citation\\.web\\.cs1': 'cite.citation.web.cs1',
    '\\.reflist.references-column-count': '.reflist.references-column-count',
    '\\.location': '.location',
    '\\.vevent': '.vevent',
    '\\.ombox': '.ombox',
    '\\.ratingstable': '.ratingstable',
    '\\.boilerplate': '.boilerplate',
    '\\.description\\[lang': '.description[lang]',
    '\\.ext-discussiontools-init-replylink-buttons': 'ext-discussiontools-init-replylink-buttons',
    '\\.ext-discussiontools-init-timestamplink': 'ext-discussiontools-init-timestamplink [[phab:T369667]]',
    '\\.restrictiontemplate': '.restrictiontemplate',
    'blockquote\\.templatequote': 'blockquote.templatequote',
    '\\.fileinfotpl-type-information': 'fileinfotpl-type-information',
    '\\.txikipedia-handfont': 'txikipedia-handfont',
    '(\\.responsive-license-cc|\\.rlicense-text)': '.responsive-license-cc or .rlicense-text',
    '\\.hezkuntza_ikasleak': 'hezkuntza_ikasleak',
    'div\\.nounderlines': 'div.nounderlines',
    '\\.iamasinger-': '.iamasinger-*',
    '\\.keyboard-key': '.keyboard-key',
    '\\.txikipedia-izenburua': 'txikipedia-izenburua',
    '\\.mw-gallery-packed': '.mw-gallery-packed [[phab:T368353]]',
    "\\.ores-wp10-prediction": ".ores-wp10-prediction",
    '\\.multicol': '.multicol',
    '\\.modified-enhancement': '.modified-enhancement (last modified bar - false positive)',
    '\\.wikidata-snak': '.wikidata-snak',
    '\\.mw-templatedata-doc-wrap': '.mw-templatedata-doc-wrap',
    '\.main-box': '.main-box',
    'table\\.CdA': 'table.CdA',
    '\\.oo-ui-flaggedElement-progressive': '[[phab:T369666]]',
    '\\.mw-fr-reviewlink.flaggedrevs-pending': '[[phab:T369666]]',
    '\\.mw-babel': '[[phab:T369321]]',
    '.helpbox-content': '.helpbox-content',
    'div\.tech-header-tabs': 'div.tech-header-tabs',
    '.tech-header-intro': '.tech-header-intro',
    '.warning-message.warning': '.warning-message.warning',
    'font[color]': '.ambox-notice',
    '.ambox-notice': '.ambox-notice',
    '.ombox-content': '.ombox-content',
    'div\\[style\\] >': 'Inline style div[style] no classes',
    'div.rlicense-text': 'div.rlicense-text',
    '\.mw-highlight': 'Syntax highlight [[phab:T356956]]',
    '\.CategoryTreeSection': 'CategoryTreeSection [[phab:???]]',
    '\.flow-board': 'Flow [[phab:T357600]]',
    '\.template-pd-help-page': '.template-pd-help-page [[phab:???]]',
    '\.hatnote': '.hatnote [[phab:T357721]]',
    '\.dablink': 'color palette (.dablink) [[phab:T356427]]',
    '\.ambox': '.ambox [[phab:T357733]]',
    'div\.cytat': 'div.cytat',
    '\\.reference-cadre': '.reference-cadre',
    '\\.mbox-small': '.mbox-small',
    '\\.fileinfotpl-type-artwork': '.fileinfotpl-type-artwork',
    '\.p-current-events': '.p-current-events [[phab:T357717]]',
    '\.NavFrame\\.album': '.NavFrame\\.album',
    '\.NavFrame': '.NavFrame',
    '\\.cquote': '.cquote',
    '\\.cachelinks': '.cachelinks',
    '\.citation-needed-content': '\.citation-needed-content',
    '\.toccolours': '.toccolours',
    '\\.ilustracja-z-etykietami': '.ilustracja-z-etykietami',
    '\.bandeau-portail': '\.bandeau-portail',
    '\.standings-box': '.standings-box',
    '\\.excerpt': '.excerpt',
    '\\.plainlinks': '.plainlinks',
    '\\.hp-kop': '.hp-kop',
    '\\.autocomment': 'autocomment [[phab:T363878]]',
    '\\.VT.rellink': '.VT.rellink',
    '\\.portalbox': '.portalbox',
    '\\.languageicon': '.languageicon',
    '\\.(portal-bar-content|portal-bar)': '.portal-bar /.portal-bar-content',
    '\.BarChartTemplate': '.BarChartTemplate',
    '(div\.MainPageBG\.mp-box|\\.main-page-|\.main-wrapper|\.main-top|\.mp-|h2\.mp-h2|div\.mp-box|h1 \> \\[id\\=\'Welcome_to_Wikipedia)': 'Issue with main page (div.MainPageBG.mp-box) [[phab:T358010]]',
    '\.track-listing': '\.track-listing [[phab:T357730]]',
    '\.side-box': '\.side-box [[phab:T357726]]',
    '\.cs1-visible-error': '\.cs1-visible-error',
    '\.reflist.columns': '.reflist.columns',
    '\\.listaref': '.listaref',
    '\\.liste-horizontale': '.liste-horizontale',
    '\\.ilh-all': '.ilh-all',
    '\\.flexquote': '.flexquote',
    '\\.refbegin': '.refbegin',
    'div\\.mw-authority-control': 'div.mw-authority-control',
    'div\\.mw-references-wrap': 'div.mw-references-wrap',
    '\\.mw-kartographer-maplink': '.mw-kartographer-maplink',
    '\.listing-metadata': '.listing-metadata',
    '\\.sister-bar': '.sister-bar',
    'current-events-sidebar': 'current-events-sidebar (portal pages) [[phab:T358005]]',
    '\\.colonnes': '.colonnes.liste-simple [[phab:T358014]]',
    '\\.bandeau-container':'.bandeau-container [[phab:T358007]]',
    '\\.quotebox': '.quotebox [[phab:T357735]]',
    '\\.mw_metadata.collapsed': '.mw_metadata.collapsed',
    '\\.alternance': '.alternance [[phab:T358003]]',
    'wikitable\\.zebra': 'wikitable.zebra',
    '\\.shortcutbox': '.shortcutbox',
    '\\.rad': '.rad',
    '\\.bonita': '.bonita',
    '\\.annonce': '.annonce',
    '\\.need_ref': '.need_ref',
    'hintergrundfarbe8': 'hintergrundfarbe8',
    '\\.notheme': '.collapsed.notheme (issue in light theme as well)',
    '\\.minerva-header': 'minerva-header (false positive)',
    '\\[style\\].*\\.reference > a': 'Reference link inside element with [style] styling [[phab:T358000]]',
    '\\.commons-file-information-table': '.commons-file-information-table',
    'table\.sidebar': 'table.sidebar template [[phab:T358004]]',
    '\\.(infobox|infobox_v2)': 'infobox related issue [[phab:T357453]]',
    '\\.(navbox-even|navbox|navbox-abovebelow|navbox-title)': 'navbox related issue [[phab:T358012]]',
    'table.wikitable.plainrowheaders': 'table.wikitable.plainrowheaders',
    'table.wikitable.football-squad': 'table.wikitable.football-squad',
    '\\.wikitable\\.plainrowheaders': '.wikitable.plainrowheaders',
    '\\.mw-collapsed[^\\.]*\\[style\\]': '.mw-collapsed[style]',
    '\\.thumb.*\\[style\\]': 'thumb with [style]',
    '\\.(autres-projets|tpl-sisproj|sistersitebox|sisterproject)': 'Other projects template (.autres-projets or .tpl-sisproj or .sistersitebox) [[phab:T358016]]',
    '\\.wikitable[^\\.]*\\[style\\]': 'wikitable[style]',
    '\\.thumbcaption.*\\[style\\]': 'thumbcaption[style]',
    '\\.global-nav': '.global-nav',
    '\\[bgcolor': 'using HTML4 bgcolor attribute',
    "tr[^\\.]*\\[style]": "tr with [style]",
    "\\.mw-made-collapsible[^\\.]*\\[style]": ".mw-made-collapsible with [style]",
    "\\.jquery-tablesorter.*\\[style]": ".jquery-tablesorter with [style]",
    "\\.sortable.*\\[style]": ".sortable with [style]",
    "span[^\\.]*\\[style]": "span with [style]",
    'div.noprint[style]': 'Div with style attribute [[phab:T357585]]',
    "th[^\\.]*\\[style]": "th with [style]",
    'table\\[^\. \\]*\\[style\\]': 'Table with style attribute [[phab:T357585]]',
    'table[^\\.]*\\[style\\]': 'Table with style attribute [[phab:T357585]]'
}

const generalizeSelector = (text) => {
    for ( var regex in matches ) {
        if ( text.match( new RegExp( regex ) ) ) {
            return matches[regex];
        }
    }
    return text;
};

const csv = location.pathname.split('/').slice(-1)[0].replace( '.html', '.csv');
fetch(csv).then((r) => r.text())
    .then((text) => {
        const rows = text.split('\n');
        const selectors = {};
        const titles = {};
        rows.forEach((row, i) => {
            const cols = row.split('...').map((col) => col.replace(/"/g, ''));
            cols.forEach(( text, j ) => {
                if ( text.indexOf( '/* failed to decorate' ) > -1 || text.indexOf( ':root' ) > -1 ) {
                    return;
                }
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
                makeColumn( selector.replace(/\[\[phab:(.*)\]\]$/g, '<a href="https://phabricator.wikimedia.org/$1">$1</a>' ) )
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
