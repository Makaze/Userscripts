// ==UserScript==
// @name	XenForo - Auto-applying Macros
// @namespace	Makaze
// @description	Adds an option to automatically apply XenForo Macros.
// @include	*
// @grant	none
// @version	1.0
// ==/UserScript==

var MakazeScriptStyles,
styleElem,
context,
macros,
macro,
header,
id,
controls,
opts,
auto,
select,
i = 0;

function createElement(type, callback) {
	var element = document.createElement(type);

	callback(element);

	return element;
}

function changeSelect(select, index) {
	select.selectedIndex = index;

	if ("createEvent" in document) {
		var evt = document.createEvent("HTMLEvents");
		evt.initEvent("change", false, true);
		select.dispatchEvent(evt);
	} else {
		select.fireEvent("onchange");
	}
}

function createToggle(macro) {
	return createElement('span', function(cont) {
		cont.appendChild(createElement('a', function(toggle) {
			toggle.className = 'toggleAuto';
			toggle.href = 'javascript:void(0)';

			if (auto && id === auto) {
				toggle.appendChild(document.createTextNode('Do Not Auto-apply Macro'));
			} else {
				toggle.appendChild(document.createTextNode('Auto-apply Macro'));
			}

			toggle.onclick = function() {
				toggleAuto(macro, this.parentNode.parentNode.parentNode);
			};
		}));
	});
}

function createPrefix() {
	return createElement('span', function(prefix) {
		prefix.className = 'macroPrefix';
		prefix.appendChild(document.createTextNode('Auto'));
	});
}

function toggleAuto(macro, context) {
	var header,
	opts = (localStorage.getItem('MakazeScriptOptions')) ? JSON.parse(localStorage.getItem('MakazeScriptOptions')) : {},
	auto = (opts.hasOwnProperty('XenForo_auto_apply_macro')) ? opts.XenForo_auto_apply_macro : false;

	if (document.getElementsByClassName('macroPrefix')[0] != null) {
		document.getElementsByClassName('macroPrefix')[0].remove();
	}

	if (macro === auto) {
		context.getElementsByClassName('toggleAuto')[0].childNodes[0].nodeValue = 'Auto-apply Macro';

		opts.XenForo_auto_apply_macro = false;
		localStorage.setItem('MakazeScriptOptions', JSON.stringify(opts));

		return false;
	} else {
		header = context.getElementsByClassName('nodeTitle')[0];

		header.insertBefore(createElement('span', function(prefix) {
			prefix.className = 'macroPrefix';
			prefix.appendChild(document.createTextNode('Auto'));
		}), header.firstChild);

		context.getElementsByClassName('toggleAuto')[0].childNodes[0].nodeValue = 'Do Not Auto-apply Macro';

		opts.XenForo_auto_apply_macro = macro;
		localStorage.setItem('MakazeScriptOptions', JSON.stringify(opts));
	}
}

if (document.documentElement.id === 'XenForo') {
	opts = (localStorage.getItem('MakazeScriptOptions')) ? JSON.parse(localStorage.getItem('MakazeScriptOptions')) : {};
	auto = (opts.hasOwnProperty('XenForo_auto_apply_macro')) ? opts.XenForo_auto_apply_macro : false;

	if (auto && document.getElementById('macroSelect') != null) {
		select = document.getElementById('macroSelect');
		for (i = 0; i < select.options.length; i++) {
			if (select.options[i].text === auto) {
				changeSelect(document.getElementById('macroSelect'), i);
			}
		}
	}

	if (document.getElementsByClassName('macros')[0] != null) {
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
			'.macroPrefix {\n\n' +
				'padding: 1px 4px;\n' +
				'margin: 0 3px 0 0;\n' +
				'border: 1px solid #222;\n' +
				'font-weight: bolder;\n' +
				'border-radius: 3px;\n' +
				'background-color: #2f2f2f;\n' +
				'box-shadow: 0px 0px 3px #111;\n' +
				'text-transform: uppercase;\n' +
				'text-shadow: 0px 1px #111;\n' +
				'font-family: Consolas, monospace;\n' +
			'}';

		context = document.getElementsByClassName('macros')[0];
		macros = context.getElementsByClassName('sectionMain');

		for (i = 0; i < macros.length; i++) {
			header = macros[i].getElementsByClassName('nodeTitle')[0];
			controls = macros[i].getElementsByClassName('macroControls')[0];
			macro = header.textContent.trim();

			if (auto && macro === auto) {
				header.insertBefore(createPrefix(), header.firstChild);
			}

			controls.appendChild(createToggle(macro));
		}
	}
}