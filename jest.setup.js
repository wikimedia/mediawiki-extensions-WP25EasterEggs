/* eslint-env jest */
'use strict';

// Use the official Wikimedia MediaWiki mock for Jest tests
const mockMediaWiki = require( '@wikimedia/mw-node-qunit/src/mockMediaWiki.js' );
global.mw = mockMediaWiki();

// Mock jQuery - simple document ready handler for tests
global.$ = jest.fn( ( callback ) => {
	if ( typeof callback === 'function' ) {
		// Document ready callback - execute immediately in tests
		setTimeout( callback, 0 );
	}
	return global.$;
} );

// Add any additional mw properties needed for this extension
global.mw.requestIdleCallback =
	global.mw.requestIdleCallback || jest.fn( ( callback ) => callback() );
