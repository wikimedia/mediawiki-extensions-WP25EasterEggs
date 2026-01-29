const { ClientPrefsHandler } = require( './core/ClientPrefsHandler.js' );
const { getCompanionConfigs } = require( './companionConfigs.js' );

/**
 * Initialize wp25EasterEggs extension
 *
 * @return {void}
 */
const init = () => {
	const assetsPath = `${ mw.config.get( 'wgExtensionAssetsPath' ) }/WP25EasterEggs/resources/media`;
	const companionConfigs = getCompanionConfigs( assetsPath );

	const companionConfigCreator = ClientPrefsHandler.getCurrentCompanionConfigCreator(
		companionConfigs );
	if ( !companionConfigCreator ) {
		return;
	}

	const clientPrefsHandler = new ClientPrefsHandler( companionConfigCreator );
	clientPrefsHandler.setup();
};

$( () => {
	mw.requestIdleCallback( init );
} );
