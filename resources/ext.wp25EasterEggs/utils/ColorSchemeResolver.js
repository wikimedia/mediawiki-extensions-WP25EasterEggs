/**
 * ColorSchemeResolver
 *
 * Handle color scheme detection and resolution for the WP25 Easter Eggs extension.
 * Provide a centralized way to determine the current color scheme based on user preferences
 * and system settings. Call a callback when the color scheme changes.
 */
class ColorSchemeResolver {

	/**
	 * @param {function(string, string): void} onChange - Callback called when color scheme changes
	 */
	constructor( onChange ) {
		/** @type {function(string, string): void} */
		this.onChange = onChange;
		/** @type {'dark'|'light'} */
		this.currentColorScheme = ColorSchemeResolver.getCurrentColorScheme();
		/** @type {Function|null} */
		this.removeOsListener = null;
	}

	/**
	 * Initialize the color scheme resolver and set up OS color scheme listener
	 *
	 * @return {void}
	 */
	setup() {
		const boundHandleOsColorSchemeChange = this.handleOsColorSchemeChange.bind( this );
		const osColorSchemeMediaQuery = window.matchMedia( '(prefers-color-scheme: dark)' );
		osColorSchemeMediaQuery.addEventListener( 'change', boundHandleOsColorSchemeChange );
		this.removeOsListener = () => {
			osColorSchemeMediaQuery.removeEventListener( 'change', boundHandleOsColorSchemeChange );
		};
	}

	/**
	 * Handle OS color scheme preference change
	 *
	 * @param {MediaQueryListEvent} event
	 * @return {void}
	 */
	handleOsColorSchemeChange( event ) {
		ColorSchemeResolver.osColorScheme = event.matches ? 'dark' : 'light';
		if ( ColorSchemeResolver.skinColorScheme === 'os' ) {
			this.updateColorScheme();
		}
	}

	/**
	 * Handle client preference change via hook
	 *
	 * @param {string} value
	 * @return {void}
	 */
	handleSkinColorSchemeChange( value ) {
		ColorSchemeResolver.skinColorScheme = value;
		this.updateColorScheme();
	}

	/**
	 * Update the current color scheme and notify callback if changed
	 *
	 * Called when skin theme preference radio buttons change or when OS color
	 * scheme changes (via prefers-color-scheme media query). Only call callback
	 * if the resolved color scheme actually changed.
	 *
	 * @return {void}
	 */
	updateColorScheme() {
		const newColorScheme = ColorSchemeResolver.getCurrentColorScheme();

		// Only notify if color scheme actually changed
		if ( newColorScheme !== this.currentColorScheme ) {
			const oldColorScheme = this.currentColorScheme;
			this.currentColorScheme = newColorScheme;

			// Call the change callback
			this.onChange( newColorScheme, oldColorScheme );
		}
	}

	/**
	 * Clean up resources and remove event listeners
	 *
	 * @return {void}
	 */
	cleanup() {
		if ( this.removeOsListener ) {
			this.removeOsListener();
			this.removeOsListener = null;
		}

		this.currentColorScheme = null;
	}

	/**
	 * Get the current resolved color scheme
	 *
	 * @return {'dark'|'light'}
	 */
	static getCurrentColorScheme() {
		if ( ColorSchemeResolver.skinColorScheme === null &&
			ColorSchemeResolver.osColorScheme === null ) {
			ColorSchemeResolver.osColorScheme = window.matchMedia( '(prefers-color-scheme: dark)' ).matches ? 'dark' : 'light';
			ColorSchemeResolver.skinColorScheme = mw.user.clientPrefs.get( 'skin-theme' );
		}

		if ( ColorSchemeResolver.skinColorScheme === 'os' ) {
			if ( ColorSchemeResolver.osColorScheme !== null ) {
				return ColorSchemeResolver.osColorScheme;
			}
		} else if ( ColorSchemeResolver.skinColorScheme !== null ) {
			return ColorSchemeResolver.skinColorScheme === 'night' ? 'dark' : 'light';
		}

		return 'light';
	}
}

/**
 * Resolved OS color scheme ('dark' or 'light')
 *
 * @static
 * @type {'dark'|'light'|null}
 */
ColorSchemeResolver.osColorScheme = null;

/**
 * Resolved skin color scheme ('day', 'night', or 'os')
 *
 * @static
 * @type {'day'|'night'|'os'|null}
 */
ColorSchemeResolver.skinColorScheme = null;

module.exports = { ColorSchemeResolver };
