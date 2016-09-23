// ==UserScript==
// @name	Tumblr - Custom Shortcuts
// @namespace	Makaze
// @description	Adds custom shortcuts to the Tumblr Editor.
// @include	*www.tumblr.com/*
// @grant	none
// @version	1.6.0
// ==/UserScript==

function getSelectedHTML(win) {
	var html,
	sel,
	container;
	
	if (typeof win.getSelection != "undefined") {
		sel = win.getSelection();
		if (sel.rangeCount) {
			container = win.document.createElement("div");
			for (var i = 0, len = sel.rangeCount; i < len; ++i) {
				container.appendChild(sel.getRangeAt(i).cloneContents());
			}
			html = container.innerHTML;
		}
	} else if (typeof win.document.selection != "undefined") {
		if (win.document.selection.type == "Text") {
			html = win.document.selection.createRange().htmlText;
		}
	}
	
	return html;
}

function wrapHTML(context, open, close) {
	var selection = getSelectedHTML(window),
	index = context.innerHTML.indexOf(selection);

	if (index > -1) {
		context.innerHTML =
			context.innerHTML.substr(0, index) +
			open + selection + close +
			context.innerHTML.substr(index + selection.length, context.innerHTML.length);
	} else {
		return false;
	}
}

var addShortcutHandler = function(event) {
	var bindTo;

	var shortcutHandler = function(event) {
		if (event.altKey && event.shiftKey && event.keyCode === 83) {
			wrapHTML(bindTo, '<small>', '</small>');
		}
	};

	if (!event.target.className || event.target.className.indexOf('editor-richtext') < 0) {
		return false;
	}

	if (event.target.hasAttribute('custom-shortcuts')) {
		return false;
	}

	bindTo = event.target;

	bindTo.addEventListener('keydown', shortcutHandler, false);

	event.target.setAttribute('custom-shortcuts', '');
};

document.addEventListener('mouseover', addShortcutHandler, false);