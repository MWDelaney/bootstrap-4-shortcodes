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
			'media-heading',

			'hidden',

			'alert',

			'breadcrumb',
			'active',

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
				"class" => false,
				"data"   => false,
		), $atts );

		$class	= array();
		$class[]	= 'container';

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

		$class[]	= ( $atts['xs'] )			                                			? ' col-xs-' . $atts['xs'] : null;
		$class[]	= ( $atts['sm'] )                                           ? ' col-sm-' . $atts['sm'] : null;
		$class[]	= ( $atts['md'] )                                           ? ' col-md-' . $atts['md'] : null;
		$class[]	= ( $atts['lg'] )                                           ? ' col-lg-' . $atts['lg'] : null;
		$class[]	= ( $atts['xl'] )                                           ? ' col-xl-' . $atts['xl'] : null;

		$class[]	= ( $atts['offset-xs'] || $atts['offset-xs'] === "0" )      ? ' col-xs-offset-' . $atts['offset-xs'] : null;
		$class[]	= ( $atts['offset-sm'] || $atts['offset-sm'] === "0" )      ? ' col-sm-offset-' . $atts['offset-sm'] : null;
		$class[]	= ( $atts['offset-md'] || $atts['offset-md'] === "0" )      ? ' col-md-offset-' . $atts['offset-md'] : null;
		$class[]	= ( $atts['offset-lg'] || $atts['offset-lg'] === "0" )      ? ' col-lg-offset-' . $atts['offset-lg'] : null;
		$class[]	= ( $atts['offset-xl'] || $atts['offset-xl'] === "0" )      ? ' col-xl-offset-' . $atts['offset-xl'] : null;

		$class[]	= ( $atts['pull-xs']   || $atts['pull-xs'] === "0" )        ? ' col-xs-pull-' . $atts['pull-xs'] : null;
		$class[]	= ( $atts['pull-sm']   || $atts['pull-sm'] === "0" )        ? ' col-sm-pull-' . $atts['pull-sm'] : null;
		$class[]	= ( $atts['pull-md']   || $atts['pull-md'] === "0" )        ? ' col-md-pull-' . $atts['pull-md'] : null;
		$class[]	= ( $atts['pull-lg']   || $atts['pull-lg'] === "0" )        ? ' col-lg-pull-' . $atts['pull-lg'] : null;
		$class[]	= ( $atts['pull-xl']   || $atts['pull-xl'] === "0" )        ? ' col-xl-pull-' . $atts['pull-xl'] : null;

		$class[]	= ( $atts['push-xs']   || $atts['push-xs'] === "0" )        ? ' col-xs-push-' . $atts['push-xs'] : null;
		$class[]	= ( $atts['push-sm']   || $atts['push-sm'] === "0" )        ? ' col-sm-push-' . $atts['push-sm'] : null;
		$class[]	= ( $atts['push-md']   || $atts['push-md'] === "0" )        ? ' col-md-push-' . $atts['push-md'] : null;
		$class[]	= ( $atts['push-lg']   || $atts['push-lg'] === "0" )        ? ' col-lg-push-' . $atts['push-lg'] : null;
		$class[]	= ( $atts['push-xl']   || $atts['push-xl'] === "0" )        ? ' col-xl-push-' . $atts['push-xl'] : null;

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

		$search_tags	= array('figure', 'div', 'img', 'i', 'span');
		$fallback_tag = 'div';

		$content = do_shortcode( $content );
		$content = $this->addclass( $search_tags, $content, $object_class, $fallback_tag )

		$return = $this->bs_output(
			sprintf(
				'<div class="%s"%s>%s</div>',
				$this->class_output(__FUNCTION__, $class, $atts['class']),
				$this->parse_data_attributes( $atts['data'] ),
				$content
			)
		);

		return $return;
	}



	/**
	 * Media Body shortcode
	 * @param  [type] $atts    shortcode attributes
	 * @param  string $content shortcode contents
	 * @return string
	 */
	function bs_media_body( $atts, $content = null ) {
		$atts = shortcode_atts( array(
				"class" => false,
				"data"   => false
		), $atts );

		$class	= array();
		$class[]  = 'media-body';

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
	 * Media heading shortcode
	 * @param  [type] $atts    shortcode attributes
	 * @param  string $content shortcode contents
	 * @return string
	 */
	function bs_media_heading( $atts, $content = null ) {
		$atts = shortcode_atts( array(
				"class" => false,
				"data"   => false
		), $atts );

		$class	= array();
		$class[]  = 'media-heading';

		$search_tags = array('h1', 'h2', 'h3', 'h4', 'h5', 'h6');
		$fallback_tag = 'h4';

		$content = do_shortcode( $content );
		$content = $this->addclass( $search_tags, $content, $class, $fallback_tag )
		$content = $this->adddata( $search_tags, $content, $atts['data'] );

		$return = $this->bs_output(
			sprintf(
				'%s',
				$content
			)
		);

		return $return;
	}


	/**
	 * Hidden shortcode
	 * @param  [type] $atts    shortcode attributes
	 * @param  string $content shortcode contents
	 * @return string
	 */
	function bs_hidden( $atts, $content = null ) {
		$atts = shortcode_atts( array(
				"up" => false,
				"down"  => false,
				"class"  => false,
				"data"    => false
		), $atts );

		$class	= array();
		$class[]	= ( $atts['up'] )		? 'hidden-' . $atts['up'] . '-up': null;
		$class[]	= ( $atts['down'] )		? 'hidden-' . $atts['down'] . '-down': null;

		$content = do_shortcode( $content );
		$content = $this->addclass( null, $content, $class )
		$content = $this->adddata( null, $content, $atts['data'] );

		$return = $this->bs_output(
			sprintf(
				'%s',
				$content
			)
		);

		return $return;
	}



	/**
	 * Alert shortcode
	 * @param  [type] $atts    shortcode attributes
	 * @param  string $content shortcode contents
	 * @return string
	 */
	function bs_alert( $atts, $content = null ) {
		$atts = shortcode_atts( array(
				"type"	=> "info",
				"dismissible"	=> false,
				"class" => false,
				"data"	=> false
		), $atts );

		$class	= array();
		$class[]  = 'alert';
		$class[]  = 'alert-' . $atts['type'];
		$class[]	= 'alert-dismissible fade in';

		$link_class	= array();
		$link_class[]	= 'alert-link';

		$heading_class	= array();
		$heading_class[]	= 'alert-heading';

		$search_anchors = array('a');
		$search_headings = array('h1', 'h2', 'h3', 'h4', 'h5', 'h6');

		$content = do_shortcode( $content );
		$content = $this->addclass( $search_anchors, $content, $link_class );
		$content = $this->addclass( $search_headings, $content, $heading_class );
		$content = ($atts['dismissible']) ? '<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>' . $content : $content;

		$return = $this->bs_output(
			sprintf(
				'<div class="%s"%s>%s</div>',
				$this->class_output(__FUNCTION__, $class, $atts['class']),
				$this->parse_data_attributes( $atts['data'] ),
				$content
			)
		);

		return $return;
	}



	/**
	 * Breadcrumb shortcode
	 * @param  [type] $atts    shortcode attributes
	 * @param  string $content shortcode contents
	 * @return string
	 */
	function bs_breadcrumb( $atts, $content = null ) {
		$atts = shortcode_atts( array(
				"class"	=> false,
				"data"	=> false
		), $atts );

		$class	= array();
		$class[]	= 'breadcrumb';

		$anchor_class	= array();
		$anchor_class[]	= "breadcrumb-item";

		$search_tags	= array('a');

		$return = $this->bs_output(
			sprintf(
				'<nav class="%s"%s>%s</div>',
				$this->class_output(__FUNCTION__, $class, $atts['class']),
				$this->parse_data_attributes( $atts['data'] ),
				$this->addclass( $search_tags, do_shortcode( $content ), $anchor_class )
			)
		);

		return $return;
	}


	/**
	 * Active shortcode
	 * @param  [type] $atts    shortcode attributes
	 * @param  string $content shortcode contents
	 * @return string
	 */
	function bs_active( $atts, $content = null ) {
		$atts = shortcode_atts( array(
				"class"	=> false,
				"data"	=> false
		), $atts );

		$class	= array();
		$class[]	= 'active';

		$search_tags	= array('a');

		$content = do_shortcode( $content );
		$content = $this->addclass( $search_tags, $content, $class )
		$content = $this->adddata( $search_tags, $content, $atts['data'] );

		$return = $this->bs_output(
			sprintf(
				'$s',
				$content
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
	 * Process DOM
	 */
	function processdom( $content, $tag = null ) {
	 // Hide warnings while we run this function
	 $previous_value = libxml_use_internal_errors(TRUE);
	 $doc = new DOMDocument();
	 $doc->loadHTML($content);
	 libxml_clear_errors();
	 libxml_use_internal_errors($previous_value);

	 $tag = ($tag) ? $tag : 'div';

	 // If there's no root element, set it to $default
	 if(!$doc->documentElement) {
			 $element = $doc->createElement($tag, utf8_encode($content));
			 $doc->appendChild($element);
		}
		return $doc;
	}

	/**
	 * Parse a shortcode's contents for a tag and apply classes to each instance
	 * @param  [type] $tag     [description]
	 * @param  [type] $content [description]
	 * @param  [type] $class   [description]
	 * @param  string $title   [description]
	 * @param  [type] $data    [description]
	 * @return [type]          [description]
	 */
	function addclass( $finds, $content, $class, $fallback_tag = null ) {

		$doc = $this->processdom($content, $fallback_tag);

		if(!$finds) {
			$root = $doc->documentElement;
			$finds = array($root->tagName);
		}

		foreach( $finds as $found ){
			$tags = $doc->getElementsByTagName($found);
			foreach ($tags as $tag) {
				// Append the classes in $class to the tag's existing classes
				$tag->setAttribute(
					'class',
					$this->class_output(
						$this->getCallingFunctionName() . '_addclass',
						$class,
						$tag->getAttribute('class')
					)
				);
			}
		}
		return $doc->saveHTML($doc->documentElement);
	}



	/**
	 * Parse a shortcode's contents for a tag and add a specified title to each instance
	 * @param  [type] $tag     [description]
	 * @param  [type] $content [description]
	 * @param  [type] $class   [description]
	 * @param  string $title   [description]
	 * @param  [type] $data    [description]
	 * @return [type]          [description]
	 */
	function addtitle( $finds, $content, $title ) {

		$doc = $this->processdom($content);

		if(!$finds) {
			$root = $doc->documentElement;
			$tag = array($root->tagName);
		}

		foreach( $finds as $found ){
			$tags = $doc->getElementsByTagName($found);
			foreach ($tags as $tag) {
				// Set the title attribute
				$tag->setAttribute(
					'title',
					$title
				);
			}
		}
		return $doc->saveHTML($doc->documentElement);
	}


	/**
	 * Parse a shortcode's contents for a tag and apply data attribute pairs to each instances
	 * @param  [type] $tag     [description]
	 * @param  [type] $content [description]
	 * @param  [type] $class   [description]
	 * @param  string $title   [description]
	 * @param  [type] $data    [description]
	 * @return [type]          [description]
	 */
	function adddata( $finds, $content, $data ) {

		$doc = $this->processdom($content);

		if(!$finds) {
			$root = $doc->documentElement;
			$tag = array($root->tagName);
		}

		foreach( $finds as $found ){
			$tags = $doc->getElementsByTagName($found);
			foreach ($tags as $tag) {
				// Set data attributes
				if( $data ) {
					$data = explode( '|', $data );
					foreach( $data as $d ) {
						$d = explode(',',$d);
						$tag->setAttribute('data-'.$d[0],trim($d[1]));
					}
				}
			}
		}
		return $doc->saveHTML($doc->documentElement);
	}


} // End Boostrap4Shortcodes class
new Boostrap4Shortcodes();
