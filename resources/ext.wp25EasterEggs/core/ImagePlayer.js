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
		/** @type {HTMLElement} */
		this.container = container;
		/** @type {Function|null} */
		this.currentPlaybackReject = null;
		/** @type {number|null} */
		this.currentTimeout = null;

		/** @type {HTMLImageElement} */
		this.image = document.createElement( 'img' );
		this.image.style.width = '100%';
		this.image.style.height = '100%';
		this.image.style.objectFit = 'contain';

		this.container.appendChild( this.image );
	}

	/**
	 * Display an image source as replacement for video loop
	 *
	 * @param {string} src - Image source URL
	 * @return {Promise<void>}
	 */
	playLoop( src ) {
		this.cancelPlayback();
		this.image.src = src;
		return Promise.resolve();
	}

	/**
	 * Display an image source once for a short duration as replacement for
	 * video play once
	 *
	 * @param {string} src - Image source URL
	 * @param {number|undefined} duration - Duration in milliseconds
	 * @return {Promise<void>}
	 */
	playOnce( src, duration ) {
		this.cancelPlayback();

		return new Promise( ( resolve, reject ) => {
			/**
			 * The promise rejection of the current playOnce is stored. When that rejection
			 * callback is called from cancelPlayback - it throws and effectively breaks the chain
			 * of the promises created by playSequence, thus stopping both playOnce and
			 * playSequence.
			 */
			this.currentPlaybackReject = reject;
			this.image.src = src;

			this.currentTimeout = setTimeout( () => {
				this.currentTimeout = null;
				if ( this.currentPlaybackReject === reject ) {
					this.currentPlaybackReject = null;
				}
				resolve();
			}, duration || 2000 );
		} );
	}

	/**
	 * Play a sequence of images, looping the last one
	 *
	 * @param {string[]} sources - Array of image source URLs
	 * @return {Promise<void>}
	 */
	playSequence( sources ) {
		if ( !sources || sources.length === 0 ) {
			return Promise.resolve();
		}

		let sequence = Promise.resolve();

		// Play all images except the last one using playOnce
		for ( let i = 0; i < sources.length - 1; i++ ) {
			sequence = sequence.then( () => this.playOnce( sources[ i ] ) );
		}

		// Loop the last image
		return sequence.then( () => this.playLoop( sources[ sources.length - 1 ] ) )
			.catch( () => {} );
	}

	/**
	 * Cancel any pending async playback operation
	 */
	cancelPlayback() {
		if ( this.currentTimeout ) {
			clearTimeout( this.currentTimeout );
			this.currentTimeout = null;
		}
		if ( this.currentPlaybackReject ) {
			this.currentPlaybackReject();
			this.currentPlaybackReject = null;
		}
	}

	/**
	 * Clean up resources
	 */
	cleanup() {
		this.cancelPlayback();

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
