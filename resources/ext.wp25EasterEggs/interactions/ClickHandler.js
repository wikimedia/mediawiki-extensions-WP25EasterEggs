/**
 * @typedef {import('../companion/Companion.js').Companion} Companion
 * @typedef {import('../core/VideoContainer.js').VideoContainer} VideoContainer
 * @typedef {import('../core/VideoPlayer.js').VideoPlayer} VideoPlayer
 */

/**
 * ClickHandler
 *
 * Handle click interactions on the companion container.
 * Manages the playback of click interaction animations.
 */
class ClickHandler {
	/**
	 * @param {Object} options
	 * @param {VideoContainer['container']} options.container - DOM element to listen for click
	 * @param {VideoPlayer} options.videoPlayer - VideoPlayer instance
	 * @param {Companion['getVideoSrc']} options.getVideoSrc - Function to get video source
	 */
	constructor( options ) {
		/** @type {HTMLDivElement} */
		this.container = options.container;
		/** @type {VideoPlayer} */
		this.videoPlayer = options.videoPlayer;
		/** @type {Companion['getVideoSrc']} */
		this.getVideoSrc = options.getVideoSrc;

		/** @type {boolean} */
		this.isPlayingAnimation = false;
		/** @type {Function|null} */
		this.boundHandleClick = null;
	}

	/**
	 * Start listening for click events
	 */
	setup() {
		this.boundHandleClick = this.handleClick.bind( this );
		this.container.addEventListener( 'click', this.boundHandleClick );
		this.container.style.cursor = 'pointer';
	}

	/**
	 * Handle click event
	 *
	 * @param {MouseEvent} event
	 */
	handleClick( event ) {
		event.preventDefault();

		// Don't interrupt if already playing click animation
		if ( this.isPlayingAnimation ) {
			return;
		}

		const clickSrc = this.getVideoSrc( 'click' );

		if ( !clickSrc ) {
			return;
		}

		this.isPlayingAnimation = true;
		this.container.dispatchEvent( new CustomEvent( 'companion-click' ) );
		this.container.style.cursor = 'default';

		// Play click animation once, then return to idle
		this.videoPlayer.playOnce( clickSrc ).then( () => {
			this.isPlayingAnimation = false;
			this.container.style.cursor = 'pointer';
			const idleSrc = this.getVideoSrc( 'idle' );
			if ( idleSrc ) {
				this.videoPlayer.playLoop( idleSrc );
			}
		} ).catch( () => {
			this.isPlayingAnimation = false;
			this.container.style.cursor = 'pointer';
		} );
	}

	/**
	 * Clean up event listeners
	 */
	cleanup() {
		if ( this.boundHandleClick && this.container ) {
			this.container.removeEventListener( 'click', this.boundHandleClick );
			this.boundHandleClick = null;
			this.container.style.cursor = '';
		}
	}
}

module.exports = { ClickHandler };
