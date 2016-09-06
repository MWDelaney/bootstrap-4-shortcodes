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



/**
 * Bootstrap 4 Shortcodes class
 */
class Boostrap4Shortcodes {

	/**
	 * Initialize shortcodes and conditionally include opt-in Bootstrap scripts
	 */

	function __construct() {
		//Initialize shortcodes
		add_action( 'init', array( $this, 'add_shortcodes' ) );
		add_filter('the_content', array( $this, 'bs_fix_shortcodes') );
		//Only run this if the PHP version is less than 5.3
		if (version_compare(PHP_VERSION, '5.3.0', '<')) {
			 add_action( 'admin_notices', array( $this, 'php_version_notice') );
		}
		//Conditionally include tooltip functionality (see function for conditionals)
		//add_action( 'the_post', array( $this, 'bootstrap_shortcodes_tooltip_script' ), 9999 );
		//Conditionally include popupver functionality (see function for conditionals)
		//add_action( 'the_post', array( $this, 'bootstrap_shortcodes_popover_script' ), 9999 );
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


	/**
	 * Remove extra paragraphs and line breaks around shortcodes
	 * @param  string $content the content
	 * @return string          the content again
	 */
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


	/**
	 * Create shortcodes from array of names using WordPress add_shortcode()
	 */
	function add_shortcodes() {
		$shortcodes = array(
			'container',
			'container-fluid',
			'row',
			'column',
		);
		foreach ( $shortcodes as $shortcode ) {
			$function = 'bs_' . str_replace( '-', '_', $shortcode );
			add_shortcode( $shortcode, array( $this, $function ) );
		}
	}

	/**
	 * Container shortcode
	 * @param  [type] $atts    shortcode attributes
	 * @param  string $content shortcode contents
	 * @return string
	 */
	function bs_container( $atts, $content = null ) {
		$atts = shortcode_atts( array(
				"fluid"  => false,
				"class" => false,
				"data"   => false,
				"xclass"   => false
		), $atts );

		$class	= array();
		$class[]	= ( $atts['fluid']   == 'true' )  ? 'container-fluid' : 'container';
		$class[]	= ( $atts['xclass'] )   ? $atts['xclass'] : '';

		$data_props = $this->parse_data_attributes( $atts['data'] );
		return sprintf(
			'<div class="%s"%s>%s</div>',
			$this->class_output(__FUNCTION__, $class),
			( $data_props ) ? ' ' . $data_props : '',
			do_shortcode( $content )
		);
	}



	/**
	 * Add extra classes onto shortcode's existing class array
	 * @param  array $class
	 * @param  array $xclass
	 * @return array         merged arrays
	 */
	function xclass( $class, $xclass) {
		$class = array_filter(array_map('trim', $class));
		$xclass = array_filter(array_map('trim', $xclass));
		return array_merge( $class, $xclass);
	}



	/**
	 * Convert class array into string, apply shortcode-specific filter, and return the string
	 * @param  string $name  name of the function calling this one
	 * @param  array $class
	 * @return string
	 */
	function class_output($name, $class) {
		return esc_attr(trim(implode(' ', apply_filters( $name . '_shortcode_classes', $class ))));
	}


	/**
	 * Parse data attributes for shortcodes
	 * @param  string $data
	 * @return string
	 */
	function parse_data_attributes( $data ) {
		$data_props = '';
		if( $data ) {
			$data = explode( '|', $data );
			foreach( $data as $d ) {
				$d = explode( ',', $d );
				$data_props .= sprintf( 'data-%s="%s" ', esc_html( $d[0] ), esc_attr( trim( $d[1] ) ) );
			}
		}
		else {
			$data_props = false;
		}
		return $data_props;
	}


	/**
	 * Get a map of a shortcode's attributes
	 *
	 * Used by :
	 *   bs_tabs()
	 *   bs_carousel()
	 *
	 */
	function bs_attribute_map($str, $att = null) {
			$res = array();
			$return = array();
			$reg = get_shortcode_regex();
			preg_match_all('~'.$reg.'~',$str, $matches);
			foreach($matches[2] as $key => $name) {
					$parsed = shortcode_parse_atts($matches[3][$key]);
					$parsed = is_array($parsed) ? $parsed : array();
							$res[$name] = $parsed;
							$return[] = $res;
					}
			return $return;
	}


} // End Boostrap4Shortcodes class
new Boostrap4Shortcodes();
