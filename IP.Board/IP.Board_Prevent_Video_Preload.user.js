// ==UserScript==
// @name	IP.Board - Prevent Video Preload 
// @namespace	Makaze
// @description	Prevents the browser from pre-downloading embedded videos. 
// @include	*
// @grant	none
// @version	1.0.1
// ==/UserScript==

var MakazeScriptStyles,
styleElem,
i = 0;

function createElement(type, callback) {
	var element = document.createElement(type);

	callback(element);

	return element;
}

function replaceVideo(vid) {
	var j = 0;

	vid.setAttribute('data-src', vid.src);
	vid.removeAttribute('src');

	vid.parentNode.insertBefore(createElement('a', function(a) {
		a.className = 'EmbeddedContentLink';
		a.href = 'javascript:void(0)';
		a.title = 'Click to reveal';

		a.appendChild(createElement('span', function(code) {
			code.className = 'EmbeddedIcon';
			code.appendChild(document.createTextNode('</>'));
		}));

		a.appendChild(document.createTextNode(' Embedded Content'));
		
		a.onclick = function(event) {
			event.target.nextSibling.src = event.target.nextSibling.getAttribute('data-src');

			event.target.nextSibling.style.display = 'block';

			a.remove();
		};
	}), vid);

	vid.style.display = 'none';
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
		'.EmbeddedContentLink {\n' +
			'padding: 5px;\n' +
			'background-color: #f8f8f8;\n' +
			'border-radius: 3px;\n' +
		'}\n\n' +

		'.EmbeddedIcon {\n' +
			'font-family: consolas,monospace;\n' +
			'font-size: 150%;\n' +
			'color: #f24;\n' +
			'font-weight: bold;\n' +
			'text-shadow: 0px 1px #444;\n' +
		'}';

	for (i = 0; i < document.getElementsByTagName('iframe').length; i++) {
		if (document.getElementsByTagName('iframe')[i].className === 'EmbeddedVideo' && !document.getElementsByTagName('iframe')[i].hasAttribute('data-src')) {
			replaceVideo(document.getElementsByTagName('iframe')[i]);
		}
	}

	document.addEventListener('DOMNodeInserted', function(event) {
		var vids = event.target.parentNode.getElementsByTagName('iframe');

		for (i = 0; i < vids.length; i++) {
			if (vids[i].className === 'EmbeddedVideo' && !vids[i].hasAttribute('data-src')) {
				replaceVideo(vids[i]);
			}
		}
	}, false);
}