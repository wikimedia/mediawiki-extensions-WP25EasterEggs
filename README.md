WP25EasterEggs Extension
========================

This is an extension to celebrate Wikipedia's 25th birthday, featuring an animated page companion that appears on specific articles with theme-aware animations.

Features
--------

- **Animated Page Companion**: An interactive character that appears on specific articles based on their Wikidata QIDs
- **Multiple Companion States**: Showing different animations based on the article's Wikidata QID and Community Configuration
- **Theme Support**: Automatic adaptation to light/dark themes and OS preferences
- **Community Configuration**: Fine-grained control over which pages show companions and which companion states to display
- **User Preferences**: Users can enable/disable the feature via client preferences

Requirements
------------

This extension requires:
- [CommunityConfiguration](https://www.mediawiki.org/wiki/Extension:CommunityConfiguration) extension
- [WikibaseClient](https://www.mediawiki.org/wiki/Extension:Wikibase_Client) extension

Installation
------------

1. Install and enable the [CommunityConfiguration](https://www.mediawiki.org/wiki/Extension:CommunityConfiguration) extension
2. Install and enable the [Wikibase Client](https://www.mediawiki.org/wiki/Extension:Wikibase_Client) extension
    <details>
    <summary>Boilerplate local dev config</summary>

    ```php
    # LocalSettings.php

    # Add this to your LocalSettings.php to configure Wikibase Repository and Client
    # for local development. This config imitates enwiki to some extent by setting
    # up a local entity source with the same site ID.

    wfLoadExtension( 'WikibaseRepository', "$IP/extensions/Wikibase/extension-repo.json" );
    wfLoadExtension( 'WikibaseClient', "$IP/extensions/Wikibase/extension-client.json" );

    require_once "$IP/extensions/Wikibase/repo/config/Wikibase.example.php";
    require_once "$IP/extensions/Wikibase/client/config/WikibaseClient.example.php";

    $entitySources = [
        'local' => [
          'repoDatabase' => $wgDBname,
          'baseUri' => $wgServer . '/entity/',
          'entityNamespaces' => [
            'item' => 120,
            'property' => 122,
          ],
          'rdfNodeNamespacePrefix' => 'wd',
          'rdfPredicateNamespacePrefix' => '',
          'interwikiPrefix' => '',
        ],
    ];

    $wgWBRepoSettings['entitySources'] = $entitySources;
    $wgWBRepoSettings['localEntitySourceName'] = 'local';
    $wgWBClientSettings['entitySources'] = $entitySources;
    $wgWBClientSettings['itemAndPropertySourceName'] = 'local';
    $wgWBClientSettings['siteGlobalID'] = 'enwiki';
    $wgWBClientSettings['siteLinkGroups'] = [ 'wikipedia' ];
    ```
    ```sh
    # Source: https://www.mediawiki.org/wiki/Wikibase/Installation#Run_maintenance_scripts

    php maintenance/run.php update
    php maintenance/run.php ./extensions/Wikibase/lib/maintenance/populateSitesTable.php
    php maintenance/run.php ./extensions/Wikibase/repo/maintenance/rebuildItemsPerSite.php
    php maintenance/run.php populateInterwiki
    ```
    ```sql
    -- Run these SQL queries to set up test data for the extension
    -- This registers the wikibase-item content model and creates site links
    -- for the test pages (Sleep, Nap, Birthday, Newspaper) with their Wikidata QIDs

    INSERT INTO content_models (model_id, model_name) VALUES (2, 'wikibase-item');
    INSERT INTO wb_items_per_site (ips_item_id, ips_site_id, ips_site_page) VALUES
        (202833, 'enwiki', 'Social media'),
        (17517, 'enwiki', 'Mobile phone'),
        (144334, 'enwiki', 'Printing press'),
        (5891, 'enwiki', 'Philosophy'),
        (2927074, 'enwiki', 'Internet meme'),
        (36348, 'enwiki', 'Dream'),
        (1, 'enwiki', 'Universe'),
        (638, 'enwiki', 'Music'),
        (183998, 'enwiki', 'Camera obscura'),
        (164444, 'enwiki', 'Funk'),
        (200538, 'enwiki', 'Party'),
        (47223, 'enwiki', 'Birthday');
    ```
    </details>
3. Install this extension following the standard MediaWiki extension installation process: <https://www.mediawiki.org/wiki/Manual:Extensions/Installation_and_upgrade>
4. Visit `Special:CommunityConfiguration/WP25EasterEggs` to enable the extension

Project Structure
-----------------

### Backend ([src/](src/))

- **[CommunityConfigurationDefinitions.php](src/CommunityConfigurationDefinitions.php)** - Provides reusable schema definitions (PageFilter)
- **[CommunityConfigurationSchema.php](src/CommunityConfigurationSchema.php)** - Defines the configuration schema for extension and companion settings
- **[Hooks.php](src/Hooks.php)** - MediaWiki hooks integration (adds HTML classes, registers modules, etc.)
- **[PageCompanionConfigResolver.php](src/PageCompanionConfigResolver.php)** - Resolves companion states based on Wikidata QIDs, default configs, and community configuration filters
- **[PageCompanionService.php](src/PageCompanionService.php)** - Main service for determining which companion configs apply to a page

### Frontend ([resources/ext.wp25EasterEggs/](resources/ext.wp25EasterEggs/))

- **[init.js](resources/ext.wp25EasterEggs/init.js)** - Entry point for the client-side module
- **[core/ClientPrefsHandler.js](resources/ext.wp25EasterEggs/core/ClientPrefsHandler.js)** - Handles user preference changes and companion lifecycle
- **[utils/ColorSchemeResolver.js](resources/ext.wp25EasterEggs/utils/ColorSchemeResolver.js)** - Detects and tracks color scheme changes (light/dark/OS preference)
- **[default-companion-configs.json](resources/ext.wp25EasterEggs/default-companion-configs.json)** - Mapping of Wikibase Item IDs (QIDs) to companion configurations

### Assets

- **[default-companion-configs.json](resources/ext.wp25EasterEggs/default-companion-configs.json)** - Maps Wikidata QIDs to default companion states

How It Works
------------

1. **Page Detection**: When a page loads, [PageCompanionService](src/PageCompanionService.php) checks if it's a viewable article in the main namespace.
2. **State Resolution**: [PageCompanionConfigResolver](src/PageCompanionConfigResolver.php) determines which companion state to show by:
   - Checking the global companion filter (`everywhere`/`allowFilter`/`blockFilter`) via `isCompanionEnabled()`
   - Iterating through each state (`phone`, `newspaper`, `book`, etc.) to find the first match using `getCurrentCompanionConfig()`
   - For each state, checking filtering priority: block list (excludes page) > allow list (includes page) > defaultPages setting.
   - If Wikibase Client is enabled, `defaultPages` checks if the current page's QID maps to a companion state in `default-companion-configs.json`.
3. **HTML Classes**: Appropriate classes are added to the page (e.g., `wp25eastereggs-companion-enabled`, `wp25eastereggs-companion-dreaming`).
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
- **Per-companion-state settings**: Each companion state (`phone`, `newspaper`, `book`, etc.) has individual configuration with:
  - `defaultPages` - Whether to use default QID mappings
  - `allowPages` - Additional pages to show this state
  - `blockPages` - Pages to exclude from this state
