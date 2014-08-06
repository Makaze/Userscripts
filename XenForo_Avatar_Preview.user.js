// ==UserScript==
// @name	XenForo - Avatar Preview
// @namespace	Makaze
// @description	Generates a post preview for an avatar.
// @include	*
// @grant	none
// @version	1.0
// ==/UserScript==

function createElement(type, callback) {
	var element = document.createElement(type);

	callback(element);

	return element;
}

function fade(elem, type, speed) {
	var defaultOpacity,
	currentDisplay = elem.style.display || window.getComputedStyle(elem).display;

	elem.style.opacity = '';
	defaultOpacity = window.getComputedStyle(elem).opacity;
	elem.style.opacity = 0;

	// Default values:

	switch (arguments.length) {
		case 1:
			type = 'toggle';
		case 2:
			speed = 300;
		break;
	}

	switch (type) {
		case 'in':
			elem.style.display = '';
			setTimeout(function() {
				elem.style.transition = 'all ' + speed + 'ms ease-in-out';
				elem.style.opacity = defaultOpacity;
				setTimeout(function() {
					elem.style.transition = '';
					elem.style.opacity = '';
				}, speed + 10);
			}, 1);
		break;
		case 'out':
			elem.style.transition = '';
			elem.style.opacity = defaultOpacity;
			elem.style.transition = 'all ' + speed + 'ms ease-in-out';
			elem.style.opacity = 0;
			setTimeout(function() {
				elem.style.display = 'none';
				elem.style.transition = '';
				elem.style.opacity = '';
			}, speed + 10);
		break;
		case 'toggle':
		default:
			if (currentDisplay === 'none') {
				elem.style.display = '';
				setTimeout(function() {
					elem.style.transition = 'all ' + speed + 'ms ease-in-out';
					elem.style.opacity = defaultOpacity;
					setTimeout(function() {
						elem.style.transition = '';
						elem.style.opacity = '';
					}, speed + 10);
				}, 1);
			} else {
				elem.style.transition = '';
				elem.style.opacity = defaultOpacity;
				elem.style.transition = 'all ' + speed + 'ms ease-in-out';
				elem.style.opacity = 0;
				setTimeout(function() {
					elem.style.display = 'none';
					elem.style.transition = '';
					elem.style.opacity = '';
				}, speed + 10);
			}
	}
}

function readURL(upload) {
	if (upload.files && upload.files[0]) {
		var reader = new FileReader();

		reader.onload = function(event) {
			var avas,
			i = 0;

			for (i = 0, avas = document.getElementsByClassName('AvatarPreview'); i < avas.length; i++) {
				avas[i].setAttribute('src', event.target.result);
			}
		};

		reader.readAsDataURL(upload.files[0]);
	}
}

function previewMenu() {
	document.body.appendChild(createElement('div', function(cont) {
		cont.id = 'AvatarPreview';
		cont.style.position = 'fixed';
		cont.style.zIndex = '99999';
		cont.style.width = '1000px';
		cont.style.height = '400px';
		cont.style.marginLeft = '-500px';
		cont.style.marginTop = '-200px';
		cont.style.top = '50%';
		cont.style.left = '50%';
		cont.style.backgroundColor = '#111';

		cont.appendChild(createElement('table', function(table) {
			table.style.width = '100%';

			table.appendChild(createElement('tbody', function(bod) {
				bod.appendChild(createElement('tr', function(row) {
					row.appendChild(createElement('td', function(cell) {
						cell.style.width = '80%';
						cell.style.overflowY = 'auto';

						cell.appendChild(createElement('ol', function(ol) {
							ol.className = 'messageList';
							ol.appendChild(createElement('li', function(li) {
								li.className = 'message';
								li.setAttribute('data-author', 'Username');

								li.appendChild(createElement('div', function(usrInfo) {
									usrInfo.className = 'messageUserInfo';
									usrInfo.appendChild(createElement('div', function(block) {
										block.className = 'messageUserBlock';
										block.appendChild(createElement('h3', function(text) {
											text.className = 'userText';
											text.appendChild(createElement('a', function(username) {
												username.href = 'javascript:void(0)';
												username.className = 'username';
												username.appendChild(document.createTextNode('Username'));
											}));

											text.appendChild(createElement('em', function(usertitle) {
												usertitle.className = 'userTitle';
												usertitle.appendChild(document.createTextNode('User Title'));
											}));

											text.appendChild(createElement('div', function(banner) {
												banner.className = 'mbanner';
											}));
										}));

										block.appendChild(createElement('div', function(avaHolder) {
											avaHolder.className = 'avatarHolder';
											avaHolder.appendChild(createElement('span', function(help) {
												help.className = 'helper';
											}));

											avaHolder.appendChild(createElement('center', function(center) {
												center.appendChild(createElement('img', function(img) {
													img.className = 'AvatarPreview av';
												}));
											}));
										}));

										block.appendChild(createElement('span', function(stat) {
											stat.className = 'UserOffline';
										}));

										block.appendChild(createElement('h3', function(banner) {
											banner.className = 'userText banner';
										}));

										block.appendChild(createElement('div', function(extra) {
											extra.className = 'extraUserInfo';

											extra.appendChild(createElement('dl', function(dl) {
												dl.className = 'pairsJustified';

												dl.appendChild(createElement('dt', function(dt) {
													dt.appendChild(document.createTextNode('Joined:'));
												}));

												dl.appendChild(createElement('dd', function(dd) {
													dd.appendChild(document.createTextNode('Jan 1, 1'));
												}));
											}));

											extra.appendChild(createElement('dl', function(dl) {
												dl.className = 'pairsJustified';

												dl.appendChild(createElement('dt', function(dt) {
													dt.appendChild(document.createTextNode('Messages:'));
												}));
												
												dl.appendChild(createElement('dd', function(dd) {
													dd.appendChild(createElement('a', function(link) {
														link.className = 'concealed';
														link.href = 'javascript:void(0)';
														link.rel = 'nofollow';
													}));
												}));
											}));
										}));

										block.appendChild(createElement('span', function(arr) {
											arr.className = 'arrow';
										}));
									}));
								}));
								
								li.appendChild(createElement('div', function(msgInfo) {
									msgInfo.className = 'messageInfo primaryContent';

									msgInfo.appendChild(createElement('div', function(msg) {
										msg.className = 'messageContent';
										msg.appendChild(createElement('article', function(article) {
											article.appendChild(createElement('blockquote', function(text) {
												text.className = 'messageText ugc baseHtml';
												text.appendChild(document.createTextNode('Message.'));
											}));
										}));
									}));

									msgInfo.appendChild(createElement('div', function(sig) {
										sig.className = 'baseHtml signature messageText ugc';
										sig.appendChild(createElement('aside', function(aside) {
											aside.appendChild(document.createTextNode('Signature'));
										}));
									}));

									msgInfo.appendChild(createElement('div', function(meta) {
										meta.className = 'messageMeta ToggleTriggerAnchor';
										meta.appendChild(createElement('div', function(priv) {
											priv.className = 'privateControls';
											priv.appendChild(createElement('span', function(item) {
												item.className = 'item muted';
												item.appendChild(createElement('span', function(lastAuth) {
													lastAuth.className = 'authorEnd';
													lastAuth.appendChild(createElement('a', function(link) {
														link.className = 'username author';
														link.href = 'javascript:void(0)';
														link.appendChild(document.createTextNode('Username'));
													}));
													lastAuth.appendChild(document.createTextNode(','));
												}));

												item.appendChild(document.createTextNode(' '));

												item.appendChild(createElement('a', function(link) {
													link.className = 'datePermalink';
													link.href = 'javascript:void(0)';
													link.title = 'Permalink';
													link.appendChild(createElement('abbr', function(time) {
														time.className = 'DateTime';
														time.appendChild(document.createTextNode('Now'));
													}));
												}));
											}));
										}));

										meta.appendChild(createElement('div', function(pub) {
											pub.className = 'publicControls';
											pub.appendChild(createElement('a', function(link) {
												link.className = 'item muted postNumber hashPermalink OverlayTrigger';
												link.href = 'javascript:void(0)';
												link.title = 'Permalink';
												link.appendChild(document.createTextNode('#0'));
											}));
										}));
									}));
								}));
							}));
						}));
					}));

					row.appendChild(createElement('td', function(cell) {
						cell.style.width = '20%';
						cell.style.overflowY = 'auto';
						cell.style.verticalAlign = 'middle';
						cell.style.textAlign = 'center';
						cell.style.padding = '10px';

						cell.appendChild(createElement('input', function(file) {
							file.type = 'file';
							file.id = 'AvatarPreview_file';
						}));

						cell.appendChild(createElement('div', function(container) {
							container.style.marginTop = '1em';
							container.style.marginBottom ='1em';

							container.appendChild(createElement('img', function(preview) {
								preview.className = 'AvatarPreview av';
							}));
						}));

						cell.appendChild(createElement('a', function(close) {
							close.id = 'AvatarPreview_close';
							close.href = 'javascript:void(0)';
							close.appendChild(document.createTextNode('Close'));

							close.onclick = function() {
								fade(document.getElementById('AvatarPreview'), 'out');
							};
						}));
					}));
				}));
			}));
		}));
	}));

	var previewHandler = function(event) {
		readURL(this);
	};

	document.getElementById('AvatarPreview_file').addEventListener('change', previewHandler, false);

	fade(document.getElementById('AvatarPreview'), 'in');
}

if (document.documentElement.id === 'XenForo') {
	document.getElementById('AccountMenu').getElementsByClassName('col2')[0].appendChild(createElement('li', function(li) {
		li.appendChild(createElement('a', function(link) {
			link.href = 'javascript:void(0)';
			link.id = 'AvatarPreview_button';
			link.appendChild(document.createTextNode('Avatar Preview'));

			link.onclick = function() {
				if (document.getElementById('AvatarPreview') == null) {
					previewMenu();
				} else {
					if (document.getElementById('AvatarPreview').style.display === 'none') {
						fade(document.getElementById('AvatarPreview'), 'in');
					} else {
						fade(document.getElementById('AvatarPreview'), 'out');
					}
				}
			};
		}));
	}));
}