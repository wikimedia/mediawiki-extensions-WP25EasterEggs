<?php

namespace MediaWiki\Extension\WP25EasterEggs;

use MediaWiki\Config\Config;
use MediaWiki\Output\OutputPage;
use MediaWiki\Title\Title;
use Wikibase\Client\Store\ClientStore;
use Wikibase\Lib\SettingsArray;
use Wikimedia\LightweightObjectStore\ExpirationAwareness;
use Wikimedia\ObjectCache\WANObjectCache;

/**
 * Service for determining which companion configs apply to a page
 */
class PageCompanionService {

	/**
	 * @param WANObjectCache $cache Cache for storing default companion configs
	 * @param Config|null $communityConfig Community configuration provider
	 * @param ClientStore|null $wikibaseStore Optional WikibaseClient Store service
	 * @param SettingsArray|null $wikibaseSettings Optional WikibaseClient Settings service
	 */
	public function __construct(
		private readonly WANObjectCache $cache,
		private readonly ?Config $communityConfig = null,
		private readonly ?object $wikibaseStore = null,
		private readonly ?object $wikibaseSettings = null
	) {
	}

	/**
	 * Get the HTML classes for the companion configs applied to the current page
	 *
	 * @param OutputPage $out The output page object
	 * @return string[]
	 */
	public function getCompanionConfigHtmlClasses( OutputPage $out ): array {
		// Early return if community configuration is not available
		if ( !$this->communityConfig ) {
			return [];
		}

		$title = $out->getTitle();
		if ( !$title ) {
			return [];
		}

		// Only apply companion configs to viewable article pages in main namespace
		if ( !$this->isViewArticlePage( $title, $out ) ) {
			return [];
		}

		// Create the companion config resolver
		$companionConfigNames = CommunityConfigurationSchema::getCompanionConfigNames();
		$defaultCompanionConfigs = $this->getDefaultCompanionConfigs();
		$companionConfigResolver = new PageCompanionConfigResolver(
			$this->communityConfig,
			$companionConfigNames,
			$defaultCompanionConfigs,
			$this->wikibaseStore,
			$this->wikibaseSettings
		);

		$classes = [];

		// Check if companion is enabled for this page (global filter)
		if ( $companionConfigResolver->isCompanionEnabled( $title ) ) {
			$classes[] = 'wp25eastereggs-companion-enabled';

			// Resolve specific companion config (state) based on filters
			$companionConfigName = $companionConfigResolver->getCurrentCompanionConfig( $title );
			if ( $companionConfigName ) {
				// Add specific config class, e.g. wp25eastereggs-companion-celebrate
				$classes[] = 'wp25eastereggs-companion-' . $companionConfigName;
			}
		}

		return $classes;
	}

	/**
	 * Check if the current page is a viewable article in main namespace
	 *
	 * @param Title $title The title object for the page
	 * @param OutputPage $out The output page object
	 * @return bool
	 */
	private function isViewArticlePage( Title $title, OutputPage $out ): bool {
		$isMainNamespace = $title->getNamespace() === NS_MAIN;
		$isContent = $title->isContentPage();
		$isViewAction = $out->getActionName() === "view";
		return $isMainNamespace && $isContent && $isViewAction;
	}

	/**
	 * Get default companion configs from JSON file (cached)
	 *
	 * @return array<string,string>
	 */
	private function getDefaultCompanionConfigs(): array {
		$defaultCompanionConfigs = $this->cache->getWithSetCallback(
			$this->cache->makeKey( 'wp25eastereggs', 'default-companion-configs' ),
			ExpirationAwareness::TTL_DAY,
			static function () {
				// Load the default companion configs mapping from JSON file
				$path = __DIR__ . '/../resources/ext.wp25EasterEggs/default-companion-configs.json';
				if ( !file_exists( $path ) ) {
					return [];
				}

				$content = file_get_contents( $path );
				if ( $content === false ) {
					return [];
				}

				// Parse JSON and return the QID -> companion config mapping
				$decoded = json_decode( $content, true );
				return $decoded ?? [];
			}
		);

		return $defaultCompanionConfigs;
	}
}
