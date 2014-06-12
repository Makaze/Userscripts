// ==UserScript==
// @name	XenForo - Post Style
// @namespace	Makaze
// @description	Adds options to apply a predefined style to posts in a variety of ways.
// @include	*
// @grant	none
// @version	5.1.1
// ==/UserScript==

var opts,
autoApply,
richPrefix,
richSuffix,
plainPrefix,
plainSuffix;

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

function getPosition(element) {
	var xPosition = 0,
	yPosition = 0;

	while (element) {
		xPosition += (element.offsetLeft
			+ element.clientLeft);
		yPosition += (element.offsetTop
			+ element.clientTop);
		element = element.offsetParent;
	}
	return {x: xPosition, y: yPosition};
}

Math.easeInOutQuad = function (time, start, change, duration) {
	time /= duration / 2;
	if (time < 1) {
		return change / 2 * time * time + start;
	}
	time--;
	return -change / 2 * (time * (time - 2) - 1) + start;
};

function scrollTo(element, to, duration) {
	var start = element.scrollTop,
	change = to - start,
	currentTime = 0,
	increment = 1;

	var animateScroll = function() {
		var val = Math.easeInOutQuad(currentTime, start, change, duration);
		element.scrollTop = val;
		currentTime += increment;
		if (currentTime <= duration) {
			setTimeout(animateScroll, increment);
		}
	};

	animateScroll();
}

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

function selectRange(elem, start, end) {
	if (elem.setSelectionRange) {
		elem.focus();
		elem.setSelectionRange(start, end);
	} else if (elem.createTextRange) {
		var range = elem.createTextRange();
		range.collapse(true);
		range.moveEnd('character', end);
		range.moveStart('character', start);
		range.select();
	}
}

function wrapText(elementSelector, openTag, closeTag) {
	var textArea = elementSelector,
	len = textArea.value.length,
	start = textArea.selectionStart,
	end = textArea.selectionEnd,
	selectedText = textArea.value.substring(start, end),
	replacement,
	paste = document.createEvent('TextEvent');
	replacement = openTag + selectedText + closeTag;
	if (paste.initTextEvent) {
		paste.initTextEvent('textInput', true, true, null, replacement);
		textArea.dispatchEvent(paste);
	} else {
		textArea.value = textArea.value.substring(0, start) + replacement + textArea.value.substring(end, len);
	}
	selectRange(textArea, start + openTag.length, start + replacement.length - closeTag.length);
}

function applyTemplate(instance) {
	var opts = (localStorage.getItem('MakazeScriptOptions')) ? JSON.parse(localStorage.getItem('MakazeScriptOptions')) : {},
	richPrefix = (opts.hasOwnProperty('xf_style_richPrefix')) ? opts.xf_style_richPrefix : '',
	richSuffix = (opts.hasOwnProperty('xf_style_richSuffix')) ? opts.xf_style_richSuffix : '',
	plainPrefix = (opts.hasOwnProperty('xf_style_plainPrefix')) ? opts.xf_style_plainPrefix : '',
	plainSuffix = (opts.hasOwnProperty('xf_style_plainSuffix')) ? opts.xf_style_plainSuffix : '',
	thisList,
	thisLink,
	postForm,
	plainText,
	i = 0;

	var applyTemplateEvent = function(event) {
		var parent = event.target;
		applyToChildren(parent);
		event.target.removeEventListener('keydown', applyTemplateEvent, false);
	};

	var applyToChildren = function(parent) {
		var thisChild,
		applyTo,
		open = false,
		i = 0;

		for (i = 0; i < parent.childNodes.length; i++) {
			thisChild = parent.childNodes[i];

			
			if (thisChild.innerHTML) {
				applyTo = thisChild.innerHTML.replace(
					/\[quote/gi, richSuffix + '[quote'
				).replace(
					/\[\/quote\]/gi, '[/quote]' + richPrefix
				);

				if (thisChild.innerHTML.match(/\[quote/i) && !thisChild.innerHTML.match(/\[\/quote\]/i)) {
					thisChild.innerHTML = richPrefix + applyTo;
					open = true;
				} else if (!thisChild.innerHTML.match(/\[quote/i) && thisChild.innerHTML.match(/\[\/quote\]/i)) {
					thisChild.innerHTML = applyTo + richSuffix;
					open = false;
				} else {
					if (!open) {
						thisChild.innerHTML = richPrefix + applyTo + richSuffix;
					}
				}
			}
		}
	};

	if (opts.hasOwnProperty('xf_style_auto')) {
		if (instance.getElementsByClassName('redactor_MessageEditor')[0] != null) {
			postForm = instance.getElementsByClassName('redactor_MessageEditor')[0].contentWindow.document;

			if (!postForm.body.textContent.length) {
				postForm.body.addEventListener('keydown', applyTemplateEvent, false);
			} else {
				applyToChildren(postForm.body);
			}
		} else {
			plainText = instance.getElementsByClassName('textCtrl')[0];
			wrapText(plainText, plainPrefix, plainSuffix);
		}
	} else {
		thisList = document.getElementById('AccountMenu').getElementsByClassName('blockLinksList')[0];
		for (i = 0; i < thisList.getElementsByTagName('a').length; i++) {
			thisLink = thisList.getElementsByTagName('a')[i];
			if (thisLink.href.match(/account\/personal\-details/gi) && thisLink.href.substr(window.location.href.length - 14, 14) !== '#Post_Style') {
				thisLink.href = thisLink.href + '#Post_Style';
				thisLink.click();
				break;
			}
		}
	}
}

function xenForoMessage(msg, success) {
	if (success) {
		$('#postStyleMessage .content').html(msg);
		console.log(msg);
	} else {
		$('#postStyleMessage .content').html('<strong>Error:</strong> ' + msg);
		console.log('Error:', msg);
	}
	$('#postStyleMessage').slideDown('medium');
	$('#postStyleMessage .content').animate({
		'opacity': 1
	}, 'fast');
	setTimeout(function() {
		$('#postStyleMessage').slideUp('medium');
		$('#postStyleMessage .content').animate({
			'opacity': 0
		}, 'fast');
	}, 1500);
}

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

function saveStyleSettings() {
	if (!document.getElementById('richPrefixField').value.length) {
		xenForoMessage('Rich Text (HTML) prefix required.', false);
		return false;
	}

	if (!document.getElementById('richSuffixField').value.length) {
		xenForoMessage('Rich Text (HTML) suffix required.', false);
		return false;
	}

	if (!document.getElementById('plainPrefixField').value.length) {
		xenForoMessage('Plaintext (BBCode) prefix required.', false);
		return false;
	}

	if (!document.getElementById('plainSuffixField').value.length) {
		xenForoMessage('Plaintext (BBCode) suffix required.', false);
		return false;
	}
	
	var opts = (localStorage.getItem('MakazeScriptOptions')) ? JSON.parse(localStorage.getItem('MakazeScriptOptions')) : {};

	opts.xf_style_auto = (document.getElementById('autoApplyField').options[document.getElementById('autoApplyField').selectedIndex].value === 'true');
	opts.xf_style_richPrefix = document.getElementById('richPrefixField').value;
	opts.xf_style_richSuffix = document.getElementById('richSuffixField').value;
	opts.xf_style_plainPrefix = document.getElementById('plainPrefixField').value;
	opts.xf_style_plainSuffix = document.getElementById('plainSuffixField').value;
	localStorage.setItem('MakazeScriptOptions', JSON.stringify(opts));

	xenForoMessage('Your settings have been saved.', true);
}

if (document.documentElement.id === "XenForo") {
	opts = (localStorage.getItem('MakazeScriptOptions')) ? JSON.parse(localStorage.getItem('MakazeScriptOptions')) : {};
	autoApply = (opts.hasOwnProperty('xf_style_auto')) ? opts.xf_style_auto : false;
	richPrefix = (opts.hasOwnProperty('xf_style_richPrefix')) ? opts.xf_style_richPrefix : '';
	richSuffix = (opts.hasOwnProperty('xf_style_richSuffix')) ? opts.xf_style_richSuffix : '';
	plainPrefix = (opts.hasOwnProperty('xf_style_plainPrefix')) ? opts.xf_style_plainPrefix : '';
	plainSuffix = (opts.hasOwnProperty('xf_style_plainSuffix')) ? opts.xf_style_plainSuffix : '';

	// Button creation and auto-application

	var applyHandler = function(event) {
		var applyButton,
		cont,
		instance;

		if (!event.target.tagName || (event.target.tagName !== 'TEXTAREA' && event.target.tagName !== 'IFRAME')) {
			return false;
		}

		if (isChildOf('.redactor_box', event.target) || isChildOf('.bbCodeEditorContainer', event.target) || Classes.hasClass(event.target, 'MessageEditor')) {
			instance = event.target.parentNode;
		} else {
			return false;
		}

		console.log(instance);

		if (instance.getElementsByClassName('applyButton')[0] != null) {
			return false;
		}

		cont = document.createElement('div');
		applyButton = document.createElement('input');

		cont.style.textAlign = 'right';

		applyButton.type = 'button';
		applyButton.value = 'Apply Style';
		applyButton.className = 'button JsOnly applyButton';
		applyButton.style.fontSize = '10px';
		applyButton.style.lineHeight = '100%';
		applyButton.onclick = function() {
			applyTemplate(instance);
		};

		cont.appendChild(applyButton);

		instance.appendChild(cont);

		if (autoApply) {
			if (isChildOf('.InlineMessageEditor', event.target)) {
				return false;
			}

			if (!isChildOf('.redactor_box', event.target)) {
				selectRange(instance.getElementsByClassName('textCtrl')[0], instance.getElementsByClassName('textCtrl')[0].value.length, instance.getElementsByClassName('textCtrl')[0].value.length);
			}

			applyTemplate(instance);
		}
	};

	document.addEventListener('mouseover', applyHandler, false);
	
	if (window.location.href.match(/account\/personal\-details/gi)) {
		// Define xenForoMessage and saveStyleSettings

		runInGlobal(
			xenForoMessage.toString() +
			saveStyleSettings.toString()
		);

		// Settings creation
		
		var optionsContainer = createElement('fieldset', function(fieldset) {
			fieldset.id = 'styleOptionsContainer';

			fieldset.appendChild(createElement('dl', function(cont) {
				cont.className = 'ctrlUnit';
				cont.appendChild(createElement('dt', function(title) {}));

				cont.appendChild(createElement('dd', function(field) {
					field.style.fontWeight = 'bolder';
					field.style.fontSize = '130%';
					field.style.width = '40%';
					field.style.textDecoration = 'underline';
					field.appendChild(document.createTextNode('Post Style'));
				}));
			}));

			fieldset.appendChild(createElement('dl', function(cont) {
				cont.className = 'ctrlUnit';
				cont.appendChild(createElement('dt', function(title) {
					title.appendChild(document.createTextNode('Auto-apply:'));
				}));

				cont.appendChild(createElement('dd', function(field) {
					field.appendChild(createElement('select', function(select) {
						select.className = 'textCtrl';
						select.id = 'autoApplyField';

						select.options[0] = new Option('True', 'true');
						select.options[1] = new Option('False', 'false');

						select.selectedIndex = (autoApply) ? 0 : 1; 
					}));
				}));
			}));

			fieldset.appendChild(createElement('dl', function(cont) {
				cont.className = 'ctrlUnit';
				cont.appendChild(createElement('dt', function(title) {
					title.appendChild(document.createTextNode('Rich Prefix:'));
				}));

				cont.appendChild(createElement('dd', function(field) {
					field.appendChild(createElement('input', function(input) {
						input.type = 'text';
						input.className = 'textCtrl OptOut';
						input.id = 'richPrefixField';
						input.value = richPrefix;
					}));
				}));
			}));

			fieldset.appendChild(createElement('dl', function(cont) {
				cont.className = 'ctrlUnit';
				cont.appendChild(createElement('dt', function(title) {
					title.appendChild(document.createTextNode('Rich Suffix:'));
				}));

				cont.appendChild(createElement('dd', function(field) {
					field.appendChild(createElement('input', function(input) {
						input.type = 'text';
						input.className = 'textCtrl OptOut';
						input.id = 'richSuffixField';
						input.value = richSuffix;
					}));
				}));
			}));

			fieldset.appendChild(createElement('dl', function(cont) {
				cont.className = 'ctrlUnit';
				cont.appendChild(createElement('dt', function(title) {
					title.appendChild(document.createTextNode('Plaintext Prefix:'));
				}));

				cont.appendChild(createElement('dd', function(field) {
					field.appendChild(createElement('input', function(input) {
						input.type = 'text';
						input.className = 'textCtrl OptOut';
						input.id = 'plainPrefixField';
						input.value = plainPrefix;
					}));
				}));
			}));

			fieldset.appendChild(createElement('dl', function(cont) {
				cont.className = 'ctrlUnit';
				cont.appendChild(createElement('dt', function(title) {
					title.appendChild(document.createTextNode('Plaintext Suffix:'));
				}));

				cont.appendChild(createElement('dd', function(field) {
					field.appendChild(createElement('input', function(input) {
						input.type = 'text';
						input.className = 'textCtrl OptOut';
						input.id = 'plainSuffixField';
						input.value = plainSuffix;
					}));
				}));
			}));

			fieldset.appendChild(createElement('dl', function(cont) {
				cont.className = 'ctrlUnit';
				cont.appendChild(createElement('dt', function(title) {}));

				cont.appendChild(createElement('dd', function(field) {
					field.appendChild(createElement('input', function(input) {
						input.type = 'button';
						input.className = 'button';
						input.id = 'submitStyle';
						input.value = 'Save';
						input.setAttribute('onclick', 'saveStyleSettings();');
					}));
				}));
			}));
		});

		document.getElementsByClassName('OptOut')[document.getElementsByClassName('OptOut').length - 1].parentNode.insertBefore(optionsContainer, document.getElementsByClassName('OptOut')[document.getElementsByClassName('OptOut').length - 1]);

		document.body.appendChild(createElement('div', function(cont) {
			cont.className = 'xenOverlay timedMessage';
			cont.id = 'postStyleMessage';
			cont.style.top = '0px';
			cont.style.left = '0px';
			cont.style.position = 'fixed';
			cont.style.display = 'none';

			cont.appendChild(createElement('div', function(content) {
				content.className = 'content baseHtml';
				content.style.opacity = 0;
				content.appendChild(document.createTextNode('Post Style installed.'));
			}));
		}));
		
		if (window.location.href.substr(window.location.href.length - 14, 14) === '#Post_Style') {
			scrollTo(document.body, getPosition(document.getElementById('styleOptionsContainer')).y, 100);
			runInGlobal('xenForoMessage(\'Please customize your settings.\', true);');
		}
	}
}