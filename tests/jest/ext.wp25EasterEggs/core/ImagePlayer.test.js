'use strict';

/* global HTMLImageElement */

describe( 'ImagePlayer', () => {
	let ImagePlayer;
	let imagePlayer;
	let container;

	beforeEach( () => {
		// Reset modules
		jest.resetModules();

		// Create container
		container = document.createElement( 'div' );

		ImagePlayer = require( '../../../../resources/ext.wp25EasterEggs/core/ImagePlayer.js' ).ImagePlayer;
	} );

	afterEach( () => {
		if ( imagePlayer ) {
			imagePlayer.cleanup();
		}
		jest.clearAllMocks();
	} );

	describe( 'constructor', () => {
		it( 'should create and append image element', () => {
			imagePlayer = new ImagePlayer( container );

			expect( imagePlayer.container ).toBe( container );
			expect( imagePlayer.image ).toBeInstanceOf( HTMLImageElement );
			expect( container.contains( imagePlayer.image ) ).toBe( true );
		} );

		it( 'should configure image properties', () => {
			imagePlayer = new ImagePlayer( container );
			const image = imagePlayer.image;

			expect( image.style.width ).toBe( '100%' );
			expect( image.style.height ).toBe( '100%' );
			expect( image.style.objectFit ).toBe( 'contain' );
		} );
	} );

	describe( 'play', () => {
		it( 'should set src and resolve promise', async () => {
			imagePlayer = new ImagePlayer( container );
			const src = 'image.webp';

			await imagePlayer.play( src );

			// Check src using getAttribute because JSDOM might resolve absolute path
			expect( imagePlayer.image.src ).toContain( src );
		} );
	} );

	describe( 'cleanup', () => {
		it( 'should clear src and remove image from DOM', () => {
			imagePlayer = new ImagePlayer( container );
			const image = imagePlayer.image;

			// Set initial src
			image.src = 'image.webp';

			imagePlayer.cleanup();

			expect( image.src ).toBe( 'http://localhost/' ); // JSDOM default empty src behavior or empty string
			expect( container.contains( image ) ).toBe( false );
			expect( container.children.length ).toBe( 0 );
		} );

		it( 'should nullify image property', () => {
			imagePlayer = new ImagePlayer( container );
			imagePlayer.cleanup();

			expect( imagePlayer.image ).toBeNull();
		} );

		it( 'should handle multiple calls safely', () => {
			imagePlayer = new ImagePlayer( container );
			imagePlayer.cleanup();
			expect( () => imagePlayer.cleanup() ).not.toThrow();
		} );
	} );
} );
