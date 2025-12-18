WP25EasterEggs Extension
========================

This is an extension to celebrate Wikipedia's 25th birthday, featuring an animated page companion that appears on specific articles with theme-aware animations.

Features
--------

- **Community Configuration**: Fine-grained control over enabling the extension and the companion feature
- **User Preferences**: Users can enable/disable the feature via client preferences
- **Basic Scaffolding**: Core structure for handling client preferences and page-level configuration

Requirements
------------

This extension requires:
- [CommunityConfiguration](https://www.mediawiki.org/wiki/Extension:CommunityConfiguration) extension

Installation
------------

1. Install and enable the [CommunityConfiguration](https://www.mediawiki.org/wiki/Extension:CommunityConfiguration) extension
2. Install this extension following the standard MediaWiki extension installation process: <https://www.mediawiki.org/wiki/Manual:Extensions/Installation_and_upgrade>
3. Visit [Special:CommunityConfiguration/WP25EasterEggs](Special:CommunityConfiguration/WP25EasterEggs) to enable the extension

Project Structure
-----------------

### Backend ([src/](src/))

- **[CommunityConfigurationSchema.php](src/CommunityConfigurationSchema.php)** - Defines the configuration schema for extension and companion settings
- **[PageCompanionService.php](src/PageCompanionService.php)** - Service for determining which companion configs apply to a page
- **[PageCompanionConfigResolver.php](src/PageCompanionConfigResolver.php)** - Resolves companion enablement based on configuration filters
- **[Hooks.php](src/Hooks.php)** - MediaWiki hooks integration (adds HTML classes, registers modules, etc.)

### Frontend ([resources/ext.wp25EasterEggs/](resources/ext.wp25EasterEggs/))

- **[init.js](resources/ext.wp25EasterEggs/init.js)** - Entry point for the client-side module
- **[core/ClientPrefsHandler.js](resources/ext.wp25EasterEggs/core/ClientPrefsHandler.js)** - Handles user preference changes and observes DOM for configuration updates

Community Configuration
-----------------------

The extension can be configured via Community Configuration with the following options:

- **EnableExtension**: Global enable/disable toggle for the entire extension
- **EnableCompanion**: Controls where companions appear:
  - `everywhere` - Show on all eligible pages
  - `allowFilter` - Only show on specified pages
  - `blockFilter` - Show everywhere except specified pages
