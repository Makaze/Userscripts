// ==UserScript==
// @name	XenForo - Expanded Search Results
// @namespace	Makaze
// @description	Shows expanded posts in search results instead of snippets.
// @include	*
// @grant	none
// @version	1.2.0
// ==/UserScript==

var MakazeScriptStyles,
styleElem,
i;

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
			'.snippet {\n' +
				'position: relative;\n' +
				'overflow: hidden;\n' +
			'}\n\n' +

			'.searchExpand {\n' +
				'display: block;\n' +
				'position: absolute;\n' +
				'z-index: 1;\n' +
			'}';

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
			createElement.toString() +
			"$('.searchResult').each(function() {" +
				"var id = $(this).get(0).id," +
				"self = this;" +

				"if (id.substr(0, 7) !== 'profile') {" +
					"$(this).find('.contentType').append(createElement('a', function(cut) {" +
						"cut.className = 'searchExpand';" +
						"cut.href = 'javascript:void(0)';" +
						"cut.appendChild(document.createTextNode('Expand'));" +

						"$(cut).on('click', function() {" +
							"var expand = this;" +

							"$(self).find('.snippet').fadeOut('slow');" +

							"$(expand).fadeOut('slow');" +

							"if (!$(self).find('.fullPost').length) {" +
								"$(self).find('.snippet').after(createElement('blockquote', function(full) {" +
									"full.className = 'fullPost';" +
								"}));" +
							"}" +

							"$(self).find('.fullPost').load($(self).find('.snippet a').get(0).href + ' #' + id + ' .messageText:first', function() {" +
								"$('#' + id).find('.fullPost').find('.messageAd, style').remove();" +

								"$('#' + id).find('.fullPost').fadeIn('slow');" +
							"});" +
						"});" +
					"}));" +
				"}" +
			"});" +

			"$('.pageNavLinkGroup .linkGroup').append(createElement('a', function(all) {" +
				"all.href = 'javascript:void(0)';" +
				"all.appendChild(document.createTextNode('Expand All'));" +

				"$(all).on('click', function() {" +
					"$('.searchExpand').each(function() {" +
						"$(this).click();" +
					"});" +
					
					"$(this).fadeOut('slow');" +
				"});" +
			"}));"
		);
	}
}