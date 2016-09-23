// ==UserScript==
// @name	Serenes Forest - Thread Extractor
// @namespace	Makaze
// @description	Extracts threads as a sortable table.
// @include	*://serenesforest.net/forums/*
// @grant	none
// @version	1.0.0
// ==/UserScript==

function createElement(type, callback) {
	var element = document.createElement(type);

	callback(element);

	return element;
}

function runInJQDT(code) {
	document.getElementsByTagName('head')[0].appendChild(createElement('script', function(jQ) {
		jQ.type = 'text/javascript';
		jQ.src = 'https://code.jquery.com/jquery-2.1.3.min.js';

		jQ.onload = function() {
			document.body.appendChild(createElement('script', function(content) {
				content.appendChild(document.createTextNode('jQuery.noConflict();'));
				getDataTables(code);
			}));
		};
	}));
}

function getDataTables(code) {
	var css = 'https://cdn.datatables.net/t/dt/jszip-2.5.0,pdfmake-0.1.18,dt-1.10.11,b-1.1.2,b-colvis-1.1.2,b-flash-1.1.2,b-html5-1.1.2,fh-3.1.1,se-1.1.2/datatables.min.css',
	js = 'https://cdn.datatables.net/t/dt/jszip-2.5.0,pdfmake-0.1.18,dt-1.10.11,b-1.1.2,b-colvis-1.1.2,b-flash-1.1.2,b-html5-1.1.2,fh-3.1.1,se-1.1.2/datatables.min.js',
	cssElem = createElement('link', function(dTcss) {
		dTcss.type = 'text/css';
		dTcss.rel = 'stylesheet';
		dTcss.href = css;
	}),
 	jsElem = createElement('script', function(dTjs) {
		dTjs.type = 'text/javascript';
		dTjs.src = js;

		dTjs.onload = function() {
			document.body.appendChild(createElement('script', function(content) {
				content.appendChild(document.createTextNode(code));
			}));
		};
	});

	document.getElementsByTagName('head')[0].appendChild(cssElem);
	document.getElementsByTagName('head')[0].appendChild(jsElem);
}

function main() {
	var MakazeScriptStyles,
	styleElem,
	VERSION = "1.0.0",
	doc = new DocumentFragment().appendChild(document.createElement('div')),
	postFrame,
	background,
	notice,
	vote_check = false,
	end_phase = false,
	thread = location.href.match(/showtopic=(\d+)/i)[1] || null,
	defaults = {
		'posts': [],
		'thread': thread,
		'post': 0,
		'page': 1
	},
	pageTitle = document.title;

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

	function getPost(postid, postnumber, threadinfo) {
		var doc = new DocumentFragment(),
		post = '';

		jQuery(doc).load('http://serenesforest.net/forums/index.php?app=forums&module=post&section=post&do=reply_post&f=25&t=46581&qpid=' + postid + ' #postingform', function() {
			post += jQuery('<textarea />').html(jQuery(doc).find('textarea').val()).text().trim().replace(/^\[quote.*?\]/i, '').replace(/\[\/quote\]$/i, '');

			threadinfo['posts'][postnumber - 1] = {'postid': postid, 'postnumber': postnumber, 'postcontent': post};
		});
	}

	function getThread(loadTo, threadinfo = null) {
		if (threadinfo === null) {
			threadinfo = defaults;
		}

		var pageLoading = jQuery('#thread-extract-loading').text('Loading page ' + threadinfo.page + '...');

		jQuery(loadTo).load('http://serenesforest.net/forums/index.php?showtopic=' + threadinfo.thread + '&page=' + threadinfo.page + ' #content', function() {
			if (parseInt(jQuery(loadTo).find('.post_block:last .post_id > a:first').text().trim().split('#')[1]) > threadinfo.post) {
				jQuery(loadTo).find('.post_block').each(function() {
					var self = this,
					poster = parseInt(jQuery(self).find('.author > a:first').attr('hovercard-id')),
					posterName = jQuery(self).find('.author > a:first').text().trim(),
					postURL = jQuery(self).find('.post_id > a:first').attr('href'),
					postNum = parseInt(jQuery(self).find('.post_id > a:first').text().replace('#', '').trim()),
					dateOptions = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false },
					postTime = new Date(jQuery(self).find('.posted_info abbr:first').attr('title').trim()).toLocaleString(),
					postid = parseInt(jQuery(self).find('.post_id > a:first').data('entry-pid')),
					postContent;

					jQuery(self).find('.entry-content:first script').remove();
					jQuery(self).find('.entry-content:first style').remove();
					jQuery(self).find('.entry-content:first .edit').remove();
					jQuery(self).find('.entry-content:first .bbc_spoiler_show[value="Show"]').click();

					postContent = jQuery(self).find('.entry-content:first').html().trim();

					threadinfo['posts'][postNum - 1] = {'user': posterName, 'userid': poster, 'postid': postid, 'postnumber': postNum, 'posted': postTime, 'postcontent': postContent};
					threadinfo.post++;
				});
			}

			if (jQuery(loadTo).find('.next').get(0) != null) {
				threadinfo.page++;
				getThread(loadTo, threadinfo);
			} else {
				jQuery('#thread-extract-loading').fadeOut('fast');
				console.log(threadinfo.posts);
				jQuery('body').html('<table id="thread-table" class="cell-border"><thead><th>Post #</td><th>User</th><th>Posted</th><th>Content</td></thead><tbody></tbody>');
				jQuery('#thread-table').DataTable({
					data: threadinfo.posts,
					columns: [
						{ data: 'postnumber' },
						{ data: 'user' },
						{ data: 'posted' },
						{ data: 'postcontent' }
					],
					dom: 'Bfrtip',
					buttons: [
						'copy', 'excel', 'pdf'
					]
				});
			}
		});
	}

	//Styling

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
		'#thread-table td {\n' +
			'white-space: pre-wrap;\n' +
			'vertical-align: top;\n' +
		'}\n\n' +

		'#thread-extract-loading {\n' +
			'position: fixed;\n' +
			'height: 3em;\n' +
			'background-color: #fefefe;\n' +
			'color: #444;\n' +
			'top: 50%;\n' +
			'width: 100%;\n' +
			'line-height: 3em;\n' +
			'text-align: center;\n' +
			'box-shadow: 0px 0px 3px #000;\n' +
			'font-size: 3em;\n' +
			'margin-top: -1.5em;\n' +
		'}';

	jQuery('.topic_buttons:first').append(createElement('li', function(btn) {
		btn.appendChild(createElement('a', function(link) {
			link.href = 'javascript:void(0)';
			link.title = 'Extract this thread';
			link.appendChild(document.createTextNode('Extract this thread'));

			link.onclick = function() {
				jQuery('body').append('<div id="thread-extract-loading" style="display: none;" />');
				jQuery('#thread-extract-loading').fadeIn('fast');
				getThread(doc);
			};
		}));
	}));
}

if (location.href.indexOf('showtopic=') > -1) {
	runInJQDT(
		main.toString() +
		'main();'
	);
}