<?php

class BS4Docs {


		function __construct() {

			//add the button to the content editor, next to the media button on any admin page in the array below
			if(in_array(basename($_SERVER['PHP_SELF']), array('post.php', 'page.php', 'page-new.php', 'post-new.php', 'widgets.php', 'admin-ajax.php'))) {
				add_action( 'admin_enqueue_scripts', array( $this, 'enqueue_styles' ) );
				add_action( 'admin_footer', array( $this, 'add_templates' ) );
			}

			//Only run this if the PHP version is less than 5.3
			if (version_compare(PHP_VERSION, '5.3.0', '<')) {
				 add_action( 'admin_notices', array( $this, 'php_version_notice') );
			}

		}

		function enqueue_styles() {
			wp_enqueue_script( 'bootstrap-4-shortcodes-package', BS4_SHORTCODES_URL . 'dist/scripts/package.js', array(
				'jquery'
			) );
			wp_enqueue_script( 'bootstrap-4-shortcodes-modal', BS4_SHORTCODES_URL . 'dist/scripts/modal.js', array(
				'jquery'
			) );
		}
			/**
			 * Dumps the contents of template-data.php into the foot of the document.
			 * WordPress itself function-wraps the script tags rather than including them directly
			 * ( example: https://github.com/WordPress/WordPress/blob/master/wp-includes/media-template.php )
			 * but this isn't necessary for this example.
			 */
			public function add_templates() {
				include BS4_SHORTCODES_DIR . 'templates/modal-template.php';
			}

}
