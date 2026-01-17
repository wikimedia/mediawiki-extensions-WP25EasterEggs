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
			// If landmark is not found, hide the container and detach it from DOM
			this.hide();
			if ( this.container.parentElement ) {
				this.container.parentElement.removeChild( this.container );
			}
			return;
		}

		// Move container to new landmark
		targetLandmark.appendChild( this.container );
	}

	/**
	 * Show the container
	 *
	 * @return {void}
	 */
	show() {
		this.container.style.display = 'block';
	}

	/**
	 * Hide the container
	 *
	 * @return {void}
	 */
	hide() {
		this.container.style.display = 'none';
	}

	/**
	 * Clean up observers and DOM elements
	 *
	 * @return {void}
	 */
	cleanup() {
		// Clean up breakpoint resolver
		this.breakpointResolver.cleanup();

		// Detach container from DOM
		if ( this.container.parentNode ) {
			this.container.parentNode.removeChild( this.container );
		}
	}
}

module.exports = { VideoContainer };
