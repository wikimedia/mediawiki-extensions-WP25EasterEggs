const { VideoPlayer } = require( '../core/VideoPlayer.js' );
const { VideoContainer } = require( '../core/VideoContainer.js' );
const { ColorSchemeResolver } = require( '../utils/ColorSchemeResolver.js' );
const { CompanionConfig } = require( './CompanionConfig.js' );

/**
 * Companion
 *
 * Controller for the WP25 Companion.
 * Manages the video container and player to display the idle animation.
 */
class Companion {
	/**
	 * @param {CompanionConfig} config
	 */
	constructor( config ) {
		/** @type {CompanionConfig} */
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
			this.videoContainer.enable();
		} );
	}

	/**
	 * Play the idle video loop based on current color scheme
	 *
	 * @return {Promise<void>}
	 */
	playIdleVideo() {
		const colorScheme = ColorSchemeResolver.getCurrentColorScheme();
		const videoVariants = this.config.videoVariants || {};
		const videoSet = videoVariants.idle || {};
		const videoSrc = videoSet[ colorScheme ] || videoSet.light;

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
