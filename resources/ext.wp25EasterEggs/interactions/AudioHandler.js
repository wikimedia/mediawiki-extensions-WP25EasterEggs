/**
 * AudioHandler
 *
 * Handle audio interactions.
 * Listens for companion-click events and plays random audio files.
 */
class AudioHandler {
	/**
	 * @param {Object} options
	 * @param {HTMLElement} options.container - DOM element to listen for events
	 * @param {string} options.baseAssetsPath - Base path to media assets
	 */
	constructor( options ) {
		/** @type {HTMLElement} */
		this.container = options.container;
		/** @type {string} */
		this.baseAssetsPath = options.baseAssetsPath;
		/** @type {Function|null} */
		this.boundHandleInteraction = null;
		/** @type {HTMLAudioElement|null} */
		this.currentAudio = null;

		const AUDIO_FILES = [
			'wikipedia25_welcome_lmo.webm',
			'wikipedia25_welcome_pms.webm',
			'wikipedia25_welcome_cs.webm',
			'wikipedia25_welcome_piano_code.webm',
			'wikipedia25_welcome_hr_1.webm',
			'wikipedia25_welcome_it.webm',
			'wikipedia25_welcome_mad.webm',
			'wikipedia25_welcome_sl.webm',
			'wikipedia25_welcome_bew.webm',
			'wikipedia25_welcome_id.webm',
			'wikipedia25_welcome_id_2.webm',
			'wikipedia25_welcome_ja.webm',
			'wikipedia25_welcome_sas.webm',
			'wikipedia25_welcome_en_abal1412.webm',
			'wikipedia25_welcome_ru_abal1412.webm',
			'wikipedia25_welcome_vi_central.webm',
			'wikipedia25_welcome_vi_north.webm',
			'wikipedia25_welcome_vi_south.webm',
			'wikipedia25_welcome_vi_north_caryll.webm',
			'wikipedia25_sonic_logo_4s.webm',
			'wikipedia25_welcome_hr_staff.webm',
			'wikipedia25_welcome_el_casual.webm',
			'wikipedia25_welcome_ru_staff.webm',
			'wikipedia25_welcome_uz.webm',
			'wikipedia25_welcome_he.webm',
			'wikipedia25_welcome_nl.webm',
			'wikipedia25_welcome_de.webm',
			'wikipedia25_welcome_ca_masc.webm',
			'wikipedia25_welcome_es_fem.webm',
			'wikipedia25_welcome_es.webm',
			'wikipedia25_welcome_fr.webm',
			'wikipedia25_welcome_nl_2.webm',
			'wikipedia25_welcome_zh.webm'
		];

		/** @type {string[]} */
		this.audioFiles = AUDIO_FILES.map( ( file ) => `${ this.baseAssetsPath }/audio/${ file }` );
	}

	/**
	 * Start listening for interaction events
	 */
	setup() {
		this.boundHandleInteraction = this.handleInteraction.bind( this );
		this.container.addEventListener( 'companion-click', this.boundHandleInteraction );
	}

	/**
	 * Handle interaction event
	 */
	handleInteraction() {
		// If the current audio is playing - stop it
		if ( this.currentAudio ) {
			this.currentAudio.pause();
			this.currentAudio.currentTime = 0;
		}

		// select random audio
		const randomIndex = Math.floor( Math.random() * this.audioFiles.length );
		const audioSrc = this.audioFiles[ randomIndex ];

		// play the audio
		this.currentAudio = new Audio( audioSrc );
		this.currentAudio.play().catch( () => {} );
	}

	/**
	 * Clean up event listeners
	 */
	cleanup() {
		// remove the bound click handler
		if ( this.boundHandleInteraction && this.container ) {
			this.container.removeEventListener( 'companion-click', this.boundHandleInteraction );
			this.boundHandleInteraction = null;
		}

		// stop the current audio
		if ( this.currentAudio ) {
			this.currentAudio.pause();
			this.currentAudio = null;
		}
	}
}

module.exports = { AudioHandler };
