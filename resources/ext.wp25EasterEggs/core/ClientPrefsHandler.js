/**
 * ClientPrefsHandler
 *
 * Handle client preference changes for the WP25 Easter Eggs extension.
 * Watch for enable/disable user preference changes via class modifications.
 */
class ClientPrefsHandler {
	constructor() {
		/** @type {MutationObserver|null} */
		this.observer = null;
	}

	/**
	 * Initialize client preference handling
	 *
	 * @return {void}
	 */
	setup() {
		// Watch for class changes on the html element to detect client preference changes
		this.observer = new MutationObserver( ( mutations ) => {
			mutations.forEach( ( mutation ) => {
				if ( mutation.attributeName === 'class' ) {
					this.handleClassChange();
				}
			} );
		} );

		this.observer.observe( document.documentElement, {
			attributes: true,
			attributeFilter: [ 'class' ]
		} );

		// Check initial state
		if ( mw.user.clientPrefs.get( 'wp25eastereggs-enable' ) === '1' ) {
			this.showCompanion();
		}
	}

	/**
	 * Handle class attribute changes on documentElement
	 *
	 * @return {void}
	 */
	handleClassChange() {
		const classList = document.documentElement.classList;

		// Check enable/disable preference
		if ( classList.contains( 'wp25eastereggs-enable-clientpref-1' ) ) {
			this.showCompanion();
		} else if ( classList.contains( 'wp25eastereggs-enable-clientpref-0' ) ) {
			this.hideCompanion();
		}
	}

	/**
	 * Show the companion (Scaffolding placeholder)
	 *
	 * @return {void}
	 */
	showCompanion() {
		// Scaffolding: Companion logic to be implemented
	}

	/**
	 * Hide the companion (Scaffolding placeholder)
	 *
	 * @return {void}
	 */
	hideCompanion() {
		// Scaffolding: Companion logic to be implemented
	}
}

module.exports = { ClientPrefsHandler };
