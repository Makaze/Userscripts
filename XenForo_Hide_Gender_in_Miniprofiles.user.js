// ==UserScript==
// @name	XenForo - Hide Gender in Miniprofiles
// @namespace	Makaze
// @description	Like it says on the tin.
// @include	*
// @grant	none
// @version	1.0
// ==/UserScript==

if (document.body.parentNode.id == "XenForo") {
	if (document.getElementsByClassName('pairsJustified').length > 0 && document.getElementsByClassName('messageUserBlock').length > 0) {
		for (i = 0; i < document.getElementsByClassName('pairsJustified').length; i++) {
			for (j = 0; j < document.getElementsByClassName('pairsJustified')[i].getElementsByTagName('dt').length; j++) {
				if (document.getElementsByClassName('pairsJustified')[i].getElementsByTagName('dt')[j].innerHTML.indexOf('Gender') > -1) {
					document.getElementsByClassName('pairsJustified')[i].getElementsByTagName('dt')[j].parentNode.style.display = 'none';
				}
			}
		}
	}
}