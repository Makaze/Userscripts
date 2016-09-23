// ==UserScript==
// @name	Serenes Forest - Change 'Favorite Fire Emblem' to 'Favorite FE' in Miniprofiles
// @namespace	Makaze
// @description	Like it says on the tin.
// @include	http://*serenesforest.net/*
// @grant	none
// @version	1.0.2
// ==/UserScript==

var i = 0,
j = 0;

function clearProfile() {
	for (i = 0; i < document.getElementsByClassName('custom_fields').length; i++) {
		var thisf = document.getElementsByClassName('custom_fields')[i];
		for (j = 0; j < thisf.getElementsByTagName('li').length; j++) {
			if (thisf.getElementsByTagName('li')[j].innerHTML.match(/Favou?rite Fire Emblem/gi)) {
				thisf.getElementsByTagName('li')[j].style.display = 'none';
			}
		}
	}
}

clearProfile();