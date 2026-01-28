<?php

namespace MediaWiki\Extension\WP25EasterEggs\Tests;

use MediaWiki\Config\HashConfig;
use MediaWiki\Extension\WP25EasterEggs\PageCompanionConfigResolver;
use MediaWiki\Title\Title;

/**
 * @covers \MediaWiki\Extension\WP25EasterEggs\PageCompanionConfigResolver
 */
class PageCompanionConfigResolverTest extends \MediaWikiUnitTestCase {

	/**
	 * @covers \MediaWiki\Extension\WP25EasterEggs\PageCompanionConfigResolver::isCompanionEnabled()
	 */
	public function testIsCompanionEnabledReturnsFalseWhenCommunityConfigIsNull() {
		$communityConfig = new HashConfig( [ 'EnableCompanion' => null ] );

		$resolver = new PageCompanionConfigResolver( $communityConfig, [], [] );

		$titleMock = $this->createMock( Title::class );

		$result = $resolver->isCompanionEnabled( $titleMock );

		$this->assertFalse( $result );
	}

	/**
	 * @covers \MediaWiki\Extension\WP25EasterEggs\PageCompanionConfigResolver::isCompanionEnabled()
	 */
	public function testIsCompanionEnabledReturnsTrueWhenTypeIsEverywhere() {
		$communityConfig = new HashConfig( [
			'EnableCompanion' => (object)[ 'type' => 'everywhere' ],
		] );

		$resolver = new PageCompanionConfigResolver( $communityConfig, [], [] );

		$titleMock = $this->createMock( Title::class );
		$titleMock->method( 'getPrefixedText' )
			->willReturn( 'Test_Page' );

		$result = $resolver->isCompanionEnabled( $titleMock );

		$this->assertTrue( $result );
	}

	/**
	 * @covers \MediaWiki\Extension\WP25EasterEggs\PageCompanionConfigResolver::isCompanionEnabled()
	 */
	public function testIsCompanionEnabledReturnsTrueWhenTypeIsAllowFilterAndPageAllowed() {
		$communityConfig = new HashConfig( [
			'EnableCompanion' => (object)[
				'type' => 'allowFilter',
				'filterPages' => [ 'Allowed_Page' ]
			],
		] );

		$resolver = new PageCompanionConfigResolver( $communityConfig, [], [] );

		$titleMock = $this->createMock( Title::class );
		$titleMock->method( 'getPrefixedText' )
			->willReturn( 'Allowed_Page' );

		$result = $resolver->isCompanionEnabled( $titleMock );

		$this->assertTrue( $result );
	}

	/**
	 * @covers \MediaWiki\Extension\WP25EasterEggs\PageCompanionConfigResolver::isCompanionEnabled()
	 */
	public function testIsCompanionEnabledReturnsFalseWhenTypeIsAllowFilterAndPageNotAllowed() {
		$communityConfig = new HashConfig( [
			'EnableCompanion' => (object)[
				'type' => 'allowFilter',
				'filterPages' => [ 'Allowed_Page' ]
			],
		] );

		$resolver = new PageCompanionConfigResolver( $communityConfig, [], [] );

		$titleMock = $this->createMock( Title::class );
		$titleMock->method( 'getPrefixedText' )
			->willReturn( 'Other_Page' );

		$result = $resolver->isCompanionEnabled( $titleMock );

		$this->assertFalse( $result );
	}

	/**
	 * @covers \MediaWiki\Extension\WP25EasterEggs\PageCompanionConfigResolver::isCompanionEnabled()
	 */
	public function testIsCompanionEnabledReturnsTrueWhenTypeIsBlockFilterAndPageNotBlocked() {
		$communityConfig = new HashConfig( [
			'EnableCompanion' => (object)[
				'type' => 'blockFilter',
				'filterPages' => [ 'Blocked_Page' ]
			],
		] );

		$resolver = new PageCompanionConfigResolver( $communityConfig, [], [] );

		$titleMock = $this->createMock( Title::class );
		$titleMock->method( 'getPrefixedText' )
			->willReturn( 'Allowed_Page' );

		$result = $resolver->isCompanionEnabled( $titleMock );

		$this->assertTrue( $result );
	}

	/**
	 * @covers \MediaWiki\Extension\WP25EasterEggs\PageCompanionConfigResolver::isCompanionEnabled()
	 */
	public function testIsCompanionEnabledReturnsFalseWhenTypeIsBlockFilterAndPageBlocked() {
		$communityConfig = new HashConfig( [
			'EnableCompanion' => (object)[
				'type' => 'blockFilter',
				'filterPages' => [ 'Blocked_Page' ]
			],
		] );

		$resolver = new PageCompanionConfigResolver( $communityConfig, [], [] );

		$titleMock = $this->createMock( Title::class );
		$titleMock->method( 'getPrefixedText' )
			->willReturn( 'Blocked_Page' );

		$result = $resolver->isCompanionEnabled( $titleMock );

		$this->assertFalse( $result );
	}

	/**
	 * @covers \MediaWiki\Extension\WP25EasterEggs\PageCompanionConfigResolver::getCurrentCompanionConfig()
	 */
	public function testGetCurrentCompanionConfigReturnsNull() {
		$communityConfig = new HashConfig();

		$companionConfigNames = [ 'confetti', 'dreaming', 'newspaper' ];
		$resolver = new PageCompanionConfigResolver( $communityConfig, $companionConfigNames, [] );

		$titleMock = $this->createMock( Title::class );

		$result = $resolver->getCurrentCompanionConfig( $titleMock );

		$this->assertNull( $result );
	}

	/**
	 * @covers \MediaWiki\Extension\WP25EasterEggs\PageCompanionConfigResolver::getCurrentCompanionConfig()
	 */
	public function testGetCurrentCompanionConfigResolvesAllowPages() {
		$communityConfig = new HashConfig( [
			'confetti' => (object)[
				'allowPages' => [ 'Test_Page' ],
				'blockPages' => [],
				'defaultPages' => 'disabled',
			],
		] );

		$resolver = new PageCompanionConfigResolver(
			$communityConfig,
			[ 'confetti', 'dreaming', 'newspaper' ],
			[]
		);

		$titleMock = $this->createMock( Title::class );
		$titleMock->method( 'getPrefixedText' )
			->willReturn( 'Test_Page' );

		$result = $resolver->getCurrentCompanionConfig( $titleMock );

		$this->assertSame( 'confetti', $result );
	}

	/**
	 * @covers \MediaWiki\Extension\WP25EasterEggs\PageCompanionConfigResolver::getCurrentCompanionConfig()
	 */
	public function testGetCurrentCompanionConfigRespectsBlockPages() {
		$communityConfig = new HashConfig( [
			'confetti' => (object)[
				'allowPages' => [ 'Test_Page' ],
				'blockPages' => [ 'Test_Page' ],
				'defaultPages' => 'disabled',
			],
		] );

		$resolver = new PageCompanionConfigResolver(
			$communityConfig,
			[ 'confetti', 'dreaming', 'newspaper' ],
			[]
		);

		$titleMock = $this->createMock( Title::class );
		$titleMock->method( 'getPrefixedText' )
			->willReturn( 'Test_Page' );

		$result = $resolver->getCurrentCompanionConfig( $titleMock );

		$this->assertNull( $result );
	}

	/**
	 * @covers \MediaWiki\Extension\WP25EasterEggs\PageCompanionConfigResolver::getCurrentCompanionConfig()
	 */
	public function testGetCurrentCompanionConfigReturnsConfigFromWikibase() {
		// Ensure defaults validation passes
		$communityConfig = new HashConfig( [
			'dreaming' => (object)[ 'defaultPages' => 'enabled' ],
		] );

		$companionConfigNames = [ 'dreaming' ];
		$defaultCompanionConfigs = [ 'Q123' => 'dreaming' ];

		// Mock Wikibase Services
		// Since we can't rely on Wikibase classes being present, we mock objects that behave like them.

		$wikibaseStoreMock = new class {
			public function getSiteLinkLookup() {
				return new class {
					public function getItemIdForLink( string $globalSiteId, string $pageTitle ) {
						return new class {
							public function getSerialization() {
								return 'Q123';
							}
						};
					}
				};
			}
		};

		$wikibaseSettingsMock = new class {
			public function getSetting( $settingName ) {
				return 'enwiki';
			}
		};

		$resolver = new PageCompanionConfigResolver(
			$communityConfig,
			$companionConfigNames,
			$defaultCompanionConfigs,
			$wikibaseStoreMock,
			$wikibaseSettingsMock
		);

		$titleMock = $this->createMock( Title::class );
		$titleMock->method( 'getPrefixedText' )
			->willReturn( 'Dreaming_Page' );

		$result = $resolver->getCurrentCompanionConfig( $titleMock );

		$this->assertSame( 'dreaming', $result );
	}

	/**
	 * @covers \MediaWiki\Extension\WP25EasterEggs\PageCompanionConfigResolver::getCurrentCompanionConfig()
	 */
	public function testGetCurrentCompanionConfigReturnsNullWhenEnabledButNotConfiguredInWikibase() {
		$communityConfig = new HashConfig( [
			'confetti' => (object)[
				'allowPages' => [],
				'blockPages' => [],
				'defaultPages' => 'enabled',
			],
		] );

		$resolver = new PageCompanionConfigResolver(
			$communityConfig,
			[ 'confetti', 'dreaming', 'newspaper' ],
			[]
		);

		$titleMock = $this->createMock( Title::class );
		$titleMock->method( 'getPrefixedText' )
			->willReturn( 'Any_Page' );

		$result = $resolver->getCurrentCompanionConfig( $titleMock );

		$this->assertNull( $result );
	}

	/**
	 * @covers \MediaWiki\Extension\WP25EasterEggs\PageCompanionConfigResolver::getCurrentCompanionConfig()
	 */
	public function testGetCurrentCompanionConfigWithDefaultPagesDisabled() {
		$communityConfig = new HashConfig( [
			'confetti' => (object)[
				'allowPages' => [],
				'blockPages' => [],
				'defaultPages' => 'disabled',
			],
		] );

		$resolver = new PageCompanionConfigResolver(
			$communityConfig,
			[ 'confetti', 'dreaming', 'newspaper' ],
			[]
		);

		$titleMock = $this->createMock( Title::class );
		$titleMock->method( 'getPrefixedText' )
			->willReturn( 'Any_Page' );

		$result = $resolver->getCurrentCompanionConfig( $titleMock );

		$this->assertNull( $result );
	}
}
