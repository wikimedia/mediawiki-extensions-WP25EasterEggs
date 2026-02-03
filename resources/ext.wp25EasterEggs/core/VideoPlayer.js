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
		/** @type {HTMLElement} */
		this.container = container;
		/** @type {Function|null} */
		this.currentPlaybackReject = null;
		/** @type {Function|null} */
		this.onPlayOnceEnded = null;

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
		this.cancelPlayback();
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
		this.cancelPlayback();

		return new Promise( ( resolve, reject ) => {
			/**
			 * The promise rejection of the current playOnce is stored. When that rejection
			 * callback is called from cancelPlayback - it throws and effectively breaks the chain
			 * of the promises created by playSequence, thus stopping both playOnce and
			 * playSequence.
			 */
			this.currentPlaybackReject = reject;
			this.video.loop = false;
			this.video.src = src;

			const onPlayOnceEnded = () => {
				this.video.removeEventListener( 'ended', onPlayOnceEnded );
				this.onPlayOnceEnded = null;
				if ( this.currentPlaybackReject === reject ) {
					this.currentPlaybackReject = null;
				}
				resolve();
			};
			this.onPlayOnceEnded = onPlayOnceEnded;
			this.video.addEventListener( 'ended', onPlayOnceEnded );

			this.video.play().catch( () => {
				onPlayOnceEnded();
			} );
		} );
	}

	/**
	 * Play a sequence of videos, looping the last one
	 *
	 * @param {string[]} sources - Array of video source URLs
	 * @return {Promise<void>}
	 */
	playSequence( sources ) {
		if ( sources.length === 0 ) {
			return Promise.resolve();
		}

		let sequence = Promise.resolve();

		// Play all videos except the last one using playOnce
		for ( let i = 0; i < sources.length - 1; i++ ) {
			sequence = sequence.then( () => this.playOnce( sources[ i ] ) );
		}

		// Loop the last video
		return sequence.then( () => this.playLoop( sources[ sources.length - 1 ] ) )
			.catch( () => {} );
	}

	/**
	 * Cancel any pending async playback operation
	 */
	cancelPlayback() {
		if ( this.onPlayOnceEnded ) {
			this.video.removeEventListener( 'ended', this.onPlayOnceEnded );
			this.onPlayOnceEnded = null;
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
