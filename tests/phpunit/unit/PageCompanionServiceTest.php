<?php

namespace MediaWiki\Extension\WP25EasterEggs\Tests;

use MediaWiki\Config\HashConfig;
use MediaWiki\Extension\WP25EasterEggs\PageCompanionService;
use MediaWiki\MainConfigNames;
use MediaWiki\Output\OutputPage;
use MediaWiki\Title\Title;

/**
 * @covers \MediaWiki\Extension\WP25EasterEggs\PageCompanionService
 */
class PageCompanionServiceTest extends \MediaWikiUnitTestCase {

	/**
	 * @covers \MediaWiki\Extension\WP25EasterEggs\PageCompanionService::getCompanionConfigHtmlClasses()
	 */
	public function testGetCompanionConfigHtmlClassesWhenCommunityConfigIsNull() {
		$configMock = new HashConfig( [ MainConfigNames::ExtensionDirectory => '' ] );

		$service = new PageCompanionService( $configMock );

		$outputPageMock = $this->createMock( OutputPage::class );

		$result = $service->getCompanionConfigHtmlClasses( $outputPageMock );

		$this->assertSame( [], $result );
	}

	/**
	 * @covers \MediaWiki\Extension\WP25EasterEggs\PageCompanionService::getCompanionConfigHtmlClasses()
	 */
	public function testGetCompanionConfigHtmlClassesWhenTitleIsNull() {
		$configMock = new HashConfig( [ MainConfigNames::ExtensionDirectory => '' ] );
		$communityConfigMock = new HashConfig();

		$service = new PageCompanionService( $configMock, $communityConfigMock );

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
		$configMock = new HashConfig( [ MainConfigNames::ExtensionDirectory => '' ] );
		$communityConfigMock = new HashConfig();

		$service = new PageCompanionService( $configMock, $communityConfigMock );

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
		$configMock = new HashConfig( [ MainConfigNames::ExtensionDirectory => '' ] );
		$communityConfigMock = new HashConfig( [
			// Mock EnableCompanion to be enabled everywhere
			'EnableCompanion' => (object)[ 'type' => 'everywhere' ],
			// Mock a specific companion config (e.g. confetti) to be enabled
			'confetti' => (object)[
				'allowPages' => [ 'Test_Page' ],
				'blockPages' => [],
				'defaultPages' => 'disabled'
			],
		] );

		$service = new PageCompanionService( $configMock, $communityConfigMock );

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
		$this->assertContains( 'wp25eastereggs-companion-confetti', $result );
	}

	/**
	 * @covers \MediaWiki\Extension\WP25EasterEggs\PageCompanionService::getCompanionConfigHtmlClasses()
	 */
	public function testGetCompanionConfigHtmlClassesWhenCompanionIsDisabledByFilter() {
		$configMock = new HashConfig( [ MainConfigNames::ExtensionDirectory => '' ] );
		// Mock EnableCompanion to be disabled for this page via blockFilter
		$communityConfigMock = new HashConfig( [
			'EnableCompanion' => (object)[
				'type' => 'blockFilter',
				'filterPages' => [ 'Test_Page' ]
			],
		] );

		$service = new PageCompanionService( $configMock, $communityConfigMock );

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
		$configMock = new HashConfig( [ MainConfigNames::ExtensionDirectory => '' ] );
		// Mock EnableCompanion to be enabled everywhere
		$communityConfigMock = new HashConfig( [
			'EnableCompanion' => (object)[ 'type' => 'everywhere' ],
		] );

		$service = new PageCompanionService( $configMock, $communityConfigMock );

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
