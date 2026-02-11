'use strict';

describe( 'InactivityHandler', () => {
	let InactivityHandler;
	let inactivityHandler;
	let mockVideoPlayer;
	let mockGetVideoSrc;
	let mockContainer;

	beforeEach( () => {
		jest.resetModules();
		jest.useFakeTimers();

		// Mock VideoPlayer
		mockVideoPlayer = {
			playSequence: jest.fn().mockResolvedValue(),
			playLoop: jest.fn()
		};

		// Mock getVideoSrc
		mockGetVideoSrc = jest.fn();

		// Mock Container
		mockContainer = document.createElement( 'div' );

		InactivityHandler = require( '../../../../resources/ext.wp25EasterEggs/interactions/InactivityHandler.js' ).InactivityHandler;

		// Mock mw.config.get
		global.mw = {
			config: {
				get: jest.fn().mockReturnValue( 'vector' )
			},
			util: {
				throttle: jest.fn().mockImplementation( ( fn ) => fn )
			}
		};
	} );

	afterEach( () => {
		if ( inactivityHandler ) {
			inactivityHandler.cleanup();
		}
		jest.clearAllMocks();
		jest.clearAllTimers();
		delete global.mw;
		window.scrollY = 0;
	} );

	describe( 'constructor', () => {
		it( 'should initialize properties', () => {
			inactivityHandler = new InactivityHandler( {
				videoPlayer: mockVideoPlayer,
				getVideoSrc: mockGetVideoSrc,
				container: mockContainer
			} );

			expect( inactivityHandler.videoPlayer ).toBe( mockVideoPlayer );
			expect( inactivityHandler.getVideoSrc ).toBe( mockGetVideoSrc );
			expect( inactivityHandler.timeoutDelay ).toBe( 5 * 60 * 1000 );
			expect( inactivityHandler.state ).toBe( 'idle' );
			expect( inactivityHandler.hiddenSince ).toBeNull();

		} );
	} );

	describe( 'setup', () => {
		it( 'should add event listeners and start timer', () => {
			inactivityHandler = new InactivityHandler( {
				videoPlayer: mockVideoPlayer,
				getVideoSrc: mockGetVideoSrc,
				container: mockContainer
			} );
			const addEventListenerSpy = jest.spyOn( mockContainer, 'addEventListener' );
			const windowAddEventListenerSpy = jest.spyOn( window, 'addEventListener' );

			inactivityHandler.setup();

			expect( addEventListenerSpy ).toHaveBeenCalledWith(
				'click',
				expect.any( Function ),
				{ passive: true }
			);
			expect( addEventListenerSpy ).toHaveBeenCalledWith(
				'mouseenter',
				expect.any( Function ),
				{ passive: true }
			);

			expect( addEventListenerSpy ).not.toHaveBeenCalledWith( 'scroll', expect.any( Function ), expect.anything() );
			expect( addEventListenerSpy ).not.toHaveBeenCalledWith( 'keydown', expect.any( Function ), expect.anything() );
			expect( windowAddEventListenerSpy ).not.toHaveBeenCalledWith( 'mousemove', expect.any( Function ), expect.anything() );

			expect( inactivityHandler.boundHandleActivity ).toEqual( expect.any( Function ) );
		} );
	} );

	describe( 'handleActivity', () => {
		beforeEach( () => {
			inactivityHandler = new InactivityHandler( {
				videoPlayer: mockVideoPlayer,
				getVideoSrc: mockGetVideoSrc,
				container: mockContainer
			} );
			inactivityHandler.setup();
		} );

		it( 'should not reset timer on activity', () => {
			const clearTimeoutSpy = jest.spyOn( window, 'clearTimeout' );
			const setTimeoutSpy = jest.spyOn( window, 'setTimeout' );

			inactivityHandler.handleActivity();

			expect( clearTimeoutSpy ).not.toHaveBeenCalled();
			expect( setTimeoutSpy ).not.toHaveBeenCalled();
		} );

		it( 'should trigger wake up sequence if previously inactive', () => {
			inactivityHandler.state = 'sleep';

			mockGetVideoSrc.mockImplementation( ( type ) => {
				const sources = {
					sleepTransitionOut: 'sleep-out.webm',
					transitionFromSleep: 'trans-in.webm',
					idle: 'idle.webm'
				};
				return sources[ type ];
			} );

			inactivityHandler.handleActivity();

			expect( inactivityHandler.state ).toBe( 'transitionFromSleep' );
			expect( mockVideoPlayer.playSequence ).toHaveBeenCalledWith( [
				'sleep-out.webm',
				'trans-in.webm',
				'idle.webm'
			] );
		} );

		it( 'should handle missing video sources gracefully during wake up', () => {
			inactivityHandler.state = 'sleep';
			mockGetVideoSrc.mockReturnValue( undefined );

			inactivityHandler.handleActivity();

			expect( inactivityHandler.state ).toBe( 'sleep' );
			expect( mockVideoPlayer.playSequence ).not.toHaveBeenCalled();
		} );
	} );

	describe( 'handleVisibilityChange', () => {
		it( 'should pause timer (record timestamp) when page is hidden', () => {
			inactivityHandler = new InactivityHandler( {
				videoPlayer: mockVideoPlayer,
				getVideoSrc: mockGetVideoSrc,
				container: mockContainer
			} );
			inactivityHandler.setup();

			Object.defineProperty( document, 'hidden', { configurable: true, value: true } );
			inactivityHandler.handleVisibilityChange();

			expect( inactivityHandler.hiddenSince ).not.toBeNull();
		} );

		it( 'should trigger sleep if hidden duration exceeds timeout', () => {
			inactivityHandler = new InactivityHandler( {
				videoPlayer: mockVideoPlayer,
				getVideoSrc: mockGetVideoSrc,
				container: mockContainer
			} );
			inactivityHandler.setup();

			const now = 10000;
			const dateSpy = jest.spyOn( Date, 'now' ).mockReturnValue( now );

			inactivityHandler.handleVisibilityChange();
			inactivityHandler.hiddenSince = now - ( 6 * 60 * 1000 ); // 6 mins ago (timeout 5m)

			mockGetVideoSrc.mockReturnValue( 'sleep.webm' );

			Object.defineProperty( document, 'hidden', { configurable: true, value: false } );
			inactivityHandler.handleVisibilityChange();

			expect( inactivityHandler.state ).toBe( 'sleep' );
			expect( mockVideoPlayer.playLoop ).toHaveBeenCalledWith( 'sleep.webm' );

			dateSpy.mockRestore();
		} );

		it( 'should not trigger sleep if hidden duration is less than timeout', () => {
			inactivityHandler = new InactivityHandler( {
				videoPlayer: mockVideoPlayer,
				getVideoSrc: mockGetVideoSrc,
				container: mockContainer
			} );
			inactivityHandler.setup();

			const now = 10000;
			const dateSpy = jest.spyOn( Date, 'now' ).mockReturnValue( now );

			inactivityHandler.handleVisibilityChange();
			inactivityHandler.hiddenSince = now - 1000; // 1 second ago

			Object.defineProperty( document, 'hidden', { configurable: true, value: false } );
			inactivityHandler.handleVisibilityChange();

			expect( inactivityHandler.state ).toBe( 'idle' );
			expect( mockVideoPlayer.playLoop ).not.toHaveBeenCalled();

			dateSpy.mockRestore();
		} );
	} );

	describe( 'cleanup', () => {
		it( 'should remove event listeners and clear timer', () => {
			inactivityHandler = new InactivityHandler( {
				videoPlayer: mockVideoPlayer,
				getVideoSrc: mockGetVideoSrc,
				container: mockContainer
			} );
			const removeEventListenerSpy = jest.spyOn( mockContainer, 'removeEventListener' );

			inactivityHandler.setup();
			inactivityHandler.cleanup();

			expect( removeEventListenerSpy ).toHaveBeenCalledWith( 'mousemove', expect.any( Function ) );
			expect( removeEventListenerSpy ).toHaveBeenCalledWith( 'click', expect.any( Function ) );
			expect( removeEventListenerSpy ).toHaveBeenCalledWith( 'mouseenter', expect.any( Function ) );

			expect( inactivityHandler.boundHandleActivity ).toBeNull();
		} );
	} );
} );
