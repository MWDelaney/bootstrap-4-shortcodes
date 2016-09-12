<?php
/**
 * Backbone Templates
 * This file contains all of the HTML used in our modal and the workflow itself.
 *
 * Each template is wrapped in a script block ( note the type is set to "text/html" ) and given an ID prefixed with
 * 'tmpl'. The wp.template method retrieves the contents of the script block and converts these blocks into compiled
 * templates to be used and reused in your application.
 */


/**
 * The Modal Window, including sidebar and content area.
 * Add menu items to ".navigation-bar nav ul"
 * Add content to ".backbone_modal-main article"
 */
?>
<div id="bootstrap-4-shortcodes-help">
<div id="bootstrap-4-shortcodes-help-modal" class="modal fade">
    <div class="modal-dialog modal-lg">
        <div class="modal-content">
            <div class="modal-header">
                <button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>
                <h4>Bootstrap 4 Shortcodes Help</h4>
            </div>

            <div class="modal-body ativa-scroll">

				<nav>
					<ul>
						<li class="active"><a href="#bs-shortcode-reference">Shortcode Reference</a></li>
						<li><a href="#bs-requirements">System Requirements</a></li>
					</ul>
				</nav>
				<section class="backbone_modal-main" role="main">
				<header><h1><?php echo __( 'Bootstrap 4 Shortcodes for WordPress', 'bootstrap_4_shortcodes' ); ?></h1></header>
					<article>
				<?php
					$html = file_get_contents(BS4_SHORTCODES_DIR . '/dist/docs/README.html');
							// ======================================================================== //
							// Put HTML content in the page so we can pop it up in a modal
							// But first edit the HTML to make it more useful as popup documentation
							//      * Alter links to open in new tabs
							//      * Add Bootstrap styling to tables
							//      * Add Bootstrap styling to lists (and replace ULs with DIVs, and LIs with As)
							//      * Edit anchors to be on-page jumps
							//      * Add back-to-top buttons after sections
							//      * Add IDs to h3 tags for the above on-page jumps
							//      * Add "Insert Example" buttons after code examples
							// ======================================================================== //

							$html = preg_replace('/(<a href="http:[^"]+")>/is','\\1 target="_blank">',$html);
							$html = str_replace('<table>', '<table class="table table-striped">', $html);
							$html = str_replace('<ul>', '<div class="list-group">', $html);
							$html = str_replace('</ul>', '</div>', $html);
							$html = str_replace('<li><a ', '<a class="list-group-item" ', $html);
							$html = str_replace('</li>', '', $html);
							$html = str_replace('href="#', 'href="#bs-', $html);
							$html = str_replace('<hr>', '<hr><a class="btn btn-link btn-default pull-right" href="#bs-top"><i class="text-muted glyphicon glyphicon-arrow-up"></i></a>', $html);
							$html = str_replace('<h3 id="', '<h3 id="bs-', $html);
							$html = str_replace('</pre>', '</pre><p><button data-dismiss="modal" class="btn btn-primary btn-sm insert-code">Insert Example <i class="glyphicon glyphicon-share-alt"></i></button></p>', $html);

							//Insert the HTML now that we're done editing it
							echo $html;

				?>
				</article>
			</section>

		</div><!-- /.modal-body -->

</div><!-- /.modal-content -->
</div><!-- /.modal-dialog -->
</div><!-- /.modal -->
</div>
