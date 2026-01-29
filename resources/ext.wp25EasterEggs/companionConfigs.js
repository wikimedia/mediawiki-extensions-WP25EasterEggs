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
		headphones: () => ( new CompanionConfig( assetsPath, 'headphones' ) ),
		camera: () => ( new CompanionConfig( assetsPath, 'camera' ) ),
		synthesizer: () => ( new CompanionConfig( assetsPath, 'synthesizer' ) ),
		balloons: () => ( new CompanionConfig( assetsPath, 'balloons' ) ),
		confetti: () => ( new CompanionConfig( assetsPath, 'confetti' ) )
	};
}

module.exports = { getCompanionConfigs };
