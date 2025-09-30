<?php

namespace MediaWiki\Extension\WP25EasterEggs\Tests\Structure;

use MediaWiki\Tests\Structure\BundleSizeTestBase;

class BundleSizeTest extends BundleSizeTestBase {

	/** @inheritDoc */
	public static function getBundleSizeConfigData(): string {
		return dirname( __DIR__, 3 ) . '/bundlesize.config.json';
	}
}
