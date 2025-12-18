const { ClientPrefsHandler } = require( './core/ClientPrefsHandler.js' );

/**
 * Initialize wp25EasterEggs extension
 *
 * @private
 */
const init = () => {
	// Scaffolding: Dummy companion configs until we import them
	const companionConfigs = {
		default: () => ( { name: 'default' } ),
		celebrate: () => ( { name: 'celebrate' } ),
		dream: () => ( { name: 'dream' } ),
		newspaper: () => ( { name: 'newspaper' } )
	};

	const configCreator = ClientPrefsHandler.getCurrentCompanionConfigCreator( companionConfigs );
	if ( !configCreator ) {
		return;
	}

	const handler = new ClientPrefsHandler( configCreator );
	handler.setup();
};

$( () => {
	mw.requestIdleCallback( init );
} );
