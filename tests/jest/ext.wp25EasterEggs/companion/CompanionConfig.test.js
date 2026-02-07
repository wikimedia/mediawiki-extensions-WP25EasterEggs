'use strict';

const { CompanionConfig } = require( '../../../../resources/ext.wp25EasterEggs/companion/CompanionConfig.js' );

describe( 'CompanionConfig', () => {
	beforeAll( () => {
		Object.defineProperty( window, 'matchMedia', {
			writable: true,
			value: jest.fn().mockImplementation( () => ( { matches: false } ) )
		} );
	} );

	it( 'constructor sets assetsPath and configName correctly', () => {
		const assetsPath = '/mock/assets';
		const configName = 'test-config';
		const config = new CompanionConfig( assetsPath, configName );

		expect( config.assetsPath ).toBe( `${ assetsPath }/video` );
		expect( config.configName ).toBe( configName );
	} );

	it( 'constructor generates correct videoVariants', () => {
		const assetsPath = '/mock/assets';
		const configName = 'test-config';
		const config = new CompanionConfig( assetsPath, configName );

		expect( config.videoVariants ).toEqual( {
			idle: {
				light: `${ assetsPath }/video/${ configName }-idle-light.webm`,
				dark: `${ assetsPath }/video/${ configName }-idle-dark.webm`
			}
		} );
	} );
} );
