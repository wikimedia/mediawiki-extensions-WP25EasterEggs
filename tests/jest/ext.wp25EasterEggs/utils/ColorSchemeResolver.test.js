'use strict';

const { ColorSchemeResolver } = require( '../../../../resources/ext.wp25EasterEggs/utils/ColorSchemeResolver.js' );

describe( 'ColorSchemeResolver', () => {
	let colorSchemeResolver;
	const onChange = jest.fn();

	// Mock matchQuery
	const mockMatchMedia = {
		matches: false,
		addEventListener: jest.fn(),
		removeEventListener: jest.fn()
	};

	beforeEach( () => {
		// Reset mocks
		onChange.mockReset();
		mockMatchMedia.addEventListener.mockReset();
		mockMatchMedia.removeEventListener.mockReset();
		mockMatchMedia.matches = false;

		// Reset static state
		ColorSchemeResolver.osColorScheme = null;
		ColorSchemeResolver.skinColorScheme = null;

		// Mock mw.user.clientPrefs
		global.mw.user.clientPrefs = {
			get: jest.fn()
		};

		// Mock window.matchMedia
		Object.defineProperty( window, 'matchMedia', {
			writable: true,
			value: jest.fn().mockReturnValue( mockMatchMedia )
		} );
	} );

	describe( 'getCurrentColorScheme', () => {
		it( 'should return "dark" when client pref is "night"', () => {
			mw.user.clientPrefs.get.mockReturnValue( 'night' );
			expect( ColorSchemeResolver.getCurrentColorScheme() ).toBe( 'dark' );
		} );

		it( 'should return "light" when client pref is "day"', () => {
			mw.user.clientPrefs.get.mockReturnValue( 'day' );
			expect( ColorSchemeResolver.getCurrentColorScheme() ).toBe( 'light' );
		} );

		it( 'should return "dark" when client pref is "os" and OS is dark', () => {
			mw.user.clientPrefs.get.mockReturnValue( 'os' );
			mockMatchMedia.matches = true;
			window.matchMedia = jest.fn().mockReturnValue( mockMatchMedia );
			expect( ColorSchemeResolver.getCurrentColorScheme() ).toBe( 'dark' );
		} );

		it( 'should return "light" when client pref is "os" and OS is light', () => {
			mw.user.clientPrefs.get.mockReturnValue( 'os' );
			mockMatchMedia.matches = false;
			window.matchMedia = jest.fn().mockReturnValue( mockMatchMedia );
			expect( ColorSchemeResolver.getCurrentColorScheme() ).toBe( 'light' );
		} );

		it( 'should return "light" by default', () => {
			mw.user.clientPrefs.get.mockReturnValue( 'unknown' );
			expect( ColorSchemeResolver.getCurrentColorScheme() ).toBe( 'light' );
		} );

		it( 'should return "light" when client pref is null', () => {
			mw.user.clientPrefs.get.mockReturnValue( null );
			expect( ColorSchemeResolver.getCurrentColorScheme() ).toBe( 'light' );
		} );

		it( 'should return "light" when client pref is "os" but os scheme is null', () => {
			// Manually set static properties to simulate this state
			ColorSchemeResolver.skinColorScheme = 'os';
			ColorSchemeResolver.osColorScheme = null;

			expect( ColorSchemeResolver.getCurrentColorScheme() ).toBe( 'light' );
		} );
	} );

	describe( 'setup', () => {
		it( 'should add listener for OS color scheme changes', () => {
			// Arrange
			colorSchemeResolver = new ColorSchemeResolver( onChange );

			// Act
			colorSchemeResolver.setup();

			// Assert
			expect( window.matchMedia ).toHaveBeenCalledWith( '(prefers-color-scheme: dark)' );
			expect( mockMatchMedia.addEventListener ).toHaveBeenCalledWith( 'change', expect.any( Function ) );
		} );

		it( 'should store removeOsListener function', () => {
			// Arrange
			colorSchemeResolver = new ColorSchemeResolver( onChange );

			// Act
			colorSchemeResolver.setup();

			// Assert
			expect( colorSchemeResolver.removeOsListener ).toBeInstanceOf( Function );
		} );
	} );

	describe( 'handleOsColorSchemeChange', () => {
		it( 'should update color scheme when in OS mode', () => {
			// Arrange
			mw.user.clientPrefs.get.mockReturnValue( 'os' );
			mockMatchMedia.matches = false;
			window.matchMedia = jest.fn().mockReturnValue( mockMatchMedia );
			colorSchemeResolver = new ColorSchemeResolver( onChange );
			colorSchemeResolver.setup();

			// Act - simulate OS color scheme change to dark
			mockMatchMedia.matches = true;
			window.matchMedia = jest.fn().mockReturnValue( mockMatchMedia );
			colorSchemeResolver.handleOsColorSchemeChange( { matches: true } );

			// Assert
			expect( onChange ).toHaveBeenCalledWith( 'dark', 'light' );
		} );

		it( 'should not update color scheme when not in OS mode', () => {
			// Arrange
			mw.user.clientPrefs.get.mockReturnValue( 'night' );
			colorSchemeResolver = new ColorSchemeResolver( onChange );
			colorSchemeResolver.setup();

			// Act - simulate OS color scheme change (but we're in night mode)
			colorSchemeResolver.handleOsColorSchemeChange( { matches: true } );

			// Assert
			expect( onChange ).not.toHaveBeenCalled();
		} );

		it( 'should update color scheme to light when OS changes to light', () => {
			// Arrange
			mw.user.clientPrefs.get.mockReturnValue( 'os' );
			mockMatchMedia.matches = true; // initially dark
			window.matchMedia = jest.fn().mockReturnValue( mockMatchMedia );
			colorSchemeResolver = new ColorSchemeResolver( onChange );
			colorSchemeResolver.setup();

			// Act - simulate OS color scheme change to light
			colorSchemeResolver.handleOsColorSchemeChange( { matches: false } );

			// Assert
			expect( onChange ).toHaveBeenCalledWith( 'light', 'dark' );
		} );
	} );

	describe( 'updateColorScheme', () => {
		it( 'should call onChange when color scheme changes', () => {
			// Arrange
			mw.user.clientPrefs.get.mockReturnValue( 'day' );
			colorSchemeResolver = new ColorSchemeResolver( onChange );

			// Act - change to night mode
			ColorSchemeResolver.skinColorScheme = 'night';
			colorSchemeResolver.updateColorScheme();

			// Assert
			expect( onChange ).toHaveBeenCalledWith( 'dark', 'light' );
			expect( onChange ).toHaveBeenCalledTimes( 1 );
		} );

		it( 'should not call onChange when color scheme does not change', () => {
			// Arrange
			mw.user.clientPrefs.get.mockReturnValue( 'day' );
			colorSchemeResolver = new ColorSchemeResolver( onChange );

			// Act - no actual color scheme change
			colorSchemeResolver.updateColorScheme();

			// Assert
			expect( onChange ).not.toHaveBeenCalled();
		} );

		it( 'should update currentColorScheme property', () => {
			// Arrange
			mw.user.clientPrefs.get.mockReturnValue( 'day' );
			colorSchemeResolver = new ColorSchemeResolver( onChange );
			expect( colorSchemeResolver.currentColorScheme ).toBe( 'light' );

			// Act
			ColorSchemeResolver.skinColorScheme = 'night';
			colorSchemeResolver.updateColorScheme();

			// Assert
			expect( colorSchemeResolver.currentColorScheme ).toBe( 'dark' );
		} );

		it( 'should pass old and new color scheme to onChange', () => {
			// Arrange
			mw.user.clientPrefs.get.mockReturnValue( 'night' );
			colorSchemeResolver = new ColorSchemeResolver( onChange );

			// Act
			ColorSchemeResolver.skinColorScheme = 'day';
			colorSchemeResolver.updateColorScheme();

			// Assert
			expect( onChange ).toHaveBeenCalledWith( 'light', 'dark' );
		} );
	} );

	describe( 'cleanup', () => {
		it( 'should remove OS color scheme listener', () => {
			// Arrange
			colorSchemeResolver = new ColorSchemeResolver( onChange );
			colorSchemeResolver.setup();

			// Act
			colorSchemeResolver.cleanup();

			// Assert
			expect( mockMatchMedia.removeEventListener ).toHaveBeenCalledWith( 'change', expect.any( Function ) );
		} );

		it( 'should set removeOsListener to null', () => {
			// Arrange
			colorSchemeResolver = new ColorSchemeResolver( onChange );
			colorSchemeResolver.setup();

			// Act
			colorSchemeResolver.cleanup();

			// Assert
			expect( colorSchemeResolver.removeOsListener ).toBeNull();
		} );

		it( 'should set currentColorScheme to null', () => {
			// Arrange
			colorSchemeResolver = new ColorSchemeResolver( onChange );

			// Act
			colorSchemeResolver.cleanup();

			// Assert
			expect( colorSchemeResolver.currentColorScheme ).toBeNull();
		} );

		it( 'should not error when called without setup', () => {
			// Arrange
			colorSchemeResolver = new ColorSchemeResolver( onChange );

			// Act & Assert
			expect( () => colorSchemeResolver.cleanup() ).not.toThrow();
		} );
	} );

	describe( 'integration tests', () => {
		it( 'should handle complete lifecycle', () => {
			// Arrange
			mw.user.clientPrefs.get.mockReturnValue( 'day' );
			colorSchemeResolver = new ColorSchemeResolver( onChange );

			// Act - setup
			colorSchemeResolver.setup();

			// Change skin theme
			colorSchemeResolver.handleSkinColorSchemeChange( 'night' );

			// Cleanup
			colorSchemeResolver.cleanup();

			// Assert
			expect( onChange ).toHaveBeenCalledWith( 'dark', 'light' );
			expect( colorSchemeResolver.currentColorScheme ).toBeNull();
			expect( colorSchemeResolver.removeOsListener ).toBeNull();
		} );

		it( 'should switch to light mode when client pref changes from "night" to "day"', () => {
			// Arrange
			mw.user.clientPrefs.get.mockReturnValue( 'night' );
			colorSchemeResolver = new ColorSchemeResolver( onChange );

			// Verify initial state
			expect( colorSchemeResolver.currentColorScheme ).toBe( 'dark' );

			// Act
			colorSchemeResolver.handleSkinColorSchemeChange( 'day' );

			// Assert
			expect( onChange ).toHaveBeenCalledWith( 'light', 'dark' );
			expect( colorSchemeResolver.currentColorScheme ).toBe( 'light' );
		} );

		it( 'should switch to light mode when switching from OS (dark) to "day" preference', () => {
			// Arrange
			mw.user.clientPrefs.get.mockReturnValue( 'os' );
			mockMatchMedia.matches = true; // OS Dark
			window.matchMedia = jest.fn().mockReturnValue( mockMatchMedia );

			colorSchemeResolver = new ColorSchemeResolver( onChange );

			// Verify initial state
			expect( colorSchemeResolver.currentColorScheme ).toBe( 'dark' );

			// Act
			colorSchemeResolver.handleSkinColorSchemeChange( 'day' );

			// Assert
			expect( onChange ).toHaveBeenCalledWith( 'light', 'dark' );
			expect( colorSchemeResolver.currentColorScheme ).toBe( 'light' );
		} );

		it( 'should handle OS color scheme changes when in OS mode', () => {
			// Arrange
			mw.user.clientPrefs.get.mockReturnValue( 'os' );
			mockMatchMedia.matches = false;
			let mediaQueryCallback;
			mockMatchMedia.addEventListener = jest.fn( ( event, callback ) => {
				mediaQueryCallback = callback;
			} );
			window.matchMedia = jest.fn().mockReturnValue( mockMatchMedia );

			colorSchemeResolver = new ColorSchemeResolver( onChange );
			colorSchemeResolver.setup();

			// Act - simulate OS color scheme change
			mockMatchMedia.matches = true;
			window.matchMedia = jest.fn().mockReturnValue( mockMatchMedia );
			mediaQueryCallback( { matches: true } );

			// Assert
			expect( onChange ).toHaveBeenCalledWith( 'dark', 'light' );
		} );
	} );
} );
