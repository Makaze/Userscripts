// ==UserScript==
// @name	IP.Board - Member Nicknames
// @namespace	Makaze
// @description	Adds an optional customized Nickname field to the profiles of members of your choice. 
// @include	*
// @grant	none
// @version	1.0.3
// ==/UserScript==

var MakazeScriptStyles,
styleElem,
opts,
nicks,
context,
userID,
appendLocation,
i = 0,
j = 0;

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

function selectAll(el) {
	var range = document.createRange();
	range.selectNodeContents(el);
	var sel = window.getSelection();
	sel.removeAllRanges();
	sel.addRange(range);
}

function editNick(event) {
	var opts = (localStorage.getItem('MakazeScriptOptions')) ? JSON.parse(localStorage.getItem('MakazeScriptOptions')) : {},
	nicks = (opts.hasOwnProperty('ipb_member_nicknames')) ? opts.ipb_member_nicknames : [],
	context = event.target.parentNode.parentNode,
	user = event.target.getAttribute('data-userid'),
	field,
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
	
	if (context.getElementsByClassName('memberNickname')[0] == null) {
		addNick({ 'nickname': '', 'user': user }, context.getElementsByClassName('author')[0]);
	}
	
	field = context.getElementsByClassName('memberNickname')[0].getElementsByClassName('nickname')[0];

	empty(field);
	field.setAttribute('contenteditable', '');
	field.focus();
	selectAll(field);

	var submitNick = function(event) {
		if (event.keyCode === 13) {
			event.preventDefault();

			var opts = (localStorage.getItem('MakazeScriptOptions')) ? JSON.parse(localStorage.getItem('MakazeScriptOptions')) : {},
			nicks = (opts.hasOwnProperty('ipb_member_nicknames')) ? opts.ipb_member_nicknames : [],
			newNick = (event.target.childNodes[0] != null) ? event.target.childNodes[0].nodeValue : '',
			context,
			userID,
			appendLocation,
			newNickObj,
			i = 0;

			event.target.removeAttribute('contenteditable');
			window.getSelection().removeAllRanges();
			event.target.blur();

			if (newNick.length) {
				if (edit) {
					nicks[index].nickname = newNick;

					for (i = 0; i < document.getElementsByClassName('memberNickname_' + user).length; i++) {
						document.getElementsByClassName('memberNickname_' + user)[i].getElementsByClassName('nickname')[0].childNodes[0].nodeValue = newNick;
					}
				} else {
					newNickObj = { 'user': user, 'nickname': newNick };

					nicks.push(newNickObj);

					for (i = 0; i < document.getElementsByClassName('author').length; i++) {
						context = document.getElementsByClassName('author')[i];
						if (context.getElementsByClassName('memberNickname')[0] == null) {
							if (context.getElementsByTagName('a')[0] != null) {
								userID = context.getElementsByTagName('a')[0].href.match(/showuser=(\d+)/i)[1];
								appendLocation = context;
								
								if (userID === newNickObj.user) {
									addNick(newNickObj, appendLocation);
								}
							}
						}
					}
				}
			} else {
				if (edit) {
					nicks.splice(index, 1);
				}

				while (document.getElementsByClassName('memberNickname_' + user)[0] != null) {
					document.getElementsByClassName('memberNickname_' + user)[0].remove();
				}
			}

			if (newNick.length || edit) {
				opts.ipb_member_nicknames = nicks;
				localStorage.setItem('MakazeScriptOptions', JSON.stringify(opts));
			}

			event.target.removeEventListener('keydown', submitNick, false);
		}
	};

	field.addEventListener('keydown', submitNick, false);
}

function addNick(nickobj, context, specialClass) {
	if (specialClass != null) {
		specialClass += ' ';
	} else {
		specialClass = '';
	}

	context.appendChild(createElement('span', function(cont) {
		cont.className = specialClass + 'memberNickname memberNickname_' + nickobj.user;
		cont.appendChild(document.createTextNode(' / '));

		cont.appendChild(createElement('span', function(field) {
			field.className = 'nickname';
			field.appendChild(document.createTextNode(nickobj.nickname));
		}));
	}));
}

if (document.body.id === 'ipboard_body') {
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
		'.nickname {\n' +
			'min-height: 1px;\n' +
			'min-width: 1px;\n' +
			'display: inline-block;\n' +
		'}';

	var nickButton = function() {
		return createElement('span', function(cont) {
			cont.className = 'right ipsType_small desc blend_links';
			cont.style.marginRight = '7px';
			cont.appendChild(createElement('a', function(link) {
				link.title = 'Edit this user\'s Nickname';
				link.href = 'javascript:void(0)';
				link.setAttribute('data-userid', userID);
				link.className = 'nicknameTrigger';
				link.appendChild(document.createTextNode('Nickname'));

				link.onclick = editNick;
			}));
		});
	};

	if (document.getElementsByClassName('author')[0] != null) {
		opts = (localStorage.getItem('MakazeScriptOptions')) ? JSON.parse(localStorage.getItem('MakazeScriptOptions')) : {};
		nicks = (opts.hasOwnProperty('ipb_member_nicknames')) ? opts.ipb_member_nicknames : [];

		for (i = 0; i < document.getElementsByClassName('author').length; i++) {
			context = document.getElementsByClassName('author')[i];
			if (context.getElementsByTagName('a')[0] != null) {
				userID = context.getElementsByTagName('a')[0].href.match(/showuser=(\d+)/i)[1];
				appendLocation = context;

				context.parentNode.appendChild(nickButton());

				if (nicks.length) {
					for (j = 0; j < nicks.length; j++) {
						if (userID === nicks[j].user) {
							addNick(nicks[j], appendLocation);
						}
					}
				}
			}
		}
	}
}