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
use MediaWiki\User\Options\UserOptionsLookup;
use MediaWiki\User\User;

class Hooks implements BeforePageDisplayHook, GetPreferencesHook {

	public function __construct(
		private readonly Config $config,
		private readonly UserOptionsLookup $userOptionsLookup,
		private readonly ?Config $communityConfig,
	) {
	}

	/**
	 * Returns if the extension is enabled with CommunityConfiguration.
	 * @return bool
	 */
	public function isCommunityConfigEnabled(): bool {
		return $this->communityConfig && $this->communityConfig->get( 'CC_ENABLE' ) === "enabled";
	}

	/**
	 * Returns the key and value for the user preference that is responsible for
	 * enabling / disabling the Birthday Mode.
	 * @param User $user
	 * @return array{key: string, value: mixed, isEnabled: bool}
	 */
	private function getUserPrefEnabled( $user ) {
		$key = 'wp25eastereggs-enable';
		$value = $this->userOptionsLookup->getOption(
			$user,
			$key,
			$this->config->get( 'Wp25EasterEggsEnable' ) );
		$isEnabled = $value && $value !== 'disabled';
		return [ 'key' => $key, 'value' => $value, 'isEnabled' => $isEnabled ];
	}

	/** @inheritDoc */
	public function onGetPreferences( $user, &$preferences ) {
		if ( !$this->isCommunityConfigEnabled() ) {
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
		if ( !$this->isCommunityConfigEnabled() ) {
			return;
		}

		$user = $skin->getUser();
		$userPrefEnabled = $this->getUserPrefEnabled( $user );
		$htmlClass = $userPrefEnabled['key'] . '-clientpref-' . ( $userPrefEnabled['isEnabled'] ? '1' : '0' );
		$out->addHtmlClasses( $htmlClass );

		$out->addModules( 'ext.wp25EasterEggs' );
	}
}
