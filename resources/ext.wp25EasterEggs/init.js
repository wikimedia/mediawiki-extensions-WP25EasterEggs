const { ClientPrefsHandler } = require( './core/ClientPrefsHandler.js' );

/**
 * Initialize wp25EasterEggs extension
 *
 * @private
 */
const init = () => {
	const handler = new ClientPrefsHandler();
	handler.setup();
};

$( () => {
	mw.requestIdleCallback( init );
} );
