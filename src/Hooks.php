<?php
/**
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License along
 * with this program; if not, write to the Free Software Foundation, Inc.,
 * 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.
 *
 * @file
 */

namespace MediaWiki\Extension\WP25EasterEggs;

use MediaWiki\Config\Config;
use MediaWiki\Output\Hook\BeforePageDisplayHook;
use MediaWiki\Preferences\Hook\GetPreferencesHook;
use MediaWiki\Skin\Hook\SiteNoticeAfterHook;
use MediaWiki\User\Options\UserOptionsLookup;
use MediaWiki\User\User;
use Wikibase\Client\Store\ClientStore;
use Wikibase\Lib\SettingsArray;
use Wikimedia\ObjectCache\WANObjectCache;

class Hooks implements BeforePageDisplayHook, GetPreferencesHook, SiteNoticeAfterHook {

	private readonly PageCompanionService $pageCompanionService;

	/**
	 * @param Config $config
	 * @param UserOptionsLookup $userOptionsLookup
	 * @param WANObjectCache $cache
	 * @param Config|null $communityConfig
	 * @param ClientStore|null $wikibaseStore Optional WikibaseClient Store service
	 * @param SettingsArray|null $wikibaseSettings Optional WikibaseClient Settings service
	 */
	public function __construct(
		private readonly Config $config,
		private readonly UserOptionsLookup $userOptionsLookup,
		private readonly WANObjectCache $cache,
		private readonly ?Config $communityConfig = null,
		private readonly ?object $wikibaseStore = null,
		private readonly ?object $wikibaseSettings = null,
	) {
		$this->pageCompanionService = new PageCompanionService(
			$this->cache,
			$this->communityConfig,
			$this->wikibaseStore,
			$this->wikibaseSettings
		);
	}

	/**
	 * Returns whether the extension's visual interventions are enabled for the
	 * end users. I.e. whether the "Birthday Mode" appearance toggle switch and
	 * the Baby Globe companion is displayed. Checks both the
	 * `Wp25EasterEggsEnable` configuration flag and CommunityConfiguration
	 * `EnableExtension` field.
	 * @return bool
	 */
	public function isExtensionEnabled(): bool {
		return $this->config->get( 'Wp25EasterEggsEnable' ) &&
			$this->communityConfig &&
			$this->communityConfig->get( 'EnableExtension' ) === "enabled";
	}

	/**
	 * Return the key and value for the user preference that is responsible for
	 * enabling / disabling the Birthday Mode. The default / fallback value is
	 * `false`.
	 * @param User $user
	 * @return array{key: string, value: mixed, isEnabled: string}
	 */
	private function getUserPrefEnabled( $user ) {
		$key = 'wp25eastereggs-enable';
		$defaultUserPref = false;
		$value = $this->userOptionsLookup->getOption( $user, $key, $defaultUserPref );
		$isEnabled = $value && $value !== 'disabled' ? '1' : '0';
		return [ 'key' => $key, 'value' => $value, 'isEnabled' => $isEnabled ];
	}

	/** @inheritDoc */
	public function onGetPreferences( $user, &$preferences ) {
		if ( !$this->isExtensionEnabled() ) {
			return;
		}

		$userPrefEnabled = $this->getUserPrefEnabled( $user );
		$preferences[$userPrefEnabled['key']] = [
			'type' => 'toggle',
			'label-message' => $userPrefEnabled['key'] . '-label',
			'help-message' => $userPrefEnabled['key'] . '-help',
			'default' => $userPrefEnabled['value'],
			'section' => 'rendering/skin/skin-prefs'
		];
	}

	/** @inheritDoc */
	public function onBeforePageDisplay( $out, $skin ): void {
		$title = $out->getTitle();
		if ( $title && $title->isSpecial( 'CommunityConfiguration' ) &&
			$title->getSubpageText() === 'CommunityConfiguration/WP25EasterEggs'
		) {
			$out->addModules( 'ext.wp25EasterEggs.config' );
		}

		if ( !$this->isExtensionEnabled() ) {
			return;
		}

		$user = $skin->getUser();
		$userPrefEnabled = $this->getUserPrefEnabled( $user );
		$clientPrefHtmlClass = $userPrefEnabled['key'] . '-clientpref-' . $userPrefEnabled['isEnabled'];
		$out->addHtmlClasses( $clientPrefHtmlClass );

		// Check if companion is enabled via service
		$companionConfigHtmlClasses = $this->pageCompanionService->getCompanionConfigHtmlClasses( $out );
		if ( $companionConfigHtmlClasses !== [] ) {
			$out->addHtmlClasses( $companionConfigHtmlClasses );
		}

		$out->addModules( 'ext.wp25EasterEggs' );
		$out->addModuleStyles( 'ext.wp25EasterEggs.styles' );
	}

	/** @inheritDoc */
	public function onSiteNoticeAfter( &$siteNotice, $skin ): void {
		if ( !$this->isExtensionEnabled() ) {
			return;
		}

		$siteNotice .= '<div class="wp25eastereggs-sitenotice-landmark"></div>';
	}
}
