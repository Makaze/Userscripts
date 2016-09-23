// ==UserScript==
// @name	Tumblr - Inline Queue Button
// @namespace	Makaze
// @description	Adds a Queue button to avoid using the submission dropdown.
// @include	*www.tumblr.com/*
// @grant	none
// @version	1.0.2
// ==/UserScript==

function createElement(type, callback) {
	var element = document.createElement(type);

	callback(element);

	return element;
}

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

function queueButtonHandler(event) {
	var context,
	controls;

	if (!isChildOf('.post-form', event.target)) {
		return false;
	}

	context = getParent('.post-form', event.target);

	if (context.getElementsByClassName('queueButton')[0] != null) {
		return false;
	}

	controls = context.getElementsByClassName('post-form--controls')[0].firstChild;

	function addToQueue(event) {
		if (event.keyCode !== 81 || !event.altKey) {
			return false;
		}

		if (document.getElementById('queue-shortcut') == null) {
			return false;
		}

		var dropButton = document.getElementById('queue-shortcut').parentNode.parentNode.nextSibling.getElementsByClassName('dropdown-area')[0],
		context,
		items,
		item,
		i = 0;

		dropButton.click();

		context = document.getElementsByClassName('popover--save-post-dropdown')[0];

		for (i = 0, items = context.getElementsByClassName('item-option'); i < items.length; i++) {
			item = items[i];
			
			if (item.hasAttribute('data-js-queue')) {
				item.click();
				break;
			}
		}

		dropButton.previousSibling.click();
	}

	controls.insertBefore(createElement('div', function(queueButton) {
		queueButton.className = 'queueButton control right';
		queueButton.appendChild(createElement('div', function(chrome) {
			chrome.className = 'split chrome blue';
			chrome.style.marginRight = '5px';
			chrome.appendChild(createElement('button', function(clickable) {
				clickable.className = "flat-button blue caption create_post_button";
				clickable.id = "queue-shortcut";
				clickable.appendChild(document.createTextNode('Queue'));

				clickable.onclick = function() {
					var dropButton = this.parentNode.parentNode.nextSibling.getElementsByClassName('dropdown-area')[0],
					context,
					items,
					item,
					i = 0;

					dropButton.click();

					context = document.getElementsByClassName('popover--save-post-dropdown')[0];

					for (i = 0, items = context.getElementsByClassName('item-option'); i < items.length; i++) {
						item = items[i];
						
						if (item.hasAttribute('data-js-queue')) {
							item.click();
							break;
						}
					}

					dropButton.previousSibling.click();
				};
			}));
		}));
	}), controls.lastChild);

	document.addEventListener('keydown', addToQueue, false);
}

document.addEventListener('mouseover', queueButtonHandler, false);