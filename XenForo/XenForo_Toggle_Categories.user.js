// ==UserScript==
// @name	XenForo - Toggle Categories
// @namespace	Makaze
// @description	Toggle the visibility of categories by clicking the title bar.
// @include	*
// @grant	none
// @version	1.0.1
// ==/UserScript==

function createElement(type, callback) {
	var element = document.createElement(type);

	callback(element);

	return element;
}

function runInGlobal(code) {
	var scripts = document.createElement('script');
	scripts.type = 'text/javascript';
	scripts.id = 'runInGlobal';
	scripts.appendChild(document.createTextNode(
		'(function() { ' + code + '})();' +
		'\n\n' +
		'document.getElementById(\'runInGlobal\').remove();'
	));

	(document.head || document.body || document.documentElement).appendChild(scripts);
}

function toggleCategories() {
	var opts = (localStorage.getItem('MakazeScriptOptions')) ? JSON.parse(localStorage.getItem('MakazeScriptOptions')) : {},
	toggled = (opts.hasOwnProperty('xf_toggled_categories')) ? opts.xf_toggled_categories : {},
	id;

	$('.categoryNodeInfo').each(function() {
		id = this.parentNode.id;

		var symbol = (toggled.hasOwnProperty(id)) ? '+' : '-';

		this.style.cursor = 'pointer';

		$(this).find('.nodeTitle').append(createElement('span', function(toggle) {
			toggle.className = 'toggle';
			toggle.style.float = 'right';
			toggle.style.fontFamily = 'Consolas, monospace';
			toggle.appendChild(document.createTextNode(symbol));
		}));

		if (toggled.hasOwnProperty(id)) {
			$(this).next('.nodeList').slideToggle('medium');
		}

		$(this).find('a:first').on('click', function(event) {
			event.stopPropagation();
		});
	});

	$('.categoryNodeInfo').on('click', function() {
		opts = (localStorage.getItem('MakazeScriptOptions')) ? JSON.parse(localStorage.getItem('MakazeScriptOptions')) : {};
		toggled = (opts.hasOwnProperty('xf_toggled_categories')) ? opts.xf_toggled_categories : {};
		id = this.parentNode.id;

		if (toggled.hasOwnProperty(id)) {
			$(this).find('.toggle').text('-');
			delete toggled[id];
		} else {
			$(this).find('.toggle').text('+');
			toggled[id] = true;
		}

		$(this).next('.nodeList').slideToggle('medium');

		opts.xf_toggled_categories = toggled;

		localStorage.setItem('MakazeScriptOptions', JSON.stringify(opts));
	});
}

if (document.documentElement.id === 'XenForo') {
	if (document.getElementsByClassName('categoryNodeInfo')[0] != null) {
		runInGlobal(
			createElement.toString() +
			toggleCategories.toString() +
			'toggleCategories();'
		);
	}
}