// ==UserScript==
// @name	XenForo - Plaintext BBCode
// @namespace	Makaze
// @description	Adds BBCode buttons to Plaintext Mode on XenForo.
// @include	*
// @grant	none
// @version	1.0.5
// ==/UserScript==

var MakazeScriptStyles,
styleElem,
BUTTONS,
i = 0;

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

function createElement(type, callback) {
	var element = document.createElement(type);

	callback(element);

	return element;
}

function selectRange(elem, start, end) {
	var range;

	if (elem.setSelectionRange) {
		elem.focus();
		elem.setSelectionRange(start, end);
	} else if (elem.createTextRange) {
		range = elem.createTextRange();
		range.collapse(true);
		range.moveEnd('character', end);
		range.moveStart('character', start);
		range.select();
	}
}

function getSelection(elem) {
	var start = elem.selectionStart,
	end = elem.selectionEnd,
	selectedText = elem.value.substring(start, end);

	return selectedText;
}

function wrapText(elementSelector, openTag, closeTag, contentField) {
	var textArea = elementSelector,
	before = textArea.value,
	len = textArea.value.length,
	start = textArea.selectionStart,
	end = textArea.selectionEnd,
	selectedText = textArea.value.substring(start, end),
	replacement;
	if (contentField != null) {
		replacement = openTag + contentField.value + closeTag;
	} else {
		replacement = openTag + selectedText + closeTag;
	}
	if (document.execCommand) {
		textArea.focus();
		document.execCommand('insertText', false, replacement);
	} else {
		textArea.value = textArea.value.substring(0, start) + replacement + textArea.value.substring(end, len);
	}
	if (before === textArea.value) {
		textArea.value = textArea.value.substring(0, start) + replacement + textArea.value.substring(end, len);
	}
	selectRange(textArea, start + openTag.length, start + replacement.length - closeTag.length);
}

function fade(elem, type, speed) {
	function defaultStyle(tag) {
		var defaultStyles = {},
		testElem = document.createElement(tag),
		getStyle = 'getComputedStyle' in window,
		styles;

		document.body.appendChild(testElem);

		styles = (getStyle) ? window.getComputedStyle(testElem) : testElem.currentStyle;

		for (var prop in styles) {
			defaultStyles[prop] = styles[prop];
		}

		document.body.removeChild(testElem);

		return defaultStyles;
	}

	var defaults = defaultStyle(elem.tagName),
	defaultOpacity,
	defaultDisplay,
	currentDisplay = (elem.style.display.length) ? elem.style.display : window.getComputedStyle(elem).display;

	if (elem.style.display.length) {
		elem.style.display = '';
	}

	defaultDisplay = (window.getComputedStyle(elem).display === 'none') ? defaults.display : window.getComputedStyle(elem).display;

	elem.style.display = currentDisplay;

	if (elem.style.display.length) {
		elem.style.opacity = '';
	}

	defaultOpacity = (window.getComputedStyle(elem).opacity === '0') ? defaults.opacity : window.getComputedStyle(elem).opacity;

	elem.style.opacity = 0;

	// Default values:

	switch (arguments.length) {
		case 1:
			type = 'toggle';
		case 2:
			speed = 300;
		break;
	}

	switch (type) {
		case 'in':
			elem.style.display = defaultDisplay;
			setTimeout(function() {
				elem.style.transition = 'all ' + speed + 'ms ease-in-out';
				elem.style.opacity = defaultOpacity;
				setTimeout(function() {
					elem.style.transition = '';
				}, speed + 10);
			}, 0);
		break;
		case 'out':
			elem.style.transition = 'none';
			elem.style.opacity = defaultOpacity;
			elem.style.transition = 'all ' + speed + 'ms ease-in-out';
			elem.style.opacity = 0;
			setTimeout(function() {
				elem.style.display = 'none';
				elem.style.transition = '';
				elem.style.opacity = '';
			}, speed + 10);
		break;
		case 'toggle':
		default:
			if (currentDisplay === 'none') {
				elem.style.display = defaultDisplay;
				setTimeout(function() {
					elem.style.transition = 'all ' + speed + 'ms ease-in-out';
					elem.style.opacity = defaultOpacity;
					setTimeout(function() {
						elem.style.transition = '';
					}, speed + 10);
				}, 0);
			} else {
				elem.style.transition = 'none';
				elem.style.opacity = defaultOpacity;
				elem.style.transition = 'all ' + speed + 'ms ease-in-out';
				elem.style.opacity = 0;
				setTimeout(function() {
					elem.style.display = 'none';
					elem.style.transition = '';
					elem.style.opacity = '';
				}, speed + 10);
			}
	}
}

function addButton(field, button) {
	var plainBBCodeRequest = function() {
		if (getSelection(field).match(/^https?:\/\//)) {
			wrapText(field, '[' + button.key + ']', '[/' + button.key + ']');
		} else {
			document.body.appendChild(createElement('div', function(bg) {
				bg.id = 'plainBBCodeRequest-background';
				bg.onclick = function() {
					fade(document.getElementById('plainBBCodeRequest'), 'out');
					fade(document.getElementById('plainBBCodeRequest-background'), 'out');

					setTimeout(function() {
						document.getElementById('plainBBCodeRequest').remove();
						document.getElementById('plainBBCodeRequest-background').remove();
					}, 310);
				};
			}));

			document.body.appendChild(createElement('div', function(req) {
				req.className = 'xenOverlay';
				req.id = 'plainBBCodeRequest';

				req.appendChild(createElement('div', function(overlay) {
					overlay.className = 'formOverlay xenForm';

					overlay.appendChild(createElement('div', function(close) {
						close.className = 'plainBBCodeRequest_close';
						close.id = 'redactor_modal_close';
						close.appendChild(document.createTextNode('×'));

						close.onclick = function() {
							fade(document.getElementById('plainBBCodeRequest'), 'out');
							fade(document.getElementById('plainBBCodeRequest-background'), 'out');

							setTimeout(function() {
								document.getElementById('plainBBCodeRequest').remove();
								document.getElementById('plainBBCodeRequest-background').remove();
							}, 310);
						};
					}));

					overlay.appendChild(createElement('div', function(heading) {
						heading.className = 'heading';
						heading.appendChild(document.createTextNode(button.type));
					}));

					overlay.appendChild(createElement('div', function(inner) {
						inner.appendChild(createElement('div', function(fieldcont) {
							fieldcont.appendChild(createElement('dl', function(field) {
								field.className = 'ctrlUnit';
								field.appendChild(createElement('dt', function(desc) {
									desc.className = 'descField';
									desc.appendChild(document.createTextNode(button.desc + ':'));
								}));

								field.appendChild(createElement('dd', function(dd) {
									dd.appendChild(createElement('input', function(input) {
										input.type = 'text';
										input.className = 'textCtrl';
										input.id = 'plainBBCode_contentField';
									}));
								}));
							}));
						}));

						inner.appendChild(createElement('dl', function(footer) {
							footer.className = 'ctrlUnit submitUnit';
							footer.appendChild(createElement('dt', function() {}));

							footer.appendChild(createElement('dd', function(dd) {
								dd.appendChild(createElement('input', function(insert) {
									insert.type = 'button';
									insert.className = 'redactor_modal_btn button primary';
									insert.value = 'Insert';
									insert.style.marginRight = '5px';

									insert.onclick = function() {
										switch(button.key) {
											case 'URL':
												wrapText(field, '[' + button.key + '=' + document.getElementById('plainBBCode_contentField').value + ']', '[/' + button.key + ']');
											break;
											case 'IMG':
												wrapText(field, '[' + button.key + ']' + document.getElementById('plainBBCode_contentField').value + '[/' + button.key + ']', '');
											break;
										}

										fade(document.getElementById('plainBBCodeRequest'), 'out');
										fade(document.getElementById('plainBBCodeRequest-background'), 'out');

										setTimeout(function() {
											document.getElementById('plainBBCodeRequest').remove();
											document.getElementById('plainBBCodeRequest-background').remove();
										}, 310);
									};
								}));

								dd.appendChild(createElement('a', function(cancel) {
									cancel.className = 'redactor_modal_btn button';
									cancel.appendChild(document.createTextNode('Cancel'));

									cancel.onclick = function() {
										fade(document.getElementById('plainBBCodeRequest'), 'out');
										fade(document.getElementById('plainBBCodeRequest-background'), 'out');

										setTimeout(function() {
											document.getElementById('plainBBCodeRequest').remove();
											document.getElementById('plainBBCodeRequest-background').remove();
										}, 310);
									};
								}));
							}));
						}));
					}));
				}));
			}));

			fade(document.getElementById('plainBBCodeRequest-background'), 'in');
			fade(document.getElementById('plainBBCodeRequest'), 'in');

			document.getElementById('plainBBCode_contentField').focus();

			document.getElementById('plainBBCodeRequest').style.marginTop = '-' + (document.getElementById('plainBBCodeRequest').offsetHeight / 2) + 'px';
		}
	},

	buttonHandler = function() {
		wrapText(field, button.open, button.close);
	};

	return createElement('a', function(link) {
		link.className = "plainBBCodeButton button";
		link.href = 'javascript:void(0)';
		link.innerHTML = button.title;
		link.title = button.hover;

		link.onclick = (button.hasOwnProperty('request')) ? plainBBCodeRequest : buttonHandler;
	});
}

if (document.documentElement.id === 'XenForo') {
	BUTTONS = [
		{ 'title': '<strong>B</strong>', 'hover': 'Bold', 'open': '[B]', 'close': '[/B]', 'comment': true },
		{ 'title': '<em>I</em>', 'hover': 'Italic', 'open': '[I]', 'close': '[/I]', 'comment': true },
		{ 'title': '<span style="text-decoration: underline;">U</span>', 'hover': 'Underline', 'open': '[U]', 'close': '[/U]', 'comment': true },
		{ 'title': '<span style="text-decoration: line-through;">S</span>', 'hover': 'Strike-through', 'open': '[S]', 'close': '[/S]', 'comment': true },
		{ 'title': 'Size', 'hover': 'Change font size', 'open': '[SIZE=3]', 'close': '[/SIZE]', 'comment': false },
		{ 'title': 'Font', 'hover': 'Change font face', 'open': '[FONT=Arial]', 'close': '[/FONT]', 'comment': false },
		{ 'title': 'Color', 'hover': 'Change font color', 'open': '[COLOR=#000000]', 'close': '[/COLOR]', 'comment': false },
		{ 'title': 'URL', 'hover': 'Insert a link', 'request': true, 'type': 'Link', 'key': 'URL', 'desc': 'URL', 'comment': true },
		{ 'title': 'IMG', 'hover': 'Insert an image', 'request': true, 'type': 'Image', 'key': 'IMG', 'desc': 'URL', 'comment': false },
		{ 'title': 'Quote', 'hover': 'Insert a quote', 'open': '[QUOTE]', 'close': '[/QUOTE]', 'comment': false },
		{ 'title': 'Code', 'hover': 'Insert a code block', 'open': '[CODE]', 'close': '[/CODE]', 'comment': false },
		{ 'title': 'List (*)', 'hover': 'Create an unordered list', 'open': '[LIST]\n[*]', 'close': '\n[/LIST]', 'comment': false },
		{ 'title': 'List (#)', 'hover': 'Create an ordered list', 'open': '[LIST=1]\n[*]', 'close': '\n[/LIST]', 'comment': false },
		{ 'title': 'Indent', 'hover': 'Indent text', 'open': '[INDENT=1]', 'close': '[/INDENT]', 'comment': false },
		{ 'title': 'Right', 'hover': 'Align text to the right', 'open': '[RIGHT]', 'close': '[/RIGHT]', 'comment': false },
		{ 'title': 'Justify', 'hover': 'Justify text', 'open': '[JUSTIFY]', 'close': '[/JUSTIFY]', 'comment': false },
		{ 'title': 'Center', 'hover': 'Align text to the center', 'open': '[CENTER]', 'close': '[/CENTER]', 'comment': false },
		{ 'title': 'Spoiler', 'hover': 'Hide content until clicked', 'open': '[SPOILER]', 'close': '[/SPOILER]', 'comment': false }
	];

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
		'#plainBBCodeRequest-background {\n' +
			'position: fixed;\n' +
			'margin: auto;\n' +
			'top: 0;\n' +
			'left: 0;\n' +
			'width: 100%;\n' +
			'height: 100%;\n' +
			'z-index: 99999998;\n' +
			'opacity: 0.6;\n' +
			'filter: alpha(opacity=\'60\');\n' +
			'background-color: rgb(0, 0, 0);\n' +
			'display: none;\n' +
		'}\n\n' +

		'#plainBBCodeRequest {\n' +
			'position: fixed;\n' +
			'left: 50%;\n' +
			'width: 600px;\n' +
			'margin-left: -300px;\n' +
			'top: 50%;\n' +
			'height: auto;\n' +
			'z-index: 99999999;\n' +
			'display: none;\n' +
		'}\n\n' +

		'.plainBBCodeButton {\n' +
			'font-weight: normal;\n' +
			'font-family: Consolas, Ubuntu Mono, monospace;\n' +
			'font-size: 90%;\n' +
		'}\n\n' +

		'.plainBBCodeButton strong {\n' +
			'font-weight: bolder;\n' +
		'}\n\n' +

		'.plainBBCodeButton em {\n' +
			'font-style: italic;\n' +
		'}\n\n' +

		'.plainBBCodeContainer {\n' +
			'display: none;\n' +
		'}';

	for (i = 0; i < document.head.getElementsByTagName('link').length; i++) {
		if (document.head.getElementsByTagName('link')[i].getAttribute('href').substr(0, 12) === 'css.php?css=') {
			document.head.getElementsByTagName('link')[i].parentNode.insertBefore(createElement('link', function(css) {
				css.rel = 'stylesheet';
				css.setAttribute('href',
					document.head.getElementsByTagName('link')[i].getAttribute('href').substr(0, 12) + 'editor_ui,' + document.head.getElementsByTagName('link')[i].getAttribute('href').slice(12)
				);
			}), document.head.getElementsByTagName('link')[i].nextSibling);
			break;
		}
	}

	var initBBCodeHandler = function(event) {
		var parent,
		comment = false;

		if (!event.target.tagName || event.target.tagName !== 'TEXTAREA') {
			return false;
		}

		if (Classes.hasClass(event.target, 'textCtrl')) {
			if (Classes.hasClass(event.target, 'MessageEditor') || Classes.hasClass(event.target.parentNode, 'bbCodeEditorContainer') || Classes.hasClass(event.target.parentNode.parentNode, 'comment') || Classes.hasClass(event.target.parentNode.parentNode, 'profilePoster')) {
				parent = event.target.parentNode;

				if (parent.getElementsByClassName('plainBBCodeContainer')[0] != null) {
					return false;
				}

				parent.insertBefore(createElement('div', function(bbcodecontainer) {
					bbcodecontainer.className = 'plainBBCodeContainer';

					if (Classes.hasClass(event.target.parentNode.parentNode, 'comment') || Classes.hasClass(event.target.parentNode.parentNode, 'profilePoster')) {
						comment = true;
					}

					for (i = 0; i < BUTTONS.length; i++) {
						if (comment) {
							if (BUTTONS[i].comment) {
								bbcodecontainer.appendChild(addButton(event.target, BUTTONS[i]));
							}
						} else {
							bbcodecontainer.appendChild(addButton(event.target, BUTTONS[i]));
						}
					}
				}), parent.getElementsByClassName('textCtrl')[0]);

				fade(parent.getElementsByClassName('plainBBCodeContainer')[0], 'in');
			}
		}
	};

	document.addEventListener('mouseover', initBBCodeHandler, false);

	if (document.getElementById('ctrl_message') != null) {
		document.getElementById('ctrl_message').parentNode.insertBefore(createElement('div', function(bbcodecontainer) {
			bbcodecontainer.className = 'plainBBCodeContainer';

			for (i = 0; i < BUTTONS.length; i++) {
				bbcodecontainer.appendChild(addButton(document.getElementById('ctrl_message'), BUTTONS[i]));
			}
		}), document.getElementById('ctrl_message'));

		fade(document.getElementsByClassName('plainBBCodeContainer')[0], 'in');
	}
}