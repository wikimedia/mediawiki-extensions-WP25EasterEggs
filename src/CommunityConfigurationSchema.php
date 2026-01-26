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
		return [
			'phone',
			'newspaper',
			'book',
			'laptop',
			'dreaming',
			'outerspace',
			'headphones',
			'camera',
			'synthesizer',
			'confetti',
			'balloons'
		];
	}

	public const phone = [
		self::REF => [ 'class' => CommunityConfigurationDefinitions::class, 'field' => 'PageFilter' ]
	];
	public const newspaper = [
		self::REF => [ 'class' => CommunityConfigurationDefinitions::class, 'field' => 'PageFilter' ]
	];
	public const book = [
		self::REF => [ 'class' => CommunityConfigurationDefinitions::class, 'field' => 'PageFilter' ]
	];
	public const laptop = [
		self::REF => [ 'class' => CommunityConfigurationDefinitions::class, 'field' => 'PageFilter' ]
	];
	public const dreaming = [
		self::REF => [ 'class' => CommunityConfigurationDefinitions::class, 'field' => 'PageFilter' ]
	];
	public const outerspace = [
		self::REF => [ 'class' => CommunityConfigurationDefinitions::class, 'field' => 'PageFilter' ]
	];
	public const headphones = [
		self::REF => [ 'class' => CommunityConfigurationDefinitions::class, 'field' => 'PageFilter' ]
	];
	public const camera = [
		self::REF => [ 'class' => CommunityConfigurationDefinitions::class, 'field' => 'PageFilter' ]
	];
	public const synthesizer = [
		self::REF => [ 'class' => CommunityConfigurationDefinitions::class, 'field' => 'PageFilter' ]
	];
	public const confetti = [
		self::REF => [ 'class' => CommunityConfigurationDefinitions::class, 'field' => 'PageFilter' ]
	];
	public const balloons = [
		self::REF => [ 'class' => CommunityConfigurationDefinitions::class, 'field' => 'PageFilter' ]
	];
}
