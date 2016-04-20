// ==UserScript==
// @name	IP.Board - True Ignore
// @namespace	Makaze
// @description	Also blocks users' quotes and post previews when you have them on ignore.
// @include	*
// @grant	none
// @version	1.0.1
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

function hidePreviews() {
	var previewBlocks = document.getElementsByClassName('post_block topic_summary'),
	post,
	i = 0;

	for (i = 0; i < previewBlocks.length; i++) {
		post = previewBlocks[i].getElementsByClassName('post')[0].innerHTML;

		if (post.indexOf('You have chosen to ignore all posts from:') == 0) {
			previewBlocks[i].className += ' post_ignore';
		}
	}
}

if (document.body.id === 'ipboard_body') {
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

	hidePreviews();

	runInJQuery(main.toString() + ';main();');
}