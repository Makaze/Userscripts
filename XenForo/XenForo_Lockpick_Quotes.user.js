// ==UserScript==
// @name	XenForo - Lockpick Quotes
// @namespace	Makaze
// @description	Enables quoting posts from locked threads as MultiQuotes.
// @include	*
// @grant	none
// @version	1.0.0
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

function createElement(type, callback) {
	var element = document.createElement(type);

	callback(element);

	return element;
}

function MultiQuote() {
	this.add = function(post) {
		var quotes = ($.getCookie('MultiQuote')) ? $.getCookie('MultiQuote').split(',') : [];

		quotes.push(post);

		$.setCookie('MultiQuote', quotes.join(','));
	};

	this.remove = function(post) {
		var quotes = ($.getCookie('MultiQuote')) ? $.grep($.getCookie('MultiQuote').split(','), function(val) {
			return val !== post;
		}) : [];

		if (quotes.length) {
			$.setCookie('MultiQuote', quotes.join(','));
		} else {
			$.deleteCookie('MultiQuote');
		}
	};
}

function main() {
	var MQ = new MultiQuote(),
	quotes = ($.getCookie('MultiQuote')) ? $.getCookie('MultiQuote').split(',') : [],
	flag = false,
	i = 0;

	$('.message').each(function() {
		var post = this.id.split('post-')[1];

		for (i = 0; i < quotes.length; i++) {
			if (quotes[i] === post) {
				flag = true;
				quotes.splice(i, 1);
				break;
			}
		}

		$(this).find('.publicControls').append(createElement('a', function(mq) {
			var symbol = (flag) ? '-' : '+';

			mq.href = 'javascript:void(0)';
			mq.setAttribute('data-messageid', post);
			mq.className = 'MultiQuoteControl JsOnly item control';

			if (flag) {
				$(mq).addClass('active');
			}

			mq.appendChild(createElement('span', function(span) {
				span.className = 'symbol';
				span.appendChild(document.createTextNode(symbol + ' Quote'));
			}));

			$(mq).on('click', function() {
				if ($(this).hasClass('active')) {
					$(this).find('.symbol').text('+ Quote');
					$(this).removeClass('active');
					MQ.remove(post);
				} else {
					$(this).find('.symbol').text('- Quote');
					$(this).addClass('active');
					MQ.add(post);
				}
			});
		}));
	});
}

if (document.documentElement.id === 'XenForo') {
	if (document.getElementsByClassName('message')[0] != null && document.getElementsByClassName('reply')[0] == null) {
		runInGlobal(
			createElement.toString() +
			MultiQuote.toString() +
			main.toString() +
			'main();'
		);
	}
}