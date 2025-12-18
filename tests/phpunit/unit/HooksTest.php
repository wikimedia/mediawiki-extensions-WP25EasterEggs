<?php

namespace MediaWiki\Extension\WP25EasterEggs\Tests;

use MediaWiki\Config\Config;
use MediaWiki\Extension\WP25EasterEggs\Hooks;
use MediaWiki\Output\OutputPage;
use MediaWiki\Skin\Skin;
use MediaWiki\Title\Title;
use MediaWiki\User\Options\UserOptionsLookup;
use MediaWiki\User\UserIdentity;
use Wikimedia\ObjectCache\HashBagOStuff;
use Wikimedia\ObjectCache\WANObjectCache;

/**
 * @covers \MediaWiki\Extension\WP25EasterEggs\Hooks
 */
class HooksTest extends \MediaWikiUnitTestCase {

	/**
	 * @covers \MediaWiki\Extension\WP25EasterEggs\Hooks::onBeforePageDisplay()
	 */
	public function testOnBeforePageDisplayAddsMainJsModuleWhenCCEnabled() {
		$configMock = $this->createMock( Config::class );
		$configMock->method( 'get' )
			->with( 'Wp25EasterEggsEnable' )
			->willReturn( true );

		$userOptionsLookupMock = $this->createMock( UserOptionsLookup::class );
		$userOptionsLookupMock->method( 'getOption' )
			->willReturn( '1' );

		$communityConfigMock = $this->createMock( Config::class );
		$communityConfigMock->method( 'get' )
			->willReturnMap( [
				[ 'EnableExtension', 'enabled' ],
				[ 'EnableCompanion', [ 'type' => 'everywhere' ] ]
			] );

		$cache = new WANObjectCache( [ 'cache' => new HashBagOStuff() ] );
		$hooks = new Hooks( $configMock, $userOptionsLookupMock, $cache, $communityConfigMock );

		$userMock = $this->createMock( UserIdentity::class );

		$skinMock = $this->createMock( Skin::class );
		$skinMock->method( 'getUser' )
			->willReturn( $userMock );

		$titleMock = $this->createMock( Title::class );
		$titleMock->method( 'getNamespace' )
			->willReturn( NS_MAIN );
		$titleMock->method( 'isContentPage' )
			->willReturn( true );

		$outputPageMock = $this->createMock( OutputPage::class );
		$outputPageMock->method( 'getTitle' )
			->willReturn( $titleMock );
		$outputPageMock->method( 'getActionName' )
			->willReturn( 'view' );

		$outputPageMock->expects( $this->once() )
			->method( 'addModules' )
			->with( 'ext.wp25EasterEggs' );

		$outputPageMock->expects( $this->atLeastOnce() )
			->method( 'addHtmlClasses' );

		$hooks->onBeforePageDisplay( $outputPageMock, $skinMock );
	}

	/**
	 * @covers \MediaWiki\Extension\WP25EasterEggs\Hooks::onBeforePageDisplay()
	 */
	public function testOnBeforePageDisplayWhenCCDisabled() {
		$configMock = $this->createMock( Config::class );
		$userOptionsLookupMock = $this->createMock( UserOptionsLookup::class );
		$cacheMock = $this->createMock( WANObjectCache::class );

		$hooks = new Hooks( $configMock, $userOptionsLookupMock, $cacheMock, null );

		$skinMock = $this->createMock( Skin::class );
		$outputPageMock = $this->createMock( OutputPage::class );

		$outputPageMock->expects( $this->never() )
			->method( 'addModules' );
		$outputPageMock->expects( $this->never() )
			->method( 'addHtmlClasses' );

		$hooks->onBeforePageDisplay( $outputPageMock, $skinMock );
	}

	/**
	 * @covers \MediaWiki\Extension\WP25EasterEggs\Hooks::onGetPreferences()
	 */
	public function testOnGetPreferencesAddsPreferenceWhenCCEnabled() {
		$configMock = $this->createMock( Config::class );
		$configMock->method( 'get' )
			->with( 'Wp25EasterEggsEnable' )
			->willReturn( true );

		$userOptionsLookupMock = $this->createMock( UserOptionsLookup::class );
		$userOptionsLookupMock->method( 'getOption' )
			->willReturn( true );

		$communityConfigMock = $this->createMock( Config::class );
		$communityConfigMock->method( 'get' )
			->with( 'EnableExtension' )
			->willReturn( 'enabled' );

		$cache = new WANObjectCache( [ 'cache' => new HashBagOStuff() ] );
		$hooks = new Hooks( $configMock, $userOptionsLookupMock, $cache, $communityConfigMock );

		$userMock = $this->createMock( UserIdentity::class );

		$preferences = [];
		$hooks->onGetPreferences( $userMock, $preferences );

		$this->assertArrayHasKey( 'wp25eastereggs-enable', $preferences );
		$this->assertSame( 'toggle', $preferences['wp25eastereggs-enable']['type'] );
	}

	/**
	 * @covers \MediaWiki\Extension\WP25EasterEggs\Hooks::onGetPreferences()
	 */
	public function testOnGetPreferencesWhenCCDisabled() {
		$configMock = $this->createMock( Config::class );
		$userOptionsLookupMock = $this->createMock( UserOptionsLookup::class );
		$cache = new WANObjectCache( [ 'cache' => new HashBagOStuff() ] );

		$hooks = new Hooks( $configMock, $userOptionsLookupMock, $cache, null );

		$userMock = $this->createMock( UserIdentity::class );

		$preferences = [];
		$hooks->onGetPreferences( $userMock, $preferences );

		$this->assertArrayNotHasKey( 'wp25eastereggs-enable', $preferences );
	}
}
