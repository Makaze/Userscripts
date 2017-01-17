// ==UserScript==
// @name	IP.Board - True Ignore
// @namespace	Makaze
// @description	Also blocks users' quotes and post previews when you have them on ignore.
// @include	*
// @grant	none
// @version	2.0.0
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
	var $block_content = jQuery('<div id="block-content"/>').css({
		'display': 'none'
	}).appendTo('body'),
	blocked = [];

	$block_content.load('/forums/index.php?/ignore/ #elIgnoredUsers', function() {
		$block_content.find('li.ipsDataItem').each(function() {
			if (jQuery(this).find('.ipsListInline li:first').text().indexOf('Post') > -1) {
				blocked.push(jQuery(this).find('.ipsDataItem_title').text().trim());
			}
		});
	});

	setInterval(function() {
		var $quote,
		$preview,
		i = 0;

		for (i = 0; i < blocked.length; i++) {
			$quote = jQuery('.ipsQuote[data-ipsquote-username="' + blocked[i] + '"]');
			$quote.remove();
		}
	}, 500);
}

function hidePreviews() {
	jQuery('.ipsComment_ignored').remove();

	setInterval(function() {
		jQuery('.ipsComment_ignored').remove();
	}, 500);
}

if (document.body.className.indexOf('ipsApp') > -1) {
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
		'.post_ignore {\n' +
			'display: none;\n' +
		'}';

	runInJQuery(hidePreviews.toString() +  ';hidePreviews();' + main.toString() + ';main();');
}