<?php

namespace MediaWiki\Extension\WP25EasterEggs\Tests;

use MediaWiki\Config\Config;
use MediaWiki\Extension\WP25EasterEggs\Hooks;
use MediaWiki\Output\OutputPage;
use MediaWiki\Skin\Skin;
use MediaWiki\User\Options\UserOptionsLookup;
use MediaWiki\User\UserIdentity;

/**
 * @covers \MediaWiki\Extension\WP25EasterEggs\Hooks
 */
class HooksTest extends \MediaWikiUnitTestCase {

	/**
	 * @covers \MediaWiki\Extension\WP25EasterEggs\Hooks::onBeforePageDisplay()
	 */
	public function testOnBeforePageDisplayAddsMainJsModule() {
		$outputPageMock = $this->getMockBuilder( OutputPage::class )
			->disableOriginalConstructor()
			->getMock();

		$outputPageMock->expects( $this->once() )
			->method( 'addModules' )
			->with( 'ext.wp25EasterEggs' );

		$skinMock = $this->getMockBuilder( Skin::class )
			->disableOriginalConstructor()
			->getMock();

		/** @var Config&\PHPUnit\Framework\MockObject\MockObject $configMock */
		$configMock = $this->getMockBuilder( Config::class )
			->disableOriginalConstructor()
			->getMock();

		/** @var UserOptionsLookup&\PHPUnit\Framework\MockObject\MockObject $userOptionsLookupMock */
		$userOptionsLookupMock = $this->getMockBuilder( UserOptionsLookup::class )
			->disableOriginalConstructor()
			->getMock();

		$hooks = new Hooks( $configMock, $userOptionsLookupMock );
		$hooks->onBeforePageDisplay( $outputPageMock, $skinMock );
	}

	/**
	 * @covers \MediaWiki\Extension\WP25EasterEggs\Hooks::onGetPreferences()
	 */
	public function testOnGetPreferencesAddsPreference() {
		$userMock = $this->createMock( UserIdentity::class );

		/** @var Config&\PHPUnit\Framework\MockObject\MockObject $configMock */
		$configMock = $this->getMockBuilder( Config::class )
			->disableOriginalConstructor()
			->getMock();

		/** @var UserOptionsLookup&\PHPUnit\Framework\MockObject\MockObject $userOptionsLookupMock */
		$userOptionsLookupMock = $this->getMockBuilder( UserOptionsLookup::class )
			->disableOriginalConstructor()
			->getMock();

		$hooks = new Hooks( $configMock, $userOptionsLookupMock );

		$preferences = [];
		$hooks->onGetPreferences( $userMock, $preferences );

		$preferencesKeys = [ 'wp25eastereggs-enable' ];
		foreach ( $preferencesKeys as $key ) {
			$this->assertArrayHasKey( $key, $preferences );
		}
	}
}
