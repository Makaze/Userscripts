// ==UserScript==
// @name	XenForo - Hide Signatures for Certain Users
// @namespace	Makaze
// @description	Adds an option to hide users' signatures on XenForo.
// @include	*
// @grant	none
// @version	2.2.1
// ==/UserScript==

function createElement(type, callback) {
	var element = document.createElement(type);

	callback(element);

	return element;
}

function addButton(userID, isBlocked) {
	return createElement('div', function(cont) {
		cont.className = 'blockSigContainer';
		cont.style.marginTop = '1em';
		cont.appendChild(createElement('a', function(link) {
			link.href = 'javascript:void(0)';
			link.title = 'Toggle this user\'s signature';
			
			if (isBlocked) {
				link.appendChild(document.createTextNode('Show Signature'));
			} else {
				link.appendChild(document.createTextNode('Hide Signature'));
			}

			link.onclick = function() {
				var opts = (localStorage.getItem('MakazeScriptOptions')) ? JSON.parse(localStorage.getItem('MakazeScriptOptions')) : {}, 
				users = (opts.hasOwnProperty('xf_hidden_sigs')) ? opts.xf_hidden_sigs : [],
				context,
				postAuthor,
				signature,
				isBlocked = false,
				i = 0;

				for (i = 0; i < users.length; i++) {
					if (userID === users[i]) {
						users.splice(i, 1);
						opts.xf_hidden_sigs = users;
						localStorage.setItem('MakazeScriptOptions', JSON.stringify(opts));
						isBlocked = true;
						break;
					}
				}

				if (!isBlocked) {
					users.push(userID);
					opts.xf_hidden_sigs = users;
					localStorage.setItem('MakazeScriptOptions', JSON.stringify(opts));
				}

				for (i = 0; i < document.getElementsByClassName('messageUserInfo').length; i++) {
					context = document.getElementsByClassName('messageUserInfo')[i];

					if (context.getElementsByClassName('username')[0] != null) {
						postAuthor = context.getElementsByClassName('username')[0].href.replace(/members\/.*?\.(\d+)\//i, '$1');
						signature = context.parentNode.getElementsByClassName('signature')[0];

						if (postAuthor === userID) {
							if (isBlocked) {
								signature.style.display = 'block';
								context.getElementsByClassName('blockSigContainer')[0].getElementsByTagName('a')[0].childNodes[0].nodeValue = 'Hide Signature';
							} else {
								signature.style.display = 'none';
								context.getElementsByClassName('blockSigContainer')[0].getElementsByTagName('a')[0].childNodes[0].nodeValue = 'Show Signature';
							}
						}
					}
				}
			};
		}));
	});
}

if (document.documentElement.id === 'XenForo') {
	if (document.getElementsByClassName('signature')[0] != null && document.getElementsByClassName('messageUserInfo')[0] != null) {
		var opts = (localStorage.getItem('MakazeScriptOptions')) ? JSON.parse(localStorage.getItem('MakazeScriptOptions')) : {}, 
		users = (opts.hasOwnProperty('xf_hidden_sigs')) ? opts.xf_hidden_sigs : [],
		context,
		userID,
		appendLocation,
		signature,
		isBlocked = false,
		i = 0,
		j = 0;

		for (i = 0; i < document.getElementsByClassName('messageUserInfo').length; i++) {
			context = document.getElementsByClassName('messageUserInfo')[i];
			isBlocked = false;

			if (context.getElementsByClassName('username')[0] != null) {
				userID = context.getElementsByClassName('username')[0].href.match(/members\/.*?\.(\d+)\//i)[1];
				appendLocation = context.getElementsByClassName('extraUserInfo')[0];
				
				for (j = 0; j < users.length; j++) {
					if (userID === users[j]) {
						signature = context.parentNode.getElementsByClassName('signature')[0];
						signature.style.display = 'none';
						isBlocked = true;
						break;
					}
				}

				appendLocation.appendChild(addButton(userID, isBlocked));
			}
		}
	}
}