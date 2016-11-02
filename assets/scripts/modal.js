jQuery(document).ready(function() {

	jQuery("#bootstrap-4-shortcodes-help .insert-code").click(function() {
			var path = jQuery( this ).data('path');
			var example = jQuery( this )
				.prev()
				.find("code")
				.text().replace('placeholder-path', path);
			var lines = example.split('\n');
			var paras = '';
			jQuery.each(lines, function(i, line) {
					if (line) {
							paras += line + '<br>';
					}
			});
			// Replace placeholder paths

			var win = window.dialogArguments || opener || parent || top;
			win.send_to_editor(paras);
	});

});
