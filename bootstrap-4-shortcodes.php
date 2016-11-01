<?php
/*
Plugin Name: Bootstrap 4 Shortcodes
Plugin URI: https://github.com/MWDelaney/bootstrap-4-shortcodes
Description: The plugin adds a shortcodes for all Bootstrap 4 elements.
Version: 1
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


use Init;
$init = new \MWD\BS4Shortcodes\Init();
