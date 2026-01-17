const { ClientPrefsHandler } = require( './core/ClientPrefsHandler.js' );

/**
 * Initialize wp25EasterEggs extension
 *
 * @return {void}
 */
const init = () => {
	const assetsPath = `${ mw.config.get( 'wgExtensionAssetsPath' ) }/WP25EasterEggs/resources/media`;
	const companionConfigs = {
		default: () => ( {
			name: 'idle',
			videoVariants: {
				light: `${ assetsPath }/idle-light.webm`,
				dark: `${ assetsPath }/idle-dark.webm`
			}
		} )
	};

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
