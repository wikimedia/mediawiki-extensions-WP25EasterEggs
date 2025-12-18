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
	public function testIsCompanionEnabledWhenConfigIsNull() {
		$communityConfigMock = $this->createMock( Config::class );
		$communityConfigMock->method( 'get' )
			->with( 'EnableCompanion' )
			->willReturn( null );

		$resolver = new PageCompanionConfigResolver( $communityConfigMock );

		$titleMock = $this->createMock( Title::class );

		$result = $resolver->isCompanionEnabled( $titleMock );

		$this->assertFalse( $result );
	}

	/**
	 * @covers \MediaWiki\Extension\WP25EasterEggs\PageCompanionConfigResolver::isCompanionEnabled()
	 */
	public function testIsCompanionEnabledEverywhere() {
		$enableCompanion = new stdClass();
		$enableCompanion->type = 'everywhere';

		$communityConfigMock = $this->createMock( Config::class );
		$communityConfigMock->method( 'get' )
			->with( 'EnableCompanion' )
			->willReturn( $enableCompanion );

		$resolver = new PageCompanionConfigResolver( $communityConfigMock );

		$titleMock = $this->createMock( Title::class );

		$result = $resolver->isCompanionEnabled( $titleMock );

		$this->assertTrue( $result );
	}

	/**
	 * @covers \MediaWiki\Extension\WP25EasterEggs\PageCompanionConfigResolver::isCompanionEnabled()
	 */
	public function testIsCompanionEnabledWithAllowFilter() {
		$enableCompanion = new stdClass();
		$enableCompanion->type = 'allowFilter';
		$enableCompanion->filterPages = [ 'Test_Page', 'Another_Page' ];

		$communityConfigMock = $this->createMock( Config::class );
		$communityConfigMock->method( 'get' )
			->with( 'EnableCompanion' )
			->willReturn( $enableCompanion );

		$resolver = new PageCompanionConfigResolver( $communityConfigMock );

		$titleMock = $this->createMock( Title::class );
		$titleMock->method( 'getPrefixedText' )
			->willReturn( 'Test_Page' );

		$result = $resolver->isCompanionEnabled( $titleMock );

		$this->assertTrue( $result );
	}

	/**
	 * @covers \MediaWiki\Extension\WP25EasterEggs\PageCompanionConfigResolver::isCompanionEnabled()
	 */
	public function testIsCompanionEnabledWithAllowFilterNotInList() {
		$enableCompanion = new stdClass();
		$enableCompanion->type = 'allowFilter';
		$enableCompanion->filterPages = [ 'Test_Page', 'Another_Page' ];

		$communityConfigMock = $this->createMock( Config::class );
		$communityConfigMock->method( 'get' )
			->with( 'EnableCompanion' )
			->willReturn( $enableCompanion );

		$resolver = new PageCompanionConfigResolver( $communityConfigMock );

		$titleMock = $this->createMock( Title::class );
		$titleMock->method( 'getPrefixedText' )
			->willReturn( 'Different_Page' );

		$result = $resolver->isCompanionEnabled( $titleMock );

		$this->assertFalse( $result );
	}

	/**
	 * @covers \MediaWiki\Extension\WP25EasterEggs\PageCompanionConfigResolver::isCompanionEnabled()
	 */
	public function testIsCompanionEnabledWithBlockFilter() {
		$enableCompanion = new stdClass();
		$enableCompanion->type = 'blockFilter';
		$enableCompanion->filterPages = [ 'Blocked_Page' ];

		$communityConfigMock = $this->createMock( Config::class );
		$communityConfigMock->method( 'get' )
			->with( 'EnableCompanion' )
			->willReturn( $enableCompanion );

		$resolver = new PageCompanionConfigResolver( $communityConfigMock );

		$titleMock = $this->createMock( Title::class );
		$titleMock->method( 'getPrefixedText' )
			->willReturn( 'Allowed_Page' );

		$result = $resolver->isCompanionEnabled( $titleMock );

		$this->assertTrue( $result );
	}

	/**
	 * @covers \MediaWiki\Extension\WP25EasterEggs\PageCompanionConfigResolver::isCompanionEnabled()
	 */
	public function testIsCompanionEnabledWithBlockFilterBlocked() {
		$enableCompanion = new stdClass();
		$enableCompanion->type = 'blockFilter';
		$enableCompanion->filterPages = [ 'Blocked_Page' ];

		$communityConfigMock = $this->createMock( Config::class );
		$communityConfigMock->method( 'get' )
			->with( 'EnableCompanion' )
			->willReturn( $enableCompanion );

		$resolver = new PageCompanionConfigResolver( $communityConfigMock );

		$titleMock = $this->createMock( Title::class );
		$titleMock->method( 'getPrefixedText' )
			->willReturn( 'Blocked_Page' );

		$result = $resolver->isCompanionEnabled( $titleMock );

		$this->assertFalse( $result );
	}
}
