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


/**
 * Define constants
 */
 if(!defined('BS4_SHORTCODES_DIR')) {
		 define('BS4_SHORTCODES_DIR', plugin_dir_path( __FILE__ ));
 }
 if(!defined('BS4_SHORTCODES_URL')) {
		 define('BS4_SHORTCODES_URL', plugin_dir_url( __FILE__ ));
 }

add_action( 'init', function() {
	require_once(BS4_SHORTCODES_DIR . 'lib/class-shortcodes.php');
	require_once(BS4_SHORTCODES_DIR . 'lib/class-utilities.php');

	$bs4_shortcodes = new MWD\BS4Shortcodes\Shortcodes;

} );

add_action( 'admin_init', function() {

	require_once(BS4_SHORTCODES_DIR . 'lib/class-admin.php');
	require_once(BS4_SHORTCODES_DIR . 'lib/class-docs.php');

	$bs4_docs = new MWD\BS4Shortcodes\Docs;
	$bs4_admin = new MWD\BS4Shortcodes\Admin;
} );

function bs_fix_shortcodes($content){
		$array = array (
				'<p>[' => '[',
				']</p>' => ']',
				']<br />' => ']',
				']<br>' => ']'
		);
		$content = strtr($content, $array);
		return $content;
}
add_filter('the_content', 'bs_fix_shortcodes');
