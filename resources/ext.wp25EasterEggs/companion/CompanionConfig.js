/**
 * @typedef {Object} VideoVariant
 * @property {string} dark
 * @property {string} light
 */

/**
 * @typedef {Object} VideoVariants
 * @property {VideoVariant} idle
 * @property {VideoVariant} click
 */

/**
 * @typedef {Object} Interactions
 * @property {boolean | undefined} click
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
	 * @param {Interactions | undefined} interactions
	 */
	constructor( assetsPath, configName, interactions ) {
		/** @type {boolean} */
		this.isReducedMotion = window.matchMedia( '(prefers-reduced-motion: reduce)' ).matches;
		/** @type {string} */
		this.assetsPath = `${ assetsPath }/${ this.isReducedMotion ? 'image' : 'video' }`;
		/** @type {string} */
		this.extension = this.isReducedMotion ? 'webp' : 'webm';
		/** @type {string} */
		this.configName = configName;
		/** @type {Interactions} */
		this.interactions = interactions || {};

		/** @type {VideoVariants} */
		this.videoVariants = {
			idle: {
				light: `${ this.assetsPath }/${ this.configName }-idle-light.${ this.extension }`,
				dark: `${ this.assetsPath }/${ this.configName }-idle-dark.${ this.extension }`
			}
		};

		if ( this.interactions.click ) {
			this.videoVariants.click = {
				light: `${ this.assetsPath }/${ this.configName }-click-light.${ this.extension }`,
				dark: `${ this.assetsPath }/${ this.configName }-click-dark.${ this.extension }`
			};
		}
	}
}

module.exports = { CompanionConfig };
