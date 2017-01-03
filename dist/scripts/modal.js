jQuery(document).ready(function() {

	jQuery("#bootstrap-4-shortcodes-help .insert-code").click(function() {
			var path = jQuery( this ).data('path');
			var example = jQuery( this )
				.closest('.card')
				.find("code")
				.text().replace('placeholder-path', path)
				.replace(/]\n/g, ']<br>\n')
				.replace(/\.\.\.\n/g, '...<br>\n');
			console.log(example);
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
