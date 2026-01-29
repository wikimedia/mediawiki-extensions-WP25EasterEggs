/**
 * @typedef {Object} VideoVariant
 * @property {string} dark
 * @property {string} light
 */

/**
 * @typedef {Object} VideoVariants
 * @property {VideoVariant} idle
 */

/**
 * Companion Config
 *
 * Defines the configuration for a specific companion type, including its visual assets
 * and behavioral settings. It is required by the Companion controller, and serves as configuration
 * for which videos to play and how to respond to interaction events.
 */
class CompanionConfig {
	/**
	 * @param {string} assetsPath
	 * @param {string} configName
	 */
	constructor( assetsPath, configName ) {
		/** @type {string} */
		this.assetsPath = assetsPath;
		/** @type {string} */
		this.configName = configName;
		/** @type {VideoVariants} */
		this.videoVariants = {
			idle: {
				light: `${ this.assetsPath }/${ this.configName }-idle-light.webm`,
				dark: `${ this.assetsPath }/${ this.configName }-idle-dark.webm`
			}
		};
	}
}

module.exports = { CompanionConfig };
