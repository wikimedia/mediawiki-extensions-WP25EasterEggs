<?php

$cfg = require __DIR__ . '/../vendor/mediawiki/mediawiki-phan-config/src/config.php';

$dependencies = [
	'../../extensions/CommunityConfiguration',
];

$cfg['directory_list'] = array_merge(
	$cfg['directory_list'], $dependencies
);

$cfg['exclude_analysis_directory_list'] = array_merge(
	$cfg['exclude_analysis_directory_list'], $dependencies
);

return $cfg;
