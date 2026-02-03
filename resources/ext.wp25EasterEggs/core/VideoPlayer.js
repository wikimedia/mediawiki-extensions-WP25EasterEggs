/**
 * VideoPlayer
 *
 * A minimal video player that manages a single video element.
 */
class VideoPlayer {
	/**
	 * @param {HTMLElement} container - DOM element to append video elements to
	 */
	constructor( container ) {
		this.container = container;

		/** @type {HTMLVideoElement} */
		this.video = document.createElement( 'video' );
		this.video.loop = true;
		this.video.muted = true;
		this.video.playsInline = true;
		this.video.style.width = '100%';
		this.video.style.height = '100%';
		this.video.style.objectFit = 'contain';

		this.container.appendChild( this.video );
	}

	/**
	 * Play a video source in a loop
	 *
	 * @param {string} src - Video source URL
	 * @return {Promise<void>}
	 */
	playLoop( src ) {
		this.video.loop = true;
		this.video.src = src;
		return this.video.play().catch( () => {} );
	}

	/**
	 * Play a video source once (no loop), resolve when it ends
	 *
	 * @param {string} src - Video source URL
	 * @return {Promise<void>}
	 */
	playOnce( src ) {
		return new Promise( ( resolve ) => {
			this.video.loop = false;
			this.video.src = src;

			const onEnded = () => {
				this.video.removeEventListener( 'ended', onEnded );
				resolve();
			};
			this.video.addEventListener( 'ended', onEnded );

			this.video.play().catch( () => {
				this.video.removeEventListener( 'ended', onEnded );
				resolve();
			} );
		} ).catch( () => {} );
	}

	/**
	 * Clean up resources
	 */
	cleanup() {
		if ( this.video ) {
			this.video.pause();
			this.video.src = '';
			if ( this.video.parentNode ) {
				this.video.parentNode.removeChild( this.video );
			}
			this.video = null;
		}
	}
}

module.exports = { VideoPlayer };
