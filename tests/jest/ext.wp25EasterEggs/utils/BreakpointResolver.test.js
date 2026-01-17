'use strict';

describe( 'BreakpointResolver', () => {
	let BreakpointResolver;
	let breakpointResolver;
	const onChange = jest.fn();

	// Mock matchMedia
	const mockMatchMedia = jest.fn();
	const mockQueries = {};

	beforeEach( () => {
		// Reset mocks
		jest.resetModules();
		onChange.mockReset();
		mockMatchMedia.mockReset();

		// Mock window.matchMedia
		Object.defineProperty( window, 'matchMedia', {
			writable: true,
			value: mockMatchMedia
		} );

		// Setup default matchMedia mock behavior
		mockMatchMedia.mockImplementation( ( query ) => {
			const listeners = [];
			const mq = {
				matches: false,
				media: query,
				onchange: null,
				addEventListener: jest.fn( ( event, listener ) => {
					listeners.push( listener );
				} ),
				removeEventListener: jest.fn( ( event, listener ) => {
					const index = listeners.indexOf( listener );
					if ( index > -1 ) {
						listeners.splice( index, 1 );
					}
				} ),
				dispatchEvent: jest.fn( ( event ) => {
					listeners.forEach( ( listener ) => listener( event ) );
				} )
			};
			mockQueries[ query ] = mq;
			return mq;
		} );

		BreakpointResolver = require( '../../../../resources/ext.wp25EasterEggs/utils/BreakpointResolver.js' ).BreakpointResolver;
	} );

	afterEach( () => {
		if ( breakpointResolver ) {
			breakpointResolver.cleanup();
		}
	} );

	describe( 'constructor', () => {
		it( 'should initialize properties', () => {
			breakpointResolver = new BreakpointResolver( onChange );

			expect( breakpointResolver.removeListener ).toBeNull();
			expect( breakpointResolver.isLarge ).toBeNull();
			expect( breakpointResolver.onChange ).toBe( onChange );
		} );
	} );

	describe( 'setup', () => {
		it( 'should create media query for large breakpoint', () => {
			breakpointResolver = new BreakpointResolver( onChange );
			breakpointResolver.setup();

			expect( mockMatchMedia ).toHaveBeenCalledWith( '(min-width: 1120px)' );
		} );

		it( 'should set initial state', () => {
			// Simulate 'lg' match
			mockMatchMedia.mockImplementation( ( query ) => {
				const isLg = query.includes( '(min-width: 1120px)' );
				return {
					matches: isLg,
					addEventListener: jest.fn(),
					removeEventListener: jest.fn()
				};
			} );

			breakpointResolver = new BreakpointResolver( onChange );
			breakpointResolver.setup();

			expect( breakpointResolver.isLarge ).toBe( true );
		} );

		it( 'should add event listener', () => {
			breakpointResolver = new BreakpointResolver( onChange );
			breakpointResolver.setup();

			const mqLg = mockQueries[ '(min-width: 1120px)' ];
			expect( mqLg.addEventListener ).toHaveBeenCalledWith( 'change', expect.any( Function ) );
		} );
	} );

	describe( 'breakpoint changes', () => {
		it( 'should update state and call onChange when query matches', () => {
			breakpointResolver = new BreakpointResolver( onChange );
			breakpointResolver.setup();

			// Simulate transition to 'lg'
			const mqLg = mockQueries[ '(min-width: 1120px)' ];
			mqLg.dispatchEvent( { matches: true } );

			expect( breakpointResolver.isLarge ).toBe( true );
			expect( onChange ).toHaveBeenCalledWith( true );
		} );

		it( 'should update state and call onChange when query un-matches', () => {
			// Start with lg
			mockMatchMedia.mockImplementation( () => {
				const listeners = [];
				const mq = {
					matches: true,
					addEventListener: jest.fn( ( e, l ) => listeners.push( l ) ),
					removeEventListener: jest.fn(),
					dispatchEvent: ( e ) => listeners.forEach( ( l ) => l( e ) )
				};
				mockQueries[ '(min-width: 1120px)' ] = mq;
				return mq;
			} );

			breakpointResolver = new BreakpointResolver( onChange );
			breakpointResolver.setup();
			onChange.mockClear();

			// Simulate change to 'md' (matches: false)
			// In strict terms, the mocked setup above sets it to TRUE initially.
			const mqLg = mockQueries[ '(min-width: 1120px)' ];
			mqLg.dispatchEvent( { matches: false } );

			expect( breakpointResolver.isLarge ).toBe( false );
			expect( onChange ).toHaveBeenCalledWith( false );
		} );
	} );

	describe( 'cleanup', () => {
		it( 'should remove event listener', () => {
			breakpointResolver = new BreakpointResolver( onChange );
			breakpointResolver.setup();

			const mqLg = mockQueries[ '(min-width: 1120px)' ];

			breakpointResolver.cleanup();

			expect( mqLg.removeEventListener ).toHaveBeenCalledWith( 'change', expect.any( Function ) );
			expect( breakpointResolver.removeListener ).toBeNull();
		} );

		it( 'should clear state', () => {
			breakpointResolver = new BreakpointResolver( onChange );
			breakpointResolver.setup();

			breakpointResolver.cleanup();

			expect( breakpointResolver.isLarge ).toBeNull();
		} );
	} );
} );
