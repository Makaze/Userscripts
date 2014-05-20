// ==UserScript==
// @name	SF Mafia - Disable Post Editing
// @namespace	Makaze
// @description	Disables the post editing button in the mafia subforum.
// @include	*
// @grant	none
// @version	1.0.2
// ==/UserScript==

var mafia_flag = false,
edits,
breadcrumbs,
i = 0;

function createElement(type, callback) {
	var element = document.createElement(type);

	callback(element);

	return element;
}

if (document.body.id === 'ipboard_body' && document.getElementsByClassName('breadcrumb')[0] != null) {
	for (i = 0, breadcrumbs = document.getElementsByClassName('breadcrumb')[0].getElementsByTagName('span'); i < breadcrumbs.length; i++) {
		if (breadcrumbs[i].textContent.trim() === 'Mafia') {
			mafia_flag = true;
			break;
		}
	}

	if (mafia_flag) {
		document.getElementsByTagName('head')[0].appendChild(createElement('style', function(style) {
			style.type = 'text/css';
			style.appendChild(document.createTextNode(
				'.post_edit {\n' +
					'display: none ! important;\n' +
				'}'
			));
		}));
	}
}