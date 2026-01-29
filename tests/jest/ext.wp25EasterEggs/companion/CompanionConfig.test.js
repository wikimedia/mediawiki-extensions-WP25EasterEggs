'use strict';

const { CompanionConfig } = require( '../../../../resources/ext.wp25EasterEggs/companion/CompanionConfig.js' );

describe( 'CompanionConfig', () => {
	it( 'constructor sets assetsPath and configName correctly', () => {
		const assetsPath = '/mock/assets';
		const configName = 'test-config';
		const config = new CompanionConfig( assetsPath, configName );

		expect( config.assetsPath ).toBe( assetsPath );
		expect( config.configName ).toBe( configName );
	} );

	it( 'constructor generates correct videoVariants', () => {
		const assetsPath = '/mock/assets';
		const configName = 'test-config';
		const config = new CompanionConfig( assetsPath, configName );

		expect( config.videoVariants ).toEqual( {
			idle: {
				light: `${ assetsPath }/${ configName }-idle-light.webm`,
				dark: `${ assetsPath }/${ configName }-idle-dark.webm`
			}
		} );
	} );
} );
