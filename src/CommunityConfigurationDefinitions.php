<?php

namespace MediaWiki\Extension\WP25EasterEggs;

use MediaWiki\Extension\CommunityConfiguration\Schema\JsonSchema;
use MediaWiki\Extension\CommunityConfiguration\Schemas\MediaWiki\MediaWikiDefinitions;

// phpcs:disable Generic.NamingConventions.UpperCaseConstantName.ClassConstantNotUpperCase
class CommunityConfigurationDefinitions extends JsonSchema {

	public const PageFilter = [
		self::TYPE => self::TYPE_OBJECT,
		self::PROPERTIES => [
			'defaultPages' => [
				self::TYPE => self::TYPE_STRING,
				self::ENUM => [ 'enabled', 'disabled' ],
				self::DEFAULT => 'enabled',
			],
			'allowPages' => [
				self::REF => [
					'class' => MediaWikiDefinitions::class, 'field' => 'PageTitles'
				]
			],
			'blockPages' => [
				self::REF => [
					'class' => MediaWikiDefinitions::class, 'field' => 'PageTitles'
				]
			],
		],
		self::DEFAULT => [
			'defaultPages' => 'enabled',
			'allowPages' => [],
			'blockPages' => [],
		],
	];
}
