<?php
/*
Plugin Name: Bootstrap 4 Shortcodes
Plugin URI: https://github.com/MWDelaney/bootstrap-4-shortcodes
Description: The plugin adds a shortcodes for all Bootstrap 4 elements.
Version: 1
Text Domain: bootstrap-4-shortcodes
Domain Path: /languages
Author: Michael W. Delaney
Author URI:
License: MIT
*/

namespace MWD\BS4Shortcodes;


/**
 * Set up autoloader
 */
require __DIR__ . '/vendor/autoload.php';

/**
 * Define constants
 */
 if(!defined('BS4_SHORTCODES_DIR')) {
		 define('BS4_SHORTCODES_DIR', plugin_dir_path( __FILE__ ));
 }
 if(!defined('BS4_SHORTCODES_URL')) {
		 define('BS4_SHORTCODES_URL', plugin_dir_url( __FILE__ ));
 }
 if(!defined('BS4_SHORTCODES_RELATIVE_URL')) {
		 define('BS4_SHORTCODES_RELATIVE_URL',  parse_url(BS4_SHORTCODES_URL, PHP_URL_PATH));
 }

 function custom_rewrite_rule() {
 	add_rewrite_rule('^placeholder/([^/]*)/?',BS4_SHORTCODES_URL . '/dist/images/$matches[1]','top');
 }
 add_action('init', '\MWD\BS4Shortcodes\custom_rewrite_rule', 10, 0);

$bootstrap_4_shortcodes = new \MWD\BS4Shortcodes\Init();
