module.exports = async ( page, selector ) => {
	await page.waitForFunction( 'typeof $ !== "undefined"' );
	const newSelector = await page.evaluate( async ( selectorString ) => {
		const injectClass = ( str, classSelector, hasStyle ) => {
			const styleSuffix = hasStyle ? '[style]' : '';
			let prefix = '';
			let suffix = '';
			if ( str.indexOf( ']' ) > -1 ) {
				const tmp = str.split( ']' );
				prefix = `${tmp[0]}]`;
				suffix = tmp[1];
			} else if ( str.indexOf( ':' ) > -1 ) {
				const tmp = str.split( ':' );
				prefix = tmp[0];
				suffix = `:${tmp[1]}`;
			} else {
				prefix = str;
			}
			return `${prefix}${classSelector}${suffix}${styleSuffix}`;
		};
		const selector = selectorString.split( ' > ' ).map( ( selector ) => {
			selector = selector.trim();
			if ( selector.indexOf('#') === 0 ) {
				// rewrite as [id=""] - these are more compatible with non-standard IDs we
				// find in Wikipedia articles.
				return `[id='${selector.slice(1)}']`;
			} else {
				return selector;
			}
		});
		try {
			let node = $( selector.join( ' > ' ).replace( '$', '\$' ) )[ 0 ];
			if ( !node ) {
				// If we can't find the node, no point in putting it in the results
				return '';
			}
			let j = selector.length - 1;
			while ( node && node.id !== 'mw-content-text' ) {
				const newSelector = ( node.getAttribute( 'class' ) || '' ).split( ' ' ).join( '.' );
				const hasStyle = node.hasAttribute( 'style' );
				const hasColorStyle = hasStyle && node.getAttribute( 'style' ).match(/(color|background|border)/g);
				if ( newSelector && j > -1 ) {
					selector[j] = injectClass( selector[j], `.${newSelector}`, !!hasColorStyle );
				}
				if ( j < 0 ) {
					selector.unshift(
						injectClass( node.tagName.toLowerCase(), newSelector ? `.${newSelector}` : '', !!hasColorStyle )
					);
				}
				j--;
				node = node.parentNode;
			}
		} catch ( e ) {
			selector.push ( `/* failed to decorate ${e} */` );
		}
		return selector.join( ' > ' );
	}, selector );
	return newSelector
};