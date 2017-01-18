// ==UserScript==
// @name	IP.Board - Rich Post Templates
// @namespace	Makaze
// @description	Automatically adds a post template of your choice to the reply box.
// @include	*
// @grant	none
// @version	1.0.1
// ==/UserScript==

var MakazeScriptStyles,
styleElem,
$template;

function createElement(type, callback) {
	var element = document.createElement(type);

	callback(element);

	return element;
}

function runInJQuery(code) {
	if (typeof(jQuery) == "undefined") {
		document.body.appendChild(createElement('script', function(jQ) {
			jQ.type = 'text/javascript';
			jQ.src = 'https://code.jquery.com/jquery-2.1.3.min.js';

			jQ.onload = function() {
				document.body.appendChild(createElement('script', function(content) {
					content.appendChild(document.createTextNode('jQuery.noConflict();' + code));
				}));
			};
		}));
	} else {
		document.body.appendChild(createElement('script', function(content) {
			content.appendChild(document.createTextNode(code));
		}));
	}
}

function main() {
	// Styling

	if (document.getElementById('MakazeScriptStyles') == null) {
		MakazeScriptStyles = createElement('style', function(style) {
			style.id = 'MakazeScriptStyles';
			style.type = 'text/css';
		});
		document.head.appendChild(MakazeScriptStyles);
	}

	styleElem = document.getElementById('MakazeScriptStyles');

	if (styleElem.hasChildNodes()) {
		styleElem.childNodes[0].nodeValue += '\n\n';
	} else {
		styleElem.appendChild(document.createTextNode(''));
	}

	styleElem.childNodes[0].nodeValue +=
		'.post_templates {' +
			'box-sizing: border-box;' +
			'position: absolute;' +
			'z-index: 999;' +
			'opacity: .95;' +
			'bottom: 55px;' +
			'right: 2.5%;' +
			'width: 95%;' +
			'min-height: 150px;' +
			'background-color: #333;' +
			'border-radius: 5px;' +
			'box-shadow: 0px 3px 2px #111;' +
			'border: 1px solid #111;' +
			'color: #0aa;' +
			'padding: 10px;' +
			'white-space: pre-line;' +
			'word-wrap: normal;' +
			'outline: none;' +
			'display: none;' +
		'}';

	jQuery('.ipsComposeArea_editor ul.ipsToolList').append('<li style="float:left;"><button type="button" class="ipsButton ipsButton_primary post_templates_button" tabindex="2" role="button" title="Click to edit the Post Template. Click again to save. Ctrl + click to erase your reply and apply the last saved template to the field.">Post Templates</button><div class="post_templates" contenteditable="">&lt;Edit HTML here.<div>Click Post Templates again to close this window and save.</div><div>Ctrl + click Post Templates to erase your reply and apply the last saved template to the field.&gt;</div></div></li>');

	jQuery('.post_templates_button').on('click', function(event) {
		$template = localStorage.getItem('ipb_RichPostTemplate');

		if (event.ctrlKey) {
			jQuery('.cke_wysiwyg_div').html($template);
		} else if (jQuery('.post_templates').is(':visible')) {
			localStorage.setItem('ipb_RichPostTemplate', jQuery('.post_templates').text());
			jQuery('.post_templates').fadeOut('fast');
		} else {
			jQuery('.post_templates').fadeIn('fast');
		}
	});

	$template = localStorage.getItem('ipb_RichPostTemplate');

	if ($template != null && $template.length) {
		jQuery('.post_templates').text($template);
	}
}

if (document.body.className.indexOf('ipsApp') > -1) {
	runInJQuery(main.toString() + ';main();');
}