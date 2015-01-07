// ==UserScript==
// @name	IP.Board - Lockpick Quotes
// @namespace	Makaze
// @description	Enables quoting posts from locked threads as MultiQuotes.
// @include	*
// @grant	none
// @version	1.0.0
// ==/UserScript==

var quotes,
posts,
post,
pid,
i = 0;

function createElement(type, callback) {
	var element = document.createElement(type);

	callback(element);

	return element;
}

function getCookie(name) {
	var start = document.cookie.indexOf(name + "="),
	len = start + name.length + 1,
	end;

	if ((!start) && (name !== document.cookie.substring(0, name.length))) {
		return null;
	}

	if (start === -1) {
		return null;
	}

	end = document.cookie.indexOf(';', len);

	if (end === -1) {
		end = document.cookie.length;
	}

	return decodeURIComponent(document.cookie.substring(len, end));
}

function addMQuote(id) {
	var sel,
	flag = false;

	for (i = 0; i < quotes.length; i++) {
		if (quotes[i] === id) {
			flag = true;
			quotes.splice(i, 1);
			break;
		}
	}

	sel = (flag) ? ' selected' : '';

	return createElement('li', function(mq) {
		mq.className = 'multiquote' + sel;
		mq.id = 'multiq_' + id;
		mq.appendChild(createElement('a', function(link) {
			link.className = 'ipsButton_secondary';
			link.title = 'MultiQuote allows you to select multiple posts across multiple topics, then reply to them all at once';
			link.href = 'javascript:void(0)';
			link.appendChild(document.createTextNode('MultiQuote'));
		}));
	});
}

if (document.getElementsByTagName('body')[0].id === 'ipboard_body') {
	if (document.getElementsByClassName('topic_buttons')[0] != null && document.getElementsByClassName('topic_buttons')[0].getElementsByClassName('important')[0] != null && document.getElementsByClassName('topic_buttons')[0].getElementsByClassName('important')[0].textContent.indexOf('locked') > -1) {
		if (document.getElementsByClassName('post_controls')[0] != null) {
			quotes = (getCookie('ipb_mqtids')) ? getCookie('ipb_mqtids').split(',') : [];

			for (i = 0, posts = document.getElementsByClassName('post_controls'); i < posts.length; i++) {
				post = posts[i];
				pid = post.id.match(/(\d+)/)[1];

				post.appendChild(addMQuote(pid));
			}
		}
	}
}