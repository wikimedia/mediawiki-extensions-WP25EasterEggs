const { VideoPlayer } = require( '../core/VideoPlayer.js' );
const { VideoContainer } = require( '../core/VideoContainer.js' );
const { ColorSchemeResolver } = require( '../utils/ColorSchemeResolver.js' );

/**
 * Companion
 *
 * Simplified controller for the WP25 Companion.
 * Manages the video container and player to display the idle animation.
 */
class Companion {
	/**
	 * @param {Object} config
	 */
	constructor( config ) {
		/** @type {Object} */
		this.config = config || {};
		/** @type {VideoContainer} */
		this.videoContainer = new VideoContainer();
		/** @type {VideoPlayer} */
		this.videoPlayer = new VideoPlayer( this.videoContainer.container );
	}

	/**
	 * Initialize the companion
	 *
	 * @return {Promise<void>}
	 */
	setup() {
		this.videoContainer.setup();

		return this.playIdleVideo().then( () => {
			this.videoContainer.show();
		} );
	}

	/**
	 * Play the idle video loop based on current color scheme
	 *
	 * @return {Promise<void>}
	 */
	playIdleVideo() {
		const colorScheme = ColorSchemeResolver.getCurrentColorScheme();
		const variants = this.config.videoVariants || {};
		const videoSrc = variants[ colorScheme ] || variants.light;

		if ( !videoSrc ) {
			return Promise.resolve();
		}

		return this.videoPlayer.play( videoSrc );
	}

	/**
	 * Handle color scheme changes
	 *
	 * @return {void}
	 */
	handleColorSchemeChange() {
		// Re-trigger playback which will resolve the new color scheme
		this.playIdleVideo();
	}

	/**
	 * Cleanup resources
	 */
	cleanup() {
		this.videoPlayer.cleanup();
		this.videoContainer.cleanup();
	}
}

module.exports = { Companion };
