<?php

namespace MediaWiki\Extension\WP25EasterEggs\Tests;

use MediaWiki\Config\Config;
use MediaWiki\Extension\WP25EasterEggs\PageCompanionConfigResolver;
use MediaWiki\Title\Title;
use stdClass;

/**
 * @covers \MediaWiki\Extension\WP25EasterEggs\PageCompanionConfigResolver
 */
class PageCompanionConfigResolverTest extends \MediaWikiUnitTestCase {

	/**
	 * @covers \MediaWiki\Extension\WP25EasterEggs\PageCompanionConfigResolver::isCompanionEnabled()
	 */
	public function testIsCompanionEnabledReturnsFalseWhenCommunityConfigIsNull() {
		$communityConfigMock = $this->createMock( Config::class );
		$communityConfigMock->method( 'get' )
			->willReturn( null );

		$resolver = new PageCompanionConfigResolver( $communityConfigMock, [], [] );

		$titleMock = $this->createMock( Title::class );

		$result = $resolver->isCompanionEnabled( $titleMock );

		$this->assertFalse( $result );
	}

	/**
	 * @covers \MediaWiki\Extension\WP25EasterEggs\PageCompanionConfigResolver::isCompanionEnabled()
	 */
	public function testIsCompanionEnabledReturnsTrueWhenTypeIsEverywhere() {
		$communityConfigMock = $this->createMock( Config::class );
		$enableCompanion = (object)[ 'type' => 'everywhere' ];

		$communityConfigMock->method( 'get' )
			->willReturn( $enableCompanion );

		$resolver = new PageCompanionConfigResolver( $communityConfigMock, [], [] );

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
		$communityConfigMock = $this->createMock( Config::class );
		$enableCompanion = (object)[
			'type' => 'allowFilter',
			'filterPages' => [ 'Allowed_Page' ]
		];

		$communityConfigMock->method( 'get' )
			->willReturn( $enableCompanion );

		$resolver = new PageCompanionConfigResolver( $communityConfigMock, [], [] );

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
		$communityConfigMock = $this->createMock( Config::class );
		$enableCompanion = (object)[
			'type' => 'allowFilter',
			'filterPages' => [ 'Allowed_Page' ]
		];

		$communityConfigMock->method( 'get' )
			->willReturn( $enableCompanion );

		$resolver = new PageCompanionConfigResolver( $communityConfigMock, [], [] );

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
		$communityConfigMock = $this->createMock( Config::class );
		$enableCompanion = (object)[
			'type' => 'blockFilter',
			'filterPages' => [ 'Blocked_Page' ]
		];

		$communityConfigMock->method( 'get' )
			->willReturn( $enableCompanion );

		$resolver = new PageCompanionConfigResolver( $communityConfigMock, [], [] );

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
		$communityConfigMock = $this->createMock( Config::class );
		$enableCompanion = (object)[
			'type' => 'blockFilter',
			'filterPages' => [ 'Blocked_Page' ]
		];

		$communityConfigMock->method( 'get' )
			->willReturn( $enableCompanion );

		$resolver = new PageCompanionConfigResolver( $communityConfigMock, [], [] );

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
		$communityConfigMock = $this->createMock( Config::class );
		$communityConfigMock->method( 'get' )
			->willReturn( null );

		$companionConfigNames = [ 'celebrate', 'dream', 'newspaper' ];
		$resolver = new PageCompanionConfigResolver( $communityConfigMock, $companionConfigNames, [] );

		$titleMock = $this->createMock( Title::class );

		$result = $resolver->getCurrentCompanionConfig( $titleMock );

		$this->assertNull( $result );
	}

	/**
	 * @covers \MediaWiki\Extension\WP25EasterEggs\PageCompanionConfigResolver::getCurrentCompanionConfig()
	 */
	public function testGetCurrentCompanionConfigResolvesAllowPages() {
		$celebrateConfig = new stdClass();
		$celebrateConfig->allowPages = [ 'Test_Page' ];
		$celebrateConfig->blockPages = [];
		$celebrateConfig->defaultPages = 'disabled';

		$communityConfigMock = $this->createMock( Config::class );
		$communityConfigMock->method( 'get' )
			->willReturnMap( [
				[ 'celebrate', $celebrateConfig ],
				[ 'dream', null ],
				[ 'newspaper', null ]
			] );

		$resolver = new PageCompanionConfigResolver( $communityConfigMock, [ 'celebrate', 'dream', 'newspaper' ], [] );

		$titleMock = $this->createMock( Title::class );
		$titleMock->method( 'getPrefixedText' )
			->willReturn( 'Test_Page' );

		$result = $resolver->getCurrentCompanionConfig( $titleMock );

		$this->assertSame( 'celebrate', $result );
	}

	/**
	 * @covers \MediaWiki\Extension\WP25EasterEggs\PageCompanionConfigResolver::getCurrentCompanionConfig()
	 */
	public function testGetCurrentCompanionConfigRespectsBlockPages() {
		$celebrateConfig = new stdClass();
		$celebrateConfig->allowPages = [ 'Test_Page' ];
		$celebrateConfig->blockPages = [ 'Test_Page' ];
		$celebrateConfig->defaultPages = 'disabled';

		$communityConfigMock = $this->createMock( Config::class );
		$communityConfigMock->method( 'get' )
			->willReturnMap( [
				[ 'celebrate', $celebrateConfig ],
				[ 'dream', null ],
				[ 'newspaper', null ]
			] );

		$resolver = new PageCompanionConfigResolver( $communityConfigMock, [ 'celebrate', 'dream', 'newspaper' ], [] );

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
		$communityConfigMock = $this->createMock( Config::class );
		// Ensure defaults validation passes
		$communityConfigMock->method( 'get' )
			->willReturnMap( [
				[ 'dream', (object)[ 'defaultPages' => 'enabled' ] ]
			] );

		$companionConfigNames = [ 'dream' ];
		$defaultCompanionConfigs = [ 'Q123' => 'dream' ];

		// Mock Wikibase Services using stdClass with __call or addMethods
		// Since we can't rely on Wikibase classes being present, we mock objects that behave like them.

		$itemIdMock = $this->getMockBuilder( \stdClass::class )
			->addMethods( [ 'getSerialization' ] )
			->getMock();
		$itemIdMock->method( 'getSerialization' )
			->willReturn( 'Q123' );

		$siteLinkLookupMock = $this->getMockBuilder( \stdClass::class )
			->addMethods( [ 'getItemIdForLink' ] )
			->getMock();
		$siteLinkLookupMock->method( 'getItemIdForLink' )
			->willReturn( $itemIdMock );

		$wikibaseStoreMock = $this->getMockBuilder( \stdClass::class )
			->addMethods( [ 'getSiteLinkLookup' ] )
			->getMock();
		$wikibaseStoreMock->method( 'getSiteLinkLookup' )
			->willReturn( $siteLinkLookupMock );

		$wikibaseSettingsMock = $this->getMockBuilder( \stdClass::class )
			->addMethods( [ 'getSetting' ] )
			->getMock();
		$wikibaseSettingsMock->method( 'getSetting' )
			->with( 'siteGlobalID' )
			->willReturn( 'enwiki' );

		$resolver = new PageCompanionConfigResolver(
			$communityConfigMock,
			$companionConfigNames,
			$defaultCompanionConfigs,
			$wikibaseStoreMock,
			$wikibaseSettingsMock
		);

		$titleMock = $this->createMock( Title::class );
		$titleMock->method( 'getPrefixedText' )
			->willReturn( 'Dream_Page' );

		$result = $resolver->getCurrentCompanionConfig( $titleMock );

		$this->assertSame( 'dream', $result );
	}

	/**
	 * @covers \MediaWiki\Extension\WP25EasterEggs\PageCompanionConfigResolver::getCurrentCompanionConfig()
	 */
	public function testGetCurrentCompanionConfigReturnsNullWhenEnabledButNotConfiguredInWikibase() {
		$celebrateConfig = new stdClass();
		$celebrateConfig->allowPages = [];
		$celebrateConfig->blockPages = [];
		$celebrateConfig->defaultPages = 'enabled';

		$communityConfigMock = $this->createMock( Config::class );
		$communityConfigMock->method( 'get' )
			->willReturnMap( [
				[ 'celebrate', $celebrateConfig ],
				[ 'dream', null ],
				[ 'newspaper', null ]
			] );

		$resolver = new PageCompanionConfigResolver( $communityConfigMock, [ 'celebrate', 'dream', 'newspaper' ], [] );

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
		$celebrateConfig = new stdClass();
		$celebrateConfig->allowPages = [];
		$celebrateConfig->blockPages = [];
		$celebrateConfig->defaultPages = 'disabled';

		$communityConfigMock = $this->createMock( Config::class );
		$communityConfigMock->method( 'get' )
			->willReturnMap( [
				[ 'celebrate', $celebrateConfig ],
				[ 'dream', null ],
				[ 'newspaper', null ]
			] );

		$resolver = new PageCompanionConfigResolver( $communityConfigMock, [ 'celebrate', 'dream', 'newspaper' ], [] );

		$titleMock = $this->createMock( Title::class );
		$titleMock->method( 'getPrefixedText' )
			->willReturn( 'Any_Page' );

		$result = $resolver->getCurrentCompanionConfig( $titleMock );

		$this->assertNull( $result );
	}
}
