// ==UserScript==
// @name	IP.Board - Quote Search Results
// @namespace	Makaze
// @description	Enables quoting posts from Search Results as MultiQuotes.
// @include	*
// @grant	none
// @version	1.0.0
// ==/UserScript==

var posts,
post,
pid,
container,
i = 0;

// Remove by value

Array.prototype.remove = function() {
	var what, a = arguments, L = a.length, ax;
	while (L && this.length) {
		what = a[--L];
		while ((ax = this.indexOf(what)) !== -1) {
			this.splice(ax, 1);
		}
	}
	return this;
};

// ###### MOZILLA COOKIE LIBRARY ######

/*\
|*|
|*|  :: cookies.js ::
|*|
|*|  A complete cookies reader/writer framework with full unicode support.
|*|
|*|  Revision #1 - September 4, 2014
|*|
|*|  https://developer.mozilla.org/en-US/docs/Web/API/document.cookie
|*|  https://developer.mozilla.org/User:fusionchess
|*|
|*|  This framework is released under the GNU Public License, version 3 or later.
|*|  http://www.gnu.org/licenses/gpl-3.0-standalone.html
|*|
|*|  Syntaxes:
|*|
|*|  * docCookies.setItem(name, value[, end[, path[, domain[, secure]]]])
|*|  * docCookies.getItem(name)
|*|  * docCookies.removeItem(name[, path[, domain]])
|*|  * docCookies.hasItem(name)
|*|  * docCookies.keys()
|*|
\*/

var docCookies = {
	getItem: function (sKey) {
		if (!sKey) { return null; }
		return decodeURIComponent(document.cookie.replace(new RegExp("(?:(?:^|.*;)\\s*" + encodeURIComponent(sKey).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=\\s*([^;]*).*$)|^.*$"), "$1")) || null;
	},
	setItem: function (sKey, sValue, vEnd, sPath, sDomain, bSecure) {
		if (!sKey || /^(?:expires|max\-age|path|domain|secure)$/i.test(sKey)) { return false; }
		var sExpires = "";
		if (vEnd) {
			switch (vEnd.constructor) {
				case Number:
					sExpires = vEnd === Infinity ? "; expires=Fri, 31 Dec 9999 23:59:59 GMT" : "; max-age=" + vEnd;
					break;
				case String:
					sExpires = "; expires=" + vEnd;
					break;
				case Date:
					sExpires = "; expires=" + vEnd.toUTCString();
					break;
			}
		}
		document.cookie = encodeURIComponent(sKey) + "=" + encodeURIComponent(sValue) + sExpires + (sDomain ? "; domain=" + sDomain : "") + (sPath ? "; path=" + sPath : "") + (bSecure ? "; secure" : "");
		return true;
	},
	removeItem: function (sKey, sPath, sDomain) {
		if (!this.hasItem(sKey)) { return false; }
		document.cookie = encodeURIComponent(sKey) + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT" + (sDomain ? "; domain=" + sDomain : "") + (sPath ? "; path=" + sPath : "");
		return true;
	},
	hasItem: function (sKey) {
		if (!sKey) { return false; }
		return (new RegExp("(?:^|;\\s*)" + encodeURIComponent(sKey).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=")).test(document.cookie);
	},
	keys: function () {
		var aKeys = document.cookie.replace(/((?:^|\s*;)[^\=]+)(?=;|$)|^\s*|\s*(?:\=[^;]*)?(?:\1|$)/g, "").split(/\s*(?:\=[^;]*)?;\s*/);
		for (var nLen = aKeys.length, nIdx = 0; nIdx < nLen; nIdx++) { aKeys[nIdx] = decodeURIComponent(aKeys[nIdx]); }
		return aKeys;
	}
};

// ###### END MOZILLA COOKIE LIBRARY ######

function createElement(type, callback) {
	var element = document.createElement(type);

	callback(element);

	return element;
}

function addMQuote(id) {
	var sel,
	flag = false,
	quotes = (docCookies.getItem('ipb_mqtids')) ? docCookies.getItem('ipb_mqtids').split(',') : [],
	j = 0;

	for (j = 0; j < quotes.length; j++) {
		if (quotes[j] === id) {
			flag = true;
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

			link.onclick = function() {
				var quotes = (docCookies.getItem('ipb_mqtids')) ? docCookies.getItem('ipb_mqtids').split(',') : [],
				parent = this.parentNode;

				if (parent.className.indexOf('selected') > -1) {
					quotes.remove(id);
					parent.className = parent.className.replace(/ ?selected ?/g, '');
					if (quotes.length) {
						docCookies.setItem('ipb_mqtids', quotes.join(','), null, '/forums', '.' + location.hostname);
					} else {
						docCookies.removeItem('ipb_mqtids');
					}
				} else {
					quotes.push(id);
					parent.className += ' selected';

					docCookies.setItem('ipb_mqtids', quotes.join(','), null, '/forums', '.' + location.hostname);
				}
			};
		}));
	});
}

if (document.getElementsByTagName('body')[0].id === 'ipboard_body') {
	if (window.location.href.indexOf('module=search') > -1) {
		for (i = 0, posts = document.getElementsByClassName('post_block'); i < posts.length; i++) {
			post = posts[i];
			pid = post.getElementsByClassName('post_id')[0].textContent.match(/(\d+)/)[1];

			container = post.appendChild(document.createElement('ul'));
			container.className = 'post_controls clear clearfix';
			container.appendChild(addMQuote(pid));
		}
	}
}