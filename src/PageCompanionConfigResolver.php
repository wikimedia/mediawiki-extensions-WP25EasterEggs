<?php

namespace MediaWiki\Extension\WP25EasterEggs;

use MediaWiki\Config\Config;
use MediaWiki\Title\Title;
use stdClass;

/**
 * Resolve which companion config should be displayed for a given article,
 * taking into account wiki language and community configuration.
 */
class PageCompanionConfigResolver {
	/** @var Config */
	private readonly Config $communityConfig;
	/** @var string[] */
	private readonly array $companionConfigNames;

	/**
	 * @param Config $communityConfig Community configuration instance
	 * @param string[]|null $companionConfigNames List of companion config names
	 */
	public function __construct(
		Config $communityConfig,
		?array $companionConfigNames = null,
	) {
		$this->communityConfig = $communityConfig;
		$this->companionConfigNames = $companionConfigNames ?? CommunityConfigurationSchema::getCompanionConfigNames();
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
		// Check each companion config to find the first match
		foreach ( $this->companionConfigNames as $name ) {
			$settings = $this->communityConfig->get( $name );

			if ( !$settings || !is_object( $settings ) ) {
				continue;
			}

			if ( $this->shouldApplyCompanionConfig( $title, $settings ) ) {
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
	 * @param Title $title The title object for the article
	 * @param stdClass $settings Configuration settings for the companion config
	 * @return bool
	 */
	private function shouldApplyCompanionConfig(
		Title $title,
		stdClass $settings,
	): bool {
		$articleName = $title->getPrefixedText();

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
		return $this->isInDefaultCompanionConfigs();
	}

	/**
	 * Check if an article has a specific companion config in the default companion configs
	 *
	 * @return bool
	 */
	private function isInDefaultCompanionConfigs(): bool {
		// Scaffolding: No Wikibase integration yet.
		// Cannot resolve default configs by QID, so return true, ie. "enabled everywhere".
		return true;
	}
}
