WP25EasterEggs Extension
========================

This is an extension to celebrate Wikipedia's 25th birthday by adding interactive Easter Eggs.

Requirements
------------

This extension requires the [CommunityConfiguration](https://www.mediawiki.org/wiki/Extension:CommunityConfiguration) extension to be installed and enabled.

Installation
------------

1. Install and enable the CommunityConfiguration extension
2. Install this extension following the standard MediaWiki extension installation process: <https://www.mediawiki.org/wiki/Manual:Extensions/Installation_and_upgrade>

Project Structure
-----------------

- **[src/](src/)**
  - Integrates with CommunityConfiguration to provide a wiki-wide enable/disable toggle
  - Adds a user preference for Birthday Mode in user settings
  - Loads the JavaScript module when enabled
- **[resources/](resources/)** 
  - Client JS code (currently none)
