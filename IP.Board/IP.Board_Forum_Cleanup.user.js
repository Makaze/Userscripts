// ==UserScript==
// @name 	IP.Board - Forum Cleanup
// @namespace	Makaze
// @description	Cleans up the IP.Board interface.
// @include	*
// @grant	none
// @version	2.0.0
// ==/UserScript==

function clean() {
	var commentWalker,
	collection,
	i = 0;

	if (document.getElementsByClassName('ipsTag')[0] != null && document.getElementsByClassName('topic_list')[0] != null) {
		commentWalker = document.createTreeWalker(document, NodeFilter.SHOW_COMMENT, { 
			acceptNode: function() {
				return NodeFilter.FILTER_ACCEPT;
			}
		}, false);

		while(commentWalker.nextNode()) {
			if (commentWalker.currentNode.nodeValue.indexOf('SAME TAGGED') > -1) {
				break;
			}
		}

		if (commentWalker.currentNode.nextElementSibling && commentWalker.currentNode.nextElementSibling.nextElementSibling) {
			commentWalker.currentNode.nextElementSibling.style.display = 'none';
			commentWalker.currentNode.nextElementSibling.nextElementSibling.style.display = 'none';
			console.log('Cleaned up', commentWalker.currentNode.nextElementSibling, commentWalker.currentNode.nextElementSibling.nextElementSibling);
		}
	}

	for (i = 0, collection = document.getElementsByClassName('shareButtons'); i < collection.length; i++) {
		collection[i].style.display = 'none';
	}

	if (collection.length) {
		console.log('Cleaned up', collection);
	}
}

if (document.body.id === 'ipboard_body') {
	clean();
}