<?php

namespace MediaWiki\Extension\WP25EasterEggs\Tests;

use MediaWiki\Config\HashConfig;
use MediaWiki\Context\IContextSource;
use MediaWiki\Extension\WP25EasterEggs\Hooks;
use MediaWiki\Output\OutputPage;
use MediaWiki\Request\WebRequest;
use MediaWiki\Skin\Skin;
use MediaWiki\SpecialPage\SpecialPageFactory;
use MediaWiki\Title\Title;
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
		$configMock = new HashConfig( [
			'Wp25EasterEggsEnable' => true,
			'ExtensionDirectory' => ''
		] );
		$userOptionsLookupMock = $this->createMock( UserOptionsLookup::class );
		$userOptionsLookupMock->method( 'getOption' )
			->willReturn( '1' );
		$specialPageFactoryMock = $this->createMock( SpecialPageFactory::class );
		$communityConfig = new HashConfig( [
			'EnableExtension' => 'enabled',
			'DefaultUserPreference' => 'enabled',
			'EnableCompanion' => [ 'type' => 'everywhere' ],
		] );

		$hooks = new Hooks( $configMock, $userOptionsLookupMock, $specialPageFactoryMock, $communityConfig );

		$userMock = $this->createNoOpMock( UserIdentity::class );

		$skinMock = $this->createMock( Skin::class );
		$skinMock->method( 'getUser' )
			->willReturn( $userMock );

		$titleMock = $this->createMock( Title::class );
		$titleMock->method( 'getNamespace' )
			->willReturn( NS_MAIN );
		$titleMock->method( 'isContentPage' )
			->willReturn( true );

		$webRequestMock = $this->createMock( WebRequest::class );
		$webRequestMock->method( 'getFuzzyBool' )
			->with( 'wp25eastereggs' )
			->willReturn( false );

		$contextMock = $this->createMock( IContextSource::class );
		$contextMock->method( 'getRequest' )
			->willReturn( $webRequestMock );

		$outputPageMock = $this->createMock( OutputPage::class );
		$outputPageMock->method( 'getContext' )
			->willReturn( $contextMock );
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
		$configMock = new HashConfig( [ 'Wp25EasterEggsEnable' => true ] );
		$userOptionsLookupMock = $this->createNoOpMock( UserOptionsLookup::class );
		$specialPageFactoryMock = $this->createMock( SpecialPageFactory::class );

		$hooks = new Hooks( $configMock, $userOptionsLookupMock, $specialPageFactoryMock, null );

		$skinMock = $this->createNoOpMock( Skin::class );

		$webRequestMock = $this->createMock( WebRequest::class );
		$webRequestMock->method( 'getFuzzyBool' )
			->willReturn( false );

		$contextMock = $this->createMock( IContextSource::class );
		$contextMock->method( 'getRequest' )
			->willReturn( $webRequestMock );

		$outputPageMock = $this->createMock( OutputPage::class );
		$outputPageMock->method( 'getContext' )
			->willReturn( $contextMock );

		$outputPageMock->expects( $this->never() )
			->method( 'addModules' );
		$outputPageMock->expects( $this->never() )
			->method( 'addHtmlClasses' );

		$hooks->onBeforePageDisplay( $outputPageMock, $skinMock );
	}

	/**
	 * @covers \MediaWiki\Extension\WP25EasterEggs\Hooks::onBeforePageDisplay()
	 */
	public function testOnBeforePageDisplayWhenConfigFlagDisabled() {
		$configMock = new HashConfig( [ 'Wp25EasterEggsEnable' => false ] );
		$userOptionsLookupMock = $this->createNoOpMock( UserOptionsLookup::class );
		$specialPageFactoryMock = $this->createMock( SpecialPageFactory::class );
		$communityConfig = new HashConfig( [ 'EnableExtension' => 'enabled' ] );

		$hooks = new Hooks( $configMock, $userOptionsLookupMock, $specialPageFactoryMock, $communityConfig );

		$skinMock = $this->createNoOpMock( Skin::class );

		$webRequestMock = $this->createMock( WebRequest::class );
		$webRequestMock->method( 'getFuzzyBool' )
			->willReturn( false );

		$contextMock = $this->createMock( IContextSource::class );
		$contextMock->method( 'getRequest' )
			->willReturn( $webRequestMock );

		$outputPageMock = $this->createMock( OutputPage::class );
		$outputPageMock->method( 'getContext' )
			->willReturn( $contextMock );

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
		$configMock = new HashConfig( [ 'Wp25EasterEggsEnable' => true ] );
		$userOptionsLookupMock = $this->createMock( UserOptionsLookup::class );
		$userOptionsLookupMock->method( 'getOption' )
			->willReturn( true );
		$specialPageFactoryMock = $this->createMock( SpecialPageFactory::class );
		$communityConfig = new HashConfig( [
			'EnableExtension' => 'enabled',
			'DefaultUserPreference' => 'enabled'
		] );

		$hooks = new Hooks( $configMock, $userOptionsLookupMock, $specialPageFactoryMock, $communityConfig );

		$userMock = $this->createNoOpMock( UserIdentity::class );
		$preferences = [];

		$hooks->onGetPreferences( $userMock, $preferences );

		$this->assertArrayHasKey( 'wp25eastereggs-enable', $preferences );
		$this->assertSame( 'toggle', $preferences['wp25eastereggs-enable']['type'] );
	}

	/**
	 * @covers \MediaWiki\Extension\WP25EasterEggs\Hooks::onGetPreferences()
	 */
	public function testOnGetPreferencesWhenCCDisabled() {
		$configMock = new HashConfig( [ 'Wp25EasterEggsEnable' => true ] );
		$userOptionsLookupMock = $this->createNoOpMock( UserOptionsLookup::class );
		$specialPageFactoryMock = $this->createMock( SpecialPageFactory::class );

		$hooks = new Hooks( $configMock, $userOptionsLookupMock, $specialPageFactoryMock, null );

		$userMock = $this->createNoOpMock( UserIdentity::class );
		$preferences = [];

		$hooks->onGetPreferences( $userMock, $preferences );

		$this->assertArrayNotHasKey( 'wp25eastereggs-enable', $preferences );
	}
}
