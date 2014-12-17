// ==UserScript==
// @name 	IP.Board - Forum Cleanup
// @namespace	Makaze
// @description	Cleans up the IP.Board interface.
// @include	*
// @grant	none
// @version	1.0
// ==/UserScript==

function clean() {
	var context,
	title,
	collection,
	i = 0;

	if (document.getElementById('topic_stats') != null) {
		context = document.getElementById('topic_stats').previousElementSibling;
		title = context.getElementsByClassName('maintitle')[0];
		
		if (title.textContent.trim().substr(0, 11) === "Also tagged") {
			context.style.display = 'none';
		}
	}

	for (i = 0, collection = document.getElementsByClassName('shareButtons'); i < collection.length; i++) {
		collection[i].style.display = 'none';
	}
}

if (document.body.id === 'ipboard_body') {
	clean();
}