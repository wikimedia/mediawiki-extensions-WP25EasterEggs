const { CompanionConfig } = require( './companion/CompanionConfig.js' );

/**
 * @typedef {Object<string, function(): CompanionConfig>} CompanionConfigs
 */

/**
 * Get all companion configurations
 *
 * @param {string} assetsPath - Base path to media assets
 * @return {CompanionConfigs} Map of config names to config creator functions
 */
function getCompanionConfigs( assetsPath ) {
	return {
		default: () => ( new CompanionConfig( assetsPath, 'default' ) ),
		phone: () => ( new CompanionConfig( assetsPath, 'phone' ) ),
		newspaper: () => ( new CompanionConfig( assetsPath, 'newspaper' ) ),
		book: () => ( new CompanionConfig( assetsPath, 'book' ) ),
		laptop: () => ( new CompanionConfig( assetsPath, 'laptop' ) ),
		dreaming: () => ( new CompanionConfig( assetsPath, 'dreaming' ) ),
		outerspace: () => ( new CompanionConfig( assetsPath, 'outerspace' ) ),
		headphones: () => ( new CompanionConfig( assetsPath, 'headphones', { click: true } ) ),
		camera: () => ( new CompanionConfig( assetsPath, 'camera', { click: true } ) ),
		synthesizer: () => ( new CompanionConfig( assetsPath, 'synthesizer', { click: true } ) ),
		balloons: () => ( new CompanionConfig( assetsPath, 'balloons', { click: true } ) ),
		confetti: () => ( new CompanionConfig( assetsPath, 'confetti', { click: true } ) )
	};
}

module.exports = { getCompanionConfigs };
