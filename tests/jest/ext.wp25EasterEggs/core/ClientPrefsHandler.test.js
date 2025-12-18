'use strict';

/**
 * @jest-environment jsdom
 */

describe( 'ClientPrefsHandler', () => {
	let ClientPrefsHandler;
	let clientPrefsHandler;
	let mockCompanionConfigCreator;
	let mockMwHook;

	// Mock ColorSchemeResolver class
	const mockColorSchemeResolverInstance = {
		setup: jest.fn(),
		handleSkinColorSchemeChange: jest.fn(),
		cleanup: jest.fn()
	};
	const MockColorSchemeResolver = jest.fn( () => mockColorSchemeResolverInstance );

	beforeEach( () => {
		// Reset modules to ensure fresh require
		jest.resetModules();

		// Mock ColorSchemeResolver
		jest.doMock( '../../../../resources/ext.wp25EasterEggs/utils/ColorSchemeResolver.js', () => ( {
			ColorSchemeResolver: MockColorSchemeResolver
		} ) );

		// Require ClientPrefsHandler after mocking dependencies
		ClientPrefsHandler = require( '../../../../resources/ext.wp25EasterEggs/core/ClientPrefsHandler.js' ).ClientPrefsHandler;

		// Mock companion config creator
		mockCompanionConfigCreator = jest.fn().mockReturnValue( { name: 'test' } );

		// Reset mocks
		MockColorSchemeResolver.mockClear();
		Object.values( mockColorSchemeResolverInstance ).forEach( ( mock ) => mock.mockClear() );

		// Reset document
		document.documentElement.className = '';
		document.body.innerHTML = '';

		// Mock mw.user.clientPrefs
		mw.user = mw.user || {};
		mw.user.clientPrefs = {
			get: jest.fn()
		};

		// Mock mw.hook
		mockMwHook = {
			add: jest.fn(),
			fire: jest.fn(),
			remove: jest.fn()
		};
		mw.hook = jest.fn().mockReturnValue( mockMwHook );
	} );

	afterEach( () => {
		clientPrefsHandler = null;
		jest.clearAllMocks();
	} );

	describe( 'setup', () => {
		it( 'should listen to skin-client-preference.change hook', () => {
			// Arrange
			clientPrefsHandler = new ClientPrefsHandler( mockCompanionConfigCreator );
			mw.user.clientPrefs.get.mockReturnValue( '0' );

			// Act
			clientPrefsHandler.setup();

			// Assert
			expect( mw.hook ).toHaveBeenCalledWith( 'skin-client-preference.change' );
			expect( mockMwHook.add ).toHaveBeenCalledWith( expect.any( Function ) );
		} );

		it( 'should call showCompanion if client pref is enabled on load', () => {
			// Arrange
			clientPrefsHandler = new ClientPrefsHandler( mockCompanionConfigCreator );
			mw.user.clientPrefs.get.mockReturnValue( '1' );
			const showSpy = jest.spyOn( clientPrefsHandler, 'showCompanion' );

			// Act
			clientPrefsHandler.setup();

			// Assert
			expect( mw.user.clientPrefs.get ).toHaveBeenCalledWith( 'wp25eastereggs-enable' );
			expect( showSpy ).toHaveBeenCalled();
		} );

		it( 'should not call showCompanion if client pref is disabled on load', () => {
			// Arrange
			clientPrefsHandler = new ClientPrefsHandler( mockCompanionConfigCreator );
			mw.user.clientPrefs.get.mockReturnValue( '0' );
			const showSpy = jest.spyOn( clientPrefsHandler, 'showCompanion' );

			// Act
			clientPrefsHandler.setup();

			// Assert
			expect( showSpy ).not.toHaveBeenCalled();
		} );
	} );

	describe( 'handleClientPrefChange', () => {
		it( 'should call showCompanion when wp25eastereggs-enable is set to "1"', () => {
			// Arrange
			clientPrefsHandler = new ClientPrefsHandler( mockCompanionConfigCreator );
			const showSpy = jest.spyOn( clientPrefsHandler, 'showCompanion' );

			// Act
			clientPrefsHandler.handleClientPrefChange( 'wp25eastereggs-enable', '1' );

			// Assert
			expect( showSpy ).toHaveBeenCalled();
		} );

		it( 'should call hideCompanion when wp25eastereggs-enable is set to "0"', () => {
			// Arrange
			clientPrefsHandler = new ClientPrefsHandler( mockCompanionConfigCreator );
			const hideSpy = jest.spyOn( clientPrefsHandler, 'hideCompanion' );

			// Act
			clientPrefsHandler.handleClientPrefChange( 'wp25eastereggs-enable', '0' );

			// Assert
			expect( hideSpy ).toHaveBeenCalled();
		} );

		it( 'should update color scheme on skin-theme change', () => {
			// Arrange
			clientPrefsHandler = new ClientPrefsHandler( mockCompanionConfigCreator );

			// Act
			clientPrefsHandler.handleClientPrefChange( 'skin-theme', 'night' );

			// Assert
			expect( mockColorSchemeResolverInstance.handleSkinColorSchemeChange ).toHaveBeenCalledWith( 'night' );
		} );
	} );

	describe( 'handleColorSchemeChange', () => {
		it( 'should delegate to companion if active', () => {
			// Arrange
			clientPrefsHandler = new ClientPrefsHandler( mockCompanionConfigCreator );
			clientPrefsHandler.companion = { handleColorSchemeChange: jest.fn() };

			// Act
			clientPrefsHandler.handleColorSchemeChange();

			// Assert
			expect( clientPrefsHandler.companion.handleColorSchemeChange ).toHaveBeenCalled();
		} );

		it( 'should be wire up with ColorSchemeResolver callback', () => {
			// Arrange
			// Capture the callback passed to ColorSchemeResolver constructor
			let callback;
			MockColorSchemeResolver.mockImplementation( ( cb ) => {
				callback = cb;
				return mockColorSchemeResolverInstance;
			} );

			clientPrefsHandler = new ClientPrefsHandler( mockCompanionConfigCreator );
			const handleSpy = jest.spyOn( clientPrefsHandler, 'handleColorSchemeChange' );

			// Act
			// Trigger the callback captured from constructor
			callback();

			// Assert
			expect( handleSpy ).toHaveBeenCalled();
		} );
	} );

	describe( 'showCompanion', () => {
		it( 'should setup color scheme resolver', () => {
			// Arrange
			clientPrefsHandler = new ClientPrefsHandler( mockCompanionConfigCreator );

			// Act
			clientPrefsHandler.showCompanion();

			// Assert
			expect( mockColorSchemeResolverInstance.setup ).toHaveBeenCalled();
		} );

		it( 'should create and setup companion', () => {
			// Arrange
			clientPrefsHandler = new ClientPrefsHandler( mockCompanionConfigCreator );

			// Act
			clientPrefsHandler.showCompanion();

			// Assert
			expect( mockCompanionConfigCreator ).toHaveBeenCalled();
			expect( clientPrefsHandler.companion ).not.toBeNull();
			// Since companion is stubbed, we check if it's an object with setup method
			expect( typeof clientPrefsHandler.companion.setup ).toBe( 'function' );
		} );
	} );

	describe( 'hideCompanion', () => {
		it( 'should cleanup color scheme resolver', () => {
			// Arrange
			clientPrefsHandler = new ClientPrefsHandler( mockCompanionConfigCreator );
			// Manually attach a dummy companion so hideCompanion proceeds
			clientPrefsHandler.companion = { cleanup: jest.fn() };

			// Act
			clientPrefsHandler.hideCompanion();

			// Assert
			expect( mockColorSchemeResolverInstance.cleanup ).toHaveBeenCalled();
		} );

		it( 'should cleanup companion', () => {
			// Arrange
			clientPrefsHandler = new ClientPrefsHandler( mockCompanionConfigCreator );
			const mockCleanup = jest.fn();
			clientPrefsHandler.companion = { cleanup: mockCleanup };

			// Act
			clientPrefsHandler.hideCompanion();

			// Assert
			expect( mockCleanup ).toHaveBeenCalled();
			expect( clientPrefsHandler.companion ).toBeNull();
		} );
	} );

	describe( 'getCurrentCompanionConfigCreator', () => {
		it( 'should return null if companion not enabled on page', () => {
			// Arrange
			document.documentElement.className = '';
			const configs = { default: jest.fn() };

			// Act
			const result = ClientPrefsHandler.getCurrentCompanionConfigCreator( configs );

			// Assert
			expect( result ).toBeNull();
		} );

		it( 'should return default config creator if enabled but no specific type', () => {
			// Arrange
			document.documentElement.className = 'wp25eastereggs-companion-enabled';
			const defaultCreator = jest.fn();
			const configs = { default: defaultCreator };

			// Act
			const result = ClientPrefsHandler.getCurrentCompanionConfigCreator( configs );

			// Assert
			expect( result ).toBe( defaultCreator );
		} );

		it( 'should return specific config creator based on class', () => {
			// Arrange
			document.documentElement.className = 'wp25eastereggs-companion-enabled wp25eastereggs-companion-celebrate';
			const celebrateCreator = jest.fn();
			const configs = {
				default: jest.fn(),
				celebrate: celebrateCreator
			};

			// Act
			const result = ClientPrefsHandler.getCurrentCompanionConfigCreator( configs );

			// Assert
			expect( result ).toBe( celebrateCreator );
		} );

		it( 'should return null if specific config not in map', () => {
			// Arrange
			document.documentElement.className = 'wp25eastereggs-companion-enabled wp25eastereggs-companion-unknown';
			const configs = { default: jest.fn() };

			// Act
			const result = ClientPrefsHandler.getCurrentCompanionConfigCreator( configs );

			// Assert
			expect( result ).toBeNull();
		} );
	} );

	describe( 'integration tests', () => {
		it( 'should react to hook events', () => {
			// Arrange
			clientPrefsHandler = new ClientPrefsHandler( mockCompanionConfigCreator );
			// Capture the callback registered to add
			let storedCallback;
			mockMwHook.add.mockImplementation( ( cb ) => {
				storedCallback = cb;
			} );
			clientPrefsHandler.setup();

			const showSpy = jest.spyOn( clientPrefsHandler, 'showCompanion' );
			const hideSpy = jest.spyOn( clientPrefsHandler, 'hideCompanion' );

			// 1. Trigger enable
			storedCallback( 'wp25eastereggs-enable', '1' );

			expect( showSpy ).toHaveBeenCalled();

			// 2. Trigger disable
			storedCallback( 'wp25eastereggs-enable', '0' );

			expect( hideSpy ).toHaveBeenCalled();
		} );
	} );
} );
