// ==UserScript==
// @name	XenForo - Member Nicknames
// @namespace	Makaze
// @description	Adds an optional customized Nickname field to the profiles of members of your choice. 
// @include	*
// @grant	none
// @version	1.0
// ==/UserScript==

var MakazeScriptStyles,
styleElem,
opts,
nicks,
context,
userID,
profileID,
appendLocation,
i = 0,
j = 0;

function createElement(type, callback) {
	var element = document.createElement(type);

	callback(element);

	return element;
}

function insertAfter(newNode, referenceNode) {
	referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
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

function editNick(user) {
	var opts = (localStorage.getItem('MakazeScriptOptions')) ? JSON.parse(localStorage.getItem('MakazeScriptOptions')) : {},
	nicks = (opts.hasOwnProperty('xf_member_nicknames')) ? opts.xf_member_nicknames : [],
	edit = false,
	index = 0;

	if (nicks.length) {
		for (index = 0; index < nicks.length; index++) {
			if (nicks[index].user === user) {
				edit = true;
				break;
			}	
		}
	}

	document.body.appendChild(createElement('div', function(bg) {
		bg.id = 'memberNicknameRequest-background';
		bg.onclick = function() {
			fade(document.getElementById('memberNicknameRequest'), 'out');
			fade(document.getElementById('memberNicknameRequest-background'), 'out');

			setTimeout(function() {
				document.getElementById('memberNicknameRequest').remove();
				document.getElementById('memberNicknameRequest-background').remove();
			}, 310);
		};
	}));

	document.body.appendChild(createElement('div', function(req) {
		req.className = 'xenOverlay';
		req.id = 'memberNicknameRequest';

		req.appendChild(createElement('div', function(overlay) {
			overlay.className = 'formOverlay xenForm';

			overlay.appendChild(createElement('div', function(close) {
				close.className = 'memberNicknameRequest_close';
				close.id = 'redactor_modal_close';
				close.appendChild(document.createTextNode('×'));

				close.onclick = function() {
					fade(document.getElementById('memberNicknameRequest'), 'out');
					fade(document.getElementById('memberNicknameRequest-background'), 'out');

					setTimeout(function() {
						document.getElementById('memberNicknameRequest').remove();
						document.getElementById('memberNicknameRequest-background').remove();
					}, 310);
				};
			}));

			overlay.appendChild(createElement('div', function(heading) {
				heading.className = 'heading';
				heading.appendChild(document.createTextNode('Nickname'));
			}));

			overlay.appendChild(createElement('div', function(inner) {
				inner.appendChild(createElement('div', function(fieldcont) {
					fieldcont.appendChild(createElement('dl', function(field) {
						field.className = 'ctrlUnit';
						field.appendChild(createElement('dt', function(desc) {
							desc.className = 'descField';
							desc.appendChild(document.createTextNode('Nickname:'));
						}));

						field.appendChild(createElement('dd', function(dd) {
							dd.appendChild(createElement('input', function(input) {
								input.type = 'text';
								input.className = 'textCtrl';
								input.id = 'memberNickname_contentField';

								if (edit) {
									input.value = nicks[index].nickname;
								}
							}));
						}));
					}));
				}));

				inner.appendChild(createElement('dl', function(footer) {
					footer.className = 'ctrlUnit submitUnit';
					footer.appendChild(createElement('dt', function() {}));

					footer.appendChild(createElement('dd', function(dd) {
						dd.appendChild(createElement('input', function(button) {
							button.type = 'button';
							button.className = 'redactor_modal_btn button primary';
							button.value = 'Save';
							button.style.marginRight = '5px';

							button.onclick = function() {
								var opts = (localStorage.getItem('MakazeScriptOptions')) ? JSON.parse(localStorage.getItem('MakazeScriptOptions')) : {},
								nicks = (opts.hasOwnProperty('xf_member_nicknames')) ? opts.xf_member_nicknames : [{ 'nickname': 'Lulu', 'user': '62132' }],
								newNick = document.getElementById('memberNickname_contentField').value,
								context,
								userID,
								appendLocation,
								newNickObj,
								i = 0;

								if (newNick.length) {
									if (edit) {
										nicks[index].nickname = newNick;

										for (i = 0; i < document.getElementsByClassName('memberNickname_' + user).length; i++) {
											document.getElementsByClassName('memberNickname_' + user)[i].getElementsByTagName('a')[0].childNodes[0].nodeValue = newNick;
										}
									} else {
										newNickObj = { 'user': user, 'nickname': newNick };

										nicks.push(newNickObj);

										for (i = 0; i < document.getElementsByClassName('messageUserInfo').length; i++) {
											context = document.getElementsByClassName('messageUserInfo')[i];
											if (context.getElementsByClassName('username')[0] != null) {
												userID = context.getElementsByClassName('username')[0].href.match(/members\/.*?\.(\d+)\//i)[1];
												appendLocation = context.getElementsByClassName('extraUserInfo')[0];
												
												if (userID === newNickObj.user) {
													addNick(newNickObj, appendLocation, 'pairsJustified');
												}
											}
										}

										if (document.getElementById('info') != null) {
											appendLocation = document.getElementById('info').getElementsByClassName('aboutPairs')[0];
											addNick(newNickObj, appendLocation);
										}
									}
								} else {
									if (edit) {
										nicks.splice(index, 1);

										while (document.getElementsByClassName('memberNickname_' + user)[0] != null) {
											document.getElementsByClassName('memberNickname_' + user)[0].remove();
										}
									}
								}

								if (newNick.length || edit) {
									opts.xf_member_nicknames = nicks;
									localStorage.setItem('MakazeScriptOptions', JSON.stringify(opts));
								}

								fade(document.getElementById('memberNicknameRequest'), 'out');
								fade(document.getElementById('memberNicknameRequest-background'), 'out');

								setTimeout(function() {
									document.getElementById('memberNicknameRequest').remove();
									document.getElementById('memberNicknameRequest-background').remove();
								}, 310);
							};
						}));

						if (edit) {
							dd.appendChild(createElement('input', function(button) {
								button.type = 'button';
								button.className = 'redactor_modal_btn button primary';
								button.value = 'Remove';
								button.style.marginRight = '5px';

								button.onclick = function() {
									var opts = (localStorage.getItem('MakazeScriptOptions')) ? JSON.parse(localStorage.getItem('MakazeScriptOptions')) : {},
									nicks = (opts.hasOwnProperty('xf_member_nicknames')) ? opts.xf_member_nicknames : [{ 'nickname': 'Lulu', 'user': '62132' }];

									while (document.getElementsByClassName('memberNickname_' + user)[0] != null) {
										document.getElementsByClassName('memberNickname_' + user)[0].remove();
									}

									nicks.splice(index, 1);
									opts.xf_member_nicknames = nicks;
									localStorage.setItem('MakazeScriptOptions', JSON.stringify(opts));

									fade(document.getElementById('memberNicknameRequest'), 'out');
									fade(document.getElementById('memberNicknameRequest-background'), 'out');

									setTimeout(function() {
										document.getElementById('memberNicknameRequest').remove();
										document.getElementById('memberNicknameRequest-background').remove();
									}, 310);
								};
							}));
						}

						dd.appendChild(createElement('a', function(cancel) {
							cancel.className = 'redactor_modal_btn button';
							cancel.appendChild(document.createTextNode('Cancel'));

							cancel.onclick = function() {
								fade(document.getElementById('memberNicknameRequest'), 'out');
								fade(document.getElementById('memberNicknameRequest-background'), 'out');

								setTimeout(function() {
									document.getElementById('memberNicknameRequest').remove();
									document.getElementById('memberNicknameRequest-background').remove();
								}, 310);
							};
						}));
					}));
				}));
			}));
		}));
	}));

	fade(document.getElementById('memberNicknameRequest-background'), 'in');
	fade(document.getElementById('memberNicknameRequest'), 'in');

	document.getElementById('memberNickname_contentField').focus();

	document.getElementById('memberNicknameRequest').style.marginTop = '-' + (document.getElementById('memberNicknameRequest').offsetHeight / 2) + 'px';
}

function addNick(nickobj, context, specialClass) {
	if (specialClass != null) {
		specialClass += ' ';
	} else {
		specialClass = '';
	}

	context.insertBefore(createElement('dl', function(cont) {
		cont.className = specialClass + 'memberNickname memberNickname_' + nickobj.user;
		cont.appendChild(createElement('dt', function(dt) {
			dt.appendChild(document.createTextNode('Nickname:'));
		}));

		cont.appendChild(createElement('dd', function(dd) {
			dd.appendChild(createElement('a', function(link) {
				link.className = 'concealed';
				link.href = 'javascript:void(0)';
				link.title = 'Change Nickname';
				link.appendChild(document.createTextNode(nickobj.nickname));

				link.onclick = function() {
					editNick(nickobj.user);
				};
			}));
		}));
	}), context.firstChild);
}

if (document.documentElement.id === 'XenForo') {
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
		'#memberNicknameRequest-background {\n' +
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

		'#memberNicknameRequest {\n' +
			'position: fixed;\n' +
			'left: 50%;\n' +
			'width: 600px;\n' +
			'margin-left: -300px;\n' +
			'top: 50%;\n' +
			'height: auto;\n' +
			'z-index: 99999999;\n' +
			'display: none;\n' +
		'}';

	for (i = 0; i < document.head.getElementsByTagName('link').length; i++) {
		if (document.head.getElementsByTagName('link')[i].getAttribute('href').substr(0, 12) === 'css.php?css=') {
			document.head.getElementsByTagName('link')[i].setAttribute('href',
				document.head.getElementsByTagName('link')[i].getAttribute('href').substr(0, 12) + 'editor_ui,' + document.head.getElementsByTagName('link')[i].getAttribute('href').slice(12)
			);
			break;
		}
	}

	if (document.getElementsByClassName('messageUserInfo')[0] != null) {
		opts = (localStorage.getItem('MakazeScriptOptions')) ? JSON.parse(localStorage.getItem('MakazeScriptOptions')) : {};
		nicks = (opts.hasOwnProperty('xf_member_nicknames')) ? opts.xf_member_nicknames : [];

		if (nicks.length) {
			for (i = 0; i < document.getElementsByClassName('messageUserInfo').length; i++) {
				context = document.getElementsByClassName('messageUserInfo')[i];
				if (context.getElementsByClassName('username')[0] != null) {
					userID = context.getElementsByClassName('username')[0].href.match(/members\/.*?\.(\d+)\//i)[1];
					appendLocation = context.getElementsByClassName('extraUserInfo')[0];
					
					for (j = 0; j < nicks.length; j++) {
						if (userID === nicks[j].user) {
							addNick(nicks[j], appendLocation, 'pairsJustified');
						}
					}
				}
			}
		}
	}

	if (document.getElementsByClassName('profilePage')[0] != null) {
		opts = (localStorage.getItem('MakazeScriptOptions')) ? JSON.parse(localStorage.getItem('MakazeScriptOptions')) : {};
		nicks = (opts.hasOwnProperty('xf_member_nicknames')) ? opts.xf_member_nicknames : [];
		profileID = window.location.href.match(/members\/.*?\.(\d+)\//i)[1];

		insertAfter(createElement('li', function(li) {
			li.appendChild(createElement('a', function(link) {
				link.className = 'memberNickname_edit';
				link.href = 'javascript:void(0)';
				link.appendChild(document.createTextNode('Nickname'));

				link.onclick = function() {
					editNick(profileID);
				};
			}));
		}), document.getElementsByClassName('followBlock')[0].getElementsByTagName('ul')[0].lastChild);

		if (nicks.length) {
			if (document.getElementById('info') != null) {
				for (i = 0; i < nicks.length; i++) {
					if (profileID === nicks[i].user) {
						appendLocation = document.getElementById('info').getElementsByClassName('aboutPairs')[0];
						addNick(nicks[i], appendLocation);
						break;
					}
				}
			}
		}
	}

	var memberCardHandler = function(event) {
		var card,
		userLinks,
		userID;

		if (!event.target.hasAttribute || !event.target.hasAttribute('data-overlayclass') || event.target.getAttribute('data-overlayclass').indexOf('memberCard') < 0) {
			return false;
		}

		card = event.target;

		if (card.getElementsByClassName('memberNickname_edit')[0] != null) {
			return false;
		}

		userLinks = card.getElementsByClassName('userLinks')[0];
		userID = card.getElementsByClassName('username')[0].getElementsByClassName('username')[0].href.match(/members\/.*?\.(\d+)\//i)[1];

		insertAfter(createElement('a', function(link) {
			link.className = 'memberNickname_edit';
			link.href = 'javascript:void(0)';
			link.appendChild(document.createTextNode('Nickname'));

			link.onclick = function() {
				editNick(userID);
			};
		}), userLinks.lastChild);
	};

	document.addEventListener('DOMNodeInserted', memberCardHandler, false);
}