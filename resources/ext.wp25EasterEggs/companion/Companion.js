const { ImagePlayer } = require( '../core/ImagePlayer.js' );
const { VideoPlayer } = require( '../core/VideoPlayer.js' );
const { VideoContainer } = require( '../core/VideoContainer.js' );
const { ColorSchemeResolver } = require( '../utils/ColorSchemeResolver.js' );
const { CompanionConfig } = require( './CompanionConfig.js' );
const { ClickHandler } = require( '../interactions/ClickHandler.js' );

/**
 * @typedef {import('./CompanionConfig.js').VideoVariants} VideoVariants
 * @typedef {keyof VideoVariants} VideoType
 */

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
		/** @type {VideoPlayer|ImagePlayer} */
		this.videoPlayer = this.config.isReducedMotion ?
			new ImagePlayer( this.videoContainer.container ) :
			new VideoPlayer( this.videoContainer.container );
		/** @type {ClickHandler|null} */
		this.clickHandler = null;
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
			this.setupInteractionHandlers();
		} );
	}

	/**
	 * Set up interaction handlers based on config behaviors
	 */
	setupInteractionHandlers() {
		if ( this.config.interactions.click ) {
			this.clickHandler = new ClickHandler( {
				container: this.videoContainer.container,
				videoPlayer: this.videoPlayer,
				getVideoSrc: this.getVideoSrc.bind( this )
			} );
			this.clickHandler.setup();
		}
	}

	/**
	 * Get video source for a video type and color scheme
	 *
	 * @param {VideoType} type - Video type
	 * @return {string | undefined}
	 */
	getVideoSrc( type ) {
		const colorScheme = ColorSchemeResolver.getCurrentColorScheme();
		const videoVariants = this.config.videoVariants || {};
		const videoSet = videoVariants[ type ] || {};
		const videoSrc = videoSet[ colorScheme ] || videoSet.light;

		return videoSrc;
	}

	/**
	 * Play the idle video loop based on current color scheme
	 *
	 * @return {Promise<void>}
	 */
	playIdleVideo() {
		const videoSrc = this.getVideoSrc( 'idle' );

		if ( !videoSrc ) {
			return Promise.resolve();
		}

		return this.videoPlayer.playLoop( videoSrc );
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
		if ( this.clickHandler ) {
			this.clickHandler.cleanup();
			this.clickHandler = null;
		}

		this.videoPlayer.cleanup();
		this.videoContainer.cleanup();
	}
}

module.exports = { Companion };
