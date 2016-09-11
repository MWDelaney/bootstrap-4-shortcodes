<?php

class BS4Styles {

	function __construct() {
		
		//add the button to the content editor, next to the media button on any admin page in the array below
		if(in_array(basename($_SERVER['PHP_SELF']), array('post.php', 'page.php', 'page-new.php', 'post-new.php', 'widgets.php', 'admin-ajax.php'))) {
				add_action('media_buttons', array( $this, 'add_bootstrap_button' ), 11 );
				add_action( 'media_buttons', array( $this, 'bootstrap_shortcodes_help_styles' ) );
		}

		//Only run this if the PHP version is less than 5.3
		if (version_compare(PHP_VERSION, '5.3.0', '<')) {
			 add_action( 'admin_notices', array( $this, 'php_version_notice') );
		}

	}

	/**
	 * Create the media-button to pop up the shortcode documentation
	 */
	function add_bootstrap_button() {
			//the id of the container I want to show in the popup
			$popup_id = 'bootstrap-4-shortcodes-help';
			//our popup's title
			$title = 'Bootstrap 4 Shortcodes Help';
			//append the icon
			printf(
			'<a data-toggle="modal" data-target="#%1$s" title="%2$s" href="%3$s" class="%4$s"><span class="%5$s"></span></a>',
			$popup_id,
			esc_attr( $title ),
			esc_url( '#' ),
			esc_attr( 'button add_media bootstrap-shortcodes-button'),
			esc_attr( 'bs_bootstrap-logo wp-media-buttons-icon' )
			//sprintf( '<img src="%s" style="height: 20px; position: relative; top: -2px;">', esc_url( $img ) )
			);
	}


	//Function to register and enqueue the documentation stylesheets
	function bootstrap_shortcodes_help_styles() {
			wp_register_style( 'bootstrap-4-shortcodes', BS4_SHORTCODES_URL . '/dist/css/main.css' );
			wp_enqueue_style( 'bootstrap-4-shortcodes' );
			//Visual Composer is nothing but problems
			$handle = 'vc_bootstrap_js';
			$list = 'enqueued';
			if (wp_script_is( $handle, $list )) {
					wp_dequeue_script( $handle );
			}
	}


	/**
	 * Produce a warning if PHP is less than version 5.3
	 * @return [type] [description]
	 */
	function php_version_notice() {
		 $class = 'notice notice-error';
		 $message = __( '<strong>Bootstrap 3 Shortcodes for WordPress</strong> requires PHP version 5.3 or later. You are running PHP version ' . PHP_VERSION . '. Please upgrade to a supported version of PHP.', 'sample-text-domain' );
		 printf( '<div class="%1$s"><p>%2$s</p></div>', $class, $message );
	}

}
