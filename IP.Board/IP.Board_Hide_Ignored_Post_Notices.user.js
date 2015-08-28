// ==UserScript==
// @name	IP.Board - Hide Ignored Post Notices
// @namespace	Makaze
// @description	Hides notices that a post has been ignored in threads and thread summaries.
// @include	*
// @grant	none
// @version	1.0.0
// ==/UserScript==

var MakazeScriptStyles,
styleElem;

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
}