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
	public function testOnBeforePageDisplayAddsMainJsModuleWhenCCEnabled() {
		/** @var Config&\PHPUnit\Framework\MockObject\MockObject $configMock */
		$configMock = $this->getMockBuilder( Config::class )
			->disableOriginalConstructor()
			->getMock();

		/** @var UserOptionsLookup&\PHPUnit\Framework\MockObject\MockObject $userOptionsLookupMock */
		$userOptionsLookupMock = $this->getMockBuilder( UserOptionsLookup::class )
			->disableOriginalConstructor()
			->getMock();

		/** @var Config&\PHPUnit\Framework\MockObject\MockObject $wikiConfigMock */
		$wikiConfigMock = $this->getMockBuilder( Config::class )
			->disableOriginalConstructor()
			->getMock();

		$hooks = $this->getMockBuilder( Hooks::class )
			->setConstructorArgs( [ $configMock, $userOptionsLookupMock, $wikiConfigMock ] )
			->onlyMethods( [ 'isCommunityConfigEnabled' ] )
			->getMock();
		$hooks->method( 'isCommunityConfigEnabled' )
			->willReturn( true );

		$userMock = $this->createMock( UserIdentity::class );

		$skinMock = $this->getMockBuilder( Skin::class )
			->disableOriginalConstructor()
			->getMock();
		$skinMock->method( 'getUser' )
			->willReturn( $userMock );

		$outputPageMock = $this->getMockBuilder( OutputPage::class )
			->disableOriginalConstructor()
			->getMock();
		$outputPageMock->expects( $this->once() )
			->method( 'addModules' )
			->with( 'ext.wp25EasterEggs' );
		$outputPageMock->expects( $this->once() )
			->method( 'addHtmlClasses' )
			->with( $this->stringContains( 'wp25eastereggs-enable-' ) );

		$hooks->onBeforePageDisplay( $outputPageMock, $skinMock );
	}

	/**
	 * @covers \MediaWiki\Extension\WP25EasterEggs\Hooks::onBeforePageDisplay()
	 */
	public function testOnBeforePageDisplayAddsMainJsModuleWhenCCDisabled() {
		/** @var Config&\PHPUnit\Framework\MockObject\MockObject $configMock */
		$configMock = $this->getMockBuilder( Config::class )
			->disableOriginalConstructor()
			->getMock();

		/** @var UserOptionsLookup&\PHPUnit\Framework\MockObject\MockObject $userOptionsLookupMock */
		$userOptionsLookupMock = $this->getMockBuilder( UserOptionsLookup::class )
			->disableOriginalConstructor()
			->getMock();

		/** @var Config&\PHPUnit\Framework\MockObject\MockObject $wikiConfigMock */
		$wikiConfigMock = $this->getMockBuilder( Config::class )
			->disableOriginalConstructor()
			->getMock();

		$hooks = $this->getMockBuilder( Hooks::class )
			->setConstructorArgs( [ $configMock, $userOptionsLookupMock, $wikiConfigMock ] )
			->onlyMethods( [ 'isCommunityConfigEnabled' ] )
			->getMock();
		$hooks->method( 'isCommunityConfigEnabled' )
			->willReturn( false );

		$userMock = $this->createMock( UserIdentity::class );

		$skinMock = $this->getMockBuilder( Skin::class )
			->disableOriginalConstructor()
			->getMock();
		$skinMock->method( 'getUser' )
			->willReturn( $userMock );

		$outputPageMock = $this->getMockBuilder( OutputPage::class )
			->disableOriginalConstructor()
			->getMock();
		$outputPageMock->expects( $this->never() )
			->method( 'addModules' )
			->with( 'ext.wp25EasterEggs' );
		$outputPageMock->expects( $this->never() )
			->method( 'addHtmlClasses' )
			->with( $this->stringContains( 'wp25eastereggs-enable-' ) );

		$hooks->onBeforePageDisplay( $outputPageMock, $skinMock );
	}

	/**
	 * @covers \MediaWiki\Extension\WP25EasterEggs\Hooks::onGetPreferences()
	 */
	public function testOnGetPreferencesAddsPreferenceWhenCCEnabled() {
		/** @var Config&\PHPUnit\Framework\MockObject\MockObject $configMock */
		$configMock = $this->getMockBuilder( Config::class )
			->disableOriginalConstructor()
			->getMock();

		/** @var UserOptionsLookup&\PHPUnit\Framework\MockObject\MockObject $userOptionsLookupMock */
		$userOptionsLookupMock = $this->getMockBuilder( UserOptionsLookup::class )
			->disableOriginalConstructor()
			->getMock();

		/** @var Config&\PHPUnit\Framework\MockObject\MockObject $wikiConfigMock */
		$wikiConfigMock = $this->getMockBuilder( Config::class )
			->disableOriginalConstructor()
			->getMock();

		$hooks = $this->getMockBuilder( Hooks::class )
			->setConstructorArgs( [ $configMock, $userOptionsLookupMock, $wikiConfigMock ] )
			->onlyMethods( [ 'isCommunityConfigEnabled' ] )
			->getMock();
		$hooks->method( 'isCommunityConfigEnabled' )
			->willReturn( true );

		$userMock = $this->createMock( UserIdentity::class );

		$preferences = [];
		$hooks->onGetPreferences( $userMock, $preferences );

		$preferencesKeys = [ 'wp25eastereggs-enable' ];
		foreach ( $preferencesKeys as $key ) {
			$this->assertArrayHasKey( $key, $preferences );
		}
	}

	/**
	 * @covers \MediaWiki\Extension\WP25EasterEggs\Hooks::onGetPreferences()
	 */
	public function testOnGetPreferencesAddsPreferenceWhenCCDisabled() {
		/** @var Config&\PHPUnit\Framework\MockObject\MockObject $configMock */
		$configMock = $this->getMockBuilder( Config::class )
			->disableOriginalConstructor()
			->getMock();

		/** @var UserOptionsLookup&\PHPUnit\Framework\MockObject\MockObject $userOptionsLookupMock */
		$userOptionsLookupMock = $this->getMockBuilder( UserOptionsLookup::class )
			->disableOriginalConstructor()
			->getMock();

		/** @var Config&\PHPUnit\Framework\MockObject\MockObject $wikiConfigMock */
		$wikiConfigMock = $this->getMockBuilder( Config::class )
			->disableOriginalConstructor()
			->getMock();

		$hooks = $this->getMockBuilder( Hooks::class )
			->setConstructorArgs( [ $configMock, $userOptionsLookupMock, $wikiConfigMock ] )
			->onlyMethods( [ 'isCommunityConfigEnabled' ] )
			->getMock();
		$hooks->method( 'isCommunityConfigEnabled' )
			->willReturn( false );

		$userMock = $this->createMock( UserIdentity::class );

		$preferences = [];
		$hooks->onGetPreferences( $userMock, $preferences );

		$preferencesKeys = [ 'wp25eastereggs-enable' ];
		foreach ( $preferencesKeys as $key ) {
			$this->assertArrayNotHasKey( $key, $preferences );
		}
	}
}
