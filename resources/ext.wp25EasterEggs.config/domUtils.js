/**
 * Wait for an element to appear in the DOM.
 *
 * @param {string} selector
 * @return {Promise<HTMLElement|null>}
 */
const waitForElement = ( selector ) => new Promise( ( resolve ) => {
	if ( document.querySelector( selector ) ) {
		resolve( document.querySelector( selector ) );
		return;
	}

	/** @type {number|null} */
	let timeoutId = null;

	const observer = new MutationObserver( () => {
		if ( document.querySelector( selector ) ) {
			clearTimeout( timeoutId );
			resolve( document.querySelector( selector ) );
			observer.disconnect();
		}
	} );

	observer.observe( document.body, {
		childList: true,
		subtree: true
	} );

	timeoutId = setTimeout( () => {
		observer.disconnect();
		resolve( null );
	}, 10000 );
} );

/**
 * Create a new element and insert it into the DOM based on location and mode.
 *
 * @param {Object} properties
 * @param {string} properties.tag
 * @param {string} [properties.innerHTML]
 * @param {string} [properties.className]
 * @param {Object} location
 * @param {string|HTMLElement} location.element The reference element or selector.
 * @param {string} [location.mode] 'append', 'prepend', 'before', or 'after'.
 * @return {HTMLElement|undefined}
 */
const createElement = ( { tag, innerHTML, className }, { element, mode } ) => {
	const refElement = typeof element === 'string' ? document.querySelector( element ) : element;
	if ( !refElement ) {
		return;
	}

	const newTag = document.createElement( tag );
	if ( innerHTML ) {
		newTag.innerHTML = innerHTML;
	}
	if ( className ) {
		// eslint-disable-next-line mediawiki/class-doc
		newTag.className = className;
	}

	switch ( mode ) {
		case 'before':
			refElement.parentNode.insertBefore( newTag, refElement );
			break;
		case 'after':
			refElement.parentNode.insertBefore( newTag, refElement.nextSibling );
			break;
		case 'prepend':
			refElement.insertBefore( newTag, refElement.firstChild );
			break;
		case 'append':
		default:
			refElement.appendChild( newTag );
			break;
	}

	return newTag;
};

module.exports = { createElement, waitForElement };
