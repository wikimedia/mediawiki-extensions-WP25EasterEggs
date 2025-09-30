<?php

namespace MediaWiki\Extension\WP25EasterEggs;

use MediaWiki\Extension\CommunityConfiguration\Schema\JsonSchema;

class CommunityConfigurationSchema extends JsonSchema {
	public const CC_ENABLE = [
		self::TYPE => self::TYPE_STRING,
		self::ENUM => [ 'disabled', 'enabled' ],
		self::DEFAULT => 'disabled',
	];
}
