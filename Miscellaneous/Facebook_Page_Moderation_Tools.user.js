// ==UserScript==
// @name	Facebook - Page Moderation Tool
// @namespace	Makaze
// @description	Adds an automated method for banning members from a page even before they like or comment.
// @include	*facebook.com/*
// @grant	none
// @version	1.0.1
// ==/UserScript==

var opts = (localStorage.getItem('MakazeScriptOptions')) ? JSON.parse(localStorage.getItem('MakazeScriptOptions')) : {},
banned = (opts.hasOwnProperty('fb_ban_queue')) ? opts.fb_ban_queue : [],
banHandler,
pageID,
alreadyBanned = false,
hoverTimer,
pageTimer,
links,
i = 0,
j = 0;

function createElement(type, callback) {
	var element = document.createElement(type);

	callback(element);

	return element;
}

function banHoverCards(event) {
	var opts,
	banned,
	toBan = true,
	id,
	name,
	context = event.currentTarget,
	hoverContext,
	hoverTimer,
	i = 0;

	if (document.getElementsByClassName('HovercardMessagesButton')[0] != null) {
		return false;
	}

	opts = (localStorage.getItem('MakazeScriptOptions')) ? JSON.parse(localStorage.getItem('MakazeScriptOptions')) : {};
	banned = (opts.hasOwnProperty('fb_ban_queue')) ? opts.fb_ban_queue : [];

	id = context.getAttribute('data-hovercard').match(/id=(\d+)/)[1];
	name = context.textContent.replace(/\s+/g, ' ').trim();

	for (i = 0; i < banned.length; i++) {
		if (banned[i].id === id) {
			toBan = false;
		}
	}

	hoverTimer = setInterval(function() {
		if (document.getElementsByClassName('HovercardMessagesButton')[0] != null) {
			hoverContext = document.getElementsByClassName('HovercardMessagesButton')[0];

			if (hoverContext.parentNode.getElementsByClassName('HovercardMessagesButton').length < 2) {
				hoverContext.parentNode.insertBefore(createElement('a', function(ban) {
					ban.className = '_42ft _4jy0 HovercardMessagesButton _4-rs _4-rt _4jy3 _517h _51sy';
					ban.href = 'javascript:void(0)';
					ban.setAttribute('role', 'button');

					if (toBan) {
						ban.appendChild(document.createTextNode('Ban'));
					} else {
						ban.appendChild(document.createTextNode('Banned'));
					}

					ban.onclick = function() {
						var opts = (localStorage.getItem('MakazeScriptOptions')) ? JSON.parse(localStorage.getItem('MakazeScriptOptions')) : {},
						banned = (opts.hasOwnProperty('fb_ban_queue')) ? opts.fb_ban_queue : [],
						i = 0; 

						if (this.childNodes[0].nodeValue !== 'Banned') {
							this.childNodes[0].nodeValue = 'Banned';

							banned.push({ 'id': id, 'name': name });

							opts.fb_ban_queue = banned;

							localStorage.setItem('MakazeScriptOptions', JSON.stringify(opts));
						} else {
							this.childNodes[0].nodeValue = 'Ban';

							for (i = 0; i < banned.length; i++) {
								if (banned[i].id === id) {
									banned.splice(i, 1);
									break;
								}
							}

							opts.fb_ban_queue = banned;

							localStorage.setItem('MakazeScriptOptions', JSON.stringify(opts));
						}
					};
				}), hoverContext.nextSibling);
			}

			clearTimeout(hoverTimer);
		}
	}, 100);
}

if (document.getElementsByTagName('a')[0] != null) {
	hoverTimer = setInterval(function() {
		for (i = 0, links = document.getElementsByTagName('a'); i < links.length; i++) {
			if (links[i].hasAttribute('data-hovercard') && links[i].className.indexOf('banHoverCards') < 0) {
				links[i].addEventListener('mouseover', banHoverCards, false);
				links[i].className += ' banHoverCard';
			}
		}
	}, 500);
}

function pageInit() {
	if (document.getElementById('pagesManagerSpringboard') != null) {
		pageID = JSON.parse(document.getElementById('pagelet_timeline_main_column').getAttribute('data-gt')).profile_owner;

		document.getElementById('pagesManagerSpringboard').appendChild(createElement('ul', function(list) {
			list.appendChild(createElement('li', function(li) {
				li.className = '_5vg_ banStats';

				li.appendChild(createElement('a', function(cont) {
					cont.appendChild(createElement('span', function(head) {
						head.className = '_5vh0 banNumber';
						head.appendChild(document.createTextNode(banned.length));
					}));

					cont.appendChild(createElement('span', function(head) {
						head.className = '_5vh1';
						head.appendChild(document.createTextNode('Bans Queued'));
					}));
				}));
			}));

			if (banned.length) {
				list.appendChild(createElement('li', function(li) {
					li.className = '_5vg_ banOptions';

					li.appendChild(createElement('span', function(cont) {
						cont.style.display = 'block';
						cont.style.padding = '12px 0 11px';

						cont.appendChild(createElement('a', function(all) {
							all.className = '_5vh1 _54nc';
							all.appendChild(document.createTextNode('Ban All'));

							all.onclick = function() {
								var parent = this.parentNode,
								children = parent.getElementsByClassName('banItem'),
								banAllTimer,
								i = 0;

								for (i = 0; i < children.length; i++) {
									children[i].click();
								}

								banAllTimer = setInterval(function() {
									var ban;

									if (document.getElementsByName('ban')[0] != null) {
										ban = document.getElementsByName('ban')[0];
										ban.checked = true;
										ban.parentNode.parentNode.parentNode.getElementsByClassName('layerConfirm')[0].click();
									}
								}, 50);
							};
						}));


						cont.appendChild(createElement('a', function(clear) {
							clear.className = '_5vh1 _54nc';
							clear.style.marginTop = '12px';
							clear.appendChild(document.createTextNode('Clear Queue'));

							clear.onclick = function() {
								var opts = (localStorage.getItem('MakazeScriptOptions')) ? JSON.parse(localStorage.getItem('MakazeScriptOptions')) : {};

								delete opts['fb_ban_queue'];

								localStorage.setItem('MakazeScriptOptions', JSON.stringify(opts));

								document.getElementsByClassName('banNumber')[0].childNodes[0].nodeValue = 0;

								this.parentNode.parentNode.remove();
							};
						}));

						banHandler = function() {
							var opts,
							banned,
							self = this,
							ban,
							banTimer,
							k = 0;

							banTimer = setInterval(function() {
								var number;

								if (document.getElementsByName('ban')[0] != null) {
									ban = document.getElementsByName('ban')[0];
									ban.checked = true;
									ban.parentNode.parentNode.parentNode.getElementsByClassName('layerConfirm')[0].click();

									opts = (localStorage.getItem('MakazeScriptOptions')) ? JSON.parse(localStorage.getItem('MakazeScriptOptions')) : {};
									banned = (opts.hasOwnProperty('fb_ban_queue')) ? opts.fb_ban_queue : [];

									for (k = 0; k < banned.length; k++) {
										if (banned[k].id === self.getAttribute('data-userid')) {
											if (banned[k].hasOwnProperty('pages')) {
												banned[k].pages.push(pageID);
											} else {
												banned[k].pages = [pageID];
											}

											break;
										}
									}

									opts.fb_ban_queue = banned;

									localStorage.setItem('MakazeScriptOptions', JSON.stringify(opts));

									number = document.getElementsByClassName('banNumber')[0].childNodes[0];

									number.nodeValue = parseInt(number.nodeValue) - 1;

									self.style.display = 'none';

									clearTimeout(banTimer);
								}
							}, 100);
						};

						function banButton(pid, obj) {
							return createElement('a', function(item) {
								item.className = '_5vh1 _54nc banItem';
								item.style.marginTop = '12px';
								item.href = '/pages/likes/label_fans/?action=remove&page_id=' + pid + '&user_id=' + obj.id;
								item.rel = 'async-post';
								item.setAttribute('role', 'menuitem');
								item.setAttribute('data-userid', banned[i].id);

								item.appendChild(document.createTextNode('Ban '));
								item.appendChild(createElement('strong', function(strong) {
									strong.appendChild(document.createTextNode(obj.name));
								}));

								item.addEventListener('click', banHandler, false);
							});
						}

						for (i = 0; i < banned.length; i++) {
							if (banned[i].hasOwnProperty('pages')) {
								for (j = 0; j < banned[i].pages.length; j++) {
									if (banned[i].pages[j] === pageID) {
										alreadyBanned = true;
										break;
									}
								}
							}

							if (!alreadyBanned) {
								cont.appendChild(banButton(pageID, banned[i]));
							}
						}
					}));
				}));
			}
		}));

		clearTimeout(pageTimer);
	}
}

pageTimer = setInterval(pageInit, 100);