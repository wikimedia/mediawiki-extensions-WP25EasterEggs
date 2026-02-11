const { ImagePlayer } = require( '../core/ImagePlayer.js' );
const { VideoPlayer } = require( '../core/VideoPlayer.js' );
const { VideoContainer } = require( '../core/VideoContainer.js' );
const { ColorSchemeResolver } = require( '../utils/ColorSchemeResolver.js' );
const { CompanionConfig } = require( './CompanionConfig.js' );
const { InactivityHandler } = require( '../interactions/InactivityHandler.js' );
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
		/** @type {InactivityHandler|null} */
		this.inactivityHandler = null;
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

		if ( this.config.interactions.sleep ) {
			this.inactivityHandler = new InactivityHandler( {
				container: this.videoContainer.container,
				videoPlayer: this.videoPlayer,
				getVideoSrc: this.getVideoSrc.bind( this )
			} );
			this.inactivityHandler.setup();
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
	 * @param {string} newScheme - New color scheme
	 * @param {string} oldScheme - Previous color scheme
	 * @return {void}
	 */
	handleColorSchemeChange( newScheme, oldScheme ) {
		// If currently sleeping, stay sleeping but updated for new color scheme
		if ( this.inactivityHandler && this.inactivityHandler.state === 'sleep' ) {
			const sleepSrc = this.getVideoSrc( 'sleepLoop' );
			if ( sleepSrc ) {
				this.videoPlayer.playLoop( sleepSrc );
				return;
			}
		}

		// If switching to dark mode and has flashlight behavior, play flashlight first
		const didSwitchFromLightToDark = oldScheme === 'light' && newScheme === 'dark';
		if ( this.config.interactions.flashlight && didSwitchFromLightToDark ) {
			const flashlightSrc = this.getVideoSrc( 'flashlight' );
			const idleSrc = this.getVideoSrc( 'idle' );

			if ( flashlightSrc && idleSrc ) {
				this.videoPlayer.playSequence( [ flashlightSrc, idleSrc ] );
				return;
			}
		}

		// If currently playing click animation, switch to new color scheme's click animation
		if ( this.clickHandler && this.clickHandler.isPlayingAnimation ) {
			const clickSrc = this.getVideoSrc( 'click' );
			const idleSrc = this.getVideoSrc( 'idle' );
			if ( clickSrc ) {
				this.videoPlayer.playSequence( [ clickSrc, idleSrc ] );
				return;
			}
		}

		// For light mode or no flashlight, just play idle
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

		if ( this.inactivityHandler ) {
			this.inactivityHandler.cleanup();
			this.inactivityHandler = null;
		}

		this.videoPlayer.cleanup();
		this.videoContainer.cleanup();
	}
}

module.exports = { Companion };
