/**
 * @typedef {import('../companion/Companion.js').Companion} Companion
 */

/**
 * InactivityHandler
 *
 * Monitors visibility changes to trigger sleep behavior and user activity to wake the companion up.
 */
class InactivityHandler {
	/**
	 * @param {Object} options
	 * @param {HTMLElement} options.container - Container element
	 * @param {Companion['videoPlayer']} options.videoPlayer - VideoPlayer instance
	 * @param {Companion['getVideoSrc']} options.getVideoSrc - Function to get video source
	 */
	constructor( options ) {
		/** @type {HTMLElement} */
		this.container = options.container;
		/** @type {Companion['videoPlayer']} */
		this.videoPlayer = options.videoPlayer;
		/** @type {Companion['getVideoSrc']} */
		this.getVideoSrc = options.getVideoSrc;

		/** @type {number} */
		this.timeoutDelay = 5 * 60 * 1000;
		/** @type {'idle'|'sleep'|'transitionFromSleep'} */
		this.state = 'idle';
		/** @type {number|null} */
		this.hiddenSince = null;
		/** @type {Function|null} */
		this.boundHandleActivity = null;
		/** @type {Function|null} */
		this.boundHandleVisibilityChange = null;
	}

	/**
	 * Start monitoring visibility changes to trigger sleep behavior and user activity to wake the
	 * companion up
	 */
	setup() {
		this.boundHandleVisibilityChange = this.handleVisibilityChange.bind( this );
		document.addEventListener( 'visibilitychange', this.boundHandleVisibilityChange );

		// Throttle activity handling to run at most once per second
		this.boundHandleActivity = mw.util.throttle( this.handleActivity.bind( this ), 1000 );
		[ 'click', 'mouseenter' ].forEach( ( event ) => {
			this.container.addEventListener( event, this.boundHandleActivity, { passive: true } );
		} );
	}

	/**
	 * Handle user activity event and if needed wake the companion up
	 */
	handleActivity() {
		// If companion is not asleep - no need to wake to companion up
		if ( this.state !== 'sleep' ) {
			return;
		}

		// Play sleep transition out, then transition to idle, then idle
		const sleepTransitionOutSrc = this.getVideoSrc( 'sleepTransitionOut' );
		const transitionToIdleSrc = this.getVideoSrc( 'transitionFromSleep' );
		const idleSrc = this.getVideoSrc( 'idle' );

		const sequence = [];
		if ( sleepTransitionOutSrc ) {
			sequence.push( sleepTransitionOutSrc );
		}
		if ( transitionToIdleSrc ) {
			sequence.push( transitionToIdleSrc );
		}
		if ( idleSrc ) {
			sequence.push( idleSrc );
		}

		if ( sequence.length > 0 ) {
			this.state = 'transitionFromSleep';
			this.videoPlayer.playSequence( sequence ).then( () => {
				this.state = 'idle';
			} );
		}
	}

	/**
	 * Handle visibility change events and if needed show the companion in sleep mode
	 *
	 * When the page is hidden, record the time for when the tab was hidden. When the page is shown,
	 * check if the page was hidden for long enough to show companion in sleep mode.
	 */
	handleVisibilityChange() {
		if ( document.hidden ) {
			// Set the time for when the tab was hidden
			this.hiddenSince = Date.now();
		} else {
			// Calculate how long the tab was hidden for
			const now = Date.now();
			const timeHidden = this.hiddenSince ? ( now - this.hiddenSince ) : 0;
			this.hiddenSince = null;

			// If the tab was hidden for long enough for the companion to be sleeping and companion
			// is not asleep - show it in sleep mode
			if ( timeHidden >= this.timeoutDelay && this.state !== 'sleep' ) {
				const sleepSrc = this.getVideoSrc( 'sleepLoop' );
				if ( sleepSrc ) {
					this.state = 'sleep';
					this.videoPlayer.playLoop( sleepSrc );
				}
			}
		}
	}

	/**
	 * Clean up event listeners and timers
	 */
	cleanup() {
		if ( this.boundHandleActivity ) {
			[ 'mousemove', 'click', 'mouseenter' ].forEach( ( event ) => {
				this.container.removeEventListener( event, this.boundHandleActivity );
			} );
			this.boundHandleActivity = null;
		}

		if ( this.boundHandleVisibilityChange ) {
			document.removeEventListener( 'visibilitychange', this.boundHandleVisibilityChange );
			this.boundHandleVisibilityChange = null;
		}

		this.state = 'idle';
	}
}

module.exports = { InactivityHandler };
