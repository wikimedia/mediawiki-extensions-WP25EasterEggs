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
		default: () => ( new CompanionConfig( assetsPath, 'default', { flashlight: true } ) ),
		phone: () => ( new CompanionConfig( assetsPath, 'phone', { flashlight: true, sleep: true } ) ),
		newspaper: () => ( new CompanionConfig( assetsPath, 'newspaper', { flashlight: true, sleep: true } ) ),
		book: () => ( new CompanionConfig( assetsPath, 'book', { flashlight: true, sleep: true } ) ),
		laptop: () => ( new CompanionConfig( assetsPath, 'laptop', { flashlight: true, sleep: true } ) ),
		dreaming: () => ( new CompanionConfig( assetsPath, 'dreaming' ) ),
		outerspace: () => ( new CompanionConfig( assetsPath, 'outerspace' ) ),
		headphones: () => ( new CompanionConfig( assetsPath, 'headphones', { click: true, flashlight: true } ) ),
		camera: () => ( new CompanionConfig( assetsPath, 'camera', { click: true, flashlight: true } ) ),
		synthesizer: () => ( new CompanionConfig( assetsPath, 'synthesizer', { click: true, flashlight: true } ) ),
		balloons: () => ( new CompanionConfig( assetsPath, 'balloons', { click: true, flashlight: true } ) ),
		confetti: () => ( new CompanionConfig( assetsPath, 'confetti', { click: true, flashlight: true } ) )
	};
}

module.exports = { getCompanionConfigs };
