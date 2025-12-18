<?php

namespace MediaWiki\Extension\WP25EasterEggs\Tests;

use MediaWiki\Config\Config;
use MediaWiki\Extension\WP25EasterEggs\PageCompanionService;
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
		$service = new PageCompanionService( null );

		$outputPageMock = $this->createMock( OutputPage::class );

		$result = $service->getCompanionConfigHtmlClasses( $outputPageMock );

		$this->assertSame( [], $result );
	}

	/**
	 * @covers \MediaWiki\Extension\WP25EasterEggs\PageCompanionService::getCompanionConfigHtmlClasses()
	 */
	public function testGetCompanionConfigHtmlClassesWhenTitleIsNull() {
		$communityConfigMock = $this->createMock( Config::class );

		$service = new PageCompanionService( $communityConfigMock );

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

		$service = new PageCompanionService( $communityConfigMock );

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
}
