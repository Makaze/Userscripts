// ==UserScript==
// @name	XenForo - Archiver
// @namespace	Makaze
// @description	Convert XenForo thread and conversation messages into text format for easy archiving.
// @include	*
// @grant	none
// @version	1.0
// ==/UserScript==

var item,
buffer,
i = 0;

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

function pushMessage(msg, success, action) {
	document.body.appendChild(createElement('div', function(message) {
		message.id = "pushedMessage";
		message.style.display = 'none';
		message.style.width = '100%';
		message.style.fontSize = '150%';
		message.style.position = 'fixed';
		message.style.zIndex = 99999991;
		message.style.top = '50%';
		message.style.left = '0px';
		message.style.textAlign = 'center';
		message.style.backgroundColor = '#fafafa';
		message.style.color = '#333';
		message.style.padding = '10px 0px';
		message.style.boxShadow = '0px 0px 5px';

		if (success) {
			message.appendChild(document.createTextNode(msg));
			console.log(msg);
		} else {
			message.appendChild(createElement('strong', function(type) {
				type.appendChild(document.createTextNode('Error:'));
			}));
			message.appendChild(document.createTextNode(' ' + msg));
			console.log('Error:', msg);
		}

		message.appendChild(createElement('div', function(buttons) {
			buttons.style.marginTop = '.5em';

			if (action != null) {
				buttons.appendChild(createElement('a', function(act) {
					act.className = 'button';
					act.href = 'javascript:void(0)';
					act.style.marginRight = '10px';
					act.appendChild(document.createTextNode('Okay'));

					act.onclick = function() {
						action();

						fade(document.getElementById('pushedMessage'), 'out');
						setTimeout(function() {
							document.getElementById('pushedMessage').remove();
						}, 310);
					};
				}));

				buttons.appendChild(createElement('a', function(act) {
					act.className = 'button';
					act.href = 'javascript:void(0)';
					act.appendChild(document.createTextNode('Cancel'));

					act.onclick = function() {
						fade(document.getElementById('pushedMessage'), 'out');
						setTimeout(function() {
							document.getElementById('pushedMessage').remove();
						}, 310);
						selectRange(document.getElementById('ExportedMessages_content'), 0, document.getElementById('ExportedMessages_content').value.length);
						document.getElementById('ExportedMessages_content').focus();
					};
				}));
			} else {
				buttons.appendChild(createElement('a', function(act) {
					act.className = 'button';
					act.href = 'javascript:void(0)';
					act.appendChild(document.createTextNode('Okay'));

					act.onclick = function() {
						fade(document.getElementById('pushedMessage'), 'out');
						setTimeout(function() {
							document.getElementById('pushedMessage').remove();
						}, 310);
						selectRange(document.getElementById('ExportedMessages_content'), 0, document.getElementById('ExportedMessages_content').value.length);
						document.getElementById('ExportedMessages_content').focus();
					};
				}));
			}
		}));
		
	}));

	fade(document.getElementById('pushedMessage'), 'in');

	document.getElementById('pushedMessage').style.marginTop = '-' + (document.getElementById('pushedMessage').offsetHeight / 2) + 'px';
}

function convertChildren(parent) {
	var doc = new DocumentFragment().appendChild(document.createElement('div')),
	temp,
	inside,
	i = 0;

	function recursiveQuotes(parent) {
		var inside,
		temp;

		while (parent.getElementsByClassName('bbCodeQuote')[0] != null) {
			inside = parent.getElementsByClassName('bbCodeQuote')[0];

			if (inside.getElementsByClassName('bbCodeQuote')[0] != null) {
				recursiveQuotes(inside);
			}

			if (inside.getElementsByClassName('bbCodeSpoilerContainer')[0] != null) {
				recursiveSpoilers(inside);
			}

			if (inside.getElementsByClassName('attribution')[0] != null) {
				temp = '\n== ' +inside.getElementsByClassName('attribution')[0].textContent.split(' said:')[0].trim() + ' said: ==\n';
			} else {
				temp = '\n== QUOTE ==\n';
			}

			temp += inside.getElementsByClassName('quote')[0].innerHTML;

			if (inside.getElementsByClassName('attribution')[0] != null) {
				temp += '\n== / ' +inside.getElementsByClassName('attribution')[0].textContent.split(' said:')[0].trim() + ' said: ==\n\n';
			} else {
				temp += '\n== / QUOTE ==\n\n';
			}

			inside.parentNode.insertBefore(document.createTextNode(temp), inside);

			inside.remove();
		}
	}

	function recursiveSpoilers(parent) {
		var inside,
		temp;

		while (parent.getElementsByClassName('bbCodeSpoilerContainer')[0] != null) {
			inside = parent.getElementsByClassName('bbCodeSpoilerContainer')[0];

			if (inside.getElementsByClassName('bbCodeSpoilerContainer')[0] != null) {
				recursiveSpoilers(inside);
			}

			if (inside.getElementsByClassName('bbCodeQuote')[0] != null) {
				recursiveQuotes(inside);
			}

			temp = '\n== ' + inside.getElementsByClassName('bbCodeSpoilerButton')[0].textContent.trim() + ' ==\n';

			temp += inside.getElementsByClassName('bbCodeSpoilerText')[0].innerHTML;

			temp += '\n== / ' + inside.getElementsByClassName('bbCodeSpoilerButton')[0].textContent.trim() + ' ==\n\n';

			inside.parentNode.insertBefore(document.createTextNode(temp), inside);

			inside.remove();
		}
	}

	doc.innerHTML = parent.innerHTML;

	if (doc.getElementsByClassName('messageAd')[0] != null) {
		while (doc.getElementsByClassName('messageAd')[0] != null) {
			doc.getElementsByClassName('messageAd')[0].remove();
		}
	}

	if (doc.getElementsByTagName('script')[0] != null) {
		while (doc.getElementsByTagName('script')[0] != null) {
			doc.getElementsByTagName('script')[0].remove();
		}
	}

	if (doc.getElementsByTagName('style')[0] != null) {
		while (doc.getElementsByTagName('style')[0] != null) {
			doc.getElementsByTagName('style')[0].remove();
		}
	}

	temp = doc.innerHTML;

	if (temp.indexOf('<ul') > -1 || temp.indexOf('<ol') > -1) {
		temp = temp.split(/<\/?[uo]l.*?>/);

		for (i = 0; i < temp.length; i++) {
			if (temp[i].indexOf('li') > -1) {
				temp[i] = temp[i]
					.replace(/<li.*?>/gi, '[*] ')
					.replace(/<\/li>/gi, '');
			}
		}

		doc.innerHTML = temp.join('');
	}

	if (doc.getElementsByClassName('bbCodeCode')[0] != null) {
		while (doc.getElementsByClassName('bbCodeCode')[0] != null) {
			inside = doc.getElementsByClassName('bbCodeCode')[0];

			temp = '\n== Code: ==\n';

			temp += inside.getElementsByTagName('pre')[0].innerHTML;

			temp += '\n== / Code: ==\n\n';

			inside.parentNode.insertBefore(document.createTextNode(temp), inside);

			inside.remove();
		}
	}

	if (doc.getElementsByClassName('bbCodeHtml')[0] != null) {
		while (doc.getElementsByClassName('bbCodeHtml')[0] != null) {
			inside = doc.getElementsByClassName('bbCodeHtml')[0];

			temp = '\n== HTML: ==\n';

			temp += inside.getElementsByTagName('pre')[0].innerHTML;

			temp += '\n== / HTML: ==\n\n';

			inside.parentNode.insertBefore(document.createTextNode(temp), inside);

			inside.remove();
		}
	}

	doc.innerHTML = doc.innerHTML
		.replace(/<br>/gi, '\n')
		.replace(/<hr>/gi, '------------------------------------------------\n')
		.replace(/<\/?b>/gi, '')
		.replace(/<\/?i>/gi, '')
		.replace(/<a href="(.*?)" target="_blank" class="externalLink" rel="nofollow">(.*?)<\/a>/gi, '$2 ($1)')
		.replace(/<\/?a.*?>/gi, '')
		.replace(/<img src="(.*?)".*?>/gi, '[IMG: $1]')
		.replace(/<\/?span.*?>/gi, '')
		.replace(/<div style="padding-left: \d+px;?">([^]*?)<\/div>/gi, '$1');

	if (doc.getElementsByClassName('bbCodeQuote')[0] != null) {
		recursiveQuotes(doc);
	}

	if (doc.getElementsByClassName('bbCodeSpoilerContainer')[0] != null) {
		recursiveSpoilers(doc);
	}

	doc.innerHTML = doc.innerHTML
		.replace(/\n\n/g, '\n');

	return doc.textContent.trim();
}

function archive(buffer) {
	var CAPACITY = 5242880,
	filled = 0,
	temp,
	links,
	link,
	flag = false,
	msgs,
	msg,
	author,
	num,
	date,
	content,
	posts = [],
	i = 0;

	function loadArchive(normal) {
		document.body.appendChild(createElement('div', function(cont) {
			cont.id = 'ExportedMessages';
			cont.style.display = 'none';

			cont.appendChild(createElement('textarea', function(text) {
				text.id = 'ExportedMessages_content';
				text.style.position = 'fixed';
				text.style.zIndex = 9999998;
				text.style.width = '100%';
				text.style.height = '100%';
				text.style.top = '0px';
				text.style.left = '0px';
				text.style.boxSizing = 'border-box';
				text.style.border = 'none';
				text.style.padding = '15px';
				text.style.opacity = '.95';
				text.style.backgroundColor = '#111';
				text.style.color = '#eee';

				text.value = buffer;
			}));

			cont.appendChild(createElement('a', function(fin) {
				fin.id = 'ExportedMessages_close';
				fin.style.position = 'fixed';
				fin.style.top = '0px';
				fin.style.left = '25%';
				fin.style.width = '50%';
				fin.style.zIndex = 9999999;
				fin.style.backgroundColor = '#f5f5f5';
				fin.style.color = '#333';
				fin.style.padding = '10px 0px';
				fin.style.boxSizing = 'border-box';
				fin.style.borderBottomLeftRadius = '5px';
				fin.style.borderBottomRightRadius = '5px';
				fin.style.boxShadow = '0px 0px 5px';
				fin.style.textAlign = 'center';
				fin.style.fontWeight = 'bold';
				fin.style.fontSize = '120%';

				fin.href = 'javascript:void(0)';

				if (normal) {
					fin.appendChild(document.createTextNode('Close'));

					fin.onclick = function() {
						pushMessage('The archive will be cleared. Are you sure?', true, function() {
							localStorage.removeItem('Export Messages');
							fade(document.getElementById('ExportedMessages'), 'out');
							setTimeout(function() {
								document.getElementById('ExportedMessages').remove();
							}, 310);
							if (window.location.href.slice(-16) === '#Export_Messages') {
								window.location.href = window.location.href.substr(0, window.location.href.length - 16);
							}
						});
					};
				} else {
					fin.appendChild(document.createTextNode('Continue'));

					fin.onclick = function() {
						pushMessage('The archive will be cleared. Are you sure?', true, function() {
							localStorage.removeItem('Export Messages');
							fade(document.getElementById('ExportedMessages'), 'out');
							setTimeout(function() {
								document.getElementById('ExportedMessages').remove();
							}, 310);

							window.location.reload();
						});
					};
				}
			}));
		}));
		
		fade(document.getElementById('ExportedMessages'), 'in');

		document.getElementById('ExportedMessages_content').setAttribute('style', document.getElementById('ExportedMessages_content').getAttribute('style') + 'font-family: monospace ! important;');
	}

	for (i = 0, msgs = document.getElementsByClassName('message'); i < msgs.length; i++) {
		msg = msgs[i];

		if (msg.getElementsByClassName('userText')[0] != null) {
			author = msg.getElementsByClassName('userText')[0].getElementsByClassName('username')[0].textContent.trim();
			num = (msg.getElementsByClassName('postNumber')[0] != null) ? 'Post: ' + msg.getElementsByClassName('postNumber')[0].textContent.trim() + '\n' : '';
			date = msg.getElementsByClassName('DateTime')[0].title;
			content = convertChildren(msg.getElementsByClassName('messageText')[0]);

			posts.push('#===============================================================#\n' +
				num +
				'Author: ' + author + '\n' +
				'Posted: ' + date + '\n\n' +

				content + '\n' +
				'#===============================================================#');
		}
	}

	temp = '\n\n' + posts.join('\n\n');

	for (i = 0; i < localStorage.length; i++) {
		filled += localStorage.getItem(localStorage.key(i)).length;
	}

	if (filled + temp.length >= CAPACITY) {
		loadArchive(false);
		pushMessage('Storage capacity has been reached. Copy the current buffer to a text file to save progress, then click Continue to continue retrieving the archive.', false);
		return false;
	}

	buffer += temp;

	localStorage.setItem('Export Messages', buffer);

	if (document.getElementsByClassName('PageNav')[0] != null) {
		for (i = document.getElementsByClassName('PageNav')[0].getElementsByClassName('text').length - 1, links = document.getElementsByClassName('PageNav')[0].getElementsByClassName('text'); i >= 0; i--) {
			link = links[i];
			if (link.childNodes[0].nodeValue.substr(0, 4) === 'Next') {
				flag = true;
				break;
			}
		}
	}

	if (flag) {
		link.href = link.href + '#Export_Messages';
		link.click();
	} else {
		loadArchive(true);
		pushMessage('Archive retrieved. Copy it to a text file to save it.', true);
	}
}

if (document.documentElement.id === 'XenForo') {
	if (document.getElementsByClassName('message')[0] != null && document.getElementsByClassName('linkGroup')[0] != null) {
		document.getElementsByClassName('linkGroup')[0].insertBefore(createElement('a', function(button) {
			button.id = 'ExportMessages';
			button.href = 'javascript:void(0)';
			button.appendChild(document.createTextNode('Export Messages'));

			button.onclick = function() {
				if (document.getElementsByClassName('PageNav')[0] != null && document.getElementsByClassName('PageNav')[0].getElementsByClassName('text')[0] != null && document.getElementsByClassName('PageNav')[0].getElementsByClassName('text')[0].childNodes[0].nodeValue.slice(-4) === 'Prev') {
					localStorage.removeItem('Export Messages');
					for (i = 0; i < document.getElementsByClassName('PageNav')[0].getElementsByTagName('a').length; i++) {
						item = document.getElementsByClassName('PageNav')[0].getElementsByTagName('a')[i];

						if (item.className.indexOf('text') < 0) {
							item.href = item.href + '#Export_Messages';
							item.click();
							break;
						}
					}
				} else {
					buffer =
						'$---------------------------------------------------------------$\n\n' +

						'Archive: ' + document.getElementsByClassName('titleBar')[0].getElementsByTagName('h1')[0].textContent.trim() + '\n' +
						'Type: ' + ((document.getElementById('content').className.indexOf('conversation_view') > -1) ? 'Conversation' : 'Thread') + '\n\n' +

						'$---------------------------------------------------------------$';

					archive(buffer);
				}
			};
		}), document.getElementsByClassName('linkGroup')[0].firstChild);
	}

	if (location.href.slice(-16) === '#Export_Messages') {
		if (!localStorage.getItem('Export Messages')) {
			buffer =
				'$---------------------------------------------------------------$\n\n' +

				'Archive: ' + document.getElementsByClassName('titleBar')[0].getElementsByTagName('h1')[0].textContent.trim() + '\n' +
				'Type: ' + ((document.getElementById('content').className.indexOf('conversation_view') > -1) ? 'Conversation' : 'Thread') + '\n\n' +

				'$---------------------------------------------------------------$';
		} else {
			buffer = localStorage.getItem('Export Messages');
		}
		
		archive(buffer);
	}
}