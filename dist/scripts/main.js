jQuery(document).ready(function() {

	jQuery("#bootstrap-4-shortcodes-help .insert-code").click(function() {
			var path = jQuery( this ).data('path');
			var example = jQuery( this )
				.closest('.card')
				.find("pre code")
				.text().replace(/placeholder-path/g, path)
        .replace(/]\n/g, ']<br>')
        .replace(/<ul>\n/g, '<ul>')
				.replace(/<\/ul>\n/g, '</ul>')
				.replace(/<\/li>\n/g, '</li>')
				.replace(/>\n/g, '><br>')
				.replace(/\.\.\.\n/g, '...<br>');
			var lines = example.split('\n');
			var paras = '';
			jQuery.each(lines, function(i, line) {
					if (line) {
							paras += line;
					}
			});
			// Replace placeholder paths

			var win = window.dialogArguments || opener || parent || top;
			win.send_to_editor(paras);
	});

});
