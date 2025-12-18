<?php

namespace MediaWiki\Extension\WP25EasterEggs\Tests;

use MediaWiki\Config\Config;
use MediaWiki\Extension\WP25EasterEggs\PageCompanionService;
use MediaWiki\Output\OutputPage;
use MediaWiki\Title\Title;
use Wikimedia\ObjectCache\HashBagOStuff;
use Wikimedia\ObjectCache\WANObjectCache;

/**
 * @covers \MediaWiki\Extension\WP25EasterEggs\PageCompanionService
 */
class PageCompanionServiceTest extends \MediaWikiUnitTestCase {

	/**
	 * @covers \MediaWiki\Extension\WP25EasterEggs\PageCompanionService::getCompanionConfigHtmlClasses()
	 */
	public function testGetCompanionConfigHtmlClassesWhenCommunityConfigIsNull() {
		$cache = new WANObjectCache( [ 'cache' => new HashBagOStuff() ] );
		$service = new PageCompanionService( $cache, null );

		$outputPageMock = $this->createMock( OutputPage::class );

		$result = $service->getCompanionConfigHtmlClasses( $outputPageMock );

		$this->assertSame( [], $result );
	}

	/**
	 * @covers \MediaWiki\Extension\WP25EasterEggs\PageCompanionService::getCompanionConfigHtmlClasses()
	 */
	public function testGetCompanionConfigHtmlClassesWhenTitleIsNull() {
		$communityConfigMock = $this->createMock( Config::class );
		$cache = new WANObjectCache( [ 'cache' => new HashBagOStuff() ] );

		$service = new PageCompanionService( $cache, $communityConfigMock );

		$outputPageMock = $this->createMock( OutputPage::class );
		$outputPageMock->method( 'getTitle' )
			->willReturn( null );

		$result = $service->getCompanionConfigHtmlClasses( $outputPageMock );

		$this->assertSame( [], $result );
	}

	/**
	 * @covers \MediaWiki\Extension\WP25EasterEggs\PageCompanionService::getCompanionConfigHtmlClasses()
	 */
	public function testGetCompanionConfigHtmlClassesWhenNotViewArticlePage() {
		$communityConfigMock = $this->createMock( Config::class );
		$cache = new WANObjectCache( [ 'cache' => new HashBagOStuff() ] );

		$service = new PageCompanionService( $cache, $communityConfigMock );

		$titleMock = $this->createMock( Title::class );
		$titleMock->method( 'getNamespace' )
			->willReturn( NS_TALK );
		$titleMock->method( 'isContentPage' )
			->willReturn( true );

		$outputPageMock = $this->createMock( OutputPage::class );
		$outputPageMock->method( 'getTitle' )
			->willReturn( $titleMock );
		$outputPageMock->method( 'getActionName' )
			->willReturn( 'view' );

		$result = $service->getCompanionConfigHtmlClasses( $outputPageMock );

		$this->assertSame( [], $result );
	}

	/**
	 * @covers \MediaWiki\Extension\WP25EasterEggs\PageCompanionService::getCompanionConfigHtmlClasses()
	 */
	public function testGetCompanionConfigHtmlClassesReturnsClassesWhenEnabled() {
		$communityConfigMock = $this->createMock( Config::class );
		// Mock EnableCompanion to be enabled everywhere
		$enableCompanion = (object)[ 'type' => 'everywhere' ];
		// Mock a specific companion config (e.g. celebrate) to be enabled
		$celebrateConfig = (object)[
			'allowPages' => [ 'Test_Page' ],
			'blockPages' => [],
			'defaultPages' => 'disabled'
		];

		$communityConfigMock->method( 'get' )
			->willReturnMap( [
				[ 'EnableCompanion', $enableCompanion ],
				[ 'celebrate', $celebrateConfig ],
				[ 'dream', null ],
				[ 'newspaper', null ]
			] );

		$cache = new WANObjectCache( [ 'cache' => new HashBagOStuff() ] );

		$service = new PageCompanionService( $cache, $communityConfigMock );

		$titleMock = $this->createMock( Title::class );
		$titleMock->method( 'getNamespace' )
			->willReturn( NS_MAIN );
		$titleMock->method( 'isContentPage' )
			->willReturn( true );
		$titleMock->method( 'getPrefixedText' )
			->willReturn( 'Test_Page' );

		$outputPageMock = $this->createMock( OutputPage::class );
		$outputPageMock->method( 'getTitle' )
			->willReturn( $titleMock );
		$outputPageMock->method( 'getActionName' )
			->willReturn( 'view' );

		$result = $service->getCompanionConfigHtmlClasses( $outputPageMock );

		$this->assertContains( 'wp25eastereggs-companion-enabled', $result );
		$this->assertContains( 'wp25eastereggs-companion-celebrate', $result );
	}

	/**
	 * @covers \MediaWiki\Extension\WP25EasterEggs\PageCompanionService::getCompanionConfigHtmlClasses()
	 */
	public function testGetCompanionConfigHtmlClassesWhenCompanionIsDisabledByFilter() {
		$communityConfigMock = $this->createMock( Config::class );
		// Mock EnableCompanion to be disabled for this page via blockFilter
		$enableCompanion = (object)[
			'type' => 'blockFilter',
			'filterPages' => [ 'Test_Page' ]
		];

		$communityConfigMock->method( 'get' )
			->willReturnMap( [
				[ 'EnableCompanion', $enableCompanion ],
			] );

		$cache = new WANObjectCache( [ 'cache' => new HashBagOStuff() ] );
		$service = new PageCompanionService( $cache, $communityConfigMock );

		$titleMock = $this->createMock( Title::class );
		$titleMock->method( 'getNamespace' )
			->willReturn( NS_MAIN );
		$titleMock->method( 'isContentPage' )
			->willReturn( true );
		$titleMock->method( 'getPrefixedText' )
			->willReturn( 'Test_Page' );

		$outputPageMock = $this->createMock( OutputPage::class );
		$outputPageMock->method( 'getTitle' )
			->willReturn( $titleMock );
		$outputPageMock->method( 'getActionName' )
			->willReturn( 'view' );

		$result = $service->getCompanionConfigHtmlClasses( $outputPageMock );

		$this->assertSame( [], $result );
	}

	/**
	 * @covers \MediaWiki\Extension\WP25EasterEggs\PageCompanionService::getCompanionConfigHtmlClasses()
	 */
	public function testGetCompanionConfigHtmlClassesWhenEnabledButNoSpecificConfigMatches() {
		$communityConfigMock = $this->createMock( Config::class );
		// Mock EnableCompanion to be enabled everywhere
		$enableCompanion = (object)[ 'type' => 'everywhere' ];

		// Mock all specific configs to return null or not verify
		$communityConfigMock->method( 'get' )
			->willReturnMap( [
				[ 'EnableCompanion', $enableCompanion ],
				[ 'celebrate', null ],
				[ 'dream', null ],
				[ 'newspaper', null ]
			] );

		$cache = new WANObjectCache( [ 'cache' => new HashBagOStuff() ] );
		$service = new PageCompanionService( $cache, $communityConfigMock );

		$titleMock = $this->createMock( Title::class );
		$titleMock->method( 'getNamespace' )
			->willReturn( NS_MAIN );
		$titleMock->method( 'isContentPage' )
			->willReturn( true );
		$titleMock->method( 'getPrefixedText' )
			->willReturn( 'Test_Page' );

		$outputPageMock = $this->createMock( OutputPage::class );
		$outputPageMock->method( 'getTitle' )
			->willReturn( $titleMock );
		$outputPageMock->method( 'getActionName' )
			->willReturn( 'view' );

		$result = $service->getCompanionConfigHtmlClasses( $outputPageMock );

		$this->assertSame( [ 'wp25eastereggs-companion-enabled' ], $result );
	}
}
