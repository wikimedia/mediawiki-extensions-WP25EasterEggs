const { BreakpointResolver } = require( '../utils/BreakpointResolver.js' );

/**
 * VideoContainer
 *
 * Manage multiple landmark locations and dynamically place a container
 * in the appropriate landmark based on responsive conditions.
 * Configuration is hardcoded for the WP25 Easter Eggs extension.
 */
class VideoContainer {
	constructor() {
		/** @type {boolean} */
		this.isEnabled = false;
		/** @type {HTMLElement|null} */
		this.vectorColumnEndLandmark = null;
		/** @type {HTMLElement|null} */
		this.sitenoticeLandmark = null;
		/** @type {BreakpointResolver} */
		this.breakpointResolver = new BreakpointResolver( () => this.updatePlacement() );

		/** @type {HTMLDivElement} */
		this.container = document.createElement( 'div' );
		this.container.className = 'wp25eastereggs-video-container';
		this.container.style.display = 'none';
	}

	/**
	 * Initialize the container - create landmarks and set initial placement
	 *
	 * @return {HTMLDivElement}
	 */
	setup() {
		this.vectorColumnEndLandmark = document.querySelector( '.wp25eastereggs-vector-sitenotice-landmark' );
		this.sitenoticeLandmark = document.querySelector( '.wp25eastereggs-sitenotice-landmark' );

		this.breakpointResolver.setup();
		this.updatePlacement();

		return this.container;
	}

	/**
	 * Update container placement based on current skin and viewport breakpoint
	 *
	 * @return {void}
	 */
	updatePlacement() {
		const isLarge = this.breakpointResolver.isLarge;
		if ( isLarge && document.querySelector( '.vector-column-end' ) ) {
			this.moveContainer( 'vector-column-end' );
		} else {
			this.moveContainer( 'sitenotice' );
		}
	}

	/**
	 * Move the container to a specific landmark
	 *
	 * @param {'vector-column-end'|'sitenotice'} landmarkName - Name of the target landmark
	 * @return {void}
	 */
	moveContainer( landmarkName ) {
		const targetLandmark = landmarkName === 'vector-column-end' ? this.vectorColumnEndLandmark : this.sitenoticeLandmark;

		if ( !targetLandmark ) {
			// If landmark is not found - hide the container
			this.container.style.display = 'none';
			return;
		}

		// Move container to new landmark
		targetLandmark.appendChild( this.container );
		if ( this.isEnabled ) {
			// The companion might have been hidden because the previous landmark was not found,
			// so if the companion is currently enabled - "unhide" the container
			this.container.style.display = 'block';
		}
	}

	/**
	 * Enable the container and show the inner div
	 *
	 * @return {void}
	 */
	enable() {
		this.isEnabled = true;
		this.container.style.display = 'block';
	}

	/**
	 * Disable the container and hide the inner div
	 *
	 * @return {void}
	 */
	disable() {
		this.isEnabled = false;
		this.container.style.display = 'none';
	}

	/**
	 * Clean up observers and DOM elements
	 *
	 * @return {void}
	 */
	cleanup() {
		this.disable();

		// Clean up breakpoint resolver
		this.breakpointResolver.cleanup();

		// Detach container from DOM
		if ( this.container.parentNode ) {
			this.container.parentNode.removeChild( this.container );
		}
	}
}

module.exports = { VideoContainer };
