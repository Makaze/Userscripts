// ==UserScript==
// @name	IP.Chat - Auto-Resizing Popup
// @namespace	Makaze
// @description	Automatically resizes the chat container to fill the window when in pop-up mode.
// @include	*
// @grant	none
// @version	1.0
// ==/UserScript==

if (document.body.id === 'ipboard_body' && document.getElementById('storage_chatroom') != null && window.location.href.indexOf('_popup=1') > -1) {
	document.getElementById('messages-display').style.transition = 'height 50ms ease-in-out';

	document.getElementById('messages-display').style.height = window.innerHeight - 30 - 121 + 'px';

	window.addEventListener('resize', function() {
		document.getElementById('messages-display').style.height = window.innerHeight - 30 - 121 + 'px';
	}, false);
}