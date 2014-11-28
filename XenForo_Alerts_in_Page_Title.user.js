// ==UserScript==
// @name	XenForo - Alerts in Page Title
// @namespace	Makaze
// @description	Shows the number of alerts in the page title.
// @include	*
// @grant	none
// @version	1.0.0
// ==/UserScript==

var defaultTitle = document.title;

function alerts() {
	var PMs = parseInt(document.getElementById('ConversationsMenu_Counter').getElementsByClassName('Total')[0].childNodes[0].nodeValue.trim()),
	Alerts = parseInt(document.getElementById('AlertsMenu_Counter').getElementsByClassName('Total')[0].childNodes[0].nodeValue.trim()),
	total = PMs + Alerts;

	if (total > 0) {
		document.title = '[' + total + '] ' + defaultTitle;
	} else if (document.title !== defaultTitle) {
		document.title = defaultTitle;
	}
}

if (document.documentElement.id === 'XenForo') {
	if (document.getElementById('ConversationsMenu_Counter') != null && document.getElementById('AlertsMenu_Counter') != null) {
		setInterval(alerts, 1000);
	}
}