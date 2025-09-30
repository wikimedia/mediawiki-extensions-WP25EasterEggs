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

class Hooks implements BeforePageDisplayHook, GetPreferencesHook {

	public function __construct(
		private readonly Config $config,
		private readonly UserOptionsLookup $userOptionsLookup
	) {
	}

	/** @inheritDoc */
	public function onGetPreferences( $user, &$preferences ) {
		$preferencesKey = 'wp25eastereggs-enable';
		$preferencesValue = $this->userOptionsLookup->getOption(
			$user,
			$preferencesKey,
			$this->config->get( 'Wp25EasterEggsEnable' ) );
		$preferences[$preferencesKey] = [
			'type' => 'toggle',
			'label-message' => $preferencesKey . '-label',
			'help-message' => $preferencesKey . '-help',
			'default' => $preferencesValue,
			'section' => 'rendering/skin/skin-prefs'
		];
	}

	/** @inheritDoc */
	public function onBeforePageDisplay( $out, $skin ): void {
		$out->addModules( 'ext.wp25EasterEggs' );
	}
}
