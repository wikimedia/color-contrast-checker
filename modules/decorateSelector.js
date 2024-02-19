module.exports = async ( page, selector ) => {
	await page.waitForFunction( 'typeof $ !== "undefined"' );
	const newSelector = await page.evaluate( async ( selectorString ) => {
		const injectClass = ( str, classSelector, hasStyle, hasBgColor ) => {
			const styleSuffix = hasStyle ? '[style]' : '';
			const bgSuffix = hasBgColor ? '[bgcolor]' : '';
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
			return `${prefix}${classSelector}${suffix}${styleSuffix}${bgSuffix}`;
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
			while ( node && node.id !== 'mw-content-text' && node.nodeType !== 9 ) {
				const newSelector = ( node.getAttribute( 'class' ) || '' ).split( ' ' ).join( '.' );
				const hasStyle = node.hasAttribute( 'style' );
				const hasBgColor = node.hasAttribute( 'bgcolor' );
				const hasColorStyle = hasStyle && node.getAttribute( 'style' ).match(/(color|background|border)/g);
				if ( newSelector && j > -1 ) {
					selector[j] = injectClass( selector[j], `.${newSelector}`, !!hasColorStyle, hasBgColor );
				}
				if ( j < 0 ) {
					selector.unshift(
						injectClass( node.tagName.toLowerCase(), newSelector ? `.${newSelector}` : '', !!hasColorStyle, hasBgColor )
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