<?php

namespace MediaWiki\Extension\WP25EasterEggs;

use MediaWiki\Extension\CommunityConfiguration\Schema\JsonSchema;
use MediaWiki\Extension\CommunityConfiguration\Schemas\MediaWiki\MediaWikiDefinitions;

// phpcs:disable Generic.NamingConventions.UpperCaseConstantName.ClassConstantNotUpperCase
class CommunityConfigurationSchema extends JsonSchema {

	public const EnableExtension = [
		self::TYPE => self::TYPE_STRING,
		self::ENUM => [ 'disabled', 'enabled' ],
		self::DEFAULT => 'disabled',
	];

	public const EnableCompanion = [
		self::TYPE => self::TYPE_OBJECT,
		self::PROPERTIES => [
			'type' => [
				self::TYPE => self::TYPE_STRING,
				self::ENUM => [ 'everywhere', 'allowFilter', 'blockFilter' ],
				self::DEFAULT => 'everywhere',
			],
			'filterPages' => [
				self::REF => [
					'class' => MediaWikiDefinitions::class, 'field' => 'PageTitles'
				]
			],
		],
		self::DEFAULT => [
			'type' => 'everywhere',
			'filterPages' => [],
		],
	];

	/**
	 * Get the list of available companion config names
	 *
	 * @return string[] Array of companion config names
	 */
	public static function getCompanionConfigNames() {
		return [ 'celebrate', 'dream', 'newspaper' ];
	}

	public const celebrate = [
		self::REF => [ 'class' => CommunityConfigurationDefinitions::class, 'field' => 'PageFilter' ]
	];
	public const dream = [
		self::REF => [ 'class' => CommunityConfigurationDefinitions::class, 'field' => 'PageFilter' ]
	];
	public const newspaper = [
		self::REF => [ 'class' => CommunityConfigurationDefinitions::class, 'field' => 'PageFilter' ]
	];
}
