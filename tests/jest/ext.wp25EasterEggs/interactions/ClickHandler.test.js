'use strict';

describe( 'ClickHandler', () => {
	let ClickHandler;
	let clickHandler;
	let mockVideoPlayer;
	let mockGetVideoSrc;
	let container;

	beforeEach( () => {
		jest.resetModules();

		// Mock VideoPlayer
		mockVideoPlayer = {
			playOnce: jest.fn().mockResolvedValue(),
			playLoop: jest.fn().mockResolvedValue()
		};

		// Mock getVideoSrc
		mockGetVideoSrc = jest.fn();

		// Create container
		container = document.createElement( 'div' );

		ClickHandler = require( '../../../../resources/ext.wp25EasterEggs/interactions/ClickHandler.js' ).ClickHandler;
	} );

	afterEach( () => {
		if ( clickHandler ) {
			clickHandler.cleanup();
		}
		jest.clearAllMocks();
	} );

	describe( 'constructor', () => {
		it( 'should initialize properties', () => {
			clickHandler = new ClickHandler( {
				container: container,
				videoPlayer: mockVideoPlayer,
				getVideoSrc: mockGetVideoSrc
			} );

			expect( clickHandler.container ).toBe( container );
			expect( clickHandler.videoPlayer ).toBe( mockVideoPlayer );
			expect( clickHandler.getVideoSrc ).toBe( mockGetVideoSrc );
			expect( clickHandler.isPlayingAnimation ).toBe( false );
			expect( clickHandler.boundHandleClick ).toBeNull();
		} );
	} );

	describe( 'setup', () => {
		it( 'should add click event listener and set cursor to pointer', () => {
			clickHandler = new ClickHandler( {
				container: container,
				videoPlayer: mockVideoPlayer,
				getVideoSrc: mockGetVideoSrc
			} );
			const addEventListenerSpy = jest.spyOn( container, 'addEventListener' );

			clickHandler.setup();

			expect( addEventListenerSpy ).toHaveBeenCalledWith( 'click', expect.any( Function ) );
			expect( clickHandler.boundHandleClick ).toEqual( expect.any( Function ) );
			expect( container.style.cursor ).toBe( 'pointer' );
		} );
	} );

	describe( 'handleClick', () => {
		let event;

		beforeEach( () => {
			clickHandler = new ClickHandler( {
				container: container,
				videoPlayer: mockVideoPlayer,
				getVideoSrc: mockGetVideoSrc
			} );
			clickHandler.setup();
			event = { preventDefault: jest.fn() };
		} );

		it( 'should prevent default event action', () => {
			clickHandler.handleClick( event );
			expect( event.preventDefault ).toHaveBeenCalled();
		} );

		it( 'should ignore click if already playing animation', () => {
			clickHandler.isPlayingAnimation = true;
			clickHandler.handleClick( event );
			expect( mockGetVideoSrc ).not.toHaveBeenCalled();
		} );

		it( 'should ignore click if no click source available', () => {
			mockGetVideoSrc.mockReturnValue( undefined );
			clickHandler.handleClick( event );
			expect( mockGetVideoSrc ).toHaveBeenCalledWith( 'click' );
			expect( mockVideoPlayer.playOnce ).not.toHaveBeenCalled();
		} );

		it( 'should play click animation, change cursor, and return to idle', async () => {
			mockGetVideoSrc.mockImplementation( ( type ) => {
				if ( type === 'click' ) {
					return 'click.webm';
				}
				if ( type === 'idle' ) {
					return 'idle.webm';
				}
			} );
			let resolvePlayOnce;
			mockVideoPlayer.playOnce.mockReturnValue( new Promise( ( resolve ) => {
				resolvePlayOnce = resolve;
			} ) );

			// Trigger click
			clickHandler.handleClick( event );

			expect( clickHandler.isPlayingAnimation ).toBe( true );
			expect( container.style.cursor ).toBe( 'default' );
			expect( mockVideoPlayer.playOnce ).toHaveBeenCalledWith( 'click.webm' );

			// Resolve playOnce
			resolvePlayOnce();

			// Wait for promises to resolve
			await new Promise( ( resolve ) => {
				process.nextTick( resolve );
			} );

			expect( clickHandler.isPlayingAnimation ).toBe( false );
			expect( container.style.cursor ).toBe( 'pointer' );
			expect( mockGetVideoSrc ).toHaveBeenCalledWith( 'idle' );
			expect( mockVideoPlayer.playLoop ).toHaveBeenCalledWith( 'idle.webm' );
		} );
	} );

	describe( 'cleanup', () => {
		it( 'should remove event listener and reset cursor', () => {
			clickHandler = new ClickHandler( {
				container: container,
				videoPlayer: mockVideoPlayer,
				getVideoSrc: mockGetVideoSrc
			} );
			const removeEventListenerSpy = jest.spyOn( container, 'removeEventListener' );
			clickHandler.setup();

			clickHandler.cleanup();

			expect( removeEventListenerSpy ).toHaveBeenCalledWith( 'click', expect.any( Function ) );
			expect( clickHandler.boundHandleClick ).toBeNull();
			expect( container.style.cursor ).toBe( '' );
		} );

		it( 'should handle multiple cleanup calls safely', () => {
			clickHandler = new ClickHandler( {
				container: container,
				videoPlayer: mockVideoPlayer,
				getVideoSrc: mockGetVideoSrc
			} );
			clickHandler.setup();

			clickHandler.cleanup();
			expect( () => clickHandler.cleanup() ).not.toThrow();
		} );
	} );
} );
