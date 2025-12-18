const { ColorSchemeResolver } = require( '../utils/ColorSchemeResolver.js' );

/**
 * ClientPrefsHandler
 *
 * Handle client preference changes for the WP25 Easter Eggs extension.
 * Watch for enable/disable user preference changes via class modifications.
 */
class ClientPrefsHandler {
	/**
	 * @param {Function} companionConfigCreator - The companion config creator function
	 */
	constructor( companionConfigCreator ) {
		/** @type {Function} */
		this.companionConfigCreator = companionConfigCreator;
		/** @type {Object|null} */
		this.companion = null;
		/** @type {ColorSchemeResolver} */
		this.colorSchemeResolver = new ColorSchemeResolver( () => this.handleColorSchemeChange() );
	}

	/**
	 * Handle color scheme change by delegating to companion if active
	 *
	 * @return {void}
	 */
	handleColorSchemeChange() {
		if ( this.companion && typeof this.companion.handleColorSchemeChange === 'function' ) {
			this.companion.handleColorSchemeChange();
		}
	}

	/**
	 * Initialize client preference handling
	 *
	 * @return {void}
	 */
	setup() {
		// Listen for client preference changes
		mw.hook( 'skin-client-preference.change' ).add( this.handleClientPrefChange.bind( this ) );

		// Show companion if the client pref is already enabled on page load
		if ( mw.user.clientPrefs.get( 'wp25eastereggs-enable' ) === '1' ) {
			this.showCompanion();
		}
	}

	/**
	 * Handle client preference change via hook
	 *
	 * @param {string} featureName
	 * @param {string} value
	 * @return {void}
	 */
	handleClientPrefChange( featureName, value ) {
		// Forward color scheme changes to the resolver
		if ( featureName === 'skin-theme' ) {
			this.colorSchemeResolver.handleSkinColorSchemeChange( value );
		}

		if ( featureName === 'wp25eastereggs-enable' ) {
			if ( value === '1' ) {
				this.showCompanion();
			} else {
				this.hideCompanion();
			}
		}
	}

	/**
	 * Show the companion
	 *
	 * @return {void}
	 */
	showCompanion() {
		// If companion is already shown, do nothing
		if ( this.companion ) {
			return;
		}

		const companionConfig = this.companionConfigCreator();
		this.companion = {
			config: companionConfig,
			setup: () => {},
			cleanup: () => {},
			handleColorSchemeChange: () => {}
		};
		this.companion.setup();

		// Initialize color scheme resolver
		this.colorSchemeResolver.setup();
	}

	/**
	 * Hide the companion (Scaffolding placeholder)
	 *
	 * @return {void}
	 */
	hideCompanion() {
		// If companion is not shown, do nothing
		if ( !this.companion ) {
			return;
		}

		// Cleanup companion
		this.companion.cleanup();
		this.companion = null;

		// Cleanup color scheme resolver listeners
		this.colorSchemeResolver.cleanup();
	}

	/**
	 * Get the current companion config creator from document classes
	 *
	 * Check if companion is enabled via document class, determine which companion
	 * variant is active (default, or a custom variant like 'cake'), and return the
	 * corresponding config creator function.
	 *
	 * @param {Object} companionConfigs - Map of config names to creator functions
	 * @return {Function|null}
	 */
	static getCurrentCompanionConfigCreator( companionConfigs ) {
		const isCompanionEnabled = document.documentElement.classList.contains(
			'wp25eastereggs-companion-enabled' );
		if ( !isCompanionEnabled ) {
			return null;
		}

		let companionConfigName = 'default';
		const prefix = 'wp25eastereggs-companion-';
		const classList = Array.from( document.documentElement.classList );
		const companionClass = classList.find( ( className ) => className.startsWith( prefix ) && className !== 'wp25eastereggs-companion-enabled' );
		if ( companionClass ) {
			companionConfigName = companionClass.slice( prefix.length );
		}

		if ( !( companionConfigName in companionConfigs ) ) {
			return null;
		}

		return companionConfigs[ companionConfigName ];
	}
}

module.exports = { ClientPrefsHandler };
