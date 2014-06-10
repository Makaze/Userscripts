// ==UserScript==
// @name	XenForo - Navigation Shortcuts
// @namespace	Makaze
// @description	Adds keyboard navigation shortcuts to XenForo.
// @include	*
// @grant	none
// @version	1.0
// ==/UserScript==

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
		if (currentTime < duration) {
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
					scrollTo(context, getPosition(item).y, 50);
					break;
				}
			}
		break;
		case 'down':
		default:
			for (i = 0; i < collection.length; i++) {
				item = collection[i];

				if (getPosition(item).y > context.scrollTop + 2) {
					scrollTo(context, getPosition(item).y, 50);
					break;
				}
			}
		break;
	}
}

function xenForoMessage(msg, success) {
	if (success) {
		$('#shortcutNotice .content').html(msg);
		console.log(msg);
	} else {
		$('#shortcutNotice .content').html('<strong>Navigation Error:</strong> ' + msg);
		console.log('Error:', msg);
	}
	$('#shortcutNotice').slideDown('medium');
	$('#shortcutNotice .content').animate({
		'opacity': 1
	}, 'fast');
	setTimeout(function() {
		$('#shortcutNotice').slideUp('medium');
		$('#shortcutNotice .content').animate({
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

var shortcutsHandler = function(event) {
	var context,
	item;

	if (document.activeElement.tagName === 'TEXTAREA' || document.activeElement.tagName === 'IFRAME' || document.activeElement.hasAttribute('contenteditable') || document.activeElement.tagName === 'INPUT') {
		return false;
	}

	if (!event.shiftKey && !event.altKey && !event.ctrlKey) {
		switch (event.keyCode) {
			case 72:
				context = document.getElementsByClassName('PageNav')[0];

				if (context == null || context.getElementsByClassName('text')[0] == null) {
					return false;
				}

				event.preventDefault();

				item = context.getElementsByClassName('text')[0];
				if (item.textContent.indexOf('Prev') > -1) {
					item.click();
				} else {
					runInGlobal('xenForoMessage(\'No previous page.\', false);');
				}
			break;
			case 74:
				event.preventDefault();
				scrollToNext(document.body, document.getElementsByClassName('message'), 'up');
			break;
			case 75:
				event.preventDefault();
				scrollToNext(document.body, document.getElementsByClassName('message'), 'down');
			break;
			case 76:
				context = document.getElementsByClassName('PageNav')[0];

				if (context == null || context.getElementsByClassName('text')[0] == null) {
					return false;
				}

				event.preventDefault();
				
				item = context.getElementsByClassName('text')[context.getElementsByClassName('text').length - 1];
				if (item.textContent.indexOf('Next') > -1) {
					item.click();
				} else {
					runInGlobal('xenForoMessage(\'No next page.\', false);');
				}
			break;
		}
	}

	if (event.shiftKey) {
		switch (event.keyCode) {
			case 72:
				context = document.getElementsByClassName('PageNav')[0];

				if (context == null) {
					return false;
				}

				event.preventDefault();

				item = context.getElementsByClassName('text')[0];

				if (item.textContent.indexOf('Prev') < 0) {
					runInGlobal('xenForoMessage(\'Already on the first page.\', false);');
					return false;
				}

				for (i = 0; i < context.getElementsByTagName('a').length; i++) {
					item = context.getElementsByTagName('a')[i];

					if (item.className.indexOf('text') < 0) {
						item.click();
						break;
					}
				}
			break;
			case 76:
				context = document.getElementsByClassName('PageNav')[0];

				if (context == null) {
					return false;
				}

				event.preventDefault();

				item = context.getElementsByClassName('text')[context.getElementsByClassName('text').length - 1];

				if (item.textContent.indexOf('Next') < 0) {
					runInGlobal('xenForoMessage(\'Already on the last page.\', false);');
					return false;
				}
				
				for (i = context.getElementsByTagName('a').length - 1; i >= 0; i--) {
					item = context.getElementsByTagName('a')[i];

					if (item.className.indexOf('text') < 0) {
						item.click();
						break;
					}
				}
			break;
		}
	}
};

if (document.documentElement.id === 'XenForo' && (document.getElementsByClassName('message')[0] != null || document.getElementsByClassName('PageNav')[0])) {
	runInGlobal(xenForoMessage.toString());

	document.body.appendChild(createElement('div', function(cont) {
		cont.className = 'xenOverlay timedMessage';
		cont.id = 'shortcutNotice';
		cont.style.top = '0px';
		cont.style.left = '0px';
		cont.style.position = 'fixed';
		cont.style.display = 'none';

		cont.appendChild(createElement('div', function(content) {
			content.className = 'content baseHtml';
			content.style.opacity = 0;
			content.appendChild(document.createTextNode('Shortcut notice.'));
		}));
	}));

	document.addEventListener('keydown', shortcutsHandler, false);
}