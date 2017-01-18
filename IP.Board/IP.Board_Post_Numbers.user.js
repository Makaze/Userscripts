// ==UserScript==
// @name	IP.Board - Post Numbers
// @namespace	Makaze
// @description	Replaces the "Share post" icon with the post number.
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
	var page = 1;

	setInterval(function() {
		jQuery('.cPost').each(function(event) {
			var $self = jQuery(this),
			shareLink = $self.find('[data-role="shareComment"]'),
			postNumber;

			if (jQuery('.ipsPagination_active').length) {
				page = parseInt(jQuery('.ipsPagination_active > a').data('page'));
			}

			postNumber = ((page - 1) * 25) + (parseInt(jQuery('.cPost').index($self)) + 1);

			if (shareLink.text().indexOf('#') < 0) {
				shareLink.text('#' + postNumber);
			}
		});
	}, 500);
}

if (document.body.className.indexOf('ipsApp') > -1) {
	runInJQuery(createElement.toString() + main.toString() + ';main();');
}