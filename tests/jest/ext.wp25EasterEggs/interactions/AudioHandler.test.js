'use strict';

describe( 'AudioHandler', () => {
	let AudioHandler;
	let audioHandler;
	let container;
	let mockAudio;
	let originalAudio;

	beforeEach( () => {
		jest.resetModules();

		// Mock Audio
		mockAudio = {
			play: jest.fn().mockResolvedValue(),
			pause: jest.fn(),
			currentTime: 0
		};
		originalAudio = window.Audio;
		window.Audio = jest.fn( () => mockAudio );

		// Create container
		container = document.createElement( 'div' );

		AudioHandler = require( '../../../../resources/ext.wp25EasterEggs/interactions/AudioHandler.js' ).AudioHandler;
	} );

	afterEach( () => {
		if ( audioHandler ) {
			audioHandler.cleanup();
		}
		window.Audio = originalAudio;
		jest.clearAllMocks();
	} );

	describe( 'constructor', () => {
		it( 'should initialize properties', () => {
			audioHandler = new AudioHandler( {
				container: container,
				baseAssetsPath: 'path/to/assets'
			} );

			expect( audioHandler.container ).toBe( container );
			expect( audioHandler.baseAssetsPath ).toBe( 'path/to/assets' );
			expect( audioHandler.boundHandleInteraction ).toBeNull();
			expect( audioHandler.currentAudio ).toBeNull();
			// Check if audio files are generated correctly
			expect( audioHandler.audioFiles.length ).toBeGreaterThan( 0 );
			expect( audioHandler.audioFiles[ 0 ] ).toContain( 'path/to/assets/audio/' );
		} );
	} );

	describe( 'setup', () => {
		it( 'should add companion-click event listener', () => {
			audioHandler = new AudioHandler( {
				container: container,
				baseAssetsPath: 'path/to/assets'
			} );
			const addEventListenerSpy = jest.spyOn( container, 'addEventListener' );

			audioHandler.setup();

			expect( addEventListenerSpy ).toHaveBeenCalledWith( 'companion-click', expect.any( Function ) );
			expect( audioHandler.boundHandleInteraction ).toEqual( expect.any( Function ) );
		} );
	} );

	describe( 'handleInteraction', () => {
		beforeEach( () => {
			audioHandler = new AudioHandler( {
				container: container,
				baseAssetsPath: 'path/to/assets'
			} );
			audioHandler.setup();
		} );

		it( 'should play a random audio file', () => {
			audioHandler.handleInteraction();

			expect( window.Audio ).toHaveBeenCalledWith( expect.stringContaining( 'path/to/assets/audio/' ) );
			expect( mockAudio.play ).toHaveBeenCalled();
			expect( audioHandler.currentAudio ).toBe( mockAudio );
		} );

		it( 'should stop previously playing audio before playing new one', () => {
			// First interaction
			audioHandler.handleInteraction();
			expect( mockAudio.play ).toHaveBeenCalledTimes( 1 );

			// Reset mock calls for clarity
			mockAudio.play.mockClear();

			// Second interaction
			audioHandler.handleInteraction();

			// Should pause previous audio
			expect( mockAudio.pause ).toHaveBeenCalled();
			expect( mockAudio.currentTime ).toBe( 0 );

			// Should play new audio
			expect( mockAudio.play ).toHaveBeenCalled();
		} );

		it( 'should handle audio play errors gracefully', async () => {
			mockAudio.play.mockRejectedValue( new Error( 'Autoplay failed' ) );

			// Should not throw
			await expect( async () => {
				audioHandler.handleInteraction();
				// Wait for promise rejection to be handled
				await Promise.resolve();
			} ).not.toThrow();
		} );
	} );

	describe( 'cleanup', () => {
		it( 'should remove event listener', () => {
			audioHandler = new AudioHandler( {
				container: container,
				baseAssetsPath: 'path/to/assets'
			} );
			const removeEventListenerSpy = jest.spyOn( container, 'removeEventListener' );
			audioHandler.setup();

			audioHandler.cleanup();

			expect( removeEventListenerSpy ).toHaveBeenCalledWith( 'companion-click', expect.any( Function ) );
			expect( audioHandler.boundHandleInteraction ).toBeNull();
		} );

		it( 'should stop currently playing audio', () => {
			audioHandler = new AudioHandler( {
				container: container,
				baseAssetsPath: 'path/to/assets'
			} );
			audioHandler.setup();

			// Start audio
			audioHandler.handleInteraction();
			expect( audioHandler.currentAudio ).toBe( mockAudio );

			// Cleanup
			audioHandler.cleanup();

			expect( mockAudio.pause ).toHaveBeenCalled();
			expect( audioHandler.currentAudio ).toBeNull();
		} );

		it( 'should handle multiple cleanup calls safely', () => {
			audioHandler = new AudioHandler( {
				container: container,
				baseAssetsPath: 'path/to/assets'
			} );
			audioHandler.setup();

			audioHandler.cleanup();
			expect( () => audioHandler.cleanup() ).not.toThrow();
		} );
	} );
} );
