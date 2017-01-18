// ==UserScript==
// @name	IP.Board - Expand on Click
// @namespace	Makaze
// @description	Makes Expanded view on Unread Content behave like Condensed view until items are clicked, revealing expanded content.
// @include	*
// @grant	none
// @version	1.0.0
// ==/UserScript==

var MakazeScriptStyles,
styleElem;

function createElement(type, callback) {
	var element = document.createElement(type);

	callback(element);

	return element;
}

function runInJQuery(code) {
	document.body.appendChild(createElement('script', function(jQ) {
		jQ.type = 'text/javascript';
		jQ.src = 'https://code.jquery.com/jquery-2.1.3.min.js';

		jQ.onload = function() {
			document.body.appendChild(createElement('script', function(content) {
				content.appendChild(document.createTextNode('jQuery.noConflict();' + code));
			}));
		};
	}));
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
		'.ipsStream.ipsStream_withTimeline .ipsStreamItem_snippet.ipsType_break {\n' +
			'display: none;\n' +
		'}';

	jQuery('.ipsStream.ipsStream_withTimeline').on('click', 'li.ipsStreamItem', function() {
		jQuery(this).find('.ipsStreamItem_snippet.ipsType_break').slideToggle('fast');
	});
}

if (document.body.className.indexOf('ipsApp') > -1) {
	runInJQuery(main.toString() + ';main();');
}