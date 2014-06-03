// ==UserScript==
// @name	IP.Board - Post Style
// @namespace	Makaze
// @include	*
// @grant	none
// @version	1.2.0
// ==/UserScript==

var opts,
templateAutoApply,
templateStartRich,
templateEndRich,
templateStartPlain,
templateEndPlain;

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
		if (currentTime < duration) {
			setTimeout(animateScroll, increment);
		}
	};

	animateScroll();
}

function createElement(type, callback) {
	var element = document.createElement(type);

	callback(element);

	return element;
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
	templateStartRich = (opts.hasOwnProperty('ipb_post_template_rich_prefix')) ? opts.ipb_post_template_rich_prefix : '',
	templateEndRich = (opts.hasOwnProperty('ipb_post_template_rich_suffix')) ? opts.ipb_post_template_rich_suffix : '',
	templateStartPlain = (opts.hasOwnProperty('ipb_post_template_plaintext_prefix')) ? opts.ipb_post_template_plaintext_prefix : '',
	templateEndPlain = (opts.hasOwnProperty('ipb_post_template_plaintext_suffix')) ? opts.ipb_post_template_plaintext_suffix : '',
	ucp,
	postForm,
	plainText;

	var applyTemplateEvent = function(event) {
		var parent = event.target;
		applyToChildren(parent);
		event.target.removeEventListener('keydown', applyTemplateEvent, false);
	};

	var applyToChildren = function(parent) {
		var thisChild,
		applyTo,
		i = 0;

		for (i = 0; i < parent.childNodes.length; i++) {
			thisChild = parent.childNodes[i];
			if (thisChild.innerHTML) {
				if (thisChild.tagName !== 'BLOCKQUOTE') {
					applyTo = thisChild.innerHTML.replace(
						/<blockquote/gi, templateEndRich + '<blockquote'
					).replace(
						/<\/blockquote>/gi, '</blockquote>' + templateStartRich
					);

					thisChild.innerHTML = templateStartRich + applyTo + templateEndRich;
				}
			} else {
				thisChild.innerHTML = templateStartRich + applyTo + templateEndRich;
			}
		}
	};

	if (opts.hasOwnProperty('ipb_post_template_auto_apply')) {
		if (instance.getElementsByClassName('cke_source')[0] == null) {
			postForm = instance.getElementsByTagName('iframe')[0].contentWindow.document;

			if (!postForm.body.textContent.length) {
				postForm.body.addEventListener('keydown', applyTemplateEvent, false);
			} else {
				applyToChildren(postForm.body);
			}
		} else {
			plainText = instance.getElementsByClassName('cke_source')[0];
			wrapText(plainText, templateStartPlain, templateEndPlain);
		}
	} else {
		ucp = document.getElementById('user_ucp').getElementsByTagName('a')[0];

		ucp.href = ucp.href + '#Post_Template';
		ucp.click();
	}
}

function autoApply(instance) {
	var opts = (localStorage.getItem('MakazeScriptOptions')) ? JSON.parse(localStorage.getItem('MakazeScriptOptions')) : {},
	templateAutoApply = (opts.hasOwnProperty('ipb_post_template_auto_apply')) ? opts.ipb_post_template_auto_apply : false,
	plainText;

	if (templateAutoApply) {
		if (instance.getElementsByClassName('cke_source')[0] != null) {
			plainText = instance.getElementsByClassName('cke_source')[0];
			selectRange(plainText, plainText.value.length, plainText.value.length);
		}

		applyTemplate(instance);
	}
}

function addTemplateButton(instance) {
	var parent = instance;

	while (parent.getElementsByClassName('input_submit')[0] == null && parent.parentNode) {
		parent = parent.parentNode;
	}

	parent.getElementsByClassName('input_submit')[0].parentNode.appendChild(document.createTextNode('\xA0\xA0'));

	parent.getElementsByClassName('input_submit')[0].parentNode.appendChild(createElement('input', function(apply) {
		apply.className = 'input_submit alt template_button';
		apply.type = 'button';
		apply.value = 'Apply Template';

		apply.onclick = function() {
			applyTemplate(instance);
		};
	}));
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

var initTemplateHandler = function(event) {
	var instance;

	if (isChildOf('.cke_editor', event.target)) {
		instance = getParent('.cke_editor', event.target);
	} else {
		return false;
	}

	if (Classes.hasClass(instance, 'post_template')) {
		return false;
	}

	addTemplateButton(instance);
	autoApply(instance);
	Classes.addClass(instance, 'post_template');
};

if (document.body.id === 'ipboard_body') {
	opts = (localStorage.getItem('MakazeScriptOptions')) ? JSON.parse(localStorage.getItem('MakazeScriptOptions')) : {};
	templateAutoApply = (opts.hasOwnProperty('ipb_post_template_auto_apply')) ? opts.ipb_post_template_auto_apply : false;
	templateStartRich = (opts.hasOwnProperty('ipb_post_template_rich_prefix')) ? opts.ipb_post_template_rich_prefix : '';
	templateEndRich = (opts.hasOwnProperty('ipb_post_template_rich_suffix')) ? opts.ipb_post_template_rich_suffix : '';
	templateStartPlain = (opts.hasOwnProperty('ipb_post_template_plaintext_prefix')) ? opts.ipb_post_template_plaintext_prefix : '';
	templateEndPlain = (opts.hasOwnProperty('ipb_post_template_plaintext_suffix')) ? opts.ipb_post_template_plaintext_suffix : '';

	if (document.getElementsByClassName('ipsSettings_pagetitle')[0] != null && document.getElementsByClassName('ipsSettings_pagetitle')[0].textContent.trim() === 'General Account Settings') {
		document.getElementsByClassName('ipsSettings')[0].appendChild(createElement('fieldset', function(fieldset) {
			fieldset.className = 'ipsSettings_section';
			fieldset.id = 'template_settings';
			fieldset.appendChild(createElement('h3', function(header) {
				header.className = 'ipsSettings_sectiontitle';
				header.appendChild(document.createTextNode('Post Template'));
			}));

			fieldset.appendChild(createElement('div', function(cont) {
				cont.appendChild(createElement('ul', function(list) {
					list.appendChild(createElement('li', function(item) {
						item.className = 'custom';
						item.appendChild(createElement('label', function(title) {
							title.className = 'ipsSettings_fieldtitle';
							title.setAttribute('for', 'template_auto_apply');
							title.appendChild(document.createTextNode('Auto-apply'));
						}));

						item.appendChild(createElement('select', function(drop) {
							drop.className = 'input_select';
							drop.id = 'template_auto_apply';

							if (templateAutoApply) {
								drop.options[0] = new Option('True', 'true', true, true);
								drop.options[1] = new Option('False', 'false');
							} else {
								drop.options[0] = new Option('True', 'true');
								drop.options[1] = new Option('False', 'false', true, true);
							}
						}));
					}));

					list.appendChild(createElement('li', function(item) {
						item.className = 'custom';
						item.appendChild(createElement('label', function(title) {
							title.className = 'ipsSettings_fieldtitle';
							title.setAttribute('for', 'template_rich_prefix');
							title.appendChild(document.createTextNode('Rich Prefix'));
						}));

						item.appendChild(createElement('textarea', function(input) {
							input.className = 'input_text template_field';
							input.id = 'template_rich_prefix';
							input.cols = '60';
							input.rows = '4';

							input.value = templateStartRich;
						}));
					}));

					list.appendChild(createElement('li', function(item) {
						item.className = 'custom';
						item.appendChild(createElement('label', function(title) {
							title.className = 'ipsSettings_fieldtitle';
							title.setAttribute('for', 'template_rich_suffix');
							title.appendChild(document.createTextNode('Rich Suffix'));
						}));

						item.appendChild(createElement('textarea', function(input) {
							input.className = 'input_text template_field';
							input.id = 'template_rich_suffix';
							input.cols = '60';
							input.rows = '4';

							input.value = templateEndRich;
						}));
					}));

					list.appendChild(createElement('li', function(item) {
						item.className = 'custom';
						item.appendChild(createElement('label', function(title) {
							title.className = 'ipsSettings_fieldtitle';
							title.setAttribute('for', 'template_plaintext_prefix');
							title.appendChild(document.createTextNode('Plaintext Prefix'));
						}));

						item.appendChild(createElement('textarea', function(input) {
							input.className = 'input_text template_field';
							input.id = 'template_plaintext_prefix';
							input.cols = '60';
							input.rows = '4';

							input.value = templateStartPlain;
						}));
					}));

					list.appendChild(createElement('li', function(item) {
						item.className = 'custom';
						item.appendChild(createElement('label', function(title) {
							title.className = 'ipsSettings_fieldtitle';
							title.setAttribute('for', 'template_plaintext_suffix');
							title.appendChild(document.createTextNode('Plaintext Suffix'));
						}));

						item.appendChild(createElement('textarea', function(input) {
							input.className = 'input_text template_field';
							input.id = 'template_plaintext_suffix';
							input.cols = '60';
							input.rows = '4';

							input.value = templateEndPlain;
						}));
					}));

					list.appendChild(createElement('li', function(item) {
						item.className = 'custom';
						item.appendChild(createElement('label', function(title) {
							title.className = 'ipsSettings_fieldtitle';
							title.setAttribute('for', 'template_preview');
							title.appendChild(document.createTextNode('Preview'));
						}));

						item.appendChild(createElement('div', function(preview) {
							preview.id = 'template_preview';
							preview.style.display = 'inline-block';
							preview.style.fontSize = '14px';
							preview.style.padding = '3px 0';

							if (templateStartRich.length && templateEndRich.length) {
								preview.innerHTML = templateStartRich + 'Example message.' + templateEndRich;
							} else {
								preview.appendChild(document.createTextNode('Example message.'));
							}
						}));
					}));

					list.appendChild(createElement('li', function(item) {
						item.className = 'custom';
						item.appendChild(createElement('label', function(title) {
							title.className = 'ipsSettings_fieldtitle';
							title.setAttribute('for', 'template_submit');
						}));

						item.appendChild(createElement('input', function(input) {
							input.type = 'button';
							input.className = 'input_submit';
							input.id = 'template_submit';
							input.value = 'Save & Preview';

							input.onclick = function() {
								templateAutoApply = (document.getElementById('template_auto_apply').options[document.getElementById('template_auto_apply').options.selectedIndex].value === 'true') ? true : false;
								templateStartRich = document.getElementById('template_rich_prefix').value;
								templateEndRich = document.getElementById('template_rich_suffix').value;
								templateStartPlain = document.getElementById('template_plaintext_prefix').value;
								templateEndPlain = document.getElementById('template_plaintext_suffix').value;

								if (!templateStartRich.length || !templateEndRich.length || !templateStartPlain.length || !templateEndPlain.length) {
									document.getElementById('template_preview').innerHTML = '<em><strong>Error!</strong>:</em> All template fields must be filled.';
								} else {
									document.getElementById('template_preview').innerHTML = templateStartRich + 'Example message.' + templateEndRich;

									opts = (localStorage.getItem('MakazeScriptOptions')) ? JSON.parse(localStorage.getItem('MakazeScriptOptions')) : {};

									opts.ipb_post_template_auto_apply = templateAutoApply;
									opts.ipb_post_template_rich_prefix = templateStartRich;
									opts.ipb_post_template_rich_suffix = templateEndRich;
									opts.ipb_post_template_plaintext_prefix = templateStartPlain;
									opts.ipb_post_template_plaintext_suffix = templateEndPlain;

									localStorage.setItem('MakazeScriptOptions', JSON.stringify(opts));
								}
							};
						}));
					}));
				}));
			}));
		}));

		if (window.location.href.slice(-14) === '#Post_Template') {
			scrollTo(document.body, getPosition(document.getElementById('template_settings')).y, 100);
		}
	}

	document.addEventListener('mouseover', initTemplateHandler, false);

	document.addEventListener('keydown', function(event) {
		if (event.shiftKey && event.altKey) {
			if (event.keyCode === 84) {
				var instance,
				parent;

				if (isChildOf('.cke_editor', event.target)) {
					instance = getParent('.cke_editor', event.target);
				} else {
					return false;
				}

				parent = instance;

				while (parent.getElementsByClassName('template_button')[0] == null && parent.parentNode) {
					parent = parent.parentNode;
				}

				parent.getElementsByClassName('template_button')[0].click();
			}
		}
	}, false);
}