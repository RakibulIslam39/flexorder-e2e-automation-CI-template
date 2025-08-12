<?php
/**
 * PHPUnit bootstrap file for FlexOrder Plugin
 * Following Koodimonni WordPress test template approach
 */

$_tests_dir = getenv('WP_TESTS_DIR');

if (!$_tests_dir) {
    $_tests_dir = rtrim(sys_get_temp_dir(), '/\\') . '/wordpress-tests-lib';
}

if (!file_exists($_tests_dir . '/includes/functions.php')) {
    echo "Could not find $_tests_dir/includes/functions.php, have you run bin/install-wp-tests.sh ?" . PHP_EOL;
    exit(1);
}

// Give access to tests_add_filter() function.
require_once $_tests_dir . '/includes/functions.php';

/**
 * Manually load the plugin being tested.
 * Following Koodimonni approach for plugin loading
 */
function _manually_load_plugin() {
    // Define plugin file path (following Koodimonni approach)
    $plugin_file = getenv('PLUGIN_FILE') ?: 'flexorder.php';
    $plugin_path = dirname(dirname(__FILE__)) . '/' . $plugin_file;
    
    if (file_exists($plugin_path)) {
        require $plugin_path;
    } else {
        echo "Plugin file not found: $plugin_path" . PHP_EOL;
        exit(1);
    }
}

// Activate this plugin automatically (following Koodimonni approach)
tests_add_filter('muplugins_loaded', '_manually_load_plugin');

// Start up the WP testing environment.
require $_tests_dir . '/includes/bootstrap.php';

