// ==UserScript==
// @name	Facebook - Content Warning Generator
// @namespace	Makaze
// @description	Adds a content warning generator dropdown for posts.
// @include	*facebook.com/*
// @grant	none
// @version	1.0.1
// ==/UserScript==

var prefixes = [
	'TW:',
	'CW:',
	'Trigger warning:',
	'Content warning:',
	'Spoiler:',
	'NSFW'
],
warnings = [
	'abuse',
	'alcohol',
	'blood',
	'drugs',
	'gore',
	'homophobia',
	'imprisonment',
	'incest',
	'misogyny',
	'pedophilia',
	'racism',
	'rape',
	'sexual assault',
	'slurs',
	'transmisogyny',
	'transphobia',
	'violence',
	'weapons'
],

// EDITING NOT RECOMMENDED BELOW THIS POINT

MakazeScriptStyles,
styleElem,
fields,
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

function createElement(type, callback) {
	var element = document.createElement(type);

	callback(element);

	return element;
}

function trigger(element, event) {
	if (element != null) {
		if (element.fireEvent) {
			element.fireEvent('on' + event);
		} else {
			var evObj = document.createEvent('Events');
			evObj.initEvent(event, true, false);
			element.dispatchEvent(evObj);
		}
	}
}

function selectOption(name) {
	return createElement('option', function(opt) {
		opt.value = name;
		opt.appendChild(document.createTextNode(name));
	});
}

function checkboxOption(name) {
	var changeHandler = function() {
		var check = this;

		if (check.checked) {
			Classes.addClass(check.parentNode, 'selected');
		} else {
			Classes.removeClass(check.parentNode, 'selected');
		}
	},
	clickHandler = function() {
		var check = this.getElementsByTagName('input')[0];

		check.checked = !check.checked;

		trigger(check, 'change');
	};

	return createElement('span', function(span) {
		span.className = 'CWCheckbox';

		span.appendChild(createElement('input', function(check) {
			check.type = 'checkbox';
			check.value = name;

			check.onchange = changeHandler;
			check.onclick = function(event) {
				event.stopPropagation();
			};
		}));

		span.appendChild(document.createTextNode(' ' + name));

		span.onclick = clickHandler;
	});
}

function arrow(field) {
	var prev = field.getElementsByTagName('li')[0];

	field.appendChild(createElement('li', function(arrow) {
		arrow.className = 'CWDropArrow';
		arrow.style.height = prev.offsetHeight + 'px';
		arrow.style.lineHeight = prev.offsetHeight + 'px';

		arrow.title = 'Content Warning';

		arrow.appendChild(createElement('div', function(button) {
			button.className = 'arrow';
		}));

		arrow.onclick = function() {
			Classes.toggleClass(this.parentNode.parentNode.getElementsByClassName('CWDropContainer')[0], 'CWDropDown');
		};
	}));

	field.parentNode.insertBefore(createElement('div', function(cont) {
		cont.className = 'CWDropContainer';

		cont.appendChild(createElement('div', function(dropcont) {
			dropcont.className = 'uiList _1dsl _509- _4ki _6-h _6-j _6-i CWDropSection';

			dropcont.appendChild(createElement('select', function(sel) {
				sel.className = 'CWTypeDropdown';

				for (i = 0; i < prefixes.length; i++) {
					sel.appendChild(selectOption(prefixes[i]));
				}

				sel.onchange = function() {
					switch (this.options[this.selectedIndex].value) {
						case 'TW:':
						case 'Trigger warning:':
						case 'CW:':
						case 'Content warning:':
							Classes.removeClass(this.parentNode.nextSibling, 'CWDropUp');
						break;
						default:
							Classes.addClass(this.parentNode.nextSibling, 'CWDropUp');
					}
				};
			}));
		}));

		cont.appendChild(createElement('div', function(subcont) {
			subcont.className = 'CWCheckboxes CWDropDown';

			subcont.appendChild(createElement('div', function(dropcont) {
				dropcont.className = 'uiList _1dsl _509- _4ki _6-h _6-j _6-i CWDropSection';

				for (i = 0; i < warnings.length; i++) {
					dropcont.appendChild(checkboxOption(warnings[i]));
				}
			}));
		}));

		cont.appendChild(createElement('div', function(dropcont) {
			dropcont.className = 'uiList _1dsl _509- _4ki _6-h _6-j _6-i CWDropSection';

			dropcont.appendChild(createElement('span', function(span) {
				span.className = 'CWInput CWCustomInput';

				span.appendChild(createElement('textarea', function(text) {
					text.placeholder = 'Custom text (can be left blank)';
				}));
			}));
		}));

		cont.appendChild(createElement('div', function(dropcont) {
			dropcont.className = 'uiList _1dsl _509- _4ki _6-h _6-j _6-i CWDropSection';
			dropcont.style.border = 'none';

			var changeHandler = function() {
				var check = this;

				if (check.checked) {
					Classes.addClass(check.parentNode, 'selected');
				} else {
					Classes.removeClass(check.parentNode, 'selected');
				}
			},
			clickHandler = function() {
				var check = this.getElementsByTagName('input')[0];

				check.checked = !check.checked;

				trigger(check, 'change');
			};

			dropcont.appendChild(createElement('span', function(span) {
				span.className = 'CWCheckbox selected CWSpacerBox';

				span.appendChild(createElement('input', function(check) {
					check.type = 'checkbox';
					check.value = 'spacer';
					check.checked = true;

					check.onchange = changeHandler;
					check.onclick = function(event) {
						event.stopPropagation();
					};
				}));

				span.appendChild(document.createTextNode(' Force "Show More"'));

				span.onclick = clickHandler;
			}));
		}));

		cont.appendChild(createElement('div', function(dropcont) {
			dropcont.className = 'uiList _1dsl _509- _4ki _6-h _6-j _6-i CWDropSection CWDropFooter';

			dropcont.appendChild(createElement('a', function(save) {
				save.className = '_42ft _4jy0 _4jy4 _517h _51sy';
				save.setAttribute('role', 'button');
				save.appendChild(document.createTextNode('Prepend'));

				save.onclick = function() {
					var context = this.parentNode.parentNode,
					type = context.getElementsByClassName('CWTypeDropdown')[0].options[context.getElementsByClassName('CWTypeDropdown')[0].selectedIndex].value,
					boxes = [],
					custom = context.getElementsByClassName('CWCustomInput')[0].getElementsByTagName('textarea')[0].value,
					force = context.getElementsByClassName('CWSpacerBox')[0].getElementsByTagName('input')[0].checked,
					field,
					items,
					output,
					lines,
					i = 0;

					switch (type) {
						case 'TW:':
						case 'Trigger warning:':
						case 'CW:':
						case 'Content warning:':
							for (i = 0, items = context.getElementsByClassName('CWCheckboxes')[0].getElementsByTagName('input'); i < items.length; i++) {
								if (items[i].checked) {
									boxes.push(items[i].value);
								}
							}
						break;
					}

					output = type + ' ';

					if (boxes.length) {
						output += boxes.join(', ') + '. ';
					}

					output += custom;
					lines = 6 - output.split(/\n/).length;

					if (force) {
						for (i = 0; i < lines; i++) {
							output += '\n.';
						}
					}

					output += '\n';

					field = context;

					while (field.getElementsByClassName('uiTextareaAutogrow')[0] == null) {
						field = field.parentNode;
					}

					field = field.getElementsByClassName('uiTextareaAutogrow')[0];

					field.value = output + field.value;

					field.focus();

					Classes.toggleClass(context, 'CWDropDown');
				};
			}));
		}));
	}), field.nextSibling);
}


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
	'.CWDropArrow {\n' +
		'cursor: pointer;\n' +
	'}\n\n' +

	'.CWDropArrow .arrow {\n' +
		'border: 5px solid transparent;\n' +
		'border-top: 5px solid #888 ! important;\n' +
		'display: inline-block;\n' +
		'vertical-align: middle;\n' +
		'margin-bottom: -2.5px;\n' +
	'}\n\n' +

	'.CWDropContainer {\n' +
		'color: #555;\n' +
		'transition: all .3s ease-in-out;\n' +
		'overflow: hidden;\n' +
		'max-height: 0px;\n' +
		'opacity: 0;\n' +
	'}\n\n' +

	'.CWDropDown {\n' +
	 	'max-height: 10000px;\n' +
		'opacity: 1;\n' +
		'overflow: hidden;\n' +
		'transition: all .3s ease-in-out;\n' +
	'}\n\n' +

	'.CWDropUp {\n' +
	 	'max-height: 0px ! important;\n' +
		'opacity: 0 ! important;\n' +
		'overflow: hidden ! important;\n' +
	'}\n\n' +

	'.CWDropContainer *, .CWDropArrow {\n' +
		'vertical-align: middle;\n' +
		'transition: all .2s ease-in-out;\n' +
	'}\n\n' +

	'.CWDropSection {\n' +
		'height: auto ! important;\n' +
		'padding: 10px 0px 8px 12px ! important;\n' +
	'}\n\n' +

	'.CWCheckbox {\n' +
		'display: inline-block;\n' +
		'margin: 0px 5px 5px 0px;\n' +
		'padding: 3px 5px;\n' +
		'background-color: #fafafa;\n' +
		'border-radius: 2px;\n' +
		'border: 1px solid #eee;\n' +
		'cursor: pointer;\n' +
	'}\n\n' +

	'.CWCheckbox.selected {\n' +
		'background-color: #f5f5ff;\n' +
		'border: 1px solid #bbf;\n' +
		'box-shadow: 0px 0px 2px #bbf;\n' +
	'}\n\n' +

	'.CWCheckbox input[type=checkbox] {\n' +
		'margin: 0;\n' +
	'}\n\n' +

	'.CWCustomInput textarea {\n' +
		'width: 100%;\n' +
		'resize: none;\n' +
		'box-sizing: border-box;\n' +
	'}\n\n' +

	'.CWDropFooter {\n' +
		'padding-top: 0 ! important;\n' +
	'}';

timer = setInterval(function() {
	for (i = 0, fields = document.getElementsByClassName('_1dsl'); i < fields.length; i++) {
		if (!fields[i].hasAttribute('contentWarningArrow')) {
			fields[i].setAttribute('contentWarningArrow', '');
			
			if (!isChildOf('.fbTimelineStickyHeader', fields[i])) {
				arrow(fields[i]);
			}
		}
	}
}, 500);