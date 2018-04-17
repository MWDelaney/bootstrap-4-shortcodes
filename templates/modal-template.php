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
            <div class="container-fluid">
              <div class="row">
                <nav id="bs4-table-of-contents" class="col-md-3 left">
                  <header class="d-flex align-items-center py-3">
                    <button id="toc-off" class="btn btn-outline-primary mr-3 d-md-none d-flex align-items-center" data-target="#bs4-table-of-contents" data-toggle="sidebar">
                    <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 16 16" width="16" height="16"><g class="nc-icon-wrapper" fill="#444444"><line fill="none" stroke="#444444" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" x1="13.5" y1="2.5" x2="2.5" y2="13.5" data-cap="butt"></line> <line fill="none" stroke="#444444" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" x1="2.5" y1="2.5" x2="13.5" y2="13.5" data-cap="butt"></line> </g></svg>
                    </button>
                    <h5 class="text-center m-0">Table of Contents</h5>
                  </header> 
                  <?php
                    ob_start();
                    include(BS4_SHORTCODES_DIR . '/dist/docs/toc.php');
                    echo str_replace('data-path="placeholder"', 'data-path="' . BS4_SHORTCODES_RELATIVE_URL . 'dist/images/"', ob_get_clean());
                  ?>
                </nav>
              <div class="col-md-9 right">
              <div class="modal-header align-items-center">
                <button id="toc-on" class="btn btn-outline-light mr-3 d-md-none d-flex align-items-center" data-target="#bs4-table-of-contents" data-toggle="sidebar">
                  <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 16 16" width="16" height="16"><g class="nc-icon-wrapper" fill="#ffffff"><line fill="none" stroke="#ffffff" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" x1="1.5" y1="2.5" x2="15.5" y2="2.5"></line> <line data-color="color-2" fill="none" stroke="#ffffff" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" x1="1.5" y1="8.5" x2="15.5" y2="8.5"></line> <line fill="none" stroke="#ffffff" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" x1="1.5" y1="14.5" x2="15.5" y2="14.5"></line> </g></svg>
                </button>
                <h4 class="m-0">Bootstrap 4 Shortcodes Help</h4>
                <button type="button" class="close align-self-start" data-dismiss="modal" aria-hidden="true">&times;</button>
              </div>

              <div class="modal-body">
                <section role="main">
                  <article>
                  <?php
                    ob_start();
                    include(BS4_SHORTCODES_DIR . '/dist/docs/documentation.php');
                    // ======================================================================== //
                    // Put HTML content in the page so we can pop it up in a modal
                    // ======================================================================== //
                    echo str_replace('data-path="placeholder"', 'data-path="' . BS4_SHORTCODES_RELATIVE_URL . 'dist/images"', ob_get_clean());
                  ?>
                  </article>
                </section>
              </div>
            </div>
          </div>
        </div><!-- /.modal-body -->

      </div><!-- /.modal-content -->
    </div><!-- /.modal-dialog -->
  </div><!-- /.modal -->
</div>
