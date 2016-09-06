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

			'media-list',
			'media',
			'media-object',

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
		), $atts );

		$class	= array();
		$class[]	= ( $atts['fluid']   == 'true' )  ? 'container-fluid' : 'container';

		$return = $this->bs_output(
			sprintf(
				'<div class="%s"%s>%s</div>',
				$this->class_output(__FUNCTION__, $class, $atts['class']),
				$this->parse_data_attributes( $atts['data'] ),
				do_shortcode( $content )
			)
		);

		return $return;
	}



	/**
	 * Container-Fluid shortcode
	 * @param  [type] $atts    shortcode attributes
	 * @param  string $content shortcode contents
	 * @return string
	 */
	function bs_container_fluid( $atts, $content = null ) {
		$atts = shortcode_atts( array(
				"class" => false,
				"data"   => false,
		), $atts );

		$class	= array();
		$class[]	= ( $atts['fluid']   == 'true' )  ? 'container-fluid' : 'container';

		$return = $this->bs_output(
			sprintf(
				'<div class="%s"%s>%s</div>',
				$this->class_output(__FUNCTION__, $class, $atts['class']),
				$this->parse_data_attributes( $atts['data'] ),
				do_shortcode( $content )
			)
		);

		return $return;
	}



	/**
	 * Row shortcode
	 * @param  [type] $atts    shortcode attributes
	 * @param  string $content shortcode contents
	 * @return string
	 */
	function bs_row( $atts, $content = null ) {
		$atts = shortcode_atts( array(
				"class" => false,
				"data"   => false
		), $atts );

		$class	= array();
		$class[]	= 'row';

		$return = $this->bs_output(
			sprintf(
				'<div class="%s"%s>%s</div>',
				$this->class_output(__FUNCTION__, $class, $atts['class']),
				$this->parse_data_attributes( $atts['data'] ),
				do_shortcode( $content )
			)
		);

		return $return;
	}


	/**
	 * Column shortcode
	 * @param  [type] $atts    shortcode attributes
	 * @param  string $content shortcode contents
	 * @return string
	 */
	function bs_column( $atts, $content = null ) {
		$atts = shortcode_atts( array(
				"xs"          => false,
				"sm"          => false,
				"md"          => false,
				"lg"          => false,
				"xl"          => false,

				"offset-xs"   => false,
				"offset-sm"   => false,
				"offset-md"   => false,
				"offset-lg"   => false,
				"offset-xl"   => false,

				"pull-xs"     => false,
				"pull-sm"     => false,
				"pull-md"     => false,
				"pull-lg"     => false,
				"pull-xl"     => false,

				"push-xs"     => false,
				"push-sm"     => false,
				"push-md"     => false,
				"push-lg"     => false,
				"push-xl"     => false,

				"class"      => false,
				"data"        => false
		), $atts );

		$class	= array();

		$class[]	= ( $atts['xs'] )			                                			? ' col-xs-' . $atts['xs'] : '';
		$class[]	= ( $atts['sm'] )                                           ? ' col-sm-' . $atts['sm'] : '';
		$class[]	= ( $atts['md'] )                                           ? ' col-md-' . $atts['md'] : '';
		$class[]	= ( $atts['lg'] )                                           ? ' col-lg-' . $atts['lg'] : '';
		$class[]	= ( $atts['xl'] )                                           ? ' col-xl-' . $atts['xl'] : '';

		$class[]	= ( $atts['offset-xs'] || $atts['offset-xs'] === "0" )      ? ' col-xs-offset-' . $atts['offset-xs'] : '';
		$class[]	= ( $atts['offset-sm'] || $atts['offset-sm'] === "0" )      ? ' col-sm-offset-' . $atts['offset-sm'] : '';
		$class[]	= ( $atts['offset-md'] || $atts['offset-md'] === "0" )      ? ' col-md-offset-' . $atts['offset-md'] : '';
		$class[]	= ( $atts['offset-lg'] || $atts['offset-lg'] === "0" )      ? ' col-lg-offset-' . $atts['offset-lg'] : '';
		$class[]	= ( $atts['offset-xl'] || $atts['offset-xl'] === "0" )      ? ' col-xl-offset-' . $atts['offset-xl'] : '';

		$class[]	= ( $atts['pull-xs']   || $atts['pull-xs'] === "0" )        ? ' col-xs-pull-' . $atts['pull-xs'] : '';
		$class[]	= ( $atts['pull-sm']   || $atts['pull-sm'] === "0" )        ? ' col-sm-pull-' . $atts['pull-sm'] : '';
		$class[]	= ( $atts['pull-md']   || $atts['pull-md'] === "0" )        ? ' col-md-pull-' . $atts['pull-md'] : '';
		$class[]	= ( $atts['pull-lg']   || $atts['pull-lg'] === "0" )        ? ' col-lg-pull-' . $atts['pull-lg'] : '';
		$class[]	= ( $atts['pull-xl']   || $atts['pull-xl'] === "0" )        ? ' col-xl-pull-' . $atts['pull-xl'] : '';

		$class[]	= ( $atts['push-xs']   || $atts['push-xs'] === "0" )        ? ' col-xs-push-' . $atts['push-xs'] : '';
		$class[]	= ( $atts['push-sm']   || $atts['push-sm'] === "0" )        ? ' col-sm-push-' . $atts['push-sm'] : '';
		$class[]	= ( $atts['push-md']   || $atts['push-md'] === "0" )        ? ' col-md-push-' . $atts['push-md'] : '';
		$class[]	= ( $atts['push-lg']   || $atts['push-lg'] === "0" )        ? ' col-lg-push-' . $atts['push-lg'] : '';
		$class[]	= ( $atts['push-xl']   || $atts['push-xl'] === "0" )        ? ' col-xl-push-' . $atts['push-xl'] : '';

		$class[]	= ( $atts['xclass'] )                                       ? ' ' . $atts['xclass'] : '';

		$return = $this->bs_output(
			sprintf(
				'<div class="%s"%s>%s</div>',
				$this->class_output(__FUNCTION__, $class, $atts['class']),
				$this->parse_data_attributes( $atts['data'] ),
				do_shortcode( $content )
			)
		);

		return $return;
	}



	/**
	 * Media List (media object wrapper) shortcode
	 * @param  [type] $atts    shortcode attributes
	 * @param  string $content shortcode contents
	 * @return string
	 */
	function bs_media_list( $atts, $content = null ) {
		$atts = shortcode_atts( array(
				"class" => false,
				"data"   => false
		), $atts );

		$class	= array();
		$class[]  = 'media-list';

		$GLOBALS['media_list'] = true;

		$return = $this->bs_output(
			sprintf(
				'<ul class="%s"%s>%s</div>',
				$this->class_output(__FUNCTION__, $class, $atts['class']),
				$this->parse_data_attributes( $atts['data'] ),
				do_shortcode( $content )
			)
		);

		unset($GLOBALS['media_list']);
		return $return;
	}



	/**
	 * Media (media object wrapper) shortcode
	 * @param  [type] $atts    shortcode attributes
	 * @param  string $content shortcode contents
	 * @return string
	 */
	function bs_media( $atts, $content = null ) {
		$atts = shortcode_atts( array(
				"class" => false,
				"data"   => false
		), $atts );

		$class	= array();
		$class[]  = 'media';

		$return = $this->bs_output(
			sprintf(
				'<%1$s class="%2$s"%3$s>%4$s</%1$s>',
				(isset($GLOBALS['media_list'])) ? 'li' : 'div',
				$this->class_output(__FUNCTION__, $class, $atts['class']),
				$this->parse_data_attributes( $atts['data'] ),
				do_shortcode( $content )
			)
		);

		return $return;
	}


	/**
	 * Media Object shortcode
	 * @param  [type] $atts    shortcode attributes
	 * @param  string $content shortcode contents
	 * @return string
	 */
	function bs_media_object( $atts, $content = null ) {
		$atts = shortcode_atts( array(
				"media"	=> "left",
				"alignment"	=> false,
				"class"	=> false,
				"data"	=> false
		), $atts );

		$class	= array();
		$class[]	= ($atts['media']) ? 'media-' . $atts['media'] : null;
		$class[]	= ($atts['alignment']) ? 'media-' . $atts['alignment'] : null;

		$object_class	= array();
		$object_class[]	= "media-object";

		$allowed_tags	= array('figure', 'div', 'img', 'i', 'span');

		$return = $this->bs_output(
			sprintf(
				'<div class="%s"%s>%s</div>',
				$this->class_output(__FUNCTION__, $class, $atts['class']),
				$this->parse_data_attributes( $atts['data'] ),
				$this->scrape_dom_element($allowed_tags, $content, $object_class, null, null)
			)
		);

		return $return;
	}


	/**
	 * Get the name of the function that called the current function
	 * @param  boolean $completeTrace [description]
	 * @return string                 The calling function's name
	 */
	function getCallingFunctionName($completeTrace=false) {
			$trace=debug_backtrace();
			if($completeTrace) {
					$str = '';
					foreach($trace as $caller) {
							$str .= $caller['function'];
							if (isset($caller['class']))
									$str .= '-' . $caller['class'];
					}
			} else {
					$caller=$trace[2];
					$str = $caller['function'];
					if (isset($caller['class']))
							$str .= '-' . $caller['class'];
			}
			return $str;
	}



	/**
	 * Output the shortcode after applying a shortcode-specific filter
	 * Filters are named for the shortcode function, ex: bs_row, bs_column
	 * @param  string $return The shortcode output passed from the calling function
	 * @return string         The filtered shortcode output
	 */
	function bs_output( $return, $callback = null ) {
		return apply_filters($this->getCallingFunctionName(), $return);
	}



	/**
	 * Add extra classes onto shortcode's existing class array
	 * @param  array $class
	 * @param  array $xclass
	 * @return array         merged arrays
	 */
	function xclass( $class, $xclass) {
		$class = array_filter( array_map( 'trim', $class ) );
		$xclass = array_filter( array_map( 'trim', explode( ' ', $xclass ) ) );
		return array_merge( $class, $xclass );
	}



	/**
	 * Convert class array into string, apply shortcode-specific filter, and return the string
	 * @param  string $name  name of the function calling this one
	 * @param  array $class
	 * @return string
	 */
	function class_output($name, $class, $xclass = array()) {
		$class = $this->xclass($class, $xclass);
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



	/**
	 * Scrape the shortcode's contents for a particular DOMDocument tag or tags, pull them out, apply attributes, and return just the tags.
	 * @param  [type] $tag     [description]
	 * @param  [type] $content [description]
	 * @param  [type] $class   [description]
	 * @param  string $title   [description]
	 * @param  [type] $data    [description]
	 * @return [type]          [description]
	 */
	function scrape_dom_element( $tag, $content, $class = '', $title = '', $data = null ) {

		// Hide warnings while we run this function
		$previous_value = libxml_use_internal_errors(TRUE);
		$dom = new DOMDocument;
		$dom->loadHTML(mb_convert_encoding($content, 'HTML-ENTITIES', 'UTF-8'));
		libxml_clear_errors();
		libxml_use_internal_errors($previous_value);

		// Search the document object for the the tags in $tag
		foreach ($tag as $find) {
			$tags = $dom->getElementsByTagName($find);

			// For each tag found, create a new document object and apply our changes
			foreach ($tags as $find_tag) {
				$outputdom = new DOMDocument;
				$new_root = $outputdom->importNode($find_tag, true);
				$outputdom->appendChild($new_root);
				if(is_object($outputdom->documentElement)) {

					// Append the classes in $class to the tag's existing classes
					$outputdom->documentElement->setAttribute(
						'class',
						$this->class_output(
							$this->getCallingFunctionName() . '_tag',
							$class,
							$outputdom->documentElement->getAttribute('class')
						)
					);

					// If $title was passed, set the title attribute
					if( $title ) {
						$outputdom->documentElement->setAttribute(
							'title',
							$title
						);
					}

					// If $data was passed, set data attributes
					if( $data ) {
						$data = explode( '|', $data );
						foreach( $data as $d ):
							$d = explode(',',$d);
							$outputdom->documentElement->setAttribute('data-'.$d[0],trim($d[1]));
						endforeach;
					}
				}

				// Return the modified HTML
				return $outputdom->saveHTML($outputdom->documentElement);
			}
		}
	}


} // End Boostrap4Shortcodes class
new Boostrap4Shortcodes();
