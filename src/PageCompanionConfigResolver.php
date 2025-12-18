<?php

namespace MediaWiki\Extension\WP25EasterEggs;

use MediaWiki\Config\Config;
use MediaWiki\Title\Title;

/**
 * Resolve which companion config should be displayed for a given article.
 * (Simplified for Scaffolding)
 */
class PageCompanionConfigResolver {
	/**
	 * @param Config $communityConfig
	 */
	public function __construct(
		private readonly Config $communityConfig
	) {
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
		$filterPages = $enableCompanion->filterPages ?? [];
		$articleName = $title->getPrefixedText();

		// Check based on the filter type
		if ( $type === 'everywhere' ) {
			return true;
		} elseif ( $type === 'allowFilter' ) {
			// Only allow on pages in filterPages
			return in_array( $articleName, $filterPages, true );
		} elseif ( $type === 'blockFilter' ) {
			// Allow everywhere except pages in filterPages
			return !in_array( $articleName, $filterPages, true );
		}

		return false;
	}
}
