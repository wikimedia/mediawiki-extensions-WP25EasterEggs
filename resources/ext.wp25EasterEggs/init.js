/**
 * Initialize wp25EasterEggs extension
 *
 * @private
 */
const init = () => {
	if ( mw.user.clientPrefs.get( 'wp25eastereggs-enable' ) === '1' ) {
		// should execute easter eggs loading here
	}
};

$( () => {
	mw.requestIdleCallback( init );
} );
