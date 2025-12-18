<?php

namespace MediaWiki\Extension\WP25EasterEggs;

use MediaWiki\Config\Config;
use MediaWiki\Output\OutputPage;
use MediaWiki\Title\Title;

/**
 * Service for determining which companion configs apply to a page
 * (Simplified for Scaffolding)
 */
class PageCompanionService {

	/**
	 * @param Config|null $communityConfig Community configuration provider
	 */
	public function __construct(
		private readonly ?Config $communityConfig = null
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
		$companionConfigResolver = new PageCompanionConfigResolver(
			$this->communityConfig
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
}
