// ==UserScript==
// @name	XenForo - Auto-refresh Users Viewing Thread
// @namespace	Makaze
// @description	Refreshes the 'Users Viewing Thread' field every 10 seconds.
// @include	*
// @grant	none
// @version	1.0.0
// ==/UserScript==

var thread;

function runInGlobal(code) {
	var scripts = document.createElement('script');
	scripts.type = 'text/javascript';
	scripts.id = 'runInGlobal';
	scripts.appendChild(document.createTextNode(
		code + '\n\n' +
		'document.getElementById(\'runInGlobal\').remove();'
	));

	(document.head || document.body || document.documentElement).appendChild(scripts);
}

function main(thread) {
	document.addEventListener('keydown', function(event) {
		if (event.keyCode === 116 && event.shiftKey) {
			event.preventDefault();
			$('.online').load('/threads/' + thread + '/ .online > *', function() {
				$(this).children().fadeTo(50, 0.2).fadeTo(1500, 1, 'easeInOutQuad');
			});
		}
	}, false);

	setInterval(function() {
		var currentstate = document.getElementsByClassName('online')[0].innerHTML;
		$('.online').load('/threads/' + thread + '/ .online > *', function() {
			$(this).children().fadeTo(50, 0.2).fadeTo(1500, 1, 'easeInOutQuad');
			if (currentstate !== document.getElementsByClassName('online')[0].innerHTML) {
				console.log($('.online .footnote').text(), '::', $('.online .listInline').text().replace(/\\s+/g, ' ').trim());
			}
		});
	}, 10000);
}

if (document.documentElement.id === 'XenForo') {
	if (window.location.pathname.substr(1, 7) === 'threads' && document.getElementsByClassName('online')[0] != null) {
		thread = window.location.pathname.match(/\/threads\/.*\.(\d+)/)[1];

		runInGlobal(
			main.toString() +
			"main('" + thread + "');"
		);
	}
}