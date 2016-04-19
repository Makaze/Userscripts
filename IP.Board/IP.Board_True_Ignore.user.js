// ==UserScript==
// @name	IP.Board - True Ignore
// @namespace	Makaze
// @description	Also blocks users' quotes and post previews when you have them on ignore.
// @include	*
// @grant	none
// @version	1.0.0
// ==/UserScript==

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
	var $block_content = jQuery('<div id="block-content"/>').css({
		'display': 'none'
	}).appendTo('body'),
	blocked = [];

	$block_content.load('/forums/index.php?app=core&module=usercp&tab=core&area=ignoredusers&do=show&st= [summary="Ignore Preferences"]', function() {
		$block_content.find('tr').each(function() {
			if (jQuery(this).find('td.short:first').text().indexOf('Hide') > -1) {
				blocked.push(jQuery(this).find('td:first strong:first').text().trim());
			}
		});
	});

	setInterval(function() {
		var $quote,
		$preview,
		i = 0;

		for (i = 0; i < blocked.length; i++) {
			$quote = jQuery('.ipsBlockquote[data-author="' + blocked[i] + '"]');
			$quote.prev('.citation').remove();
			$quote.remove();

			$preview = jQuery('.preview_info .name').filter(function() {
				return (jQuery(this).text().trim() == blocked[i]);
			});
			$preview.parents('.preview_col').prev().remove();
			$preview.parents('.preview_col').remove();
		}
	}, 500);
}

runInJQuery(main.toString() + ';main();');