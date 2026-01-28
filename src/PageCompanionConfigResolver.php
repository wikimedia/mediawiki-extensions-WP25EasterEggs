<?php

namespace MediaWiki\Extension\WP25EasterEggs;

use MediaWiki\Config\Config;
use MediaWiki\Title\Title;
use stdClass;
use Wikibase\Client\Store\ClientStore;
use Wikibase\Lib\SettingsArray;

/**
 * Resolve which companion config should be displayed for a given article,
 * taking into account wiki language and community configuration.
 */
class PageCompanionConfigResolver {
	/** @var Config */
	private readonly Config $communityConfig;
	/** @var string[] */
	private readonly array $companionConfigNames;
	/** @var array<string,string> */
	private readonly array $defaultCompanionConfigs;
	/** @var ClientStore|null */
	private readonly ?object $wikibaseStore;
	/** @var SettingsArray|null */
	private readonly ?object $wikibaseSettings;

	/**
	 * @param Config $communityConfig Community configuration instance
	 * @param string[] $companionConfigNames List of companion config names
	 * @param array<string,string> $defaultCompanionConfigs Map of QIDs to companion config names
	 * @param ClientStore|null $wikibaseStore Optional WikibaseClient Store service
	 * @param SettingsArray|null $wikibaseSettings Optional WikibaseClient Settings service
	 */
	public function __construct(
		Config $communityConfig,
		array $companionConfigNames,
		array $defaultCompanionConfigs,
		?object $wikibaseStore = null,
		?object $wikibaseSettings = null
	) {
		$this->communityConfig = $communityConfig;
		$this->companionConfigNames = $companionConfigNames;
		$this->defaultCompanionConfigs = $defaultCompanionConfigs;
		$this->wikibaseStore = $wikibaseStore;
		$this->wikibaseSettings = $wikibaseSettings;
	}

	/**
	 * Check if the companion should be enabled on this page based on global filter
	 *
	 * @param Title $title The title object for the article
	 * @return bool
	 */
	public function isCompanionEnabled( Title $title ): bool {
		$enableCompanion = $this->communityConfig->get( 'EnableCompanion' );

		if ( !$enableCompanion || !is_object( $enableCompanion ) ) {
			return false;
		}

		$type = $enableCompanion->type ?? 'everywhere';
		if ( $type === 'everywhere' ) {
			return true;
		}

		$filterPages = $enableCompanion->filterPages ?? [];
		$articleName = $title->getPrefixedText();

		if ( $type === 'allowFilter' ) {
			// Only allow on pages in filterPages
			return in_array( $articleName, $filterPages, true );
		} elseif ( $type === 'blockFilter' ) {
			// Allow everywhere except pages in filterPages
			return !in_array( $articleName, $filterPages, true );
		}

		return false;
	}

	/**
	 * Resolve the first matching companion config for an article
	 *
	 * @param Title $title The title object for the article
	 * @return string|null
	 */
	public function getCurrentCompanionConfig( Title $title ): ?string {
		$articleName = $title->getPrefixedText();

		// Check each companion config to find the first match
		foreach ( $this->companionConfigNames as $name ) {
			$settings = $this->communityConfig->has( $name ) ?
				$this->communityConfig->get( $name ) : null;

			if ( is_object( $settings ) &&
				$this->shouldApplyCompanionConfig( $articleName, $name, $settings )
			) {
				return $name;
			}
		}

		return null;
	}

	/**
	 * Determine if a companion config should be applied based on settings
	 *
	 * Check defaults, allow list, and block list to determine applicability.
	 *
	 * @param string $articleName The article name (prefixed text)
	 * @param string $companionConfigName Name of the companion config
	 * @param stdClass $settings Configuration settings for the companion config
	 * @return bool
	 */
	private function shouldApplyCompanionConfig(
		string $articleName,
		string $companionConfigName,
		stdClass $settings,
	): bool {
		// First check block list - if article is blocked, it's never applied
		$blockPages = $settings->blockPages ?? [];
		if ( in_array( $articleName, $blockPages, true ) ) {
			return false;
		}

		// Check allow list - if article is in allow list, it should be applied
		$allowPages = $settings->allowPages ?? [];
		if ( in_array( $articleName, $allowPages, true ) ) {
			return true;
		}

		// If defaultPages is false, and article is not in allow list, don't apply
		$defaultPages = ( $settings->defaultPages ?? 'enabled' ) === 'enabled';
		if ( !$defaultPages ) {
			return false;
		}

		// Check if article is in default companion configs for this site
		return $this->isInDefaultCompanionConfigs( $articleName, $companionConfigName );
	}

	/**
	 * Check if an article has a specific companion config in the default companion configs
	 *
	 * @param string $articleName Prefixed article name
	 * @param string $companionConfigName Name of the companion config to check
	 * @return bool
	 */
	private function isInDefaultCompanionConfigs( string $articleName, string $companionConfigName ): bool {
		// Check if Wikibase Client Store and Settings are available
		if ( !$this->wikibaseStore || !$this->wikibaseSettings ) {
			return false;
		}

		$siteLinkLookup = $this->wikibaseStore->getSiteLinkLookup();
		$globalId = $this->wikibaseSettings->getSetting( 'siteGlobalID' );
		$itemId = $siteLinkLookup->getItemIdForLink( $globalId, $articleName );

		if ( !$itemId ) {
			return false;
		}

		$qId = $itemId->getSerialization();

		// In default-companion-configs.json, QIDs are keys (e.g., "Q35831", "Q8337")
		// Check if this QID exists in the default companion configs
		if ( !array_key_exists( $qId, $this->defaultCompanionConfigs ) ) {
			return false;
		}

		// Check if the companion config matches for this QID
		if ( $this->defaultCompanionConfigs[$qId] === $companionConfigName ) {
			return true;
		}

		return false;
	}
}
