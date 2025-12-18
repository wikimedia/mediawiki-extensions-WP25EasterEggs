'use strict';

/**
 * @jest-environment jsdom
 */

const { ClientPrefsHandler } = require( '../../../../resources/ext.wp25EasterEggs/core/ClientPrefsHandler.js' );

describe( 'ClientPrefsHandler', () => {
	let clientPrefsHandler;

	beforeEach( () => {
		// Reset document
		document.documentElement.className = '';
		document.body.innerHTML = '';

		// Mock mw.user.clientPrefs
		mw.user = mw.user || {};
		mw.user.clientPrefs = {
			get: jest.fn()
		};

		// Setup global MutationObserver mock
		global.MutationObserver = jest.fn( function ( callback ) {
			this.observe = jest.fn();
			this.disconnect = jest.fn();
			this.trigger = ( mutations ) => {
				callback( mutations );
			};
		} );

		jest.clearAllMocks();
	} );

	afterEach( () => {
		if ( clientPrefsHandler ) {
			clientPrefsHandler = null;
		}
	} );

	describe( 'setup', () => {
		it( 'should observe documentElement for attribute changes', () => {
			// Arrange
			clientPrefsHandler = new ClientPrefsHandler();
			mw.user.clientPrefs.get.mockReturnValue( '0' );

			// Act
			clientPrefsHandler.setup();

			// Assert
			const observerInstance = global.MutationObserver.mock.instances[ 0 ];
			expect( observerInstance.observe ).toHaveBeenCalledWith( document.documentElement, {
				attributes: true,
				attributeFilter: [ 'class' ]
			} );
		} );

		it( 'should call showCompanion if client pref is enabled on load', () => {
			// Arrange
			clientPrefsHandler = new ClientPrefsHandler();
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
			clientPrefsHandler = new ClientPrefsHandler();
			mw.user.clientPrefs.get.mockReturnValue( '0' );
			const showSpy = jest.spyOn( clientPrefsHandler, 'showCompanion' );

			// Act
			clientPrefsHandler.setup();

			// Assert
			expect( showSpy ).not.toHaveBeenCalled();
		} );
	} );

	describe( 'handleClassChange', () => {
		it( 'should call showCompanion when enabled class is present', () => {
			// Arrange
			clientPrefsHandler = new ClientPrefsHandler();
			const showSpy = jest.spyOn( clientPrefsHandler, 'showCompanion' );
			document.documentElement.classList.add( 'wp25eastereggs-enable-clientpref-1' );

			// Act
			clientPrefsHandler.handleClassChange();

			// Assert
			expect( showSpy ).toHaveBeenCalled();
		} );

		it( 'should call hideCompanion when disabled class is present', () => {
			// Arrange
			clientPrefsHandler = new ClientPrefsHandler();
			const hideSpy = jest.spyOn( clientPrefsHandler, 'hideCompanion' );
			document.documentElement.classList.add( 'wp25eastereggs-enable-clientpref-0' );

			// Act
			clientPrefsHandler.handleClassChange();

			// Assert
			expect( hideSpy ).toHaveBeenCalled();
		} );
	} );

	describe( 'integration tests', () => {
		it( 'should react to class changes via MutationObserver', () => {
			// Arrange
			clientPrefsHandler = new ClientPrefsHandler();
			clientPrefsHandler.setup();

			const observerInstance = global.MutationObserver.mock.instances[ 0 ];
			const showSpy = jest.spyOn( clientPrefsHandler, 'showCompanion' );
			const hideSpy = jest.spyOn( clientPrefsHandler, 'hideCompanion' );

			// 1. Trigger enable class
			document.documentElement.classList.add( 'wp25eastereggs-enable-clientpref-1' );
			observerInstance.trigger( [ { attributeName: 'class' } ] );

			expect( showSpy ).toHaveBeenCalled();

			// 2. Trigger disable class
			document.documentElement.classList.remove( 'wp25eastereggs-enable-clientpref-1' );
			document.documentElement.classList.add( 'wp25eastereggs-enable-clientpref-0' );
			observerInstance.trigger( [ { attributeName: 'class' } ] );

			expect( hideSpy ).toHaveBeenCalled();
		} );
	} );
} );
