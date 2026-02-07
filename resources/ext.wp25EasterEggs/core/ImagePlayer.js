/**
 * ImagePlayer
 *
 * A minimal player that manages a single image element for reduced motion.
 */
class ImagePlayer {
	/**
	 * @param {HTMLElement} container - DOM element to append image elements to
	 */
	constructor( container ) {
		this.container = container;

		/** @type {HTMLImageElement} */
		this.image = document.createElement( 'img' );
		this.image.style.width = '100%';
		this.image.style.height = '100%';
		this.image.style.objectFit = 'contain';

		this.container.appendChild( this.image );
	}

	/**
	 * Display an image source
	 *
	 * @param {string} src - Image source URL
	 * @return {Promise<void>}
	 */
	play( src ) {
		this.image.src = src;
		return Promise.resolve();
	}

	/**
	 * Clean up resources
	 */
	cleanup() {
		if ( this.image ) {
			this.image.src = '';
			if ( this.image.parentNode ) {
				this.image.parentNode.removeChild( this.image );
			}
			this.image = null;
		}
	}
}

module.exports = { ImagePlayer };
