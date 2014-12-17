// ==UserScript==
// @name	Tumblr - Custom Shortcuts
// @namespace	Makaze
// @description	Adds custom shortcuts to the Tumblr Editor.
// @include	*www.tumblr.com/*
// @grant	none
// @version	1.5.0
// ==/UserScript==

// Classes constructor

function ClassHandler() {
	var self = this;

	this.classList = function(elem) {
		return elem.className.trim().split(/[\b\s]/);
	};

	this.hasClass = function(elem, className) {
		var classes = self.classList(elem),
		has = false,
		i = 0;

		for (i = 0; i < classes.length; i++) {
			if (classes[i] === className) {
				has = true;
				break;
			}
		}

		return (has);
	};

	this.addClass = function(elem, className) {
		var classes;

		if (!self.hasClass(elem, className)) {
			classes = self.classList(elem);
			classes.push(className);
			elem.className = classes.join(' ').trim();
		}

		return self;
	};

	this.removeClass = function(elem, className) {
		var classes = self.classList(elem),
		i = 0;

		for (i = 0; i < classes.length; i++) {
			if (classes[i] === className) {
				classes.splice(i, 1);
			}
		}

		elem.className = classes.join(' ').trim();

		return self;
	};

	this.toggleClass = function(elem, className) {
		var classes;

		if (self.hasClass(elem, className)) {
			self.removeClass(elem, className);
		} else {
			classes = self.classList(elem);
			classes.push(className);
			elem.className = classes.join(' ').trim();
		}

		return self;
	};
}

// Initilize

var Classes = new ClassHandler();

// End Classes constructor

function isChildOf(selector, element) {
	switch (selector.charAt(0)) {
		case '.':
			if (document.getElementsByClassName(selector.slice(1))[0] == null) {
				return false;
			}

			while (element.getElementsByClassName(selector.slice(1))[0] == null && element.parentNode) {
				if (Classes.hasClass(element, selector.slice(1))) {
					return true;
				}
				element = element.parentNode;
			}
		break;
		case '#':
			if (document.getElementById(selector.slice(1)) == null) {
				return false;
			}

			while (element.parentNode) {
				if (element.id === selector.slice(1)) {
					return true;
				}
				element = element.parentNode;
			}
		break;
		default:
			if (document.getElementsByTagName(selector)[0] == null) {
				return false;
			}

			while (element.getElementsByTagName(selector) == null && element.parentNode) {
				if (element.tagName === selector.toUpperCase()) {
					return true;
				}
				element = element.parentNode;
			}
	}
	return false;
}

function getParent(selector, element) {
	switch (selector.charAt(0)) {
		case '.':
			if (document.getElementsByClassName(selector.slice(1))[0] == null) {
				return false;
			}

			while (element.getElementsByClassName(selector.slice(1))[0] == null && element.parentNode) {
				if (Classes.hasClass(element, selector.slice(1))) {
					return element;
				}
				element = element.parentNode;
			}
		break;
		case '#':
			if (document.getElementById(selector.slice(1)) == null) {
				return false;
			}

			while (element.parentNode) {
				if (element.id === selector.slice(1)) {
					return element;
				}
				element = element.parentNode;
			}
		break;
		default:
			if (document.getElementsByTagName(selector)[0] == null) {
				return false;
			}

			while (element.getElementsByTagName(selector) == null && element.parentNode) {
				if (element.tagName === selector.toUpperCase()) {
					return element;
				}
				element = element.parentNode;
			}
	}
}

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
	var win = context.getElementsByClassName('mceIframeContainer')[0].getElementsByTagName('iframe')[0].contentWindow,
	body = win.document.getElementById('tinymce'),
	selection = getSelectedHTML(win),
	index = body.innerHTML.indexOf(selection);

	if (index > -1) {
		body.innerHTML =
			body.innerHTML.substr(0, index) +
			open + selection + close +
			body.innerHTML.substr(index + selection.length, body.innerHTML.length);
	} else {
		return false;
	}
}

var addButtonHandler = function(event) {
	var context,
	bindTo;

	var shortcutHandler = function(event) {
		if (event.altKey && event.shiftKey && event.keyCode === 83) {
			wrapHTML(context, '<small>', '</small>');
		}
	};

	if (!event.target.tagName || event.target.tagName !== 'IFRAME') {
		return false;
	}

	if (event.target.hasAttribute('custombuttons')) {
		return false;
	}

	if (isChildOf('.mceEditor', event.target)) {
		context = getParent('.mceEditor', event.target);
	} else {
		return false;
	}

	bindTo = context.getElementsByTagName('iframe')[0].contentWindow.document;

	bindTo.addEventListener('keydown', shortcutHandler, false);

	event.target.setAttribute('custombuttons', '');
};


document.addEventListener('mouseover', addButtonHandler, false);