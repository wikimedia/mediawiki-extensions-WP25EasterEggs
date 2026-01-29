'use strict';

const { getCompanionConfigs } = require( '../../../resources/ext.wp25EasterEggs/companionConfigs.js' );
const { CompanionConfig } = require( '../../../resources/ext.wp25EasterEggs/companion/CompanionConfig.js' );

describe( 'companionConfigs', () => {
	describe( 'getCompanionConfigs', () => {
		it( 'returns an object with expected keys', () => {
			const assetsPath = '/mock/assets';
			const configs = getCompanionConfigs( assetsPath );
			const expectedKeys = [
				'default',
				'phone',
				'newspaper',
				'book',
				'laptop',
				'dreaming',
				'outerspace',
				'headphones',
				'camera',
				'synthesizer',
				'balloons',
				'confetti'
			];

			expect( Object.keys( configs ) ).toEqual( expect.arrayContaining( expectedKeys ) );
			expect( expectedKeys.every( ( key ) => typeof configs[ key ] === 'function' ) ).toBe( true );
		} );

		it( 'config creators return valid CompanionConfig instances', () => {
			const assetsPath = '/mock/assets';
			const configs = getCompanionConfigs( assetsPath );

			Object.keys( configs ).forEach( ( key ) => {
				const createConfig = configs[ key ];
				const config = createConfig();

				expect( config ).toBeInstanceOf( CompanionConfig );
				expect( config.assetsPath ).toBe( assetsPath );
				expect( config.configName ).toBe( key );
			} );
		} );
	} );
} );
