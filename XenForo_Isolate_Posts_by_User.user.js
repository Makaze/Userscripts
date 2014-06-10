// ==UserScript==
// @name	XenForo - Isolate Posts by User
// @namespace	Makaze
// @description	Adds a button to the Mini-profilw to display all posts by that user in the thread.
// @include	*
// @grant	none
// @version	1.0
// ==/UserScript==

var contexts,
context,
user,
i = 0;

function createElement(type, callback) {
	var element = document.createElement(type);

	callback(element);

	return element;
}

function addButton(user) {
	return createElement('div', function(cont) {
		cont.className = 'isolatePostsByUser';
		cont.style.marginTop = '1em';
		cont.appendChild(createElement('a', function(link) {
			link.href = 'javascript:void(0)';
			link.appendChild(document.createTextNode('Isolate Posts'));
			link.title = 'Display all posts by this user in this thread';

			link.onclick = function() {
				document.getElementById('searchBar_users').value = user;
				document.getElementById('search_bar_thread').click();
				document.getElementById('searchBar').getElementsByClassName('submitUnit')[0].getElementsByTagName('input')[0].click();
			};
		}));
	});
}

if (document.documentElement.id === 'XenForo' && document.getElementsByClassName('messageUserInfo')[0] != null) {
	for (i = 0, contexts = document.getElementsByClassName('messageUserInfo'); i < contexts.length; i++) {
		context = contexts[i];
		if (context.getElementsByClassName('username')[0] != null) {
			user = context.getElementsByClassName('username')[0].textContent.trim();

			context.getElementsByClassName('extraUserInfo')[0].appendChild(addButton(user));
		}
	}
}