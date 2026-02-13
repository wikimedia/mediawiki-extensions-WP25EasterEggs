const { createElement, waitForElement } = require( './domUtils.js' );

/**
 * Setup the extension header with description and links.
 *
 * @return {Promise<void>}
 */
const setupHeader = () => waitForElement( 'fieldset#EnableExtension' ).then( ( fieldset ) => {
	if ( !fieldset ) {
		return;
	}

	const headerSection = createElement( {
		tag: 'div',
		className: 'cdx-field'
	}, { mode: 'before', element: fieldset } );

	createElement( {
		tag: 'p',
		innerHTML: mw.message( 'communityconfiguration-wp25eastereggs-description' ).parse()
	}, { mode: 'append', element: headerSection } );

	createElement( {
		tag: 'p',
		innerHTML: mw.message( 'communityconfiguration-wp25eastereggs-additional-description' ).parse()
	}, { mode: 'append', element: headerSection } );
} );

/**
 * Setup the mode configuration section support text and links.
 *
 * @return {Promise<void>}
 */
const setupModeConfigurationSection = () => waitForElement( '[id="EnableCompanion.filterPages"]' ).then( ( filterPages ) => {
	if ( !filterPages ) {
		return;
	}

	const modeConfigurationSection = createElement( {
		tag: 'div',
		className: 'cdx-field'
	}, { mode: 'after', element: filterPages } );

	createElement( {
		tag: 'h3',
		innerHTML: mw.msg( 'communityconfiguration-wp25eastereggs-modeconfiguration-section-label' ).escaped(),
		className: 'communityconfiguration-wp25eastereggs-section-label'
	}, { mode: 'append', element: modeConfigurationSection } );

	createElement( {
		tag: 'p',
		innerHTML: mw.message( 'communityconfiguration-wp25eastereggs-modeconfiguration-section-description' ).parse(),
		className: 'communityconfiguration-wp25eastereggs-section-label'
	}, { mode: 'append', element: modeConfigurationSection } );
} );

$( () => {
	setupHeader()
		.then( setupModeConfigurationSection )
		// fail silently in case something went wrong
		.catch( () => {} );
} );
