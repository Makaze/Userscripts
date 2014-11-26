// ==UserScript==
// @name	XenForo - Expanded Search Results
// @namespace	Makaze
// @description	Shows expanded posts in search results instead of snippets.
// @include	*
// @grant	none
// @version	1.0.0
// ==/UserScript==

function createElement(type, callback) {
	var element = document.createElement(type);

	callback(element);

	return element;
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

if (document.documentElement.id === 'XenForo') {
	if (document.getElementsByClassName('searchResult')[0] != null) {
		for (i = 0; i < document.head.getElementsByTagName('link').length; i++) {
			if (document.head.getElementsByTagName('link')[i].getAttribute('href').substr(0, 12) === 'css.php?css=') {
				document.head.appendChild(createElement('link', function(css) {
					css.rel = 'stylesheet';
					css.setAttribute('href',
						document.head.getElementsByTagName('link')[i].getAttribute('href').substr(0, 12) + 'RT_UserOnlineRibbon_Dot,RT_UserOnlineRibbon_Responsive,attachment_editor,back_to_top,bb_code,bbcode_tabs,bbm_buttons,dark_azucloud,doublepost_bb_code_tag,likes_summary,message,message_user_info,nat_public_css,node_list,quick_reply,thread_online,thread_view,waindigo_message_user_info_socialgroups' + document.head.getElementsByTagName('link')[i].getAttribute('href').match(/&.*?$/i)[0]
					);
				}));
				break;
			}
		}

		runInGlobal(
			"$('.searchResult').each(function() {" +
				"var id = $(this).get(0).id;" +

				"$(this).find('.snippet').fadeOut('slow');" +

				"$(this).find('.snippet').load($(this).find('.snippet a').get(0).href + ' #' + id + ' .messageText:first', function() {" +
					"$('#' + id).find('.snippet').find('.messageAd, style').remove();" +

					"$('#' + id).find('.snippet').fadeIn('slow');" +
				"});" +
			"});"
		);
	}
}