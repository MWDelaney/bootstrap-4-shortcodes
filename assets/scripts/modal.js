jQuery(document).ready(function() {

	jQuery("#bootstrap-4-shortcodes-help .insert-code").click(function() {
			var example = jQuery( this ).parent().prev().find("code").text();
			var lines = example.split('\n');
			var paras = '';
			jQuery.each(lines, function(i, line) {
					if (line) {
							paras += line + '<br>';
					}
			});
			var win = window.dialogArguments || opener || parent || top;
			win.send_to_editor(paras);
	});

	jQuery(".bs4-table-of-contents-title + .bs4-table-of-contents-section").detach();


});
