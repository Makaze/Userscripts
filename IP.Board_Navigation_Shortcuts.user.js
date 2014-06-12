// ==UserScript==
// @name	IP.Board - Navigation Shortcuts
// @namespace	Makaze
// @description	Adds keyboard navigation shortcuts to XenForo.
// @include	*
// @grant	none
// @version	2.0.1
// ==/UserScript==

var MakazeScriptStyles,
styleElem,
opts,
shortcuts;

function createElement(type, callback) {
	var element = document.createElement(type);

	callback(element);

	return element;
}

function empty(elem) {
	while (elem.hasChildNodes()) {
		elem.removeChild(elem.lastChild);
	}
}

function fade(elem, type, speed) {
	var defaultOpacity,
	currentDisplay = elem.style.display || window.getComputedStyle(elem).display;

	elem.style.opacity = '';
	defaultOpacity = window.getComputedStyle(elem).opacity;
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
			elem.style.display = '';
			setTimeout(function() {
				elem.style.transition = 'all ' + speed + 'ms ease-in-out';
				elem.style.opacity = defaultOpacity;
				setTimeout(function() {
					elem.style.transition = '';
					elem.style.opacity = '';
				}, speed + 10);
			}, 1);
		break;
		case 'out':
			elem.style.transition = '';
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
				elem.style.display = '';
				setTimeout(function() {
					elem.style.transition = 'all ' + speed + 'ms ease-in-out';
					elem.style.opacity = defaultOpacity;
					setTimeout(function() {
						elem.style.transition = '';
						elem.style.opacity = '';
					}, speed + 10);
				}, 1);
			} else {
				elem.style.transition = '';
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

function scrollToNext(context, collection, dir) {
	var item,
	i = 0;

	switch (dir) {
		case 'up':
			for (i = collection.length - 1; i >= 0; i--) {
				item = collection[i];

				if (getPosition(item).y < context.scrollTop - 2) {
					scrollTo(context, getPosition(item).y, 30);
					break;
				}
			}
		break;
		case 'down':
		default:
			for (i = 0; i < collection.length; i++) {
				item = collection[i];

				if (getPosition(item).y > context.scrollTop + 2) {
					scrollTo(context, getPosition(item).y, 30);
					break;
				}
			}
		break;
	}
}

function ipbMessage(msg, success) {
	document.body.appendChild(createElement('div', function(message) {
		message.id = "NavigationNotice";
		message.style.display = 'none';

		if (success) {
			message.appendChild(document.createTextNode(msg));
			console.log(msg);
		} else {
			message.appendChild(createElement('strong', function(type) {
				type.appendChild(document.createTextNode('Navigation Error:'));
			}));
			message.appendChild(document.createTextNode(' ' + msg));
			console.log('Error:', msg);
		}
	}));

	fade(document.getElementById('NavigationNotice'), 'in');

	document.getElementById('NavigationNotice').style.marginTop = '-' + (document.getElementById('NavigationNotice').offsetHeight / 2) + 'px';
	
	setTimeout(function() {
		fade(document.getElementById('NavigationNotice'), 'out');

		setTimeout(function() {
			document.getElementById('NavigationNotice').remove();
		}, 310);
	}, 1500);
}

function checkModifiers(shortcut, e, shortcuts) {
	var mods = (shortcuts.hasOwnProperty(shortcut + '_modifier')) ? shortcuts[shortcut + '_modifier'] : '';

	if ((mods.indexOf('shiftKey') > -1 && !e.shiftKey) || (mods.indexOf('shiftKey') < 0 && e.shiftKey)) {
		return false;
	}
	
	if ((mods.indexOf('ctrlKey') > -1 && !e.ctrlKey) || (mods.indexOf('ctrlKey') < 0 && e.ctrlKey)) {
		return false;
	}

	if ((mods.indexOf('altKey') > -1 && !e.altKey) || (mods.indexOf('altKey') < 0 && e.altKey)) {
		return false;
	}

	if ((mods.indexOf('metaKey') > -1 && !e.metaKey) || (mods.indexOf('metaKey') < 0 && e.metaKey)) {
		return false;
	}

	return true;
}

function returnKeys(e) {
	var keys = [];

	if (e.ctrlKey) {
		keys.push('Ctrl');
	}

	if (e.shiftKey) {
		keys.push('Shift');
	}

	if (e.altKey) {
		keys.push('Alt');
	}

	if (e.metaKey) {
		keys.push('Meta');
	}

	switch (e.keyCode) {
		case 16:
		case 17:
		case 18:
			return keys;
		break;		
		case 8:
			keys.push('Backspace');
		break;
		case 9:
			keys.push('Tab');
		break;
		case 13:
			keys.push('Enter');
		break;
		case 19:
			keys.push('Pause/Break');
		break;
		case 20:
			keys.push('Caps Lock');
		break;
		case 27:
			keys.push('Esc');
		break;
		case 33:
			keys.push('Page Up');
		break;
		case 34:
			keys.push('Page Down');
		break;
		case 35:
			keys.push('End');
		break;
		case 36:
			keys.push('Home');
		break;
		case 37:
			keys.push('Left');
		break;
		case 38:
			keys.push('Up');
		break;
		case 39:
			keys.push('Right');
		break;
		case 40:
			keys.push('Down');
		break;
		case 45:
			keys.push('Insert');
		break;
		case 46:
			keys.push('Delete');
		break;
		case 112:
			keys.push('F1');
		break;
		case 113:
			keys.push('F2');
		break;
		case 114:
			keys.push('F3');
		break;
		case 115:
			keys.push('F4');
		break;
		case 116:
			keys.push('F5');
		break;
		case 117:
			keys.push('F6');
		break;
		case 118:
			keys.push('F7');
		break;
		case 119:
			keys.push('F8');
		break;
		case 120:
			keys.push('F9');
		break;
		case 121:
			keys.push('F10');
		break;
		case 122:
			keys.push('F11');
		break;
		case 123:
			keys.push('F12');
		break;
		default:
			keys.push(String.fromCharCode(e.keyCode));
	}

	return keys;
}

function generatedCapturedKeys(e, context) {
	var keys = returnKeys(e),
	i = 0;

	empty(context);

	function makeKey(code) {
		return createElement('kbd', function(key) {
			switch(code) {
				case 'Ctrl':
				case 'Shift':
				case 'Alt':
				case 'Meta':
					key.className = 'Modifier';
					key.setAttribute('data-keycode', code.toLowerCase() + 'Key');
				break;
				default:
					key.setAttribute('data-keycode', e.keyCode);
			}

			key.appendChild(document.createTextNode(code));
		});
	}

	for (i = 0; i < keys.length; i++) {
		if (i > 0) {
			context.appendChild(document.createTextNode(' + '));
		}

		context.appendChild(makeKey(keys[i]));
	}
}

function getChanges(object, type, className) {
	var keys,
	modifiers = [],
	keycode,
	i = 0;

	for (i = 0, keys = document.getElementById('NavigationShortcuts').getElementsByClassName(className)[0].getElementsByTagName('kbd'); i < keys.length; i++) {
		if (keys[i].className.indexOf('Modifier') > -1) {
			modifiers.push(keys[i].getAttribute('data-keycode'));
		} else {
			keycode = parseInt(keys[i].getAttribute('data-keycode'));
		}
	}

	if (modifiers.length) {
		object[type + '_modifier'] = modifiers.join(' + ');
	} else if (object.hasOwnProperty(type + '_modifier')) {
		delete object[type + '_modifier'];
	}

	object[type] = keycode;

	return object;
}

function shortcutsMenu() {
	document.body.appendChild(createElement('div', function(cont) {
		cont.id = 'NavigationShortcuts';
		cont.className = 'MakazeScriptMenu';
		cont.style.width = '90%';
		cont.style.marginLeft = '-45%';

		cont.appendChild(createElement('table', function(table) {
			table.style.width = '100%';

			table.appendChild(createElement('thead', function(head) {
				head.appendChild(createElement('tr', function(row) {
					row.appendChild(createElement('th', function(th) {
						th.style.width = '16.6%';
						th.appendChild(document.createTextNode('Next Post'));
					}));

					row.appendChild(createElement('th', function(th) {
						th.style.width = '16.6%';
						th.appendChild(document.createTextNode('Previous Post'));
					}));

					row.appendChild(createElement('th', function(th) {
						th.style.width = '16.6%';
						th.appendChild(document.createTextNode('Next Page'));
					}));

					row.appendChild(createElement('th', function(th) {
						th.style.width = '16.6%';
						th.appendChild(document.createTextNode('Previous Page'));
					}));

					row.appendChild(createElement('th', function(th) {
						th.style.width = '16.6%';
						th.appendChild(document.createTextNode('Last Page'));
					}));

					row.appendChild(createElement('th', function(th) {
						th.style.width = '16.6%';
						th.appendChild(document.createTextNode('First Page'));
					}));
				}));
			}));

			table.appendChild(createElement('tbody', function(body) {
				body.appendChild(createElement('tr', function(row) {
					row.appendChild(createElement('td', function(cell) {
						var mods,
						shortcut = 'next_post';

						cell.className = 'NextPost';

						if (shortcuts.hasOwnProperty(shortcut + '_modifier')) {
							mods = shortcuts[shortcut + '_modifier'];

							if (mods.indexOf('ctrlKey') > -1) {
								cell.appendChild(createElement('kbd', function(key) {
									key.className = 'Modifier';
									key.setAttribute('data-keycode', 'altKey');
									key.appendChild(document.createTextNode('Ctrl'));
								}));
							}

							if (mods.indexOf('shiftKey') > -1) {
								if (cell.getElementsByTagName('kbd')[0] != null) {
									cell.appendChild(document.createTextNode(' + '));
								}

								cell.appendChild(createElement('kbd', function(key) {
									key.className = 'Modifier';
									key.setAttribute('data-keycode', 'shiftKey');
									key.appendChild(document.createTextNode('Shift'));
								}));
							}

							if (mods.indexOf('altKey') > -1) {
								if (cell.getElementsByTagName('kbd')[0] != null) {
									cell.appendChild(document.createTextNode(' + '));
								}

								cell.appendChild(createElement('kbd', function(key) {
									key.className = 'Modifier';
									key.setAttribute('data-keycode', 'altKey');
									key.appendChild(document.createTextNode('Alt'));
								}));
							}

							if (mods.indexOf('metaKey') > -1) {
								if (cell.getElementsByTagName('kbd')[0] != null) {
									cell.appendChild(document.createTextNode(' + '));
								}

								cell.appendChild(createElement('kbd', function(key) {
									key.className = 'Modifier';
									key.setAttribute('data-keycode', 'altKey');
									key.appendChild(document.createTextNode('Meta'));
								}));
							}
						}

						if (cell.getElementsByTagName('kbd')[0] != null) {
							cell.appendChild(document.createTextNode(' + '));
						}

						cell.appendChild(createElement('kbd', function(key) {
							key.setAttribute('data-keycode', shortcuts[shortcut]);
							key.appendChild(document.createTextNode(String.fromCharCode(shortcuts[shortcut])));
						}));
					}));
					
					row.appendChild(createElement('td', function(cell) {
						var mods,
						shortcut = 'previous_post';

						cell.className = 'PreviousPost';

						if (shortcuts.hasOwnProperty(shortcut + '_modifier')) {
							mods = shortcuts[shortcut + '_modifier'];

							if (mods.indexOf('ctrlKey') > -1) {
								cell.appendChild(createElement('kbd', function(key) {
									key.className = 'Modifier';
									key.setAttribute('data-keycode', 'altKey');
									key.appendChild(document.createTextNode('Ctrl'));
								}));
							}

							if (mods.indexOf('shiftKey') > -1) {
								if (cell.getElementsByTagName('kbd')[0] != null) {
									cell.appendChild(document.createTextNode(' + '));
								}

								cell.appendChild(createElement('kbd', function(key) {
									key.className = 'Modifier';
									key.setAttribute('data-keycode', 'shiftKey');
									key.appendChild(document.createTextNode('Shift'));
								}));
							}

							if (mods.indexOf('altKey') > -1) {
								if (cell.getElementsByTagName('kbd')[0] != null) {
									cell.appendChild(document.createTextNode(' + '));
								}

								cell.appendChild(createElement('kbd', function(key) {
									key.className = 'Modifier';
									key.setAttribute('data-keycode', 'altKey');
									key.appendChild(document.createTextNode('Alt'));
								}));
							}

							if (mods.indexOf('metaKey') > -1) {
								if (cell.getElementsByTagName('kbd')[0] != null) {
									cell.appendChild(document.createTextNode(' + '));
								}

								cell.appendChild(createElement('kbd', function(key) {
									key.className = 'Modifier';
									key.setAttribute('data-keycode', 'altKey');
									key.appendChild(document.createTextNode('Meta'));
								}));
							}
						}

						if (cell.getElementsByTagName('kbd')[0] != null) {
							cell.appendChild(document.createTextNode(' + '));
						}

						cell.appendChild(createElement('kbd', function(key) {
							key.setAttribute('data-keycode', shortcuts[shortcut]);
							key.appendChild(document.createTextNode(String.fromCharCode(shortcuts[shortcut])));
						}));
					}));

					row.appendChild(createElement('td', function(cell) {
						var mods,
						shortcut = 'next_page';

						cell.className = 'NextPage';

						if (shortcuts.hasOwnProperty(shortcut + '_modifier')) {
							mods = shortcuts[shortcut + '_modifier'];

							if (mods.indexOf('ctrlKey') > -1) {
								cell.appendChild(createElement('kbd', function(key) {
									key.className = 'Modifier';
									key.setAttribute('data-keycode', 'altKey');
									key.appendChild(document.createTextNode('Ctrl'));
								}));
							}

							if (mods.indexOf('shiftKey') > -1) {
								if (cell.getElementsByTagName('kbd')[0] != null) {
									cell.appendChild(document.createTextNode(' + '));
								}

								cell.appendChild(createElement('kbd', function(key) {
									key.className = 'Modifier';
									key.setAttribute('data-keycode', 'shiftKey');
									key.appendChild(document.createTextNode('Shift'));
								}));
							}

							if (mods.indexOf('altKey') > -1) {
								if (cell.getElementsByTagName('kbd')[0] != null) {
									cell.appendChild(document.createTextNode(' + '));
								}

								cell.appendChild(createElement('kbd', function(key) {
									key.className = 'Modifier';
									key.setAttribute('data-keycode', 'altKey');
									key.appendChild(document.createTextNode('Alt'));
								}));
							}

							if (mods.indexOf('metaKey') > -1) {
								if (cell.getElementsByTagName('kbd')[0] != null) {
									cell.appendChild(document.createTextNode(' + '));
								}

								cell.appendChild(createElement('kbd', function(key) {
									key.className = 'Modifier';
									key.setAttribute('data-keycode', 'altKey');
									key.appendChild(document.createTextNode('Meta'));
								}));
							}
						}

						if (cell.getElementsByTagName('kbd')[0] != null) {
							cell.appendChild(document.createTextNode(' + '));
						}

						cell.appendChild(createElement('kbd', function(key) {
							key.setAttribute('data-keycode', shortcuts[shortcut]);
							key.appendChild(document.createTextNode(String.fromCharCode(shortcuts[shortcut])));
						}));
					}));
					
					row.appendChild(createElement('td', function(cell) {
						var mods,
						shortcut = 'previous_page';

						cell.className = 'PreviousPage';

						if (shortcuts.hasOwnProperty(shortcut + '_modifier')) {
							mods = shortcuts[shortcut + '_modifier'];

							if (mods.indexOf('ctrlKey') > -1) {
								cell.appendChild(createElement('kbd', function(key) {
									key.className = 'Modifier';
									key.setAttribute('data-keycode', 'altKey');
									key.appendChild(document.createTextNode('Ctrl'));
								}));
							}

							if (mods.indexOf('shiftKey') > -1) {
								if (cell.getElementsByTagName('kbd')[0] != null) {
									cell.appendChild(document.createTextNode(' + '));
								}

								cell.appendChild(createElement('kbd', function(key) {
									key.className = 'Modifier';
									key.setAttribute('data-keycode', 'shiftKey');
									key.appendChild(document.createTextNode('Shift'));
								}));
							}

							if (mods.indexOf('altKey') > -1) {
								if (cell.getElementsByTagName('kbd')[0] != null) {
									cell.appendChild(document.createTextNode(' + '));
								}

								cell.appendChild(createElement('kbd', function(key) {
									key.className = 'Modifier';
									key.setAttribute('data-keycode', 'altKey');
									key.appendChild(document.createTextNode('Alt'));
								}));
							}

							if (mods.indexOf('metaKey') > -1) {
								if (cell.getElementsByTagName('kbd')[0] != null) {
									cell.appendChild(document.createTextNode(' + '));
								}

								cell.appendChild(createElement('kbd', function(key) {
									key.className = 'Modifier';
									key.setAttribute('data-keycode', 'altKey');
									key.appendChild(document.createTextNode('Meta'));
								}));
							}
						}

						if (cell.getElementsByTagName('kbd')[0] != null) {
							cell.appendChild(document.createTextNode(' + '));
						}

						cell.appendChild(createElement('kbd', function(key) {
							key.setAttribute('data-keycode', shortcuts[shortcut]);
							key.appendChild(document.createTextNode(String.fromCharCode(shortcuts[shortcut])));
						}));
					}));

					row.appendChild(createElement('td', function(cell) {
						var mods,
						shortcut = 'last_page';

						cell.className = 'LastPage';

						if (shortcuts.hasOwnProperty(shortcut + '_modifier')) {
							mods = shortcuts[shortcut + '_modifier'];

							if (mods.indexOf('ctrlKey') > -1) {
								cell.appendChild(createElement('kbd', function(key) {
									key.className = 'Modifier';
									key.setAttribute('data-keycode', 'altKey');
									key.appendChild(document.createTextNode('Ctrl'));
								}));
							}

							if (mods.indexOf('shiftKey') > -1) {
								if (cell.getElementsByTagName('kbd')[0] != null) {
									cell.appendChild(document.createTextNode(' + '));
								}

								cell.appendChild(createElement('kbd', function(key) {
									key.className = 'Modifier';
									key.setAttribute('data-keycode', 'shiftKey');
									key.appendChild(document.createTextNode('Shift'));
								}));
							}

							if (mods.indexOf('altKey') > -1) {
								if (cell.getElementsByTagName('kbd')[0] != null) {
									cell.appendChild(document.createTextNode(' + '));
								}

								cell.appendChild(createElement('kbd', function(key) {
									key.className = 'Modifier';
									key.setAttribute('data-keycode', 'altKey');
									key.appendChild(document.createTextNode('Alt'));
								}));
							}

							if (mods.indexOf('metaKey') > -1) {
								if (cell.getElementsByTagName('kbd')[0] != null) {
									cell.appendChild(document.createTextNode(' + '));
								}

								cell.appendChild(createElement('kbd', function(key) {
									key.className = 'Modifier';
									key.setAttribute('data-keycode', 'altKey');
									key.appendChild(document.createTextNode('Meta'));
								}));
							}
						}

						if (cell.getElementsByTagName('kbd')[0] != null) {
							cell.appendChild(document.createTextNode(' + '));
						}

						cell.appendChild(createElement('kbd', function(key) {
							key.setAttribute('data-keycode', shortcuts[shortcut]);
							key.appendChild(document.createTextNode(String.fromCharCode(shortcuts[shortcut])));
						}));
					}));

					row.appendChild(createElement('td', function(cell) {
						var mods,
						shortcut = 'first_page';

						cell.className = 'FirstPage';

						if (shortcuts.hasOwnProperty(shortcut + '_modifier')) {
							mods = shortcuts[shortcut + '_modifier'];

							if (mods.indexOf('ctrlKey') > -1) {
								cell.appendChild(createElement('kbd', function(key) {
									key.className = 'Modifier';
									key.setAttribute('data-keycode', 'altKey');
									key.appendChild(document.createTextNode('Ctrl'));
								}));
							}

							if (mods.indexOf('shiftKey') > -1) {
								if (cell.getElementsByTagName('kbd')[0] != null) {
									cell.appendChild(document.createTextNode(' + '));
								}

								cell.appendChild(createElement('kbd', function(key) {
									key.className = 'Modifier';
									key.setAttribute('data-keycode', 'shiftKey');
									key.appendChild(document.createTextNode('Shift'));
								}));
							}

							if (mods.indexOf('altKey') > -1) {
								if (cell.getElementsByTagName('kbd')[0] != null) {
									cell.appendChild(document.createTextNode(' + '));
								}

								cell.appendChild(createElement('kbd', function(key) {
									key.className = 'Modifier';
									key.setAttribute('data-keycode', 'altKey');
									key.appendChild(document.createTextNode('Alt'));
								}));
							}

							if (mods.indexOf('metaKey') > -1) {
								if (cell.getElementsByTagName('kbd')[0] != null) {
									cell.appendChild(document.createTextNode(' + '));
								}

								cell.appendChild(createElement('kbd', function(key) {
									key.className = 'Modifier';
									key.setAttribute('data-keycode', 'altKey');
									key.appendChild(document.createTextNode('Meta'));
								}));
							}
						}

						if (cell.getElementsByTagName('kbd')[0] != null) {
							cell.appendChild(document.createTextNode(' + '));
						}

						cell.appendChild(createElement('kbd', function(key) {
							key.setAttribute('data-keycode', shortcuts[shortcut]);
							key.appendChild(document.createTextNode(String.fromCharCode(shortcuts[shortcut])));
						}));
					}));
				}));

				body.appendChild(createElement('tr', function(row) {
					row.appendChild(createElement('td', function(cell) {
						cell.style.textAlign = 'center';
						cell.appendChild(createElement('a', function(button) {
							button.className = 'ipsButton_secondary';
							button.href = 'javascript:void(0)';
							button.style.marginTop = '5px';
							button.appendChild(document.createTextNode('Capture'));

							var nextPostCaptureHandler = function(event) {
								event.preventDefault();
								generatedCapturedKeys(event, document.getElementById('NavigationShortcuts').getElementsByClassName('NextPost')[0]);
							};

							button.onclick = function() {
								switch (this.childNodes[0].nodeValue) {
									case 'Submit':
										document.removeEventListener('keydown', nextPostCaptureHandler, false);

										if (document.getElementById('captureField') != null) {
											document.getElementById('captureField').remove();
										}

										this.className = this.className.replace(/\bcapturing\b/g, '').replace(/\s\s+/g, ' ').trim();
										this.childNodes[0].nodeValue = 'Capture';
									break;
									case 'Capture':
									default:
										if (document.getElementsByClassName('capturing')[0] != null) {
											while (document.getElementsByClassName('capturing')[0] != null) {
												document.getElementsByClassName('capturing')[0].click();
											}
										}

										if (document.getElementById('captureField') == null) {
											document.body.appendChild(createElement('textarea', function(capture) {
												capture.id = 'captureField';
												capture.style.position = 'fixed';
												capture.style.top = '0px';
												capture.style.left = '0px';
												capture.style.zIndex = '-999';
												capture.style.opacity = '0';

												capture.onblur = function() {
													this.focus();
												};
											}));

											document.getElementById('captureField').focus();
										}

										document.addEventListener('keydown', nextPostCaptureHandler, false);
										this.className += ' capturing';
										this.childNodes[0].nodeValue = 'Submit';
								}
							};
						}));
					}));

					row.appendChild(createElement('td', function(cell) {
						cell.style.textAlign = 'center';
						cell.appendChild(createElement('a', function(button) {
							button.className = 'ipsButton_secondary';
							button.href = 'javascript:void(0)';
							button.style.marginTop = '5px';
							button.appendChild(document.createTextNode('Capture'));

							var previousPostCaptureHandler = function(event) {
								event.preventDefault();
								generatedCapturedKeys(event, document.getElementById('NavigationShortcuts').getElementsByClassName('PreviousPost')[0]);
							};

							button.onclick = function() {
								switch (this.childNodes[0].nodeValue) {
									case 'Submit':
										document.removeEventListener('keydown', previousPostCaptureHandler, false);

										if (document.getElementById('captureField') != null) {
											document.getElementById('captureField').remove();
										}

										this.className = this.className.replace(/\bcapturing\b/g, '').replace(/\s\s+/g, ' ').trim();
										this.childNodes[0].nodeValue = 'Capture';
									break;
									case 'Capture':
									default:
										if (document.getElementsByClassName('capturing')[0] != null) {
											while (document.getElementsByClassName('capturing')[0] != null) {
												document.getElementsByClassName('capturing')[0].click();
											}
										}

										if (document.getElementById('captureField') == null) {
											document.body.appendChild(createElement('textarea', function(capture) {
												capture.id = 'captureField';
												capture.style.position = 'fixed';
												capture.style.top = '0px';
												capture.style.left = '0px';
												capture.style.zIndex = '-999';
												capture.style.opacity = '0';

												capture.onblur = function() {
													this.focus();
												};
											}));

											document.getElementById('captureField').focus();
										}

										document.addEventListener('keydown', previousPostCaptureHandler, false);
										this.className += ' capturing';
										this.childNodes[0].nodeValue = 'Submit';
								}
							};
						}));
					}));

					row.appendChild(createElement('td', function(cell) {
						cell.style.textAlign = 'center';
						cell.appendChild(createElement('a', function(button) {
							button.className = 'ipsButton_secondary';
							button.href = 'javascript:void(0)';
							button.style.marginTop = '5px';
							button.appendChild(document.createTextNode('Capture'));

							var nextPageCaptureHandler = function(event) {
								event.preventDefault();
								generatedCapturedKeys(event, document.getElementById('NavigationShortcuts').getElementsByClassName('NextPage')[0]);
							};

							button.onclick = function() {
								switch (this.childNodes[0].nodeValue) {
									case 'Submit':
										document.removeEventListener('keydown', nextPageCaptureHandler, false);

										if (document.getElementById('captureField') != null) {
											document.getElementById('captureField').remove();
										}

										this.className = this.className.replace(/\bcapturing\b/g, '').replace(/\s\s+/g, ' ').trim();
										this.childNodes[0].nodeValue = 'Capture';
									break;
									case 'Capture':
									default:
										if (document.getElementsByClassName('capturing')[0] != null) {
											while (document.getElementsByClassName('capturing')[0] != null) {
												document.getElementsByClassName('capturing')[0].click();
											}
										}

										if (document.getElementById('captureField') == null) {
											document.body.appendChild(createElement('textarea', function(capture) {
												capture.id = 'captureField';
												capture.style.position = 'fixed';
												capture.style.top = '0px';
												capture.style.left = '0px';
												capture.style.zIndex = '-999';
												capture.style.opacity = '0';

												capture.onblur = function() {
													this.focus();
												};
											}));

											document.getElementById('captureField').focus();
										}

										document.addEventListener('keydown', nextPageCaptureHandler, false);
										this.className += ' capturing';
										this.childNodes[0].nodeValue = 'Submit';
								}
							};
						}));
					}));

					row.appendChild(createElement('td', function(cell) {
						cell.style.textAlign = 'center';
						cell.appendChild(createElement('a', function(button) {
							button.className = 'ipsButton_secondary';
							button.href = 'javascript:void(0)';
							button.style.marginTop = '5px';
							button.appendChild(document.createTextNode('Capture'));

							var previousPageCaptureHandler = function(event) {
								event.preventDefault();
								generatedCapturedKeys(event, document.getElementById('NavigationShortcuts').getElementsByClassName('PreviousPage')[0]);
							};

							button.onclick = function() {
								switch (this.childNodes[0].nodeValue) {
									case 'Submit':
										document.removeEventListener('keydown', previousPageCaptureHandler, false);

										if (document.getElementById('captureField') != null) {
											document.getElementById('captureField').remove();
										}

										this.className = this.className.replace(/\bcapturing\b/g, '').replace(/\s\s+/g, ' ').trim();
										this.childNodes[0].nodeValue = 'Capture';
									break;
									case 'Capture':
									default:
										if (document.getElementsByClassName('capturing')[0] != null) {
											while (document.getElementsByClassName('capturing')[0] != null) {
												document.getElementsByClassName('capturing')[0].click();
											}
										}

										if (document.getElementById('captureField') == null) {
											document.body.appendChild(createElement('textarea', function(capture) {
												capture.id = 'captureField';
												capture.style.position = 'fixed';
												capture.style.top = '0px';
												capture.style.left = '0px';
												capture.style.zIndex = '-999';
												capture.style.opacity = '0';

												capture.onblur = function() {
													this.focus();
												};
											}));

											document.getElementById('captureField').focus();
										}

										document.addEventListener('keydown', previousPageCaptureHandler, false);
										this.className += ' capturing';
										this.childNodes[0].nodeValue = 'Submit';
								}
							};
						}));
					}));

					row.appendChild(createElement('td', function(cell) {
						cell.style.textAlign = 'center';
						cell.appendChild(createElement('a', function(button) {
							button.className = 'ipsButton_secondary';
							button.href = 'javascript:void(0)';
							button.style.marginTop = '5px';
							button.appendChild(document.createTextNode('Capture'));

							var lastPageCaptureHandler = function(event) {
								event.preventDefault();
								generatedCapturedKeys(event, document.getElementById('NavigationShortcuts').getElementsByClassName('LastPage')[0]);
							};

							button.onclick = function() {
								switch (this.childNodes[0].nodeValue) {
									case 'Submit':
										document.removeEventListener('keydown', lastPageCaptureHandler, false);

										if (document.getElementById('captureField') != null) {
											document.getElementById('captureField').remove();
										}

										this.className = this.className.replace(/\bcapturing\b/g, '').replace(/\s\s+/g, ' ').trim();
										this.childNodes[0].nodeValue = 'Capture';
									break;
									case 'Capture':
									default:
										if (document.getElementsByClassName('capturing')[0] != null) {
											while (document.getElementsByClassName('capturing')[0] != null) {
												document.getElementsByClassName('capturing')[0].click();
											}
										}

										if (document.getElementById('captureField') == null) {
											document.body.appendChild(createElement('textarea', function(capture) {
												capture.id = 'captureField';
												capture.style.position = 'fixed';
												capture.style.top = '0px';
												capture.style.left = '0px';
												capture.style.zIndex = '-999';
												capture.style.opacity = '0';

												capture.onblur = function() {
													this.focus();
												};
											}));

											document.getElementById('captureField').focus();
										}

										document.addEventListener('keydown', lastPageCaptureHandler, false);
										this.className += ' capturing';
										this.childNodes[0].nodeValue = 'Submit';
								}
							};
						}));
					}));

					row.appendChild(createElement('td', function(cell) {
						cell.style.textAlign = 'center';
						cell.appendChild(createElement('a', function(button) {
							button.className = 'ipsButton_secondary';
							button.href = 'javascript:void(0)';
							button.style.marginTop = '5px';
							button.appendChild(document.createTextNode('Capture'));

							var firstPageCaptureHandler = function(event) {
								event.preventDefault();
								generatedCapturedKeys(event, document.getElementById('NavigationShortcuts').getElementsByClassName('FirstPage')[0]);
							};

							button.onclick = function() {
								switch (this.childNodes[0].nodeValue) {
									case 'Submit':
										document.removeEventListener('keydown', firstPageCaptureHandler, false);

										if (document.getElementById('captureField') != null) {
											document.getElementById('captureField').remove();
										}

										this.className = this.className.replace(/\bcapturing\b/g, '').replace(/\s\s+/g, ' ').trim();
										this.childNodes[0].nodeValue = 'Capture';
									break;
									case 'Capture':
									default:
										if (document.getElementsByClassName('capturing')[0] != null) {
											while (document.getElementsByClassName('capturing')[0] != null) {
												document.getElementsByClassName('capturing')[0].click();
											}
										}

										if (document.getElementById('captureField') == null) {
											document.body.appendChild(createElement('textarea', function(capture) {
												capture.id = 'captureField';
												capture.style.position = 'fixed';
												capture.style.top = '0px';
												capture.style.left = '0px';
												capture.style.zIndex = '-999';
												capture.style.opacity = '0';

												capture.onblur = function() {
													this.focus();
												};
											}));

											document.getElementById('captureField').focus();
										}

										document.addEventListener('keydown', firstPageCaptureHandler, false);
										this.className += ' capturing';
										this.childNodes[0].nodeValue = 'Submit';
								}
							};
						}));
					}));
				}));

				body.appendChild(createElement('tr', function(row) {
					row.appendChild(createElement('td', function(cell) {
						cell.setAttribute('colspan', '6');
						cell.style.textAlign = 'center';
						cell.appendChild(createElement('a', function(save) {
							save.className = 'ipsButton';
							save.id = 'NavigationShortcuts_save';
							save.style.marginRight = '10px';
							save.style.marginTop = '5px';
							save.appendChild(document.createTextNode('Save Changes'));

							save.onclick = function() {
								opts = (localStorage.getItem('MakazeScriptOptions')) ? JSON.parse(localStorage.getItem('MakazeScriptOptions')) : {};
								shortcuts = (opts.hasOwnProperty('ipb_navigation_shortcuts')) ? opts.ipb_navigation_shortcuts : {
									'next_post': 74,
									'previous_post': 75,
									'next_page': 72,
									'previous_page': 76,
									'last_page': 72, 'last_page_modifier': 'shiftKey',
									'first_page': 76, 'first_page_modifier': 'shiftKey'
								};

								getChanges(shortcuts, 'next_post', 'NextPost');
								getChanges(shortcuts, 'previous_post', 'PreviousPost');
								getChanges(shortcuts, 'next_page', 'NextPage');
								getChanges(shortcuts, 'previous_page', 'PreviousPage');
								getChanges(shortcuts, 'last_page', 'LastPage');
								getChanges(shortcuts, 'first_page', 'FirstPage');

								opts.ipb_navigation_shortcuts = shortcuts;

								localStorage.setItem('MakazeScriptOptions', JSON.stringify(opts));

								fade(document.getElementById('NavigationShortcuts'), 'out');
								setTimeout(function() {
									document.getElementById('NavigationShortcuts').remove();
								}, 310);
							};
						}));

						cell.appendChild(createElement('a', function(close) {
							close.className = 'ipsButton';
							close.id = 'NavigationShortcuts_close';
							close.style.marginTop = '5px';
							close.appendChild(document.createTextNode('Cancel'));

							close.onclick = function() {
								fade(document.getElementById('NavigationShortcuts'), 'out');
								setTimeout(function() {
									document.getElementById('NavigationShortcuts').remove();
								}, 310);
							};
						}));

					}));
				}));
			}));
		}));
	}));

	fade(document.getElementById('NavigationShortcuts'), 'in');
}

var shortcutsHandler = function(event) {
	var context,
	item;

	if (document.activeElement.tagName === 'TEXTAREA' || document.activeElement.tagName === 'IFRAME' || document.activeElement.hasAttribute('contenteditable') || document.activeElement.tagName === 'INPUT') {
		return false;
	}

	if (event.keyCode === shortcuts['next_post'] && checkModifiers('next_post', event, shortcuts)) {
			event.preventDefault();
			scrollToNext(document.body, document.getElementsByClassName('post_block'), 'down');
	} else if (event.keyCode === shortcuts['previous_post'] && checkModifiers('previous_post', event, shortcuts)) {
			event.preventDefault();
			scrollToNext(document.body, document.getElementsByClassName('post_block'), 'up');
	} else if (event.keyCode === shortcuts['next_page'] && checkModifiers('next_page', event, shortcuts)) {
		context = document.getElementsByClassName('pagination')[0];

		if (context == null) {
			return false;
		}

		event.preventDefault();
		
		item = context.getElementsByClassName('next')[0];
		
		if (item != null) {
			item.getElementsByTagName('a')[0].click();
		} else {
			ipbMessage('No next page.', false);
			return false;
		}
	} else if (event.keyCode === shortcuts['previous_page'] && checkModifiers('previous_page', event, shortcuts)) {
		context = document.getElementsByClassName('pagination')[0];

		if (context == null) {
			return false;
		}

		event.preventDefault();

		item = context.getElementsByClassName('prev')[0];

		if (item != null) {
			item.getElementsByTagName('a')[0].click();
		} else {
			ipbMessage('No previous page.', false);
			return false;
		}
	} else if (event.keyCode === shortcuts['last_page'] && checkModifiers('last_page', event, shortcuts)) {
		context = document.getElementsByClassName('pagination')[0];

		if (context == null) {
			return false;
		}

		event.preventDefault();

		item = context.getElementsByClassName('next')[0];
		
		if (item == null) {
			ipbMessage('Already on the last page.', false);
			return false;
		}
		
		item = context.getElementsByClassName('last')[0];

		if (item == null) {
			context.getElementsByClassName('page')[context.getElementsByClassName('page').length - 1].getElementsByTagName('a')[0].click();
		} else {
			item.getElementsByTagName('a')[0].click();
		}
	} else if (event.keyCode === shortcuts['first_page'] && checkModifiers('first_page', event, shortcuts)) {
		context = document.getElementsByClassName('pagination')[0];

		if (context == null) {
			return false;
		}

		event.preventDefault();

		item = context.getElementsByClassName('prev')[0];
		
		if (item == null) {
			ipbMessage('Already on the first page.', false);
			return false;
		}

		item = context.getElementsByClassName('first')[0];

		if (item == null) {
			context.getElementsByClassName('page')[0].getElementsByTagName('a')[0].click();
		} else {
			item.getElementsByTagName('a')[0].click();
		}
	}
};

if (document.body.id === 'ipboard_body') {
	opts = (localStorage.getItem('MakazeScriptOptions')) ? JSON.parse(localStorage.getItem('MakazeScriptOptions')) : {};
	shortcuts = (opts.hasOwnProperty('ipb_navigation_shortcuts')) ? opts.ipb_navigation_shortcuts : {
		'next_post': 74,
		'previous_post': 75,
		'next_page': 72,
		'previous_page': 76,
		'last_page': 72, 'last_page_modifier': 'shiftKey',
		'first_page': 76, 'first_page_modifier': 'shiftKey'
	};

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

	if (styleElem.childNodes[0].nodeValue.indexOf('.MakazeScriptMenu') < 0) {
		styleElem.childNodes[0].nodeValue += '.MakazeScriptMenu { position: fixed; z-index: 99999; top: 50%; left: 50%; padding: 10px; background-color: rgba(255, 255, 255, .85); box-shadow: 0px 0px 3px #888; border-radius: 5px; color: #333; }  .MakazeScriptMenu th { font-weight: bolder; }  .MakazeScriptMenu th, .MakazeScriptMenu td { padding: 3px; }  .MakazeScriptMenu .menu-save { text-align: center; margin-top: 6px; }  .MakazeScriptMenu .menu-save > a { padding: 2px 10px; border: 1px solid #ccc; border-radius: 3px; font-weight: bolder; cursor: pointer; }  .MakazeScriptMenu .menuTitle { margin-bottom: 10px; font-weight: bolder; }  .MakazeScriptMenu .scrollableContent { width: 312px; height: 150px; overflow: auto; padding: 2px; }  .MakazeScriptMenu textarea, .MakazeScriptMenu input[type=text], .MakazeScriptMenu input[type=number] { font-family: Consolas, Ubuntu Mono, sans-serif; font-size: 10px; color: #333; padding: 3px; box-sizing: border-box; }  .MakazeScriptMenu kbd { background-color: #f5f5f5; padding: 2px 4px; border-radius: 3px; border-bottom: 2px solid #aaa; border-right: 2px solid #aaa; font-family: \'Courier New\', Courier, monospace; font-size: 110%; }\n\n';
	}

	styleElem.childNodes[0].nodeValue +=
		'#NavigationShortcuts {\n' +
			'width: 90%;\n' +
			'margin-left: -45%;\n' +
		'}\n\n' +

		'#NavigationNotice {\n' +
			'width: 100%;\n' +
			'font-size: 30px;\n' +
			'position: fixed;\n' +
			'z-index: 99999;\n' +
			'top: 50%;\n' +
			'left: 0px;\n' +
			'text-align: center;\n' +
			'background-color: #fafafa;\n' +
			'padding: 10px 0;\n' +
			'box-shadow: 0px 0px 3px #999;\n' +
		'}';

	document.getElementById('user_link_menucontent').getElementsByTagName('ul')[0].appendChild(createElement('li', function(li) {
		li.id = 'navigation_shortcuts';
		li.appendChild(createElement('a', function(link) {
			link.href = 'javascript:void(0)';
			link.appendChild(document.createTextNode('Navigation Shortcuts'));

			link.onclick = function() {
				if (document.getElementById('NavigationShortcuts') == null) {
					shortcutsMenu();
					document.getElementById('NavigationShortcuts').style.marginTop = '-' + (document.getElementById('NavigationShortcuts').offsetHeight / 2) + 'px';
				} else {
					document.getElementById('NavigationShortcuts_close').click();
				}
			};
		}));
	}));

	if (document.getElementsByClassName('post_block')[0] != null || document.getElementsByClassName('pagination')[0] != null) {
		document.addEventListener('keydown', shortcutsHandler, false);
	}
}