// ==UserScript==
// @name	IP.Board - Custom Avatars
// @namespace	Makaze
// @description	Allows users to customise or remove avatars on their display on a user-by-user basis.
// @include	*
// @grant	none
// @version	2.0.0
// ==/UserScript==

var MakazeScriptStyles,
styleElem,
userID,
avatars,
i = 0;

function createElement(type, callback) {
	var element = document.createElement(type);

	callback(element);

	return element;
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

function getRadioValue(name) {
	var radios = document.getElementsByName(name),
	val,
	i = 0;

	for (i = 0; i < radios.length; i++) {
		if (radios[i].checked) {
			val = radios[i].value;
			break;
		}
	}

	return val;
}

function loadAvatars() {
	var opts = (localStorage.getItem('MakazeScriptOptions')) ? JSON.parse(localStorage.getItem('MakazeScriptOptions')) : {},
	customAvatars = (opts.hasOwnProperty('ipb_custom_avatars')) ? opts.ipb_custom_avatars : {},
	avatars = document.getElementsByClassName('cAuthorPane_photo'),
	userid,
	i = 0;

	for (i = 0; i < avatars.length; i++) {
		userid = avatars[i].getElementsByClassName('ipsUserPhoto')[0].href.match(/profile\/(\d+)/i)[1];

		if (customAvatars.hasOwnProperty(userid)) {
			switch (customAvatars[userid]) {
				case false:
					avatars[i].getElementsByTagName('img')[0].style.display = 'none';
				break;
				default:
					avatars[i].getElementsByTagName('img')[0].style.display = '';
					avatars[i].getElementsByTagName('img')[0].src = customAvatars[userid];
			}
		}
	}
}

function editAvatar(user, setting) {
	var opts = (localStorage.getItem('MakazeScriptOptions')) ? JSON.parse(localStorage.getItem('MakazeScriptOptions')) : {},
	customAvatars = (opts.hasOwnProperty('ipb_custom_avatars')) ? opts.ipb_custom_avatars : {};

	if (setting !== null) {
		customAvatars[user] = setting;
	} else if (setting === null && customAvatars.hasOwnProperty(user)) {
		delete customAvatars[user];
	}

	opts.ipb_custom_avatars = customAvatars;

	localStorage.setItem('MakazeScriptOptions', JSON.stringify(opts));

	loadAvatars();
}

function addButton(user) {
	var opts = (localStorage.getItem('MakazeScriptOptions')) ? JSON.parse(localStorage.getItem('MakazeScriptOptions')) : {},
	customAvatars = (opts.hasOwnProperty('ipb_custom_avatars')) ? opts.ipb_custom_avatars : {},
	type = 'null';

	if (customAvatars.hasOwnProperty(user)) {
		type = (customAvatars[user] === false) ? 'disabled' : 'custom';
	}

	return createElement('div', function(cont) {
		cont.className = 'clear ipsType_small customAvatar';

		cont.appendChild(createElement('strong', function(strong) {
			strong.appendChild(createElement('a', function(button) {
				button.href = 'javascript:void(0)';
				button.appendChild(document.createTextNode('Customise Avatar'));

				button.onclick = function() {
					fade(this.parentNode.parentNode.getElementsByClassName('customAvatarPopup')[0]);
				};
			}));
		}));

		cont.appendChild(createElement('div', function(popup) {
			popup.className = 'customAvatarPopup MakazeScriptMenu';

			popup.appendChild(createElement('input', function(custom) {
				custom.type = 'radio';
				custom.name = 'customAvatarPopup';
				custom.value = 'custom';

				if (type === 'custom') {
					custom.setAttribute('checked', '');
				}
			}));
			popup.appendChild(document.createTextNode(' Custom avatar: '));
			popup.appendChild(createElement('input', function(text) {
				text.type = 'text';
				text.className = 'customAvatarURL';
				text.placeholder = 'URL';
			}));

			popup.appendChild(document.createElement('br'));

			popup.appendChild(createElement('input', function(custom) {
				custom.type = 'radio';
				custom.name = 'customAvatarPopup';
				custom.value = 'disabled';

				if (type === 'disabled') {
					custom.setAttribute('checked', '');
				}
			}));
			popup.appendChild(document.createTextNode(' Disable avatar'));

			popup.appendChild(document.createElement('br'));

			popup.appendChild(createElement('input', function(custom) {
				custom.type = 'radio';
				custom.name = 'customAvatarPopup';
				custom.value = 'null';

				if (type === 'null') {
					custom.setAttribute('checked', '');
				}
			}));
			popup.appendChild(document.createTextNode(' Default (requires refresh)'));

			popup.appendChild(createElement('div', function(right) {
				right.style.textAlign = 'right';
				right.appendChild(createElement('input', function(submit) {
					submit.type = 'button';
					submit.className = 'input_submit';
					submit.value = 'Okay';

					submit.onclick = function() {
						var val = getRadioValue('customAvatarPopup'),
						context = this.parentNode.parentNode,
						url = context.getElementsByClassName('customAvatarURL')[0].value;

						if (val === 'null') {
							editAvatar(user, null);
							fade(context);
						} else if (val === 'disabled') {
							editAvatar(user, false);
							fade(context);
						} else if (url.length) {
							editAvatar(user, url);
							fade(context);
						} else {
							alert('Missing URL');
							context.getElementsByClassName('customAvatarURL')[0].focus();
						}
					};
				}));
			}));
		}));
	});
}

if (document.body.className.indexOf('ipsApp') > -1) {
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
		'.customAvatar {\n' +
			'margin: 8px 0px;\n' +
			'position: relative;\n' +
		'}\n\n' +

		'.customAvatarPopup {\n' +
			'display: none;\n' +
			'position: absolute;\n' +
			'z-index: 999999;\n' +
			'left: 100%;\n' +
			'background-color: #f5f5f5;\n' +
			'padding: 10px;\n' +
			'border-radius: 5px;\n' +
			'box-shadow: 0px 0px 3px #555;\n' +
			'width: 300px;\n' +
			'text-align: left;\n' +
		'}';

	if (document.getElementsByClassName('cAuthorPane_photo')[0] != null) {
		loadAvatars();
	}

	if (document.getElementById('profile_photo') != null) {
		userID = location.href.match(/profile\/(\d+)/i)[1];
		document.getElementById('elProfilePhoto').parentNode.appendChild(addButton(userID));
	}

	for (i = 0, avatars = document.getElementsByClassName('cAuthorPane_photo'); i < avatars.length; i++) {
		userID = avatars[i].getElementsByClassName('ipsUserPhoto')[0].href.match(/profile\/(\d+)/i)[1];
		avatars[i].appendChild(addButton(userID));
	}
}