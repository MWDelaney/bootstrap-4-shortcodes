<?php

namespace MWD\BS4Shortcodes;

use \MWD\BS4Shortcodes\Shortcodes;
use \MWD\BS4Shortcodes\Utilities;

use \MWD\BS4Shortcodes\Docs;
use \MWD\BS4Shortcodes\Admin;

class Init {

	function __construct() {
		add_filter('the_content', array( $this, 'bs_fix_shortcodes' ) );
		add_action( 'init', array( $this, 'init_classes' ) );
		add_action( 'admin_init', array( $this, 'admin_classes' ) );

	}



	function init_classes() {
		$shortcodes = new \MWD\BS4Shortcodes\Shortcodes;
		$utilities = new \MWD\BS4Shortcodes\Utilities;
	}



	function admin_classes() {

		$docs = new \MWD\BS4Shortcodes\Docs;
		$admin = new \MWD\BS4Shortcodes\Admin;

	}



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

}
