'use strict';

/* global HTMLVideoElement */

describe( 'VideoPlayer', () => {
	let VideoPlayer;
	let videoPlayer;
	let container;

	beforeEach( () => {
		// Reset modules
		jest.resetModules();

		// Create container
		container = document.createElement( 'div' );

		// Mock HTMLVideoElement methods
		HTMLVideoElement.prototype.play = jest.fn().mockResolvedValue();
		HTMLVideoElement.prototype.pause = jest.fn();

		VideoPlayer = require( '../../../../resources/ext.wp25EasterEggs/core/VideoPlayer.js' ).VideoPlayer;
	} );

	afterEach( () => {
		if ( videoPlayer ) {
			videoPlayer.cleanup();
		}
		jest.clearAllMocks();
	} );

	describe( 'constructor', () => {
		it( 'should create and append video element', () => {
			videoPlayer = new VideoPlayer( container );

			expect( videoPlayer.container ).toBe( container );
			expect( videoPlayer.video ).toBeInstanceOf( HTMLVideoElement );
			expect( container.contains( videoPlayer.video ) ).toBe( true );
		} );

		it( 'should configure video properties', () => {
			videoPlayer = new VideoPlayer( container );
			const video = videoPlayer.video;

			expect( video.loop ).toBe( true );
			expect( video.muted ).toBe( true );
			expect( video.playsInline ).toBe( true );
			expect( video.style.width ).toBe( '100%' );
			expect( video.style.height ).toBe( '100%' );
			expect( video.style.objectFit ).toBe( 'contain' );
		} );
	} );

	describe( 'play', () => {
		it( 'should set src and play video', async () => {
			videoPlayer = new VideoPlayer( container );
			const src = 'video.webm';

			await videoPlayer.play( src );

			// Check src using getAttribute because JSDOM might resolve absolute path
			expect( videoPlayer.video.src ).toContain( src );
			expect( videoPlayer.video.play ).toHaveBeenCalled();
		} );

		it( 'should handle playback errors', async () => {
			videoPlayer = new VideoPlayer( container );
			const error = new Error( 'Playback failed' );
			const consoleSpy = jest.spyOn( console, 'warn' )
				.mockImplementation( () => {} );

			// Mock play to reject
			videoPlayer.video.play.mockRejectedValue( error );

			await videoPlayer.play( 'video.webm' );

			expect( consoleSpy ).toHaveBeenCalledWith( 'Video playback error', error );
		} );
	} );

	describe( 'cleanup', () => {
		it( 'should pause video and clear src', () => {
			videoPlayer = new VideoPlayer( container );
			const video = videoPlayer.video;
			videoPlayer.cleanup();

			expect( video.pause ).toHaveBeenCalled();
			expect( video.src ).toBe( 'http://localhost/' );
		} );

		it( 'should remove video from DOM', () => {
			videoPlayer = new VideoPlayer( container );
			videoPlayer.cleanup();

			// videoPlayer.video is null now, so we check using flag or assumption
			expect( container.contains( videoPlayer.video ) ).toBe( false );
			expect( container.children.length ).toBe( 0 );
		} );

		it( 'should nullify video property', () => {
			videoPlayer = new VideoPlayer( container );
			videoPlayer.cleanup();

			expect( videoPlayer.video ).toBeNull();
		} );

		it( 'should handle multiple calls safely', () => {
			videoPlayer = new VideoPlayer( container );
			videoPlayer.cleanup();
			expect( () => videoPlayer.cleanup() ).not.toThrow();
		} );
	} );
} );
