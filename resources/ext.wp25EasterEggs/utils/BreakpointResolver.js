/**
 * BreakpointResolver
 *
 * Manage responsive breakpoint detection and trigger callbacks when breakpoints change.
 */
class BreakpointResolver {
	/**
	 * @param {Function} onChange - Callback function to call when breakpoint changes
	 */
	constructor( onChange ) {
		/** @type {Function} */
		this.onChange = onChange;
		/** @type {boolean|null} */
		this.isLarge = null;
		/** @type {Function|null} */
		this.removeListener = null;
	}

	/**
	 * Initialize breakpoint observers
	 *
	 * @return {void}
	 */
	setup() {
		const mq = window.matchMedia( '(min-width: 1120px)' );

		const updateState = ( matches ) => {
			this.isLarge = matches;
		};

		const listener = ( e ) => {
			updateState( e.matches );
			this.onChange( this.isLarge );
		};

		// Add listener for breakpoint changes
		mq.addEventListener( 'change', listener );
		this.removeListener = () => mq.removeEventListener( 'change', listener );

		// Set initial breakpoint
		updateState( mq.matches );
	}

	/**
	 * Clean up observers and clear references
	 *
	 * @return {void}
	 */
	cleanup() {
		// Remove listener
		if ( this.removeListener ) {
			this.removeListener();
			this.removeListener = null;
		}

		// Reset state
		this.isLarge = null;
	}
}

module.exports = { BreakpointResolver };
