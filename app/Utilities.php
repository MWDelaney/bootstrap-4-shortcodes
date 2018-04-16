<?php

namespace MWD\BS4Shortcodes;

class Utilities {
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
	public static function bs_output( $return, $callback = null ) {
		$u = new Utilities;
		return apply_filters($u->getCallingFunctionName(), $return);
	}



	/**
	 * Parse data attributes for shortcodes
	 * @param  string $data
	 * @return string
	 */
	public static function parse_data_attributes( $data ) {
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
	 * Convert class array into string, apply shortcode-specific filter, and return the string
	 * @param  string $name  name of the function calling this one
	 * @param  array $class
	 * @return string
	 */
	public static function class_output($name, $class, $xclass = array()) {
		$u = new Utilities;
		$class = $u->xclass($class, $xclass);
		return esc_attr(trim(implode(' ', apply_filters( $name . '_shortcode_classes', $class ))));
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
	public static function addclass( $finds, $content, $class, $nth = null ) {
		$u = new Utilities;
		$doc = $u->processdom($content);

		if(!$finds) {
			$root = $doc->documentElement;
			$finds = array($root->tagName);
		}
		$count = 0;
		foreach( $finds as $found ) {
			$tags = $doc->getElementsByTagName($found);
			foreach ($tags as $tag) {
				if($nth && $count == $nth) { continue; }
				// Append the classes in $class to the tag's existing classes
				$tag->setAttribute(
					'class',
					$u->class_output(
						$u->getCallingFunctionName() . '_addclass',
						$class,
						$tag->getAttribute('class')
					)
				);
				$count++;
			}
		}
		return $doc->saveHTML($doc->documentElement);
	}



	/**
	 * Check whether a specified tag has a specified class
	 * @param  [type] $tag     [description]
	 * @param  [type] $content [description]
	 * @param  [type] $class   [description]
	 * @param  string $title   [description]
	 * @param  [type] $data    [description]
	 * @return [type]          [description]
	 */
	public static function hasclass ($tag, $class) {
		if ($tag->hasAttribute('class') && strstr($tag->getAttribute('class'), $class)) {
			return true;
		 }
	}



	/**
	 * Add a class to the parent of the targetted element
	 * @param  [type] $tag     [description]
	 * @param  [type] $content [description]
	 * @param  [type] $class   [description]
	 * @param  string $title   [description]
	 * @param  [type] $data    [description]
	 * @return [type]          [description]
	 */
	public static function addparentclass( $finds, $content, $class) {
		$u = new Utilities;
		$doc = $u->processdom($content);

		if(!$finds) {
			$root = $doc->documentElement;
			$finds = array($root->tagName);
		}
		$count = 0;
		foreach( $finds as $found ) {
			$tags = $doc->getElementsByTagName($found);
			foreach ($tags as $tag) {
				foreach ($class as $c) {
					if (!Utilities::hasclass($tag, $c)) { continue; }
						else {
						$parent = $tag->parentNode;

						// Append the classes in $class to the tag's existing classes
						$parent->setAttribute(
							'class',
							$u->class_output(
								$u->getCallingFunctionName() . '_addclass',
								$class,
								$parent->getAttribute('class')
							)
						);
						$count++;
					}
				}
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
	public static function addtitle( $finds, $content, $title ) {
		$u = new Utilities;
		$doc = $u->processdom($content);

		if(!$finds) {
			$root = $doc->documentElement;
			$finds = array($root->tagName);
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
	 * Parse a shortcode's contents for a tag and add a specified area attributes to each instance
	 * @param  [type] $tag     [description]
	 * @param  [type] $content [description]
	 * @param  [type] $class   [description]
	 * @param  string $title   [description]
	 * @param  [type] $data    [description]
	 * @return [type]          [description]
	 */
	public static function addaria( $finds, $content, $aria, $value ) {
		$u = new Utilities;
		$doc = $u->processdom($content);

		if(!$finds) {
			$root = $doc->documentElement;
			$tag = array($root->tagName);
		}

		foreach( $finds as $found ){
			$tags = $doc->getElementsByTagName($found);
			foreach ($tags as $tag) {
				// Set the title attribute
				$tag->setAttribute(
					'title' . $aria,
					$value
				);
			}
		}
		return $doc->saveHTML($doc->documentElement);
	}



	/**
	 * Count instances of specified tag(s) in content
	 * @param  [type] $tag     [description]
	 * @param  [type] $content [description]
	 * @param  [type] $class   [description]
	 * @param  string $title   [description]
	 * @param  [type] $data    [description]
	 * @return [type]          [description]
	 */
	public static function counttags( $finds, $content ) {
		$u = new Utilities;
		$doc = $u->processdom($content);

		$count = 0;

		foreach( $finds as $found ){
			$tags = $doc->getElementsByTagName($found);
			foreach ($tags as $tag) {
				$count++;
			}
		}
		return $count;
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
	 * Check if a particular parameter is set as a flag (a parameter without a value) in a shortcode
	 * @param  string  $flag the flag we're looking for
	 * @param  array  $atts  an array of the shortcode's attributes
	 * @return boolean       [description]
	 */
	public static function is_flag( $flag, $atts ) {
		if(is_array($atts)) {
			foreach ( $atts as $key => $value ) {
				if ( $value === $flag && is_int( $key ) ) return true;
			}
			return false;
		}
	}



	/**
	 * Test DOM for root tags
	 */
	 public static function testdom( $content, $tag ) {
		 $u = new Utilities;
 		 $test = $u->processdom($content);
		 if(in_array($test->documentElement->tagName, $tag)) {
			 return true;
		 }
	 }



	/**
	 * Strip tags by name from DOM
	 */
	 public static function striptagfromdom( $tag, $content ) {
		 $u = new Utilities;
 		 $doc = $u->processdom($content);
		 $list = $doc->getElementsByTagName($tag);

		 while ($list->length > 0) {
		     $p = $list->item(0);
		     $p->parentNode->removeChild($p);
		 }
		 return $doc->saveHTML($doc->documentElement);
   }



	/**
	 * Process DOM
	 */
	function processdom( $content ) {
		$content = mb_convert_encoding($content, 'HTML-ENTITIES', "UTF-8");

	 // Hide warnings while we run this function
	 $previous_value = libxml_use_internal_errors(TRUE);

	 $doc = new \DOMDocument();
	 $doc->loadHTML($content, LIBXML_HTML_NOIMPLIED | LIBXML_HTML_NODEFDTD);
	 libxml_clear_errors();
	 libxml_use_internal_errors($previous_value);

		return $doc;
	}



	/**
	 * Remove tags from DOM keeping their children
	 */
	 function DOMRemove(DOMNode $from) {
	     $sibling = $from->firstChild;
	     do {
	         $next = $sibling->nextSibling;
	         $from->parentNode->insertBefore($sibling, $from);
	     } while ($sibling = $next);
	     $from->parentNode->removeChild($from);
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
	public static function adddata( $finds, $content, $data ) {
		$u = new Utilities;
		$doc = $u->processdom($content);

		if(!$finds) {
			$root = $doc->documentElement;
			$finds = array($root->tagName);
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

}
