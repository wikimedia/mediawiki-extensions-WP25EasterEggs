'use strict';

describe( 'Companion', () => {
	let Companion;
	let companion;
	let mockVideoContainerInstance;
	let mockVideoPlayerInstance;
	const mockConfig = {
		videoVariants: {
			idle: {
				light: 'path/to/light.webm',
				dark: 'path/to/dark.webm'
			}
		}
	};

	beforeEach( () => {
		jest.resetModules();

		// Mock VideoContainer
		mockVideoContainerInstance = {
			container: document.createElement( 'div' ),
			setup: jest.fn(),
			enable: jest.fn(),
			disable: jest.fn(),
			cleanup: jest.fn()
		};
		const MockVideoContainer = jest.fn( () => mockVideoContainerInstance );

		// Mock VideoPlayer
		mockVideoPlayerInstance = {
			play: jest.fn().mockResolvedValue(),
			cleanup: jest.fn()
		};
		const MockVideoPlayer = jest.fn( () => mockVideoPlayerInstance );

		// Mock ColorSchemeResolver
		const MockColorSchemeResolver = {
			getCurrentColorScheme: jest.fn().mockReturnValue( 'light' )
		};

		// Mock dependencies
		jest.doMock( '../../../../resources/ext.wp25EasterEggs/core/VideoContainer.js', () => ( {
			VideoContainer: MockVideoContainer
		} ) );
		jest.doMock( '../../../../resources/ext.wp25EasterEggs/core/VideoPlayer.js', () => ( {
			VideoPlayer: MockVideoPlayer
		} ) );
		jest.doMock( '../../../../resources/ext.wp25EasterEggs/utils/ColorSchemeResolver.js', () => ( {
			ColorSchemeResolver: MockColorSchemeResolver
		} ) );

		// Require Companion
		Companion = require( '../../../../resources/ext.wp25EasterEggs/companion/Companion.js' ).Companion;
	} );

	afterEach( () => {
		companion = null;
		jest.clearAllMocks();
	} );

	describe( 'constructor', () => {
		it( 'should initialize with config', () => {
			companion = new Companion( mockConfig );
			expect( companion.config ).toBe( mockConfig );
		} );

		it( 'should create video container and player', () => {
			companion = new Companion( mockConfig );
			expect( companion.videoContainer ).toBe( mockVideoContainerInstance );
			expect( companion.videoPlayer ).toBe( mockVideoPlayerInstance );
		} );

		it( 'should handle missing config', () => {
			companion = new Companion();
			expect( companion.config ).toEqual( {} );
		} );
	} );

	describe( 'setup', () => {
		it( 'should setup video container and start playing', async () => {
			companion = new Companion( mockConfig );

			await companion.setup();

			expect( mockVideoContainerInstance.setup ).toHaveBeenCalled();
			expect( mockVideoPlayerInstance.play ).toHaveBeenCalledWith( 'path/to/light.webm' );
			expect( mockVideoContainerInstance.enable ).toHaveBeenCalled();
		} );

		it( 'should wait for playback before showing container', async () => {
			companion = new Companion( mockConfig );
			let resolvePlay;
			mockVideoPlayerInstance.play.mockReturnValue( new Promise( ( resolve ) => {
				resolvePlay = resolve;
			} ) );

			const setupPromise = companion.setup();

			expect( mockVideoContainerInstance.enable ).not.toHaveBeenCalled();

			resolvePlay();
			await setupPromise;

			expect( mockVideoContainerInstance.enable ).toHaveBeenCalled();
		} );
	} );

	describe( 'playIdleVideo', () => {
		it( 'should play "light" variant when scheme is light', async () => {
			companion = new Companion( mockConfig );
			const { ColorSchemeResolver } = require( '../../../../resources/ext.wp25EasterEggs/utils/ColorSchemeResolver.js' );
			ColorSchemeResolver.getCurrentColorScheme.mockReturnValue( 'light' );

			await companion.playIdleVideo();

			expect( mockVideoPlayerInstance.play ).toHaveBeenCalledWith( 'path/to/light.webm' );
		} );

		it( 'should play "dark" variant when scheme is dark', async () => {
			companion = new Companion( mockConfig );
			const { ColorSchemeResolver } = require( '../../../../resources/ext.wp25EasterEggs/utils/ColorSchemeResolver.js' );
			ColorSchemeResolver.getCurrentColorScheme.mockReturnValue( 'dark' );

			await companion.playIdleVideo();

			expect( mockVideoPlayerInstance.play ).toHaveBeenCalledWith( 'path/to/dark.webm' );
		} );

		it( 'should fallback to "light" variant if specific scheme not found', async () => {
			companion = new Companion( mockConfig );
			const { ColorSchemeResolver } = require( '../../../../resources/ext.wp25EasterEggs/utils/ColorSchemeResolver.js' );
			ColorSchemeResolver.getCurrentColorScheme.mockReturnValue( 'unknown' );

			await companion.playIdleVideo();

			expect( mockVideoPlayerInstance.play ).toHaveBeenCalledWith( 'path/to/light.webm' );
		} );

		it( 'should do nothing if no video source is available', async () => {
			companion = new Companion( {} ); // Empty config
			const { ColorSchemeResolver } = require( '../../../../resources/ext.wp25EasterEggs/utils/ColorSchemeResolver.js' );
			ColorSchemeResolver.getCurrentColorScheme.mockReturnValue( 'light' );

			await companion.playIdleVideo();

			expect( mockVideoPlayerInstance.play ).not.toHaveBeenCalled();
		} );
	} );

	describe( 'handleColorSchemeChange', () => {
		it( 'should re-trigger playIdleVideo', () => {
			companion = new Companion( mockConfig );
			const playSpy = jest.spyOn( companion, 'playIdleVideo' );

			companion.handleColorSchemeChange();

			expect( playSpy ).toHaveBeenCalled();
		} );
	} );

	describe( 'cleanup', () => {
		it( 'should cleanup resources', () => {
			companion = new Companion( mockConfig );

			companion.cleanup();

			expect( mockVideoPlayerInstance.cleanup ).toHaveBeenCalled();
			expect( mockVideoContainerInstance.cleanup ).toHaveBeenCalled();
		} );
	} );
} );
