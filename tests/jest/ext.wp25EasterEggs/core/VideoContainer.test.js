'use strict';

/* global HTMLElement */

describe( 'VideoContainer', () => {
	let VideoContainer;
	let videoContainer;
	let mockBreakpointResolverInstance;

	beforeEach( () => {
		jest.resetModules();

		// Mock BreakpointResolver
		mockBreakpointResolverInstance = {
			setup: jest.fn(),
			isLarge: false,
			cleanup: jest.fn()
		};
		const MockBreakpointResolver = jest.fn( () => mockBreakpointResolverInstance );

		jest.doMock( '../../../../resources/ext.wp25EasterEggs/utils/BreakpointResolver.js', () => ( {
			BreakpointResolver: MockBreakpointResolver
		} ) );

		// Reset DOM
		document.body.innerHTML = '';
		// Setup DOM structure for landmarks
		document.body.innerHTML = `
			<div class="vector-sitenotice-container">
				<div class="wp25eastereggs-sitenotice-landmark"></div>
			</div>
			<main id="content" class="main">
				<div class="vector-column-end">
					<div class="wp25eastereggs-vector-sitenotice-landmark"></div>
				</div>
			</main>
		`;

		// Mock mw.config
		global.mw.config = {
			get: jest.fn()
		};

		VideoContainer = require( '../../../../resources/ext.wp25EasterEggs/core/VideoContainer.js' ).VideoContainer;
	} );

	afterEach( () => {
		if ( videoContainer ) {
			// clean up if not already cleaned up
			if ( videoContainer.container ) {
				videoContainer.cleanup();
			}
		}
		jest.clearAllMocks();
	} );

	describe( 'constructor', () => {
		it( 'should initialize properties', () => {
			videoContainer = new VideoContainer();

			expect( videoContainer.container ).toBeInstanceOf( HTMLElement );
			expect( videoContainer.container.className ).toBe( 'wp25eastereggs-video-container' );
			expect( videoContainer.container.style.display ).toBe( 'none' );
		} );
	} );

	describe( 'setup', () => {
		it( 'should find landmarks and setup breakpoint resolver', () => {
			videoContainer = new VideoContainer();
			const updatePlacementSpy = jest.spyOn( videoContainer, 'updatePlacement' );

			videoContainer.setup();

			expect( videoContainer.vectorColumnEndLandmark ).toBeInstanceOf( HTMLElement );
			expect( videoContainer.sitenoticeLandmark ).toBeInstanceOf( HTMLElement );

			expect( mockBreakpointResolverInstance.setup ).toHaveBeenCalled();
			expect( updatePlacementSpy ).toHaveBeenCalled();
		} );
	} );

	describe( 'updatePlacement', () => {
		it( 'should place in sitenotice for minerva skin', () => {
			mw.config.get.mockReturnValue( 'minerva' );
			videoContainer = new VideoContainer();
			videoContainer.setup();
			const moveSpy = jest.spyOn( videoContainer, 'moveContainer' );

			videoContainer.updatePlacement();

			expect( moveSpy ).toHaveBeenCalledWith( 'sitenotice' );
		} );

		it( 'should place in vector-column-end for isLarge=true in vector', () => {
			mw.config.get.mockReturnValue( 'vector-2022' );
			mockBreakpointResolverInstance.isLarge = true;
			videoContainer = new VideoContainer();
			videoContainer.setup();
			const moveSpy = jest.spyOn( videoContainer, 'moveContainer' );

			videoContainer.updatePlacement();

			expect( moveSpy ).toHaveBeenCalledWith( 'vector-column-end' );
		} );

		it( 'should place in sitenotice for isLarge=false in vector', () => {
			mw.config.get.mockReturnValue( 'vector-2022' );
			mockBreakpointResolverInstance.isLarge = false;
			videoContainer = new VideoContainer();
			videoContainer.setup();
			const moveSpy = jest.spyOn( videoContainer, 'moveContainer' );

			videoContainer.updatePlacement();

			expect( moveSpy ).toHaveBeenCalledWith( 'sitenotice' );
		} );
	} );

	describe( 'moveContainer', () => {
		it( 'should append container to target landmark', () => {
			videoContainer = new VideoContainer();
			videoContainer.setup();

			// Test vector-column-end
			videoContainer.moveContainer( 'vector-column-end' );
			expect(
				videoContainer.vectorColumnEndLandmark.contains( videoContainer.container )
			).toBe( true );

			// Test sitenotice
			videoContainer.moveContainer( 'sitenotice' );
			expect(
				videoContainer.sitenoticeLandmark.contains( videoContainer.container )
			).toBe( true );
		} );

		it( 'should remove container if target landmark not found', () => {
			videoContainer = new VideoContainer();
			videoContainer.setup();

			// Force landmark to be null for testing
			videoContainer.sitenoticeLandmark = null;

			// First place it somewhere valid
			videoContainer.moveContainer( 'vector-column-end' );
			expect( videoContainer.container.parentNode ).toBeTruthy();

			// Now try to move to sitenotice (which is null)
			videoContainer.moveContainer( 'sitenotice' );

			expect( videoContainer.container.parentNode ).toBeNull();
		} );

		it( 'should not throw error if target landmark not found and container has no parent', () => {
			videoContainer = new VideoContainer();
			videoContainer.setup();
			videoContainer.sitenoticeLandmark = null;

			// Container is initially detached or detached by previous move
			videoContainer.moveContainer( 'sitenotice' );

			expect( videoContainer.container.parentNode ).toBeNull();
		} );
	} );

	describe( 'show/hide', () => {
		it( 'should show container', () => {
			videoContainer = new VideoContainer();
			videoContainer.show();
			expect( videoContainer.container.style.display ).toBe( 'block' );
		} );

		it( 'should hide container', () => {
			videoContainer = new VideoContainer();
			videoContainer.container.style.display = 'block';
			videoContainer.hide();
			expect( videoContainer.container.style.display ).toBe( 'none' );
		} );
	} );

	describe( 'cleanup', () => {
		it( 'should cleanup resources and remove elements', () => {
			videoContainer = new VideoContainer();
			videoContainer.setup();
			videoContainer.moveContainer( 'vector-column-end' );

			videoContainer.cleanup();

			expect( mockBreakpointResolverInstance.cleanup ).toHaveBeenCalled();
			expect( videoContainer.container.parentNode ).toBeNull();
		} );
	} );
} );
