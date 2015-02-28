// ==UserScript==
// @name	Facebook - Page Moderation Tools
// @namespace	Makaze
// @description	Adds automated features for moderation of Facebook Pages.
// @include	*facebook.com/*
// @grant	none
// @version	1.2.1
// ==/UserScript==

var MakazeScriptStyles,
styleElem,
opts = (localStorage.getItem('MakazeScriptOptions')) ? JSON.parse(localStorage.getItem('MakazeScriptOptions')) : {},
banned = (opts.hasOwnProperty('fb_moderation_tool_ban_queue')) ? opts.fb_moderation_tool_ban_queue : [],
ModTools = (opts.hasOwnProperty('fb_moderation_tool_settings')) ? opts.fb_moderation_tool_settings : {},
config = (ModTools.hasOwnProperty('pages')) ? ModTools.pages : {
	'ban_tool': {
		'enabled': false
	},
	'auto_signature': {
		'enabled': false,
		'signature': ''
	}
},
hoverTimer,
pageTimer,
menu,
item,
i = 0,
j = 0;

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

function selectRange(elem, start, end) {
	var range;

	if (elem.setSelectionRange) {
		elem.focus();
		elem.setSelectionRange(start, end);
	} else if (elem.createTextRange) {
		range = elem.createTextRange();
		range.collapse(true);
		range.moveEnd('character', end);
		range.moveStart('character', start);
		range.select();
	}
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
	banned = (opts.hasOwnProperty('fb_moderation_tool_ban_queue')) ? opts.fb_moderation_tool_ban_queue : [];

	id = context.getAttribute('data-hovercard').match(/id=(\d+)/)[1];
	name = context.textContent.replace(/\s+/g, ' ').trim();

	for (i = 0; i < banned.length; i++) {
		if (banned[i].id === id) {
			toBan = false;
		}
	}

	hoverTimer = setTimeout(function() {
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
						banned = (opts.hasOwnProperty('fb_moderation_tool_ban_queue')) ? opts.fb_moderation_tool_ban_queue : [],
						i = 0; 

						if (this.childNodes[0].nodeValue !== 'Banned') {
							this.childNodes[0].nodeValue = 'Banned';

							banned.push({ 'id': id, 'name': name });

							opts.fb_moderation_tool_ban_queue = banned;

							localStorage.setItem('MakazeScriptOptions', JSON.stringify(opts));
						} else {
							this.childNodes[0].nodeValue = 'Ban';

							for (i = 0; i < banned.length; i++) {
								if (banned[i].id === id) {
									banned.splice(i, 1);
									break;
								}
							}

							opts.fb_moderation_tool_ban_queue = banned;

							localStorage.setItem('MakazeScriptOptions', JSON.stringify(opts));
						}
					};
				}), hoverContext.nextSibling);
			}

			clearTimeout(hoverTimer);
		}
	}, 1000);
}

function pageInit() {
	var pageID,
	banHandler,
	alreadyBanned = false;

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
								}, 100);
							};
						}));


						cont.appendChild(createElement('a', function(clear) {
							clear.className = '_5vh1 _54nc';
							clear.style.marginTop = '12px';
							clear.appendChild(document.createTextNode('Clear Queue'));

							clear.onclick = function() {
								var opts = (localStorage.getItem('MakazeScriptOptions')) ? JSON.parse(localStorage.getItem('MakazeScriptOptions')) : {};

								delete opts['fb_moderation_tool_ban_queue'];

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
									banned = (opts.hasOwnProperty('fb_moderation_tool_ban_queue')) ? opts.fb_moderation_tool_ban_queue : [];

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

									opts.fb_moderation_tool_ban_queue = banned;

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

function toolOptions(settings) {
	var bantool = settings.ban_tool.enabled,
	autosignature = settings.auto_signature.enabled;

	return createElement('div', function(cont) {
		cont.className = 'ModToolOptions';
		cont.setAttribute('data-name', 'pages');

		cont.appendChild(createElement('div', function(option) {
			option.className = 'ModToolOption';
			option.setAttribute('data-name', 'ban_tool');

			option.appendChild(createElement('input', function(check) {
				check.className = 'ModToolEnable';
				check.type = 'checkbox';

				if (bantool) {
					check.checked = true;
				}
			}));

			option.appendChild(document.createTextNode(' Ban Queue'));
		}));

		cont.appendChild(createElement('div', function(option) {
			option.className = 'ModToolOption';
			option.setAttribute('data-name', 'auto_signature');

			option.appendChild(createElement('input', function(check) {
				check.className = 'ModToolEnable';
				check.type = 'checkbox';

				if (autosignature) {
					check.checked = true;
				}

				check.onchange = function() {
					var sub = this.parentNode.getElementsByClassName('subOptions')[0],
					container = document.getElementById('ModToolPopupForeground');

					if (this.checked) {
						sub.style.display = 'block';
					} else {
						sub.style.display = 'none';
					}

					container.style.marginTop = '-' + (container.offsetHeight / 2) + 'px';
				};
			}));

			option.appendChild(document.createTextNode(' Automatic Signature (Posts only)'));

			option.appendChild(createElement('div', function(sub) {
				sub.className = 'subOptions';

				if (!autosignature) {
					sub.style.display = 'none';
				}

				sub.appendChild(createElement('div', function(field) {
					field.className = 'subOption';
					field.setAttribute('data-name', 'signature');
					field.setAttribute('data-type', 'textarea');
					field.appendChild(document.createTextNode('↳ Signature: '));

					field.appendChild(createElement('textarea', function(text) {
						text.placeholder = 'Enter signature';

						text.value = settings.auto_signature.signature;
					}));

					field.appendChild(createElement('a', function(save) {
						save.className = '_42ft _4jy0 _4jy4 _517h _51sy';
						save.setAttribute('role', 'button');
						save.style.marginLeft = '5px';
						save.appendChild(document.createTextNode('Save'));

						save.onclick = function() {
							var opts = (localStorage.getItem('MakazeScriptOptions')) ? JSON.parse(localStorage.getItem('MakazeScriptOptions')) : {},
							toolSettings = (opts.hasOwnProperty('fb_moderation_tool_settings')) ? opts.fb_moderation_tool_settings : {},
							context = document.getElementById('ModToolPopupForeground'),
							toolType = context.getElementsByClassName('ModToolOptions')[0].getAttribute('data-name'),
							toolSetting = (toolSettings.hasOwnProperty(toolType)) ? toolSettings[toolType] : {},
							settings,
							settingName,
							setting,
							subSettings,
							subSettingName,
							subSettingType,
							subSetting,
							items,
							i = 0,
							j = 0,
							k = 0;

							for (i = 0, settings = context.getElementsByClassName('ModToolOption'); i < settings.length; i++) {
								settingName = settings[i].getAttribute('data-name');
								setting = settings[i].getElementsByClassName('ModToolEnable')[0].checked;

								toolSetting[settingName] = { 'enabled': setting };

								for (j = 0, subSettings = settings[i].getElementsByClassName('subOption'); j < subSettings.length; j++) {
									subSettingName = subSettings[j].getAttribute('data-name');
									subSettingType = subSettings[j].getAttribute('data-type');

									switch (subSettingType) {
										case 'textarea':
											subSetting = subSettings[j].getElementsByTagName('textarea')[0].value;
										break;
										case 'text':
											subSetting = subSettings[j].getElementsByTagName('input')[0].value;
										break;
										case 'checkbox':
											subSetting = subSettings[j].getElementsByTagName('input')[0].checked;
										break;
										case 'radio':
											for (k = 0, items = subSettings[j].getElementsByTagName('input'); k < items.length; k++) {
												if (items[k].checked) {
													subSetting = items[k].value;
													break;
												}
											}
										break;
									}

									toolSetting[settingName][subSettingName] = subSetting;
								}
							}

							toolSettings[toolType] = toolSetting;

							opts.fb_moderation_tool_settings = toolSettings;

							localStorage.setItem('MakazeScriptOptions', JSON.stringify(opts));
						};
					}));
				}));
			}));
		}));

		cont.appendChild(createElement('div', function(footer) {
			footer.style.textAlign = 'right';

			footer.appendChild(createElement('a', function(cancel) {
				cancel.className = '_42ft _4jy0 _4jy4 _517h _51sy';
				cancel.setAttribute('role', 'button');
				cancel.appendChild(document.createTextNode('Cancel'));

				cancel.onclick = function() {
					fade(document.getElementById('ModToolPopupBackground'), 'out');
					fade(document.getElementById('ModToolPopupForeground'), 'out');
					document.getElementById('ModToolPopupForeground').style.marginTop = '0px';
				};
			}));

			footer.appendChild(createElement('a', function(save) {
				save.className = '_42ft _4jy0 _4jy4 _517h _51sy';
				save.setAttribute('role', 'button');
				save.appendChild(document.createTextNode('Save'));

				save.onclick = function() {
					var opts = (localStorage.getItem('MakazeScriptOptions')) ? JSON.parse(localStorage.getItem('MakazeScriptOptions')) : {},
					toolSettings = (opts.hasOwnProperty('fb_moderation_tool_settings')) ? opts.fb_moderation_tool_settings : {},
					context = document.getElementById('ModToolPopupForeground'),
					toolType = context.getElementsByClassName('ModToolOptions')[0].getAttribute('data-name'),
					toolSetting = (toolSettings.hasOwnProperty(toolType)) ? toolSettings[toolType] : {},
					settings,
					settingName,
					setting,
					subSettings,
					subSettingName,
					subSettingType,
					subSetting,
					items,
					i = 0,
					j = 0,
					k = 0;

					for (i = 0, settings = context.getElementsByClassName('ModToolOption'); i < settings.length; i++) {
						settingName = settings[i].getAttribute('data-name');
						setting = settings[i].getElementsByClassName('ModToolEnable')[0].checked;

						toolSetting[settingName] = { 'enabled': setting };

						for (j = 0, subSettings = settings[i].getElementsByClassName('subOption'); j < subSettings.length; j++) {
							subSettingName = subSettings[j].getAttribute('data-name');
							subSettingType = subSettings[j].getAttribute('data-type');

							switch (subSettingType) {
								case 'textarea':
									subSetting = subSettings[j].getElementsByTagName('textarea')[0].value;
								break;
								case 'text':
									subSetting = subSettings[j].getElementsByTagName('input')[0].value;
								break;
								case 'checkbox':
									subSetting = subSettings[j].getElementsByTagName('input')[0].checked;
								break;
								case 'radio':
									for (k = 0, items = subSettings[j].getElementsByTagName('input'); k < items.length; k++) {
										if (items[k].checked) {
											subSetting = items[k].value;
											break;
										}
									}
								break;
							}

							toolSetting[settingName][subSettingName] = subSetting;
						}
					}

					toolSettings[toolType] = toolSetting;

					opts.fb_moderation_tool_settings = toolSettings;

					localStorage.setItem('MakazeScriptOptions', JSON.stringify(opts));

					fade(document.getElementById('ModToolPopupBackground'), 'out');
					fade(document.getElementById('ModToolPopupForeground'), 'out');
					document.getElementById('ModToolPopupForeground').style.marginTop = '0px';
				};
			}));
		}));
	});
}

function popup(title, child) {
	var context;

	if (document.getElementById('ModToolPopupForeground') == null) {
		document.body.appendChild(createElement('div', function(bg) {
			bg.id = 'ModToolPopupBackground';
			bg.style.display = 'none';

			bg.onclick = function() {
				fade(this, 'out');
				fade(this.nextSibling, 'out');
				this.nextSibling.style.marginTop = '0px';
			};
		}));

		document.body.appendChild(createElement('div', function(pop) {
			pop.id = 'ModToolPopupForeground';
			pop.style.display = 'none';

			pop.appendChild(createElement('h1', function(header) {
				header.className = 'ModToolHeader';
				header.appendChild(document.createTextNode(title));
			}));

			pop.appendChild(createElement('div', function(cont) {
				cont.className = 'ModToolChildContainer';
				cont.appendChild(child);
			}));
		}));

		context = document.getElementById('ModToolPopupForeground');
	} else {
		context = document.getElementById('ModToolPopupForeground');

		context.getElementsByClassName('ModToolHeader')[0].childNodes[0].nodeValue = title;

		context.getElementsByClassName('ModToolChildContainer')[0].firstChild.remove();
		context.getElementsByClassName('ModToolChildContainer')[0].appendChild(child);
	}

	fade(context.previousSibling, 'in');
	fade(context, 'in');

	context.style.marginTop = '-' + (context.offsetHeight / 2) + 'px';
}


if (document.getElementsByTagName('a')[0] != null) {
	hoverTimer = setInterval(function() {
		var opts = (localStorage.getItem('MakazeScriptOptions')) ? JSON.parse(localStorage.getItem('MakazeScriptOptions')) : {},
		ModTools = (opts.hasOwnProperty('fb_moderation_tool_settings')) ? opts.fb_moderation_tool_settings : {},
		config = (ModTools.hasOwnProperty('pages')) ? ModTools.pages : {
			'ban_tool': {
				'enabled': false
			},
			'auto_signature': {
				'enabled': false,
				'signature': ''
			}
		};

		if (config.ban_tool.enabled) {
			var links,
			i = 0;

			for (i = 0, links = document.getElementsByTagName('a'); i < links.length; i++) {
				if (links[i].hasAttribute('data-hovercard') && links[i].className.indexOf('banHoverCards') < 0) {
					links[i].addEventListener('mouseover', banHoverCards, false);
					links[i].className += ' banHoverCard';
				}
			}
		}
	}, 500);
}

if (document.getElementById('pages_manager_top_bar_container') != null) {
	if (config.ban_tool.enabled) {
		pageTimer = setInterval(pageInit, 500);
	}

	document.getElementsByClassName('uiTextareaAutogrow')[0].addEventListener('focus', function() {
		var opts = (localStorage.getItem('MakazeScriptOptions')) ? JSON.parse(localStorage.getItem('MakazeScriptOptions')) : {},
		ModTools = (opts.hasOwnProperty('fb_moderation_tool_settings')) ? opts.fb_moderation_tool_settings : {},
		config = (ModTools.hasOwnProperty('pages')) ? ModTools.pages : {
			'ban_tool': {
				'enabled': false
			},
			'auto_signature': {
				'enabled': false,
				'signature': ''
			}
		},
		sig = config.auto_signature.signature,
		self = this;

		if (config.auto_signature.enabled) {
			if (!this.value.length) {
				this.value += ' ' + sig;

				setTimeout(function() {
					selectRange(self, 0, 0);
				}, 0);
			} else {
				setTimeout(function() {
					selectRange(self, self.value.length - (sig.length + 1), self.value.length - (sig.length + 1));
				}, 0);
			}
		}
	}, false);
}

if (document.getElementById('userNavigationMenu') != null) {
	// Styling

	if (document.getElementById('MakazeScriptStyles') == null) {
		MakazeScriptStyles = createElement('style', function(style) {
			style.id = 'MakazeScriptStyles';
			style.type = 'text/css';
		});
		document.head.appendChild(MakazeScriptStyles);
	}

	styleElem = document.getElementById('MakazeScriptStyles');

	if (styleElem.hasChildNodes()) {
		styleElem.childNodes[0].nodeValue += '\n\n';
	} else {
		styleElem.appendChild(document.createTextNode(''));
	}

	styleElem.childNodes[0].nodeValue +=
		'#ModToolPopupBackground {\n' +
			'position: fixed;\n' +
			'z-index: 9999;\n' +
			'top: 0;\n' +
			'left: 0;\n' +
			'background-color: rgba(0, 0, 0, .4);\n' +
			'width: 100%;\n' +
			'height: 100%;\n' +
		'}\n\n' +

		'#ModToolPopupForeground {\n' +
			'position: fixed;\n' +
			'z-index: 10000;\n' +
			'top: 50%;\n' +
			'left: 50%;\n' +
			'width: 500px;\n' +
			'margin-left: -250px;\n' +
			'background-color: #fff;\n' +
			'padding: 15px;\n' +
			'border-radius: 3px;\n' +
			'box-shadow: 0px 0px 2px #000;\n' +
			'transition: all .3s ease-in-out;\n' +
		'}\n\n' +

		'#ModToolPopupForeground * {\n' +
			'vertical-align: middle;\n' +
		'}\n\n' +

		'.ModToolHeader {\n' +
			'margin-bottom: 1em;\n' +
		'}\n\n' +

		'.ModToolOption {\n' +
			'padding: 1em 0;\n' +
			'color: #555;\n' +
		'}\n\n' +

		'.ModToolOption:not(:first-of-type) {\n' +
			'border-top: 1px solid #ccc;\n' +
		'}\n\n' +

		'.subOptions {\n' +
			'padding: .5em 8px;\n' +
		'}';

	menu = document.getElementById('userNavigationMenu');
	item = menu.getElementsByClassName('menuDivider')[1];
	
	item.parentNode.insertBefore(createElement('li', function(item) {
		item.role = 'menuitem';
		item.className = 'ModToolsMenuButton';

		item.appendChild(createElement('a', function(link) {
			link.className = 'navSubmenu';
			link.appendChild(document.createTextNode('Page Moderation Tools'));

			link.onclick = function() {
				var opts = (localStorage.getItem('MakazeScriptOptions')) ? JSON.parse(localStorage.getItem('MakazeScriptOptions')) : {},
				ModTools = (opts.hasOwnProperty('fb_moderation_tool_settings')) ? opts.fb_moderation_tool_settings : {},
				config = (ModTools.hasOwnProperty('pages')) ? ModTools.pages : {
					'ban_tool': {
						'enabled': false
					},
					'auto_signature': {
						'enabled': false,
						'signature': ''
					}
				};

				popup('Page Moderation Tools Settings', toolOptions(config));
			};
		}));
	}), item);
}

if (!ModTools.hasOwnProperty('pages')) {
	popup('Page Moderation Tools Settings', toolOptions(config));
}