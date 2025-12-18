WP25EasterEggs Extension
========================

This is an extension to celebrate Wikipedia's 25th birthday, featuring an animated page companion that appears on specific articles with theme-aware animations.

Features
--------

- **Animated Page Companion**: An interactive character that appears on specific articles
- **Three Themed States**: `celebrate`, `dream`, `newspaper`
- **Theme Support**: Automatic adaptation to light/dark themes and OS preferences
- **Community Configuration**: Fine-grained control over which pages show companions and which companion states to display
- **User Preferences**: Users can enable/disable the feature via client preferences

Requirements
------------

This extension requires:
- [CommunityConfiguration](https://www.mediawiki.org/wiki/Extension:CommunityConfiguration) extension

Installation
------------

1. Install and enable the [CommunityConfiguration](https://www.mediawiki.org/wiki/Extension:CommunityConfiguration) extension
2. Install this extension following the standard MediaWiki extension installation process: <https://www.mediawiki.org/wiki/Manual:Extensions/Installation_and_upgrade>
3. Visit `Special:CommunityConfiguration/WP25EasterEggs` to enable the extension

Project Structure
-----------------

### Backend ([src/](src/))

- **[CommunityConfigurationDefinitions.php](src/CommunityConfigurationDefinitions.php)** - Provides reusable schema definitions (PageFilter)
- **[CommunityConfigurationSchema.php](src/CommunityConfigurationSchema.php)** - Defines the configuration schema for extension and companion settings
- **[Hooks.php](src/Hooks.php)** - MediaWiki hooks integration (adds HTML classes, registers modules, etc.)
- **[PageCompanionConfigResolver.php](src/PageCompanionConfigResolver.php)** - Resolves companion states based on configuration filters
- **[PageCompanionService.php](src/PageCompanionService.php)** - Main service for determining which companion configs apply to a page

### Frontend ([resources/ext.wp25EasterEggs/](resources/ext.wp25EasterEggs/))

- **[init.js](resources/ext.wp25EasterEggs/init.js)** - Entry point for the client-side module
- **[core/ClientPrefsHandler.js](resources/ext.wp25EasterEggs/core/ClientPrefsHandler.js)** - Handles user preference changes and companion lifecycle
- **[utils/ColorSchemeResolver.js](resources/ext.wp25EasterEggs/utils/ColorSchemeResolver.js)** - Detects and tracks color scheme changes (light/dark/OS preference)

How It Works
------------

1. **Page Detection**: When a page loads, [PageCompanionService](src/PageCompanionService.php) checks if it's a viewable article in the main namespace.
2. **State Resolution**: [PageCompanionConfigResolver](src/PageCompanionConfigResolver.php) determines which companion state to show by:
   - Checking the global companion filter (`everywhere`/`allowFilter`/`blockFilter`) via `isCompanionEnabled()`
   - Iterating through each state (`celebrate`, `dream`, `newspaper`) to find the first match using `getCurrentCompanionConfig()`
   - For each state, checking filtering priority: block list (excludes page) > allow list (includes page) > defaultPages setting.
3. **HTML Classes**: Appropriate classes are added to the page (e.g., `wp25eastereggs-companion-enabled`, `wp25eastereggs-companion-dream`).
4. **Client Initialization**: [init.js](resources/ext.wp25EasterEggs/init.js) detects the companion config from HTML classes and initializes [ClientPrefsHandler](resources/ext.wp25EasterEggs/core/ClientPrefsHandler.js).
5. **Color Scheme Management**: [ColorSchemeResolver](resources/ext.wp25EasterEggs/utils/ColorSchemeResolver.js) detects the current color scheme and listens for changes via `prefers-color-scheme` media query and client preference radio buttons.

Community Configuration
-----------------------

The extension can be configured via Community Configuration with the following options:

- **EnableExtension**: Global enable/disable toggle for the entire extension
- **EnableCompanion**: Controls where companions appear:
  - `everywhere` - Show on all eligible pages
  - `allowFilter` - Only show on specified pages
  - `blockFilter` - Show everywhere except specified pages
- **Per-companion-state settings**: Each companion state (`celebrate`, `dream`, `newspaper`) has individual configuration with:
  - `defaultPages` - (Currently unused in scaffolding, defaults to enabled)
  - `allowPages` - Additional pages to show this state
  - `blockPages` - Pages to exclude from this state
