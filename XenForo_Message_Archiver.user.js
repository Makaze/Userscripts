// ==UserScript==
// @name	XenForo - Message Archiver
// @namespace	Makaze
// @description	Converts XenForo thread and conversation messages into text format for easy archiving.
// @include	*
// @grant	none
// @version	2.0.0
// ==/UserScript==

function runInGlobal(code) {
	var scripts = document.createElement('script');
	scripts.type = 'text/javascript';
	scripts.id = 'runInGlobal';
	scripts.appendChild(document.createTextNode(
		'(function() { ' + code + '})();' +
		'\n\n' +
		'document.getElementById(\'runInGlobal\').remove();'
	));

	(document.head || document.body || document.documentElement).appendChild(scripts);
}

function init() {
	var MakazeScriptStyles,
	styleElem,
	firstPage = '',
	lastPage = '',
	load,
	progress,
	posts,
	timer,
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

	function convertChildren(parent) {
		var doc = new DocumentFragment().appendChild(document.createElement('div')),
		temp,
		inside;

		function cleanHTML(elem) {
			return elem.innerHTML
				.replace(/<br>/gi, '\n')
				.replace(/<hr>/gi, '\n------------------------------------------------\n')
				.replace(/<\/?b>/gi, '**')
				.replace(/<\/?i>/gi, '_')
				.replace(/<a href="(.*?)".*?>(.*?)<\/a>/gi, '[$2]($1)')
				.replace(/<\/?a>/gi, '')
				.replace(/<img src="(.*?)".*?>/gi, '[IMG: $1]')
				.replace(/<\/?span.*?>/gi, '')
				.replace(/<div style="padding-left: \d+px;?">([^]*?)<\/div>/gi, '$1')
				.replace(/<.*?>/g, '')
				.replace(/\n[ \t]+\n/g, '\n\n')
				.replace(/\n\n+/gi, '\n\n')
				.trim();
		}

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
					temp = '\n> ' + inside.getElementsByClassName('attribution')[0].textContent.split(' said:')[0].trim() + ' said:\n> \n> ';
				} else {
					temp = '\n> ';
				}

				temp += cleanHTML(inside.getElementsByClassName('quote')[0])
					.replace(/&gt;/gi, '>')
					.replace(/\n/g, '\n> ') + '\n\n';

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

				temp = '\n~~~ ' + inside.getElementsByClassName('bbCodeSpoilerButton')[0].textContent.trim() + ':\n';

				temp += cleanHTML(inside.getElementsByClassName('bbCodeSpoilerText')[0]);

				temp += '\n~~~\n\n';

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
			temp = temp.split(/<\/?[uo]l.*?>(?! li")/);

			for (i = 0; i < temp.length; i++) {
				if (temp[i].indexOf('li') > -1) {
					temp[i] = temp[i]
						.replace(/<li.*?>/gi, ' * ')
						.replace(/<\/li>/gi, '') + '\n';
				}
			}

			doc.innerHTML = temp.join('');
		}

		if (doc.getElementsByClassName('bbCodeCode')[0] != null) {
			while (doc.getElementsByClassName('bbCodeCode')[0] != null) {
				inside = doc.getElementsByClassName('bbCodeCode')[0];

				temp = '\n``` Code:\n';

				temp += inside.getElementsByTagName('pre')[0].innerHTML;

				temp += '\n```\n\n';

				inside.parentNode.insertBefore(document.createTextNode(temp), inside);

				inside.remove();
			}
		}

		if (doc.getElementsByClassName('bbCodeHtml')[0] != null) {
			while (doc.getElementsByClassName('bbCodeHtml')[0] != null) {
				inside = doc.getElementsByClassName('bbCodeHtml')[0];

				temp = '\n``` HTML:\n';

				temp += inside.getElementsByTagName('pre')[0].innerHTML;

				temp += '\n```\n\n';

				inside.parentNode.insertBefore(document.createTextNode(temp), inside);

				inside.remove();
			}
		}

		if (doc.getElementsByClassName('bbCodeQuote')[0] != null) {
			recursiveQuotes(doc);
		}

		if (doc.getElementsByClassName('bbCodeSpoilerContainer')[0] != null) {
			recursiveSpoilers(doc);
		}

		doc.innerHTML = cleanHTML(doc)
			.replace(/\n/gi, '  \n')
			.replace(/[ \t]+\n/gi, '  \n');

		return doc.textContent.trim();
	}

	function loadPosts(ajax) {
		var context = (ajax) ? $(load) : $(document),
		msg,
		link,
		author,
		num,
		date,
		content,
		flag = false;

		if (!ajax) {
			if ($(context).find('.PageNav')[0] != null) {
				firstPage = $('.currentPage:first').text().trim();
			} else {
				firstPage = '1';
			}

			$(progress).find('.progressMessage').text('Loading Page ' + $('.currentPage:first').text().trim() + ' ');
		}

		$(context).find('.message').each(function() {
			msg = this;

			if (msg.getElementsByClassName('userText')[0] != null) {
				author = msg.getElementsByClassName('userText')[0].getElementsByClassName('username')[0].textContent.trim();
				num = (msg.getElementsByClassName('postNumber')[0] != null) ? '### Post ' + msg.getElementsByClassName('postNumber')[0].textContent.trim() + '\n' : '';
				date = msg.getElementsByClassName('DateTime')[0].title;
				content = convertChildren(msg.getElementsByClassName('messageContent')[0]);

				if (posts.value.length) {
					posts.value += '\n\n';
				}

				posts.value +=
					'------------------------------------------------\n\n' +

					num +
					'#### Author: ' + author + '\n' +
					'#### Posted: ' + date + '\n\n' +

					content;
			}
		});

		if ($(context).find('.PageNav')[0] != null) {
			$($(context).find('.PageNav .text').get().reverse()).each(function() {
				if (this.childNodes[0].nodeValue.substr(0, 4) === 'Next') {
					link = this.href;
					flag = true;
					return false;
				}
			});
		}

		if (flag) {
			$(progress).find('.progressMessage').text('Loading Page ' + link.match(/(\d+)$/)[1] + ' ');
			lastPage = link.match(/(\d+)$/)[1];
			$(load).load(link, function() {
				loadPosts(true);
			});
		} else {
			$(progress).find('.progressMessage').text('Done!');
			$(progress).attr('href', 'javascript:void(0)');

			$(progress).on('click.toggle', function() {
				var display = (posts.style.display.length && posts.style.display !== 'none'),
				scroll = { 'firefox': document.documentElement.scrollTop, 'chrome': document.body.scrollTop };

				$(posts).slideToggle('medium');

				if (!display) {
					$(progress).find('.progressMessage').text('Close');
					selectRange(posts, 0, posts.value.length);
					document.documentElement.scrollTop = scroll.firefox;
					document.body.scrollTop = scroll.chrome;
				} else {
					progress.remove();
				}
			});

			clearTimeout(timer);
			$(progress).find('.animation').text('');

			posts.value =
				'# Archive: ' + document.getElementsByClassName('titleBar')[0].getElementsByTagName('h1')[0].textContent.trim() + '\n' +
				'# Type: ' + ((document.getElementById('content').className.indexOf('conversation_view') > -1) ? 'Conversation' : 'Thread') + '\n\n' +

				'## Page' + ((lastPage.length) ? 's ' + firstPage + '-' + lastPage : ' ' + firstPage) + '\n\n' +
				posts.value;
		}
	}

	
	load = new DocumentFragment().appendChild(document.createElement('div'));
	posts = document.body.appendChild(createElement('textarea', function(text) {
		text.className = 'exportMessages';
	}));

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
		'.progressBar {\n' +
			'display: none;\n' +
			'position: fixed;\n' +
			'padding: 10px;\n' +
			'bottom: 15px;\n' +
			'right: 15px;\n' +
			'background-color: #222;\n' +
			'font-family: Consolas, monospace;\n' +
			'border: 2px solid #111;\n' +
			'border-radius: 5px;\n' +
			'box-shadow: 0px 0px 5px #111;\n' +
			'z-index: 999999;\n' +
		'}\n\n' +

		'.exportMessages {\n' +
			'display: none;\n' +
			'position: fixed;\n' +
			'padding: 10px;\n' +
			'background-color: #222;\n' +
			'font-family: Consolas, monospace ! important;\n' +
			'color: #eee;\n' +
			'border: 2px solid #111;\n' +
			'border-radius: 5px;\n' +
			'box-shadow: 0px 0px 5px #111;\n' +
			'font-size: 11px;\n' +
			'box-sizing: border-box;\n' +
			'bottom: 2.5%;\n' +
			'left: 25%;\n' +
			'height: 95%;\n' +
			'width: 50%;\n' +
			'overflow-x: hidden;\n' +
			'resize: none;\n' +
			'outline: none;\n' +
			'z-index: 999999;\n' +
		'}';

	document.getElementsByClassName('linkGroup')[0].insertBefore(createElement('a', function(button) {
		button.id = 'ExportMessages';
		button.href = 'javascript:void(0)';
		button.appendChild(document.createTextNode('Export Messages'));

		button.onclick = function() {
			progress = document.body.appendChild(createElement('a', function(prog) {
				prog.className = 'progressBar';

				prog.appendChild(createElement('span', function(message) {
					message.className = 'progressMessage';
				}));

				prog.appendChild(createElement('span', function(ani) {
					ani.className = 'animation';
					ani.style.whiteSpace = 'pre';
					ani.appendChild(document.createTextNode('.    '));
				}));
			}));

			timer = setInterval(function() {
				var text = $(progress).find('.animation').text();

				if (text === ".    ") {
					$(progress).find('.animation').text('. .  ');
				} else if (text === ". .  ") {
					$(progress).find('.animation').text('. . .');
				} else if (text === ". . .") {
					$(progress).find('.animation').text('  . .');
				} else if (text === "  . .") {
					$(progress).find('.animation').text('    .');
				} else if (text === "    .") {
					$(progress).find('.animation').text('     ');
				} else {
					$(progress).find('.animation').text('.    ');
				}
			}, 100);

			$(progress).slideUp('medium');

			loadPosts(false);
		};
	}), document.getElementsByClassName('linkGroup')[0].firstChild);
}

if (document.documentElement.id === 'XenForo') {
	if (document.getElementsByClassName('message')[0] != null && document.getElementsByClassName('linkGroup')[0] != null) {
		runInGlobal(init.toString() + 'init();');
	}

}