// ==UserScript==
// @name	SF Mafia - Disable Post Editing
// @namespace	Makaze
// @description	Disable the post editing button in the mafia subforum.
// @include	*
// @grant	none
// @version	1.0
// ==/UserScript==

var mafia_flag = false,
edits,
breadcrumbs,
i = 0;

if (document.body.id === 'ipboard_body' && document.getElementsByClass('breadcrumb')[0] != null) {
	for (i = 0, breadcrumbs = document.getElementsByClass('breadcrumb')[0].getElementsByTagName('span'); i < breadcrumbs.lengh; i++) {
		if (breadcrumbs[i].textContent.trim() === 'Mafia') {
			mafia_flag = true;
		}
	}

	if (mafia_flag) {
		if (document.getElementsByClass('post_edit')[0] != null) {
			for (i = 0, edits = document.getElementsByClass('post_edit'); i < edits.length; i++) {
				edits[i].style.display = 'none';
			}
		}
	}
}