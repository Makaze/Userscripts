// ==UserScript==
// @name	Serenes Forest - Mafia Votal Generator
// @namespace	Makaze
// @description	A feature-rich votal generator for Serenes Forest Mafia.
// @include	*://serenesforest.net/forums/*
// @grant	none
// @version	1.0.1
// ==/UserScript==

function createElement(type, callback) {
	var element = document.createElement(type);

	callback(element);

	return element;
}

function runInJQuery(code) {
	document.body.appendChild(createElement('script', function(jQ) {
		jQ.type = 'text/javascript';
		jQ.src = 'https://code.jquery.com/jquery-2.1.3.min.js';

		jQ.onload = function() {
			document.body.appendChild(createElement('script', function(content) {
				content.appendChild(document.createTextNode('jQuery.noConflict();' + code));
			}));
		};
	}));
}

function VoteCounter() {
	var MakazeScriptStyles,
	styleElem,
	VERSION = "0.1.8",
	UI_loaded = false,
	doc = new DocumentFragment().appendChild(document.createElement('div')),
	postFrame,
	background,
	notice,
	defaults = {
		'id': null,
		'page': 1,
		'votes': { 'votals': {}, 'history': [], 'player_history': {}, 'player_cache': {}, 'recent': {}, 'errors': [] },
		'players': {
			'0': { 'aliases': ['No Lynch'], 'id': 0, 'lynch_requirement': 0, 'dead': false }
		},
		'post': 1,
		'last': { 'post': 1, 'time': null },
		'phase': { 'name': null, 'end': null, 'hammer': null, 'post': null, 'page': null, 'running': false },
		'settings': {
			'post_at_intervals': true,
			'posting_interval_time': 6,
			'posting_interval_posts': 50,
			'post_at_hammer': true,
			'post_on_trigger': true,
			'vote_check_interval': 5,
			'order_method': 'latest',
			'post_at_end_of_phase': true,
			'debug_mode': false
		}
	},
	vote_check = false,
	end_phase = false,
	thread = location.href.match(/showtopic=(\d+)/i)[1] || null,
	pageTitle = document.title,
	games = (localStorage.getItem('Mafia Votal Generator')) ? JSON.parse(localStorage.getItem('Mafia Votal Generator')) : {},
	game = (games.hasOwnProperty(thread)) ? games[thread] : defaults,
	recounting = false,
	switches = false,
	debug_mode = game.settings.debug_mode;

	game.id = thread;

	function createElement(type, callback) {
		var element = document.createElement(type);

		callback(element);

		return element;
	}

	function empty(elem) {
		while (elem.hasChildNodes()) {
			elem.removeChild(elem.lastChild);
		}
	}

	function isJSON(str) {
		try {
			JSON.parse(str);
		} catch (e) {
			return false;
		}
		return true;
	}

	function sanitize(str) {
		return str.replace(/[\/\\]/g, '-');
	}

	function addUI() {
		document.getElementsByTagName('head')[0].appendChild(createElement('link', function(css) {
			css.type = 'text/css';
			css.rel = 'stylesheet';
			css.href = 'https://code.jquery.com/ui/1.11.4/themes/smoothness/jquery-ui.css';
		}));

		document.body.appendChild(createElement('script', function(jQ) {
			jQ.id = 'jQuery-UI';
			jQ.type = 'text/javascript';
			jQ.src = 'https://code.jquery.com/ui/1.11.4/jquery-ui.min.js';

			jQ.onload = function() {
				UI_loaded = true;
			};
		}));
	}

	function formatDate(date) {
		var day = date.getDate(),
		month = date.getMonth() + 1,
		year = date.getFullYear();

		day = (day < 10) ? '0' + day : day;
		month = (month < 10) ? '0' + month : month;

		return month + '/' + day + '/' + year;
	}

	function formatTime(date) {
		var hours = date.getHours(),
		minutes = date.getMinutes(),
		half;

		if (hours > 12) {
			hours -= 12;
			half = 'PM';
		} else {
			if (!hours) {
				hours = 12;
			}

			half = 'AM';
		}

		minutes = (minutes < 10) ? '0' + minutes : minutes;

		return hours + ':' + minutes + ' ' + half;
	}

	function readableCountdown(time) {
		var minuteDiff = time / 60 / 1000, //in minutes
		hourDiff = time / 3600 / 1000, //in hours
		humanReadable = {};

		humanReadable.hours = Math.floor(hourDiff);
		humanReadable.minutes = Math.floor(minuteDiff - 60 * humanReadable.hours);

		return humanReadable;
	}

	function endPhaseTimer(endTime) {
		var now = new Date(),
		difference = new Date(new Date(endTime) - now);

		end_phase = setTimeout(function() {
			getVotes(doc, thread, true, true);
		}, difference.getTime());
	}

	function addSwitches() {
		if (!switches) {
			var switchesChecker = setInterval(function() {
				if (UI_loaded) {
					document.body.appendChild(createElement('script', function(script) {
						script.type = 'text/javascript';
						script.src = 'http://pastebin.com/raw.php?i=nvhwrEHm';
						script.onload = function() {
							jQuery('.VoteCounterControls input[type=checkbox]').not('.showVotePowerFlag, .deadFlag').switchButton();
							switches = true;
						};
					}));
					clearTimeout(switchesChecker);
				}
			}, 100);
		} else {
			jQuery('.VoteCounterControls input[type=checkbox]').not('.showVotePowerFlag, .deadFlag').switchButton();
		}
	}

	function addTips() {
		jQuery('.VoteCounterControls .tab').on('mouseover', function() {
			jQuery(this).find('.help').each(function() {
				jQuery(this).css({
					'min-height': jQuery(this).parent().height() + 'px',
					'line-height': jQuery(this).parent().height() + 'px'
				});
			});
		});

		jQuery('.VoteCounterControls .help').hover(function() {
			jQuery(this).find('.tip').slideDown('fast');
		}, function() {
			jQuery(this).find('.tip').slideUp('fast');
		});
	}

	function controls(game) {
		var now = new Date(),
		countdown = (game.last.time) ? new Date(now - new Date(game.last.time)) : new Date(now - now),
		postDiff = game.post - game.last.post,
		settings = game.settings,
		prop;

		postFrame = document.body.appendChild(createElement('iframe', function(frame) {
			frame.src = 'http://serenesforest.net/forums/index.php?showtopic=' + game.id;
			frame.id = 'postFrame';
			frame.style.height = '0';
			frame.style.width = '0';
			frame.style.border = '0';
			frame.style.visibility = 'hidden';
			frame.style.position = 'fixed';
			frame.style.top = '0';
		}));

		background = document.body.appendChild(createElement('div', function(bg) {
			bg.id = 'VoteCounter_Background';
		}));

		notice = document.body.appendChild(createElement('div', function(note) {
			note.className = 'VoteCounterNotice';
			note.appendChild(document.createTextNode('Posting...'));
		}));

		function playerField(player, index) {
			player.lynch_requirement = player.lynch_requirement || 0;
			player.vote_power = player.vote_power || 1;

			return createElement('div', function(setting) {
				setting.className = 'setting playerField';
				setting.appendChild(document.createTextNode('Player ' + index + ': '));
				setting.appendChild(createElement('input', function(text) {
					text.className = 'text playerAliases';
					text.type = 'text';
					text.placeholder = 'Alias1 (default),Alias2,Alias3';
					if (player.aliases.length) {
						text.value = player.aliases.join(',');
					}
				}));
				setting.appendChild(createElement('input', function(text) {
					text.className = 'text playerID';
					text.type = 'text';
					text.placeholder = 'Profile ID';
					if (player.id) {
						text.value = player.id;
					}
				}));
				setting.appendChild(createElement('input', function(text) {
					text.className = 'text lynchRequirement';
					text.type = 'number';
					text.style.width = '15em';
					text.placeholder = 'Lynch Requirement Modifier';
					if (player.lynch_requirement) {
						text.value = player.lynch_requirement;
					}
				}));
				setting.appendChild(createElement('input', function(text) {
					text.className = 'text votePower';
					text.type = 'number';
					text.style.width = '15em';
					text.placeholder = 'Vote Power (1 default)';
					if (player.vote_power > 1) {
						text.value = player.vote_power;
					}
				}));
				setting.appendChild(createElement('span', function(span) {
					span.className = 'text';
					span.appendChild(createElement('input', function(check) {
						check.className = 'showVotePowerFlag';
						check.type = 'checkbox';
						if (player.show_vote_power != null) {
							check.checked = player.show_vote_power;
						} else {
							check.checked = true;
						}
					}));
					span.appendChild(document.createTextNode(' Show Vote Power '));
				}));
				setting.appendChild(createElement('span', function(span) {
					span.className = 'text deadFlagContainer';
					span.appendChild(createElement('input', function(check) {
						check.className = 'deadFlag';
						check.type = 'checkbox';
						if (player.dead != null) {
							check.checked = player.dead;
							if (player.dead) {
								jQuery(setting).addClass('dead');
							}
						} else {
							check.checked = false;
						}

						check.onclick = function() {
							if (this.checked) {
								jQuery(this).parent().parent().addClass('dead');
							} else {
								jQuery(this).parent().parent().removeClass('dead');
							}
						};
					}));
					span.appendChild(document.createTextNode(' Dead '));
				}));
				if (index > 1) {
					setting.appendChild(createElement('a', function(rm) {
						rm.className = 'removeField';
						rm.href = 'javascript:void(0)';
						rm.appendChild(document.createTextNode('Remove'));

						rm.onclick = function() {
							this.parentNode.remove();
						};
					}));
				}
			});
		}

		return createElement('div', function(container) {
			container.className = 'row2 post_block VoteCounterControls';
			container.appendChild(createElement('div', function(main) {
				main.className = 'mainControls';
				main.appendChild(createElement('a', function(timer) {
					timer.className = 'timerButton';
					timer.title = 'Start automated posting';
					timer.appendChild(createElement('div', function(symbol) {
						symbol.className = 'timerSymbol play';
					}));

					timer.onclick = function() {
						var games = (localStorage.getItem('Mafia Votal Generator')) ? JSON.parse(localStorage.getItem('Mafia Votal Generator')) : {},
						game = (games.hasOwnProperty(thread)) ? games[thread] : defaults,
						vote_check_interval = game.settings.vote_check_interval * 60 * 1000;

						if (game.phase.running) {
							if (vote_check || end_phase) {
								clearTimeout(vote_check);
								clearTimeout(end_phase);
								vote_check = false;
								end_phase = false;
							} else {
								vote_check = setInterval(function() {
									getVotes(doc, thread);

									if (!game.phase.running) {
										clearTimeout(vote_check);
										vote_check = false;

										toggleAuto('off');
									}
								}, vote_check_interval);

								if (game.settings.post_at_end_of_phase) {
									endPhaseTimer(new Date(game.phase.end));
								}
							}

							toggleAuto();
						} else {
							alert('Error: You must start a Phase before counting.');
							if (!jQuery('#PhaseControl').hasClass('active')) {
								jQuery('#PhaseControl').click();
							}
						}
					};
				}));

				main.appendChild(createElement('span', function(timer) {
					timer.className = 'timerDisplay';
					timer.appendChild(createElement('span', function(count) {
						var since = readableCountdown(countdown);

						count.id = 'VoteCounter_countdown';
						count.appendChild(document.createTextNode(since.hours + 'h' + since.minutes + 'm'));
					}));
					timer.appendChild(document.createTextNode(' & '));
					timer.appendChild(createElement('span', function(posts) {
						posts.id = 'VoteCounter_postcount';
						posts.appendChild(document.createTextNode(postDiff));
					}));
					timer.appendChild(document.createTextNode(' posts'));

					timer.appendChild(createElement('span', function(sub) {
						sub.className = 'subtext';
						sub.appendChild(document.createTextNode('since last votal'));
					}));
				}));

				main.appendChild(createElement('span', function(right) {
					right.className = 'tabControls right';
					right.appendChild(createElement('a', function(control) {
						control.id = 'PostControl';
						control.className = 'tabControl';
						control.href = 'javascript:void(0)';
						control.appendChild(document.createTextNode('Post Now'));
						control.title = 'Post the current votals right now';

						control.onclick = function() {
							var games = (localStorage.getItem('Mafia Votal Generator')) ? JSON.parse(localStorage.getItem('Mafia Votal Generator')) : {},
							game = (games.hasOwnProperty(thread)) ? games[thread] : defaults;

							if (game.phase.running) {
								getVotes(doc, thread, true);
							} else {
								alert('Error: You must start a Phase before counting.');
								if (!jQuery('#PhaseControl').hasClass('active')) {
									jQuery('#PhaseControl').click();
								}
							}
						};
					}));
					right.appendChild(document.createTextNode('·'));
					right.appendChild(createElement('a', function(control) {
						control.id = 'RecountControl';
						control.className = 'tabControl';
						control.href = 'javascript:void(0)';
						control.appendChild(document.createTextNode('Recount Votes'));
						control.title = 'Recount all votes in the Phase';

						control.onclick = function() {
							var games = (localStorage.getItem('Mafia Votal Generator')) ? JSON.parse(localStorage.getItem('Mafia Votal Generator')) : {},
							game = (games.hasOwnProperty(thread)) ? games[thread] : defaults;

							if (game.phase.running) {
								game.post = game.phase.post;
								game.page = game.phase.page;
								game.last.post = game.phase.post;

								game.votes.votals = {};
								game.votes.player_cache = {};
								game.votes.recent = {};

								games[thread] = game;

								localStorage.setItem('Mafia Votal Generator', JSON.stringify(games));

								if (!jQuery(notice).is(':visible') || !jQuery(notice).hasClass('recount')) {
									jQuery(notice).text('Recounting votes...');
									jQuery(notice).addClass('recount');
									jQuery(notice).fadeIn('fast');
								}

								recounting = true;

								getVotes(doc, thread);
							} else {
								alert('Error: You must start a Phase before counting.');
								if (!jQuery('#PhaseControl').hasClass('active')) {
									jQuery('#PhaseControl').click();
								}
							}
						};
					}));
					right.appendChild(document.createTextNode('·'));
					right.appendChild(createElement('a', function(control) {
						control.id = 'PhaseControl';
						control.className = 'tabControl';
						control.href = 'javascript:void(0)';
						control.appendChild(document.createTextNode('Phases' + ((game.phase.running) ? ' (Running)' : '')));
						control.title = 'Manage Phases';

						control.onclick = function() {
							jQuery('.tabControl.active').not(this).removeClass('active');
							jQuery('.VoteCounterControls .tab').not('#VoteCounter_phaseTab').slideUp('fast');
							jQuery('#VoteCounter_phaseTab').slideToggle('fast');
							jQuery(this).toggleClass('active');
						};
					}));
					right.appendChild(document.createTextNode('·'));
					right.appendChild(createElement('a', function(control) {
						control.id = 'PlayerControl';
						control.className = 'tabControl';
						control.href = 'javascript:void(0)';
						control.appendChild(document.createTextNode('Players'));
						control.title = 'Manage Players';

						control.onclick = function() {
							jQuery('.tabControl.active').not(this).removeClass('active');
							jQuery('.VoteCounterControls .tab').not('#VoteCounter_playersTab').slideUp('fast');
							jQuery('#VoteCounter_playersTab').slideToggle('fast');
							jQuery(this).toggleClass('active');
						};
					}));
					right.appendChild(document.createTextNode('·'));
					right.appendChild(createElement('a', function(control) {
						control.id = 'SettingsControl';
						control.className = 'tabControl';
						control.href = 'javascript:void(0)';
						control.appendChild(document.createTextNode('Settings'));
						control.title = 'Manage Settings';

						control.onclick = function() {
							jQuery('.tabControl.active').not(this).removeClass('active');
							jQuery('.VoteCounterControls .tab').not('#VoteCounter_settingsTab').slideUp('fast');
							jQuery('#VoteCounter_settingsTab').slideToggle('fast');
							jQuery(this).toggleClass('active');
						};
					}));
				}));
			}));

			container.appendChild(createElement('div', function(tabs) {
				tabs.className = 'tabsContainer';
				tabs.appendChild(createElement('div', function(tab) {
					tab.id = 'VoteCounter_phaseTab';
					tab.className = 'tab';
					tab.appendChild(createElement('div', function(setting) {
						setting.className = 'setting';
						setting.appendChild(document.createTextNode('Phase Name: '));
						setting.appendChild(createElement('input', function(text) {
							text.id = 'VoteCounter_phaseName';
							text.className = 'text';
							text.type = 'text';
							text.placeholder = 'Day 1';
							if (game.phase.running) {
								text.value = game.phase.name;
							}
						}));
						setting.appendChild(createElement('div', function(helpcont) {
							helpcont.className = 'help';
							helpcont.appendChild(document.createTextNode('?'));
							helpcont.appendChild(createElement('div', function(tip) {
								tip.className = 'tip';
								tip.appendChild(document.createTextNode('The name of the Phase (shown in votals).'));
							}));
						}));
					}));

					tab.appendChild(createElement('div', function(setting) {
						setting.className = 'setting';
						setting.appendChild(document.createTextNode('Starting Post #: '));
						setting.appendChild(createElement('input', function(text) {
							text.id = 'VoteCounter_startingPost';
							text.className = 'text';
							text.type = 'number';
							text.placeholder = 0;

							if (game.phase.running) {
								text.value = game.phase.post;
							}
						}));
						setting.appendChild(createElement('div', function(helpcont) {
							helpcont.className = 'help';
							helpcont.appendChild(document.createTextNode('?'));
							helpcont.appendChild(createElement('div', function(tip) {
								tip.className = 'tip';
								tip.appendChild(document.createTextNode('The starting post number.'));
							}));
						}));
					}));

					tab.appendChild(createElement('div', function(setting) {
						setting.className = 'setting';
						setting.appendChild(document.createTextNode('Starting Page #: '));
						setting.appendChild(createElement('input', function(text) {
							text.id = 'VoteCounter_startingPage';
							text.className = 'text';
							text.type = 'number';
							text.placeholder = 0;

							if (game.phase.running) {
								text.value = game.phase.page;
							}
						}));
						setting.appendChild(createElement('div', function(helpcont) {
							helpcont.className = 'help';
							helpcont.appendChild(document.createTextNode('?'));
							helpcont.appendChild(createElement('div', function(tip) {
								tip.className = 'tip';
								tip.appendChild(document.createTextNode('The starting page number.'));
							}));
						}));
					}));

					addUI();

					tab.appendChild(createElement('div', function(setting) {
						setting.className = 'setting';
						setting.appendChild(document.createTextNode('Phase End: '));

						var phaseEndDate = new Date(game.phase.end);

						setting.appendChild(createElement('input', function(text) {
							text.id = 'VoteCounter_phaseEnd';
							text.className = 'text';
							text.type = 'text';

							var pickercheck = setInterval(function() {
								if (UI_loaded) {
									jQuery("#VoteCounter_phaseEnd").datepicker({ minDate: 0, showAnim: "slideDown" });
									clearTimeout(pickercheck);
								}
							}, 100);

							if (game.phase.running) {
								text.value = formatDate(phaseEndDate);
							} else {
								text.value = formatDate(now);
							}
						}));

						setting.appendChild(document.createTextNode(' at '));

						setting.appendChild(createElement('select', function(select) {
							var i = 0;

							select.id = 'VoteCounter_timeSelect';
							select.className = 'text';

							select.options[0] = new Option('12:00 AM', '12:00 AM');
							select.options[1] = new Option('12:30 AM', '12:30 AM');
							select.options[2] = new Option('1:00 AM', '1:00 AM');
							select.options[3] = new Option('1:30 AM', '1:30 AM');
							select.options[4] = new Option('2:00 AM', '2:00 AM');
							select.options[5] = new Option('2:30 AM', '2:30 AM');
							select.options[6] = new Option('3:00 AM', '3:00 AM');
							select.options[7] = new Option('3:30 AM', '3:30 AM');
							select.options[8] = new Option('4:00 AM', '4:00 AM');
							select.options[9] = new Option('4:30 AM', '4:30 AM');
							select.options[10] = new Option('5:00 AM', '5:00 AM');
							select.options[11] = new Option('5:30 AM', '5:30 AM');
							select.options[12] = new Option('6:00 AM', '6:00 AM');
							select.options[13] = new Option('6:30 AM', '6:30 AM');
							select.options[14] = new Option('7:00 AM', '7:00 AM');
							select.options[15] = new Option('7:30 AM', '7:30 AM');
							select.options[16] = new Option('8:00 AM', '8:00 AM');
							select.options[17] = new Option('8:30 AM', '8:30 AM');
							select.options[18] = new Option('9:00 AM', '9:00 AM');
							select.options[19] = new Option('9:30 AM', '9:30 AM');
							select.options[20] = new Option('10:00 AM', '10:00 AM');
							select.options[21] = new Option('10:30 AM', '10:30 AM');
							select.options[22] = new Option('11:00 AM', '11:00 AM');
							select.options[23] = new Option('11:30 AM', '11:30 AM');

							select.options[24] = new Option('12:00 PM', '12:00 PM');
							select.options[25] = new Option('12:30 PM', '12:30 PM');
							select.options[26] = new Option('1:00 PM', '1:00 PM');
							select.options[27] = new Option('1:30 PM', '1:30 PM');
							select.options[28] = new Option('2:00 PM', '2:00 PM');
							select.options[29] = new Option('2:30 PM', '2:30 PM');
							select.options[30] = new Option('3:00 PM', '3:00 PM');
							select.options[31] = new Option('3:30 PM', '3:30 PM');
							select.options[32] = new Option('4:00 PM', '4:00 PM');
							select.options[33] = new Option('4:30 PM', '4:30 PM');
							select.options[34] = new Option('5:00 PM', '5:00 PM');
							select.options[35] = new Option('5:30 PM', '5:30 PM');
							select.options[36] = new Option('6:00 PM', '6:00 PM');
							select.options[37] = new Option('6:30 PM', '6:30 PM');
							select.options[38] = new Option('7:00 PM', '7:00 PM');
							select.options[39] = new Option('7:30 PM', '7:30 PM');
							select.options[40] = new Option('8:00 PM', '8:00 PM');
							select.options[41] = new Option('8:30 PM', '8:30 PM');
							select.options[42] = new Option('9:00 PM', '9:00 PM');
							select.options[43] = new Option('9:30 PM', '9:30 PM');
							select.options[44] = new Option('10:00 PM', '10:00 PM');
							select.options[45] = new Option('10:30 PM', '10:30 PM');
							select.options[46] = new Option('11:00 PM', '11:00 PM');
							select.options[47] = new Option('11:30 PM', '11:30 PM');

							if (game.phase.running) {
								for (i = 0; i < select.options.length; i++) {
									if (select.options[i].value === formatTime(phaseEndDate)) {
										select.selectedIndex = i;
										break;
									}
								}
							}
						}));
						setting.appendChild(createElement('div', function(helpcont) {
							helpcont.className = 'help';
							helpcont.appendChild(document.createTextNode('?'));
							helpcont.appendChild(createElement('div', function(tip) {
								tip.className = 'tip';
								tip.appendChild(document.createTextNode('The date and time when the Phase ends.'));
							}));
						}));
					}));

					tab.appendChild(createElement('div', function(setting) {
						setting.className = 'setting';
						setting.appendChild(document.createTextNode('Hammer: '));
						setting.appendChild(createElement('input', function(text) {
							text.id = 'VoteCounter_hammer';
							text.className = 'text';
							text.type = 'number';
							text.placeholder = 0;

							if (game.phase.running) {
								text.value = game.phase.hammer;
							}
						}));
						setting.appendChild(createElement('div', function(helpcont) {
							helpcont.className = 'help';
							helpcont.appendChild(document.createTextNode('?'));
							helpcont.appendChild(createElement('div', function(tip) {
								tip.className = 'tip';
								tip.appendChild(document.createTextNode('The number of votes required to Hammer.'));
							}));
						}));
					}));

					tab.appendChild(createElement('div', function(setting) {
						setting.className = 'setting';
						setting.appendChild(document.createTextNode('Post at end of phase: '));
						setting.appendChild(createElement('div', function(checkCont) {
							checkCont.className = 'checkbox_container text';
							checkCont.appendChild(createElement('input', function(check) {
								check.id = 'VoteCounter_postAtEndOfPhaseFlag';
								check.type = 'checkbox';
								if (settings.hasOwnProperty('post_at_end_of_phase')) {
									check.checked = settings.post_at_end_of_phase;
								} else {
									check.checked = true;
								}
							}));
						}));
						setting.appendChild(createElement('div', function(helpcont) {
							helpcont.className = 'help';
							helpcont.appendChild(document.createTextNode('?'));
							helpcont.appendChild(createElement('div', function(tip) {
								tip.className = 'tip';
								tip.appendChild(document.createTextNode('Enables or disables automated posting when the Phase ends.'));
							}));
						}));
					}));

					tab.appendChild(createElement('div', function(setting) {
						setting.className = 'setting';
						setting.appendChild(createElement('input', function(submit) {
							submit.className = 'input_submit';
							submit.type = 'submit';
							submit.value = 'Save Changes';

							submit.onclick = function() {
								var endDate = new Date(document.getElementById('VoteCounter_phaseEnd').value + ' ' + document.getElementById('VoteCounter_timeSelect').options[document.getElementById('VoteCounter_timeSelect').selectedIndex].value),
								games = (localStorage.getItem('Mafia Votal Generator')) ? JSON.parse(localStorage.getItem('Mafia Votal Generator')) : {},
								game = (games.hasOwnProperty(thread)) ? games[thread] : defaults;

								if (!isNaN(endDate)) {
									if (!game.id) {
										game.id = thread;
									}

									if (!document.getElementById('VoteCounter_phaseName').value.length) {
										alert('Error: You must enter a Phase Name.');
										return false;
									} else if (!document.getElementById('VoteCounter_hammer').value.length) {
										alert('Error: You must enter a Hammer.');
										return false;
									}

									game.phase.name = document.getElementById('VoteCounter_phaseName').value;
									game.phase.end = endDate;
									game.phase.hammer = parseInt(document.getElementById('VoteCounter_hammer').value);
									game.settings.post_at_end_of_phase = document.getElementById('VoteCounter_postAtEndOfPhaseFlag').checked;

									games[thread] = game;

									localStorage.setItem('Mafia Votal Generator', JSON.stringify(games));

									jQuery('.ifGame').removeClass('disabled');

									jQuery(notice).text('Changes saved.');
									jQuery(notice).fadeIn('fast').delay(1500).fadeOut('fast');
								} else {
									alert('Error: Invalid Date');
								}
							};
						}));
					}));

					tab.appendChild(createElement('div', function(setting) {
						setting.className = 'setting';
						setting.appendChild(createElement('input', function(submit) {
							submit.id = 'PhaseStarter';
							submit.className = 'input_submit';
							submit.type = 'submit';
							submit.value = ((game.phase.running) ? 'End' : 'Start') + ' Phase';

							submit.onclick = function() {
								var endDate = new Date(document.getElementById('VoteCounter_phaseEnd').value + ' ' + document.getElementById('VoteCounter_timeSelect').options[document.getElementById('VoteCounter_timeSelect').selectedIndex].value),
								games = (localStorage.getItem('Mafia Votal Generator')) ? JSON.parse(localStorage.getItem('Mafia Votal Generator')) : {},
								game = (games.hasOwnProperty(thread)) ? games[thread] : defaults;

								if (!game.phase.running) {
									if (!isNaN(endDate)) {
										if (!game.id) {
											game.id = thread;
										}

										if (!document.getElementById('VoteCounter_phaseName').value.length) {
											alert('Error: You must enter a Phase Name.');
											return false;
										} else if (!document.getElementById('VoteCounter_hammer').value.length) {
											alert('Error: You must enter a Hammer.');
											return false;
										}

										game.phase.name = document.getElementById('VoteCounter_phaseName').value;
										game.phase.end = endDate;
										game.phase.hammer = parseInt(document.getElementById('VoteCounter_hammer').value);
										game.settings.post_at_end_of_phase = document.getElementById('VoteCounter_postAtEndOfPhaseFlag').checked;
										game.phase.post = parseInt(document.getElementById('VoteCounter_startingPost').value);
										game.phase.page = parseInt(document.getElementById('VoteCounter_startingPage').value);

										game.post = game.phase.post;
										game.page = game.phase.page;
										game.last.post = game.phase.post;
										game.last.time = now;

										game.phase.running = true;

										games[thread] = game;

										localStorage.setItem('Mafia Votal Generator', JSON.stringify(games));

										document.getElementById('PhaseControl').textContent = 'Phases' + ((game.phase.running) ? ' (Running)' : '');
										this.value = 'End Phase';

										jQuery('.ifGame').removeClass('disabled');

										jQuery(notice).text(game.phase.name + ' started.');
										jQuery(notice).fadeIn('fast').delay(1500).fadeOut('fast');
									} else {
										alert('Error: Invalid Date');
									}
								} else {
									getVotes(doc, thread, true, true);

									games[thread] = game;

									localStorage.setItem('Mafia Votal Generator', JSON.stringify(games));
								}
							};
						}));
					}));
				}));

				tabs.appendChild(createElement('div', function(tab) {
					var players = game.players,
					player,
					i = 1;

					tab.id = 'VoteCounter_playersTab';
					tab.className = 'tab';

					if (Object.keys(players).length > 1) {
						for (prop in players) {
							if (players.hasOwnProperty(prop)) {
								if (prop !== '0') {
									player = JSON.parse(JSON.stringify(players[prop]));
									player.id = prop;
									tab.appendChild(playerField(player, i));
									i++;
								}
							}
						}
					} else {
						tab.appendChild(playerField({ 'aliases': [], 'id': '', 'lynch_requirement': 0, 'vote_power': 1, 'show_vote_power': true, 'dead': false }, i));
					}

					tab.appendChild(createElement('div', function(setting) {
						setting.className = 'setting';
						setting.appendChild(createElement('a', function(add) {
							add.className = 'addField';
							add.href = 'javascript:void(0)';
							add.appendChild(document.createTextNode('+'));
							add.title = 'Add a new Player';

							add.onclick = function() {
								var context = this.parentNode.parentNode,
								index = context.getElementsByClassName('playerField').length + 1;

								context.insertBefore(playerField({ 'aliases': [], 'id': '', 'lynch_requirement': 0, 'vote_power': 1, 'show_vote_power': true, 'dead': false }, index), context.getElementsByClassName('playerField')[context.getElementsByClassName('playerField').length -1].nextSibling);
							};
						}));
					}));

					tab.appendChild(createElement('div', function(setting) {
						setting.className = 'setting';
						setting.appendChild(createElement('input', function(submit) {
							submit.className = 'input_submit';
							submit.type = 'submit';
							submit.value = 'Save Changes';

							submit.onclick = function() {
								var games = (localStorage.getItem('Mafia Votal Generator')) ? JSON.parse(localStorage.getItem('Mafia Votal Generator')) : {},
								game = (games.hasOwnProperty(thread)) ? games[thread] : defaults,
								players = document.getElementsByClassName('playerField'),
								playersTemp = { '0': { 'aliases': ['No Lynch'], 'id': 0, 'lynch_requirement': 0, 'dead': false } },
								aliases,
								player,
								lynchRequirement,
								votePower,
								showVotePower,
								deathStatus,
								i = 0;

								if (!game.id) {
									game.id = thread;
								}

								for (i = 0; i < players.length; i++) {
									aliases = players[i].getElementsByClassName('playerAliases')[0].value.split(/,\s?/);
									player = players[i].getElementsByClassName('playerID')[0].value;
									lynchRequirement = (players[i].getElementsByClassName('lynchRequirement')[0].value) ? parseInt(players[i].getElementsByClassName('lynchRequirement')[0].value) : 0;
									votePower = (players[i].getElementsByClassName('votePower')[0].value) ? parseInt(players[i].getElementsByClassName('votePower')[0].value) : 1;
									showVotePower = players[i].getElementsByClassName('showVotePowerFlag')[0].checked;
									deathStatus = players[i].getElementsByClassName('deadFlag')[0].checked;

									if (!aliases.length) {
										alert('Error: You must enter at least one Alias for Player ' + (i + 1) + '.');
										return false;
									} else if (!player.length) {
										alert('Error: You must enter a Profile ID for Player ' + (i + 1) + '.');
										return false;
									}

									playersTemp[player] = { 'aliases': aliases, 'id': player, 'lynch_requirement': lynchRequirement, 'vote_power': votePower, 'show_vote_power': showVotePower, 'dead': deathStatus };
								}

								game.players = playersTemp;

								games[thread] = game;

								localStorage.setItem('Mafia Votal Generator', JSON.stringify(games));

								jQuery('.ifGame').removeClass('disabled');

								jQuery(notice).text('Changes saved.');
								jQuery(notice).fadeIn('fast').delay(1500).fadeOut('fast');
							};
						}));

						setting.appendChild(createElement('input', function(submit) {
							submit.id = 'EndGameControl';
							submit.className = 'input_submit ifGame';
							submit.type = 'submit';
							submit.value = 'End Game';
							submit.style.marginLeft = '1em';

							if (!game.id) {
								submit.className += ' disabled';
							}

							submit.onclick = function() {
								var games = (localStorage.getItem('Mafia Votal Generator')) ? JSON.parse(localStorage.getItem('Mafia Votal Generator')) : {},
								players = document.getElementsByClassName('playerField');

								if (games.hasOwnProperty(thread)) {
									if (confirm('Are you sure you want to end the game? All data will be cleared.')) {
										for (i = 0; i < players.length; i++) {
											if (!players[i].getElementsByClassName('deadFlag')[0].checked) {
												players[i].getElementsByClassName('deadFlag')[0].click();
											}
										}

										delete games[thread];

										localStorage.setItem('Mafia Votal Generator', JSON.stringify(games));

										jQuery('.ifGame').addClass('disabled');

										jQuery(notice).text('Game Over');
										jQuery(notice).fadeIn('fast').delay(1500).fadeOut('fast');
									} else {
										return false;
									}
								} else {
									jQuery(notice).text('No game data.');
									jQuery(notice).fadeIn('fast').delay(1500).fadeOut('fast');
								}
							};
						}));
					}));
				}));

				tabs.appendChild(createElement('div', function(tab) {
					tab.id = 'VoteCounter_settingsTab';
					tab.className = 'tab';

					tab.appendChild(createElement('div', function(setting) {
						setting.className = 'setting';
						setting.appendChild(document.createTextNode('Post at intervals: '));
						setting.appendChild(createElement('div', function(checkCont) {
							checkCont.className = 'checkbox_container text';
							checkCont.appendChild(createElement('input', function(check) {
								check.id = 'VoteCounter_postAtIntervalsFlag';
								check.type = 'checkbox';
								if (settings.hasOwnProperty('post_at_intervals')) {
									check.checked = settings.post_at_intervals;
								} else {
									check.checked = true;
								}
							}));
						}));
						setting.appendChild(createElement('div', function(helpcont) {
							helpcont.className = 'help';
							helpcont.appendChild(document.createTextNode('?'));
							helpcont.appendChild(createElement('div', function(tip) {
								tip.className = 'tip';
								tip.appendChild(document.createTextNode('Enables or disables automated posting at set postcount and time intervals.'));
							}));
						}));
					}));

					tab.appendChild(createElement('div', function(setting) {
						setting.className = 'setting';
						setting.appendChild(document.createTextNode('Post on trigger ('));
						setting.appendChild(createElement('strong', function(b) {
							b.appendChild(document.createTextNode('##Votal'));
						}));
						setting.appendChild(document.createTextNode('): '));
						setting.appendChild(createElement('div', function(checkCont) {
							checkCont.className = 'checkbox_container text';
							checkCont.appendChild(createElement('input', function(check) {
								check.id = 'VoteCounter_postOnTriggerFlag';
								check.type = 'checkbox';
								if (settings.hasOwnProperty('post_on_trigger')) {
									check.checked = settings.post_on_trigger;
								} else {
									check.checked = true;
								}
							}));
						}));
						setting.appendChild(createElement('div', function(helpcont) {
							helpcont.className = 'help';
							helpcont.appendChild(document.createTextNode('?'));
							helpcont.appendChild(createElement('div', function(tip) {
								tip.className = 'tip';
								tip.appendChild(document.createTextNode('Enables or disables automated posting when a Player says "##Votal" in the thread.'));
							}));
						}));
					}));

					tab.appendChild(createElement('div', function(setting) {
						setting.className = 'setting';
						setting.appendChild(document.createTextNode('Post at Hammer: '));
						setting.appendChild(createElement('div', function(checkCont) {
							checkCont.className = 'checkbox_container text';
							checkCont.appendChild(createElement('input', function(check) {
								check.id = 'VoteCounter_postAtHammerFlag';
								check.type = 'checkbox';
								if (settings.hasOwnProperty('post_at_hammer')) {
									check.checked = settings.post_at_hammer;
								} else {
									check.checked = true;
								}
							}));
						}));
						setting.appendChild(createElement('div', function(helpcont) {
							helpcont.className = 'help';
							helpcont.appendChild(document.createTextNode('?'));
							helpcont.appendChild(createElement('div', function(tip) {
								tip.className = 'tip';
								tip.appendChild(document.createTextNode('Enables or disables automated posting when a lynch reaches the Phase\'s Hammer requirement.'));
							}));
						}));
					}));

					tab.appendChild(createElement('div', function(setting) {
						setting.className = 'setting';
						setting.appendChild(document.createTextNode('Post every (hours): '));
						setting.appendChild(createElement('input', function(text) {
							text.id = 'VoteCounter_postingInterval_Time';
							text.className = 'text';
							text.type = 'text';
							text.placeholder = '6';

							if (settings.posting_interval_time) {
								text.value = settings.posting_interval_time;
							} else {
								text.value = '6';
							}
						}));
						setting.appendChild(createElement('div', function(helpcont) {
							helpcont.className = 'help';
							helpcont.appendChild(document.createTextNode('?'));
							helpcont.appendChild(createElement('div', function(tip) {
								tip.className = 'tip';
								tip.appendChild(document.createTextNode('The number of hours to wait between automated posts. ('));
								tip.appendChild(createElement('em', function(i) {
									i.appendChild(document.createTextNode('"Post at intervals" must be Enabled.'));
								}));
								tip.appendChild(document.createTextNode(')'));
							}));
						}));
					}));

					tab.appendChild(createElement('div', function(setting) {
						setting.className = 'setting';
						setting.appendChild(document.createTextNode('Post every (posts): '));
						setting.appendChild(createElement('input', function(text) {
							text.id = 'VoteCounter_postingInterval_Posts';
							text.className = 'text';
							text.type = 'number';
							text.placeholder = 50;

							if (settings.posting_interval_posts) {
								text.value = settings.posting_interval_posts;
							} else {
								text.value = '50';
							}
						}));
						setting.appendChild(createElement('div', function(helpcont) {
							helpcont.className = 'help';
							helpcont.appendChild(document.createTextNode('?'));
							helpcont.appendChild(createElement('div', function(tip) {
								tip.className = 'tip';
								tip.appendChild(document.createTextNode('The number of posts to allow between automated posts. ('));
								tip.appendChild(createElement('em', function(i) {
									i.appendChild(document.createTextNode('"Post at intervals" must be Enabled.'));
								}));
								tip.appendChild(document.createTextNode(')'));
							}));
						}));
					}));

					tab.appendChild(createElement('div', function(setting) {
						setting.className = 'setting';
						setting.appendChild(document.createTextNode('Order votals by: '));
						setting.appendChild(createElement('select', function(select) {
							select.id = 'VoteCounter_orderMethod';
							select.className = 'text';

							select.options[0] = new Option('Most Recent', 'latest');
							select.options[1] = new Option('Most Votes', 'votes');
							select.options[2] = new Option('Name', 'name');

							if (settings.order_method) {
								switch (settings.order_method) {
									case 'votes':
										select.selectedIndex = 1;
									break;
									case 'name':
										select.selectedIndex = 2;
									break;
									case 'latest':
									default:
										select.selectedIndex = 0;
									break;
								}
							} else {
								select.selectedIndex = 0;
							}
						}));
						setting.appendChild(createElement('div', function(helpcont) {
							helpcont.className = 'help';
							helpcont.appendChild(document.createTextNode('?'));
							helpcont.appendChild(createElement('div', function(tip) {
								tip.className = 'tip';
								tip.appendChild(document.createTextNode('The sorting method used when displaying votes. All methods sort in descending order.'));
							}));
						}));
					}));

					tab.appendChild(createElement('div', function(setting) {
						setting.className = 'setting';
						setting.appendChild(document.createTextNode('Check thread every (minutes): '));
						setting.appendChild(createElement('input', function(text) {
							text.id = 'VoteCounter_voteCheckInterval';
							text.className = 'text';
							text.type = 'number';
							text.placeholder = 5;

							if (settings.vote_check_interval) {
								text.value = settings.vote_check_interval;
							} else {
								text.value = 5;
							}
						}));
						setting.appendChild(createElement('div', function(helpcont) {
							helpcont.className = 'help';
							helpcont.appendChild(document.createTextNode('?'));
							helpcont.appendChild(createElement('div', function(tip) {
								tip.className = 'tip';
								tip.appendChild(document.createTextNode('Time (in minutes) to wait between checking the thread for updates.'));
							}));
						}));
					}));

					tab.appendChild(createElement('div', function(setting) {
						setting.className = 'setting';
						setting.appendChild(createElement('div', function(debugcont) {
							debugcont.className = 'text debugContainer';
							debugcont.appendChild(document.createTextNode('Preview Mode: '));
							debugcont.appendChild(createElement('div', function(checkCont) {
								checkCont.className = 'checkbox_container text';
								checkCont.appendChild(createElement('input', function(check) {
									check.id = 'VoteCounter_debugModeFlag';
									check.type = 'checkbox';
									if (settings.hasOwnProperty('debug_mode')) {
										check.checked = settings.debug_mode;
									} else {
										check.checked = false;
									}

									check.onchange = function() {
										debug_mode = this.checked;
									};
								}));
							}));
						}));
						setting.appendChild(createElement('div', function(helpcont) {
							helpcont.className = 'help';
							helpcont.appendChild(document.createTextNode('?'));
							helpcont.appendChild(createElement('div', function(tip) {
								tip.className = 'tip';
								tip.appendChild(document.createTextNode('If enabled, forces votals to appear in the Quick Reply box instead of posting. ('));
								tip.appendChild(createElement('em', function(i) {
									i.appendChild(document.createTextNode('CAUTION: Automated posting does not occur in this mode. Results must be submitted manually in the Quick Reply.'));
								}));
								tip.appendChild(document.createTextNode(')'));
							}));
						}));
					}));

					tab.appendChild(createElement('div', function(setting) {
						setting.className = 'setting';
						setting.appendChild(createElement('input', function(submit) {
							submit.className = 'input_submit';
							submit.type = 'submit';
							submit.value = 'Save Changes';

							submit.onclick = function() {
								var games = (localStorage.getItem('Mafia Votal Generator')) ? JSON.parse(localStorage.getItem('Mafia Votal Generator')) : {},
								game = (games.hasOwnProperty(thread)) ? games[thread] : defaults;

								if (!game.id) {
									game.id = thread;
								}

								if (!document.getElementById('VoteCounter_postingInterval_Time').value.length) {
									alert('Error: You must enter a posting interval (hours).');
									return false;
								} else if (!document.getElementById('VoteCounter_postingInterval_Posts').value.length) {
									alert('Error: You must enter a posting interval (posts).');
									return false;
								} else if (!document.getElementById('VoteCounter_voteCheckInterval').value.length) {
									alert('Error: You must enter a vote check interval (minutes).');
									return false;
								}

								game.settings.post_at_intervals = document.getElementById('VoteCounter_postAtIntervalsFlag').checked;
								game.settings.posting_interval_time = parseFloat(document.getElementById('VoteCounter_postingInterval_Time').value);
								game.settings.posting_interval_posts = parseInt(document.getElementById('VoteCounter_postingInterval_Posts').value);
								game.settings.order_method = document.getElementById('VoteCounter_orderMethod').options[document.getElementById('VoteCounter_orderMethod').selectedIndex].value;
								game.settings.post_at_hammer = document.getElementById('VoteCounter_postAtHammerFlag').checked;
								game.settings.post_on_trigger = document.getElementById('VoteCounter_postOnTriggerFlag').checked;
								game.settings.vote_check_interval = parseInt(document.getElementById('VoteCounter_voteCheckInterval').value);
								game.settings.debug_mode = document.getElementById('VoteCounter_debugModeFlag').checked;

								games[thread] = game;

								localStorage.setItem('Mafia Votal Generator', JSON.stringify(games));

								jQuery('.ifGame').removeClass('disabled');

								jQuery(notice).text('Changes saved.');
								jQuery(notice).fadeIn('fast').delay(1500).fadeOut('fast');
							};
						}));
					}));

					tab.appendChild(createElement('div', function(setting) {
						setting.className = 'setting';
						setting.appendChild(createElement('input', function(submit) {
							submit.className = 'input_submit ifGame';
							submit.id = 'exportButton';
							submit.type = 'submit';
							submit.value = 'Export Game';

							if (!game.id) {
								submit.className += ' disabled';
							}

							submit.onclick = function() {
								var games = (localStorage.getItem('Mafia Votal Generator')) ? JSON.parse(localStorage.getItem('Mafia Votal Generator')) : {},
								game = (games.hasOwnProperty(thread)) ? games[thread] : defaults,
								title = jQuery('.ipsType_pagetitle:first').text().trim(),
								link;

								if (game.id) {
									link = doc.appendChild(document.createElement('a'));
									jQuery(link).attr('download', sanitize(title + ' - #' + game.post) + '.json').attr('href', 'data:text/plain;charset=UTF-8,' + encodeURIComponent(JSON.stringify(game)));
									link.click();
									link.remove();
								} else {
									jQuery(notice).text('No game data.');
									jQuery(notice).fadeIn('fast').delay(1500).fadeOut('fast');
								}
							};
						}));

						setting.appendChild(createElement('input', function(submit) {
							submit.className = 'input_submit';
							submit.id = 'importButton';
							submit.type = 'submit';
							submit.style.marginLeft = '1em';
							submit.value = 'Import Game';

							submit.onclick = function() {
								jQuery('#VoteCounter_importTab').slideToggle('fast');
							};
						}));

						setting.appendChild(createElement('div', function(helpcont) {
							helpcont.className = 'help';
							helpcont.appendChild(document.createTextNode('?'));
							helpcont.appendChild(createElement('div', function(tip) {
								tip.className = 'tip';
								tip.appendChild(document.createTextNode('"Export Game": Saves the current game data as a file which can be shared with other members or loaded at a later time.'));
								tip.appendChild(document.createElement('br'));
								tip.appendChild(document.createTextNode('"Import Game": Loads a previously exported game file.'));
							}));
						}));
					}));
				}));

				tabs.appendChild(createElement('div', function(tab) {
					tab.className = 'tab import';
					tab.id = 'VoteCounter_importTab';
					tab.appendChild(createElement('h3', function(head) {
						head.appendChild(document.createTextNode('Import Game'));
					}));

					tab.appendChild(createElement('input', function(file) {
						file.className = 'text file';
						file.type = 'file';
						file.id = 'VoteCounter_importFile';
					}));

					var reader = new FileReader(),
					result,
					game_file,
					games;

					reader.onload = function(event) {
						result = event.target.result;
						game_file = isJSON(result) ? JSON.parse(result) : false;

						if (game_file && game_file.id === thread) {
							games = (localStorage.getItem('Mafia Votal Generator')) ? JSON.parse(localStorage.getItem('Mafia Votal Generator')) : {};
							games[thread] = game_file;

							localStorage.setItem('Mafia Votal Generator', JSON.stringify(games));

							jQuery(notice).text('Game imported successfully.');
							jQuery(notice).fadeIn('fast').delay(1500).fadeOut('fast');

							jQuery('.VoteCounterControls').fadeOut('fast', function() {
								jQuery('.VoteCounterControls').remove();
								jQuery('.post_block:first .row2').after(controls(game_file));
								addSwitches();
								addTips();
								jQuery('#SettingsControl').click();
								jQuery('.VoteCounterControls').fadeIn('fast');
								jQuery('html, body').animate({
									scrollTop: jQuery('.VoteCounterControls:first').offset().top
								}, 300);
							});
						} else if (game_file && game_file.id !== thread) {
							jQuery(notice).text('Wrong game.');
							jQuery(notice).fadeIn('fast').delay(1500).fadeOut('fast');
						} else {
							jQuery(notice).text('Invalid file.');
							jQuery(notice).fadeIn('fast').delay(1500).fadeOut('fast');
						}
					};

					tab.appendChild(createElement('strong', function(b) {
						b.appendChild(document.createTextNode('OR'));
					}));

					tab.appendChild(createElement('textarea', function(file) {
						file.className = 'text';
						file.id = 'VoteCounter_importText';
						file.placeholder = 'Enter data as text';
					}));

					tab.appendChild(createElement('div', function(foot) {
						foot.style.marginTop = '20px';

						foot.appendChild(createElement('input', function(save) {
							save.className = 'input_submit';
							save.type = 'submit';
							
							save.value = 'Submit';

							save.onclick = function() {
								var upload = document.getElementById('VoteCounter_importFile'),
								import_field = document.getElementById('VoteCounter_importText');

								if (upload.files && upload.files[0]) {
									reader.readAsText(upload.files[0]);
								} else if (import_field.value) {
									result = import_field.value;
									game_file = isJSON(result) ? JSON.parse(result) : false;

									if (game_file && game_file.id === thread) {
										games = (localStorage.getItem('Mafia Votal Generator')) ? JSON.parse(localStorage.getItem('Mafia Votal Generator')) : {};
										games[thread] = game_file;

										localStorage.setItem('Mafia Votal Generator', JSON.stringify(games));

										jQuery(notice).text('Game imported successfully.');
										jQuery(notice).fadeIn('fast').delay(1500).fadeOut('fast');

										jQuery('.VoteCounterControls').fadeOut('fast', function() {
											jQuery('.VoteCounterControls').remove();
											jQuery('.post_block:first .row2').after(controls(game_file));
											addSwitches();
											addTips();
											jQuery('#SettingsControl').click();
											jQuery('.VoteCounterControls').fadeIn('fast');
											jQuery('html, body').animate({
												scrollTop: jQuery('.VoteCounterControls:first').offset().top
											}, 500);
										});
									} else if (game_file && game_file.id !== thread) {
										jQuery(notice).text('Wrong game.');
										jQuery(notice).fadeIn('fast').delay(1500).fadeOut('fast');
									} else {
										jQuery(notice).text('Invalid file.');
										jQuery(notice).fadeIn('fast').delay(1500).fadeOut('fast');
									}
								} else {
									jQuery(notice).text('File is empty.');
									jQuery(notice).fadeIn('fast').delay(1500).fadeOut('fast');
								}
							};
						}));

						foot.appendChild(createElement('input', function(cancel) {
							cancel.className = 'input_submit';
							cancel.type = 'submit';
							cancel.style.marginLeft = '1em';
							cancel.value = 'Cancel';

							cancel.onclick = function() {
								var upload = jQuery('#VoteCounter_importFile'),
								import_field = jQuery('#VoteCounter_importText');

								upload.replaceWith(upload.val('').clone(true));
								import_field.val('');

								jQuery('#VoteCounter_importTab').slideUp('fast');
							};
						}));
					}));
				}));
			}));
		});
	}

	function Votal(game, method, endPhase, hammer) {
		var votals = jQuery.map(game.votes.votals, function(value, key) {
			value.user = key;
			if (value.tally > 0) {
				return value;
			}
		}).sort(function(a, b) {
			switch (method) {
				case 'name':
					if (a.user > b.user) {
						return 1;
					} else if (a.user < b.user) {
						return -1;
					}
					return 0;
				break;
				case 'votes':
					if (a.tally > b.tally) {
						return -1;
					} else if (a.tally < b.tally) {
						return 1;
					}
					return 0;
				break;
				case 'latest':
				default:
					if (a.latest > b.latest) {
						return -1;
					} else if (a.latest < b.latest) {
						return 1;
					}
					return 0;
				break;
			}
		}),
		postDoc = (debug_mode) ? document : postFrame.contentWindow.document,
		recent = game.votes.recent,
		errors = game.votes.errors,
		caches = game.votes.player_cache,
		cache_field = '',
		remaining = new Date(new Date(game.phase.end) - new Date()),
		time = readableCountdown(remaining.getTime()),
		field,
		voters,
		novotes = 0,
		novoters = '',
		first = false,
		prop,
		L1Threshold,
		trueVote = true,
		tally,
		i = 0,
		j = 0;

		for (prop in game.players) {
			if (game.players.hasOwnProperty(prop)) {
				if (prop !== '0') {
					if (!game.players[prop].dead) {
						if (!recent.hasOwnProperty(game.players[prop].aliases[0]) || recent[game.players[prop].aliases[0]].vote === 'Unvote') {
							if (novotes) {
								novoters += ', ';
							}

							novoters += game.players[prop].aliases[0];
							novotes++;
						}
					}
				}
			}
		}

		for (prop in caches) {
			if (caches.hasOwnProperty(prop)) {
				if (caches[prop].length) {
					if (first) {
						cache_field += '\n';
					}

					first = true;

					cache_field += '[B]' + prop + ' (' + caches[prop].length + '):[/B] ';

					for (j = 0; j < caches[prop].length; j++) {
						if (j > 0) {
							cache_field += ' -> ';
						}

						cache_field += '[URL=' + caches[prop][j].url + ']' + caches[prop][j].vote + '[/URL]';
					}
				}
			}
		}

		function votalResult(i) {
			for (j = 0, voters = votals[i].voters; j < voters.length; j++) {
				if (!game.players[checkAlias(votals[i].voters[j], game.players).id].show_vote_power) {
					trueVote = false;
					break;
				}
			}

			tally = (trueVote) ? votals[i].trueTally : votals[i].tally;

			return createElement('p', function(body) {
				body.appendChild(createElement('strong', function(b) {
					b.appendChild(document.createTextNode(votals[i].user + ' (' + tally + '):'));
				}));
				body.appendChild(document.createTextNode(' '));

				for (j = 0, voters = votals[i].voters; j < voters.length; j++) {
					if (!game.players[checkAlias(votals[i].voters[j], game.players).id].dead) {
						if (j > 0) {
							body.appendChild(document.createTextNode(', '));
						}

						body.appendChild(voteLinkRecent(j));
					}
				}

				if (game.settings.post_at_hammer) {
					L1Threshold = game.phase.hammer + game.players[checkAlias(votals[i].user, game.players).id].lynch_requirement - 1;

					if (tally === L1Threshold) {
						body.appendChild(document.createTextNode(' '));
						body.appendChild(L1Notice());
					}
				}
			});
		}

		function cacheResult(prop) {
			var j = 0;

			return createElement('p', function(body) {
				body.appendChild(createElement('strong', function(b) {
					b.appendChild(document.createTextNode(prop + ' (' + caches[prop].length + '):'));
				}));

				body.appendChild(document.createTextNode(' '));

				for (j = 0; j < caches[prop].length; j++) {
					if (j > 0) {
						body.appendChild(document.createTextNode(' -> '));
					}

					body.appendChild(voteLinkCache(j));
				}
			});
		}

		function voteLinkRecent(j) {
			return createElement('a', function(v) {
				var url = recent[voters[j]].url;

				v.setAttribute('data-cke-saved-href', url);
				v.href = url;
				v.appendChild(document.createTextNode(voters[j]));
			});
		}

		function voteLinkError(j) {
			return createElement('a', function(v) {
				var url = errors[j].url;

				v.setAttribute('data-cke-saved-href', url);
				v.href = url;
				v.appendChild(document.createTextNode(errors[j].voter));
			});
		}

		function voteLinkCache(j) {
			return createElement('a', function(v) {
				v.setAttribute('data-cke-saved-href', caches[prop][j].url);
				v.href = caches[prop][j].url;
				v.appendChild(document.createTextNode(caches[prop][j].vote));
			});
		}

		function L1Notice() {
			return createElement('span', function(red) {
				red.style.color = '#FF0000';
				red.appendChild(createElement('strong', function(b) {
					b.appendChild(document.createTextNode('(L-1)'));	
				}));
			});
		}

		if (jQuery('.cke_contents iframe', postDoc).length) {
			field = jQuery('.cke_contents iframe', postDoc).contents().find('body').get(0);

			empty(field);

			field.appendChild(createElement('p', function(header) {
				header.appendChild(createElement('span', function(size) {
					size.style.fontSize = '18px';
					size.appendChild(createElement('strong', function(b) {
						b.appendChild(document.createTextNode(game.phase.name + ': Automated Votals from #' + game.last.post + ' to #' + game.post));
					}));
				}));
			}));

			field.appendChild(createElement('p', function(spacing) {
				spacing.appendChild(document.createElement('br'));
			}));

			if (hammer) {
				field.appendChild(createElement('p', function(header) {
					header.appendChild(createElement('span', function(size) {
						size.style.fontSize = '18px';
						size.appendChild(createElement('span', function(red) {
							red.style.color = '#FF0000';
							red.appendChild(createElement('strong', function(b) {
								jQuery.each(votals, function() {
									var hammerThreshold = game.phase.hammer + game.players[checkAlias(this.user, game.players).id].lynch_requirement;

									if (this.trueTally >= hammerThreshold) {
										b.appendChild(document.createTextNode(this.user + ' has been Hammered!'));
										return false;
									}
								});
							}));
						}));
					}));
				}));

				field.appendChild(createElement('p', function(spacing) {
					spacing.appendChild(document.createElement('br'));
				}));
			}

			for (i = 0; i < votals.length; i++) {
				field.appendChild(votalResult(i));
			}

			if (novotes) {
				field.appendChild(createElement('p', function(body) {
					body.appendChild(createElement('strong', function(b) {
						b.appendChild(document.createTextNode('Not voting' + ' (' + novotes + '):'));
					}));
					body.appendChild(document.createTextNode(' ' + novoters));
				}));
			}

			if (errors.length) {
				field.appendChild(createElement('p', function(spacing) {
					spacing.appendChild(document.createElement('br'));
				}));

				field.appendChild(createElement('p', function(body) {
					body.appendChild(createElement('span', function(red) {
						red.style.color = '#FF0000';
						red.appendChild(createElement('strong', function(b) {
							b.appendChild(document.createTextNode('Errors (' + errors.length + '):'));
						}));
					}));
					body.appendChild(document.createTextNode(' '));

					for (j = 0; j < errors.length; j++) {
						if (j > 0) {
							body.appendChild(document.createTextNode(', '));
						}

						body.appendChild(voteLinkError(j));
					}
				}));
			}

			if (!hammer && !endPhase) {
				field.appendChild(createElement('p', function(spacing) {
					spacing.appendChild(document.createElement('br'));
				}));

				field.appendChild(createElement('p', function(body) {
					body.appendChild(createElement('strong', function(b) {
						b.appendChild(document.createTextNode('Phase ends in ' + time.hours + 'h' + time.minutes + 'm.'));
						if (game.settings.post_at_hammer) {
							b.appendChild(document.createTextNode(' Hammer at ' + game.phase.hammer + '.'));
						}
					}));
				}));
			}

			if (endPhase) {
				field.appendChild(createElement('p', function(spacing) {
					spacing.appendChild(document.createElement('br'));
				}));

				field.appendChild(createElement('p', function(body) {
					body.appendChild(createElement('strong', function(b) {
						b.appendChild(document.createTextNode('Phase End'));
					}));
				}));
			}

			if (cache_field) {
				field.appendChild(createElement('p', function(spacing) {
					spacing.appendChild(document.createElement('br'));
				}));

				field.appendChild(createElement('p', function(body) {
					body.appendChild(createElement('strong', function(b) {
						b.appendChild(document.createTextNode('Vote history:'));
					}));
				}));

				field.appendChild(createElement('p', function(body) {
					body.appendChild(document.createTextNode('[spoiler]'));
				}));

				for (prop in caches) {
					if (caches.hasOwnProperty(prop)) {
						if (caches[prop].length) {
							field.appendChild(cacheResult(prop));
						}
					}
				}

				field.appendChild(createElement('p', function(body) {
					body.appendChild(document.createTextNode('[/spoiler]'));
				}));
			}

			field.appendChild(createElement('p', function(spacing) {
				spacing.appendChild(document.createElement('br'));
			}));

			field.appendChild(createElement('p', function(body) {
				body.appendChild(createElement('strong', function(b) {
					b.appendChild(createElement('span', function(color) {
						color.style.color = '#555';
						color.appendChild(document.createTextNode('<Beta v' + VERSION + '>'));
					}));
				}));
			}));
		} else if (jQuery('.cke_contents textarea', postDoc).length) {
			field = jQuery('.cke_contents textarea', postDoc).get(0);

			field.value = '[SIZE=5][B]' + game.phase.name + ': Automated Votals from #' + game.last.post + ' to #' + game.post + '[/B][/SIZE]\n\n';

			if (hammer) {
				jQuery.each(votals, function() {
					var hammerThreshold = game.phase.hammer + game.players[checkAlias(this.user, game.players).id].lynch_requirement;

					if (this.trueTally >= hammerThreshold) {
						field.value += '[SIZE=5][COLOR=#FF0000][B]' + this.user + ' has been Hammered![/B][/COLOR][/SIZE]\n\n';
						return false;
					}
				});
			}

			for (i = 0; i < votals.length; i++) {
				for (j = 0, voters = votals[i].voters; j < voters.length; j++) {
					if (!game.players[checkAlias(votals[i].voters[j], game.players).id].show_vote_power) {
						trueVote = false;
						break;
					}
				}

				tally = (trueVote) ? votals[i].trueTally : votals[i].tally;

				if (i > 0) {
					field.value += '\n';
				}

				field.value += '[B]' + votals[i].user +' (' + tally + '):[/B] ';

				for (j = 0, voters = votals[i].voters; j < voters.length; j++) {
					if (j > 0) {
						field.value += ', ';
					}

					field.value += '[URL=' + recent[voters[j]].url + ']' + voters[j] + '[/URL]';
				}

				if (game.settings.post_at_hammer) {
					L1Threshold = game.phase.hammer + game.players[checkAlias(votals[i].user, game.players).id].lynch_requirement - 1;

					if (tally === L1Threshold) {
						field.value += ' [COLOR=#FF0000][B](L-1)[/B][/COLOR]';
					}
				}
			}

			if (novotes) {
				field.value += '\n[B]Not voting (' + novotes + '):[/B] ' + novoters;
			}

			if (errors.length) {
				field.value += '\n\n';

				field.value += '[COLOR=#FF0000][B]Errors (' + errors.length + '):[/B][/COLOR] ';

				for (j = 0; j < errors.length; j++) {
					if (j > 0) {
						field.value += ', ';
					}

					field.value += '[URL=' + errors[j].url + ']' + errors[j].voter + '[/URL]';
				}
			}

			if (!hammer && !endPhase) {
				field.value += '\n\n';
				field.value += '[B]Phase ends in ' + time.hours + 'h' + time.minutes + 'm.';
				if (game.settings.post_at_hammer) {
					field.value += ' Hammer at ' + game.phase.hammer + '.';
				}
				field.value += '[/B]';
			}

			if (endPhase) {
				field.value += '\n\n';
				field.value += '[B]Phase End[/B]';
			}

			if (cache_field) {
				field.value += '\n\n';
				field.value += '[B]Vote history:[/B]\n[spoiler]';
				field.value += cache_field;
				field.value += '[/spoiler]';
			}

			if (!cache_field) {
				field.value += '\n';
			}

			field.value += '\n';
			field.value += '[B][COLOR=#555]<Beta v' + VERSION + '>[/COLOR][/B]';
		}

		if (endPhase) {
			toggleAuto('off');
			document.getElementById('PhaseControl').textContent = 'Phases';
			document.getElementById('PhaseStarter').value = 'Start Phase';

			jQuery(notice).text(game.phase.name + ' ended.');
			jQuery(notice).fadeIn('fast').delay(1500).fadeOut('fast');

			game.phase.end = null;
			game.phase.name = null;
			game.phase.hammer = null;
			game.phase.post = null;
			game.phase.page = null;
			game.votes.votals = {};
			game.votes.player_cache = {};
			game.votes.recent = {};
			game.last.post = game.post;
			game.last.time = null;

			game.phase.running = false;

			clearTimeout(vote_check);
			clearTimeout(end_phase);
			vote_check = false;
			end_phase = false;
		} else {
			game.last.post = ++game.post;
			game.last.time = new Date();
		}

		game.votes.player_cache = {};
		game.votes.errors = [];
	}

	function toggleAuto(type) {
		switch (type) {
			case 'on':
				if (jQuery('.timerSymbol').hasClass('play')) {
					jQuery('.timerSymbol').removeClass('play').addClass('stop');
					jQuery('.timerButton').attr('title', 'Stop automated posting');
					jQuery('.VoteCounterControls').addClass('running');
					jQuery('#VoteCounter_Background').fadeIn('fast');
					document.title = '[VOTEBOT] ' + pageTitle;
				}
			break;
			case 'off':
				if (jQuery('.timerSymbol').hasClass('stop')) {
					jQuery('.timerSymbol').removeClass('stop').addClass('play');
					jQuery('.timerButton').attr('title', 'Start automated posting');
					jQuery('.VoteCounterControls').removeClass('running');
					jQuery('#VoteCounter_Background').fadeOut('fast');
					document.title = pageTitle;
				}
			break;
			default:
				if (jQuery('.timerSymbol').hasClass('play')) {
					jQuery('.timerSymbol').removeClass('play').addClass('stop');
					jQuery('.timerButton').attr('title', 'Stop automated posting');
					jQuery('.VoteCounterControls').addClass('running');
					jQuery('#VoteCounter_Background').fadeIn('fast');
					document.title = '[VOTEBOT] ' + pageTitle;
				} else {
					jQuery('.timerSymbol').removeClass('stop').addClass('play');
					jQuery('.timerButton').attr('title', 'Start automated posting');
					jQuery('.VoteCounterControls').removeClass('running');
					jQuery('#VoteCounter_Background').fadeOut('fast');
					document.title = pageTitle;
				}
		}
	}

	function checkAlias(alias, list) {
		var prop,
		i = 0;

		for (prop in list) {
			if (list.hasOwnProperty(prop)) {
				for (i = 0; i < list[prop].aliases.length; i++) {
					if (list[prop].aliases[i].toLowerCase() === alias.toLowerCase()) {
						return { 'name': list[prop].aliases[0], 'id': list[prop].id };
					}
				}
			}
		}

		return { 'name': false, 'id': false };
	}

	function getVotes(loadTo, thread, post, endPhase) {
		var games = (localStorage.getItem('Mafia Votal Generator')) ? JSON.parse(localStorage.getItem('Mafia Votal Generator')) : {},
		game = (games.hasOwnProperty(thread)) ? games[thread] : defaults,
		votes = game.votes,
		players = game.players,
		hammer = game.phase.hammer,
		isHammer = false,
		postOnTrigger = game.settings.post_on_trigger,
		postAtHammer = game.settings.post_at_hammer,
		now,
		lastTime,
		lastPost,
		phaseEnd;

		endPhase = endPhase || false;
		post = post || false;

		jQuery(loadTo).load('http://serenesforest.net/forums/index.php?showtopic=' + thread + '&page=' + game.page + ' #content', function() {
			jQuery(loadTo).find('blockquote').remove();
			jQuery(loadTo).find('br').replaceWith(document.createTextNode('\n'));

			if (parseInt(jQuery(loadTo).find('.post_block:last .post_id > a:first').text().trim().split('#')[1]) > game.post) {
				jQuery(loadTo).find('.post_block').each(function() {
					var self = this,
					player = jQuery(self).find('.author > a:first').attr('hovercard-id'),
					playerName,
					postURL = jQuery(self).find('.post_id > a:first').attr('href'),
					postNum = jQuery(self).find('.post_id > a:first').text().trim(),
					postContent = jQuery(self).find('.entry-content:first').text(),
					unvote = postContent.match(/##Unvote/i),
					vote = postContent.match(/##Vote:? .*?(?=jQuery|\n)/gi),
					trigger = postContent.match(/##Votal/i),
					lastVote,
					lynchee,
					showVotePower,
					truePower,
					shownPower,
					hammerThreshold;

					if (trigger && postOnTrigger) {
						post = true;
					}

					if (parseInt(postNum.split('#')[1]) > game.post) {
						game.post = parseInt(postNum.split('#')[1]);

						if (players[player] && !players[player].dead) {
							playerName = players[player].aliases[0];
							lastVote = (votes.recent[playerName] != null) ? votes.recent[playerName].vote : '';
							showVotePower = (players[player].hasOwnProperty('show_vote_power')) ? players[player].show_vote_power : true;
							truePower = players[player].vote_power;
							shownPower = (showVotePower) ? truePower : 1;

							if (vote) {
								lynchee = checkAlias(vote[vote.length - 1].split(/##Vote:? /i)[1].trim(), players).name;
								
								if (lynchee !== false) {
									if (lynchee !== lastVote) {
										if (lastVote.length && votes.votals[lastVote] && lastVote !== 'Unvote') {
											votes.votals[lastVote].tally -= shownPower;
											votes.votals[lastVote].trueTally -= truePower;
											votes.votals[lastVote].voters = jQuery.grep(votes.votals[lastVote].voters, function(value) {
												return value !== playerName;
											});
										}

										if (votes.votals.hasOwnProperty(lynchee)) {
											votes.votals[lynchee].tally += shownPower;
											votes.votals[lynchee].trueTally += truePower;
											votes.votals[lynchee].voters.push(playerName);
											votes.votals[lynchee].latest = postNum;

											hammerThreshold = hammer + players[checkAlias(lynchee, players).id].lynch_requirement;

											if (votes.votals[lynchee].trueTally >= hammerThreshold - 1 && postAtHammer) {
												if (votes.votals[lynchee].trueTally >= hammerThreshold) {
													isHammer = true;
													endPhase = true;
													post = true;
												} else if (showVotePower && votes.votals[lynchee].trueTally >= hammerThreshold - 1) {
													post = true;
												} else if (!showVotePower && votes.votals[lynchee].tally >= hammerThreshold - 1) {
													post = true;
												}
											}
										} else {
											votes.votals[lynchee] = { 'tally': shownPower, 'trueTally': truePower, 'voters': [playerName], 'latest': postNum };
										}
									}

									if (!votes.history.length || postNum > votes.history[votes.history.length - 1].post) {
										votes.history.push({ 'voter': playerName, 'vote': lynchee, 'post': postNum, 'url': postURL });
									}
									
									if (votes.player_history.hasOwnProperty(playerName)) {
										if (postNum > votes.player_history[playerName][votes.player_history[playerName].length - 1].post) {
											votes.player_history[playerName].push({ 'vote': lynchee, 'post': postNum, 'url': postURL });
										}
									} else {
										votes.player_history[playerName] = [{ 'vote': lynchee, 'post': postNum, 'url': postURL }];
									}

									if (votes.player_cache.hasOwnProperty(playerName)) {
										votes.player_cache[playerName].push({ 'vote': lynchee, 'post': postNum, 'url': postURL });
									} else {
										votes.player_cache[playerName] = [{ 'vote': lynchee, 'post': postNum, 'url': postURL }];
									}

									votes.recent[playerName] = { 'vote': lynchee, 'post': postNum, 'url': postURL };
								} else {
									votes.errors.push({ 'voter': playerName, 'vote': vote[vote.length - 1].split(/##Vote:? /i)[1].trim(), 'post': postNum, 'url': postURL });
								}
							} else if (unvote) {
								if (lastVote.length && votes.votals[lastVote] && lastVote !== 'Unvote') {
									votes.votals[lastVote].tally -= shownPower;
									votes.votals[lastVote].trueTally -= truePower;
									votes.votals[lastVote].voters = jQuery.grep(votes.votals[lastVote].voters, function(value) {
										return value !== playerName;
									});
								}

								if (postNum > votes.history[votes.history.length - 1].post) {
									votes.history.push({ 'voter': playerName, 'vote': 'Unvote', 'post': postNum, 'url': postURL });
								}
								
								if (votes.player_history.hasOwnProperty(playerName)) {
									if (postNum > votes.player_history[playerName][votes.player_history[playerName].length - 1].post) {
										votes.player_history[playerName].push({ 'vote': 'Unvote', 'post': postNum, 'url': postURL });
									}
								} else {
									votes.player_history[playerName] = [{ 'vote': 'Unvote', 'post': postNum, 'url': postURL }];
								}

								if (votes.player_cache.hasOwnProperty(playerName)) {
									votes.player_cache[playerName].push({ 'vote': 'Unvote', 'post': postNum, 'url': postURL });
								} else {
									votes.player_cache[playerName] = [{ 'vote': 'Unvote', 'post': postNum, 'url': postURL }];
								}

								votes.recent[playerName] = { 'vote': 'Unvote', 'post': postNum, 'url': postURL };
							}
						}
					}

					if (isHammer) {
						return false;
					}
				});
			}

			if (post && !recounting) {
				jQuery(notice).text('Posting...');
				jQuery(notice).fadeIn('fast');
			}

			if (jQuery(loadTo).find('.next').get(0) != null && !isHammer) {
				game.page++;

				games[thread] = game;
				localStorage.setItem('Mafia Votal Generator', JSON.stringify(games));

				getVotes(loadTo, thread, post, endPhase);
			} else {
				now = new Date();
				if (game.settings.post_at_intervals && !post) {
					lastTime = new Date(game.last.time);
					lastPost = game.last.post;
					phaseEnd = new Date(game.phase.end);
					var passed = new Date(now - lastTime).getTime() / 3600 / 1000;

					if (passed >= game.settings.posting_interval_time) {
						post = true;
					} else if (game.post - lastPost >= game.settings.posting_interval_posts) {
						post = true;
					}
				}
				if (debug_mode) {
					jQuery.each(votes.votals, function(prop) {
						if (this.tally) {
							console.log(prop, this);
						}
					});
				}
				if (recounting) {
					post = false;
					jQuery(notice).removeClass('recount');
					jQuery(notice).fadeOut('fast');
					recounting = false;
				}
				if (post) {
					Votal(game, game.settings.order_method, endPhase, isHammer);
					if (!debug_mode) {
						jQuery('#submit_post', postFrame.contentWindow.document).click();
					}
					jQuery(notice).fadeOut('fast');
					document.getElementById('VoteCounter_countdown').textContent = '0h0m';
					document.getElementById('VoteCounter_postcount').textContent = '0';
				} else {
					document.getElementById('VoteCounter_postcount').textContent = game.post - game.last.post;
				}
				games[thread] = game;
				localStorage.setItem('Mafia Votal Generator', JSON.stringify(games));
			}
		});
	}

	//Styling

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
		'.VoteCounterControls {\n' +
			'padding: 10px;\n' +
			'border-top: 1px solid;\n' +
			'transition: all .2s ease-in-out;\n' +
		'}\n\n' +

		'.VoteCounterControls.running {\n' +
			'position: relative;\n' +
			'z-index: 999998;\n' +
			'border-radius: 3px;\n' +
		'}\n\n' +

		'#VoteCounter_Background {\n' +
			'position: absolute;\n' +
			'top: 0px;\n' +
			'left: 0px;\n' +
			'width: 100%;\n' +
			'height: 100%;\n' +
			'background-color: rgba(0, 0, 0, 0.298039);\n' +
			'display: none;\n' +
		'}\n\n' +

		'.VoteCounterControls input, .VoteCounterControls select, .VoteCounterControls .timerDisplay, .VoteCounterControls .tabControls {\n' +
			'vertical-align: middle;\n' +
		'}\n\n' +

		'.VoteCounterControls .mainControls, .VoteCounterControls .mainControls * {\n' +
			'line-height: 42px;\n' +
			'text-shadow: 0px 1px #fefefe;\n' +
		'}\n\n' +

		'.VoteCounterControls .timerButton {\n' +
			'font-size: 20px;\n' +
			'background-color: #fefefe;\n' +
			'display: inline-block;\n' +
			'padding: 10px;\n' +
			'height: 20px;\n' +
			'width: 20px;\n' +
			'text-align: center;\n' +
			'border-radius: 100px;\n' +
			'border: 1px solid #ddd;\n' +
			'vertical-align: middle;\n' +
			'cursor: pointer;\n' +
		'}\n\n' +

		'.VoteCounterControls .timerSymbol.play {\n' +
			'width: 20px;\n' +
			'height: 20px;\n' +
			'background-image: url(http://i.imgur.com/jf8sKVQ.png);\n' +
			'background-position: 50%;\n' +
			'background-repeat: no-repeat;\n' +
			'vertical-align: middle;\n' +
			'margin-left: 1px;\n' +
		'}\n\n' +

		'.VoteCounterControls .timerSymbol.stop {\n' +
			'width: 20px;\n' +
			'height: 20px;\n' +
			'background-image: url(http://i.imgur.com/lrQi4yr.png);\n' +
			'background-position: 50%;\n' +
			'background-repeat: no-repeat;\n' +
			'vertical-align: middle;\n' +
		'}\n\n' +

		'.VoteCounterControls .timerButton:hover {\n' +
			'background-color: #fafafa;\n' +
			'box-shadow: 0px 0px 3px #8f8;\n' +
			'border: 1px solid #ccc;\n' +
		'}\n\n' +

		'.VoteCounterControls.running .timerButton {\n' +
			'border: 1px solid #ad0 ! important;\n' +
			'box-shadow: 0px 0px 5px #aaa ! important;\n' +
			'background-color: #efa ! important;\n' +
		'}\n\n' +

		'.VoteCounterControls .timerDisplay {\n' +
			'padding: 0 10px;\n' +
			'font-size: 30px;\n' +
		'}\n\n' +

		'.VoteCounterControls .timerDisplay .subtext {\n' +
			'font-size: 12px;\n' +
			'text-transform: uppercase;\n' +
			'letter-spacing: 1px;\n' +
			'margin-left: 1em;\n' +
			'vertical-align: middle;\n' +
		'}\n\n' +

		'.VoteCounterControls .tabControls {\n' +
			'font-weight: bolder;\n' +
		'}\n\n' +

		'.VoteCounterControls .tabControl {\n' +
			'margin: 0 5px;\n' +
		'}\n\n' +

		'.VoteCounterControls .active {\n' +
			'border-bottom: 1px dotted;\n' +
		'}\n\n' +

		'.VoteCounterControls .tab {\n' +
			'background-color: #fefefe;\n' +
			'box-shadow: 0px 0px 3px #aaa;\n' +
			'border-radius: 2px;\n' +
			'padding: 15px;\n' +
			'margin-top: 10px;\n' +
			'display: none;\n' +
		'}\n\n' +

		'.VoteCounterControls .tab .setting:not(:first-of-type) {\n' +
			'border-top: 1px solid #aaa;\n' +
			'padding-top: 15px;\n' +
			'margin-top: 15px;\n' +
		'}\n\n' +

		'.VoteCounterControls .tab .text {\n' +
			'padding: 5px;\n' +
			'width: 20em;\n' +
			'margin: 0 .5em;\n' +
			'border-radius: 2px;\n' +
			'border: 1px solid #ddd;\n' +
			'background-color: #fff;\n' +
			'color: #555;\n' +
		'}\n\n' +

		'.VoteCounterControls .tab input[type=checkbox] {\n' +
			'margin: 0 .5em;\n' +
			'cursor: pointer;\n' +
		'}\n\n' +

		// start switchButton

		'.VoteCounterControls .tab .checkbox_container {\n' +
			'display: inline-block;\n' +
			'vertical-align: middle;\n' +
			'width: auto ! important;\n' +
		'}\n\n' +

		'.switch-button-label {\n' +
			'float: left;\n' +

			'font-size: 10pt;\n' +
			'cursor: pointer;\n' +
		'}\n\n' +

		'.switch-button-label.off {\n' +
			'color: #adadad;\n' +
		'}\n\n' +

		'.switch-button-label.on {\n' +
			'color: #0088CC;\n' +
		'}\n\n' +

		'.switch-button-background {\n' +
			'float: left;\n' +
			'position: relative;\n' +

			'background: #ccc;\n' +
			'border: 1px solid #aaa;\n' +

			'margin: 1px 10px;\n' +

			'-webkit-border-radius: 4px;\n' +
			'-moz-border-radius: 4px;\n' +
			'border-radius: 4px;\n' +

			'cursor: pointer;\n' +
		'}\n\n' +

		'.switch-button-button {\n' +
			'position: absolute;\n' +

			'left: -1px;\n' +
			'top : -1px;\n' +

			'background: #FAFAFA;\n' +
			'border: 1px solid #aaa;\n' +

			'-webkit-border-radius: 4px;\n' +
			'-moz-border-radius: 4px;\n' +
			'border-radius: 4px;\n' +
		'}\n\n' +

		// end switchButton

		'.VoteCounterControls .tab input.disabled {\n' +
			'-webkit-filter: grayscale(1);\n' +
			'-moz-filter: grayscale(1);\n' +
			'filter: grascale(1);\n' +
		'}\n\n' +

		'.VoteCounterControls .removeField, .VoteCounterControls .addField {\n' +
			'font-weight: bolder;\n' +
		'}\n\n' +

		'.VoteCounterControls .playerField.dead {\n' +
			'opacity: .3;\n' +
			'color: #f00;\n' +
		'}\n\n' +

		'.VoteCounterControls .playerField.dead .text {\n' +
			'color: #f00;\n' +
		'}\n\n' +

		'.VoteCounterNotice {\n' +
			'position: fixed;\n' +
			'width: 70%;\n' +
			'height: 100px;\n' +
			'left: 15%;\n' +
			'top: 50%;\n' +
			'margin-top: -50px;\n' +
			'background-color: #222;\n' +
			'border-radius: 15px;\n' +
			'box-shadow: 0px 0px 10px #000;\n' +
			'opacity: .9;\n' +
			'font-size: 42px;\n' +
			'font-weight: bolder;\n' +
			'text-align: center;\n' +
			'line-height: 100px;\n' +
			'color: #fff;\n' +
			'text-shadow: 0px 3px #000;\n' +
			'z-index: 999999;\n' +
			'display: none;\n' +
		'}\n\n' +

		'.VoteCounterControls h3 {\n' +
			'font-weight: bolder;\n' +
			'margin-bottom: 10px;\n' +
			'background-color: transparent;\n' +
		'}\n\n' +

		'.VoteCounterControls .import .file {\n' +
			'margin: 10px .5em 10px 0;\n' +
		'}\n\n' +

		'.VoteCounterControls .import textarea.text {\n' +
			'box-sizing: border-box;\n' +
			'width: 100%;\n' +
			'margin: 0px;\n' +
			'display: block;\n' +
		'}\n\n' +

		'.VoteCounterControls .debugContainer {\n' +
			'background-color: #ef0 ! important;\n' +
			'padding: 5px 10px ! important;\n' +
			'width: auto ! important;\n' +
			'display: inline-block ! important;\n' +
			'margin: 0 ! important;\n' +
			'font-weight: bolder ! important;\n' +
		'}\n\n' +

		'.VoteCounterControls .help {\n' +
			'display: inline;\n' +
			'font-weight: bolder;\n' +
			'padding: 0 5px;\n' +
			'background-color: #eee;\n' +
			'box-sizing: border-box;\n' +
			'cursor: help;\n' +
			'text-align: right;\n' +
			'position: absolute;\n' +
			'z-index: 99;\n' +
			'right: 25px;\n' +
			'margin-left: 25px;\n' +
			'border-radius: 1px;\n' +
			'transition: all .3s ease-in-out;\n' +
		'}\n\n' +

		'.VoteCounterControls .help:hover {\n' +
			'box-shadow: 0px 1px 3px #888;\n' +
			'opacity: .9;\n' +
			'z-index: 100;\n' +
		'}\n\n' +

		'.VoteCounterControls .help .tip {\n' +
			'display: none;\n' +
			'padding: 5px;\n' +
			'box-sizing: border-box;\n' +
			'background-color: #f8f8f8;\n' +
			'margin-bottom: 5px;\n' +
			'line-height: 1.5em;\n' +
			'text-align: justify;\n' +
		'}';

	jQuery('.topic_buttons:first').append(createElement('li', function(btn) {
		btn.appendChild(createElement('a', function(link) {
			link.href = 'javascript:void(0)';
			link.title = 'Open the Mafia Votal Generator interface';
			link.appendChild(document.createTextNode('Mafia Votal Generator'));

			link.onclick = function() {
				if (!jQuery('.VoteCounterControls').length) {
					jQuery('.post_block:first .row2').after(controls(game));
					addSwitches();
					addTips();
					jQuery('html, body').animate({
						scrollTop: jQuery('.VoteCounterControls:first').offset().top
					}, 300);

					if (!games.hasOwnProperty(thread)) {
						jQuery('#PlayerControl').click();
					}

					var lastVotalTimer = setInterval(function() {
						var games = (localStorage.getItem('Mafia Votal Generator')) ? JSON.parse(localStorage.getItem('Mafia Votal Generator')) : {},
						game = (games.hasOwnProperty(thread)) ? games[thread] : defaults,
						now = new Date(),
						countdown = (game.last.time) ? new Date(now - new Date(game.last.time)) : new Date(now - now),
						since = readableCountdown(countdown);

						document.getElementById('VoteCounter_countdown').textContent = since.hours + 'h' + since.minutes + 'm';
					}, 60000);
				} else {
					jQuery('.VoteCounterControls').slideToggle('fast', function() {
						if (jQuery('.VoteCounterControls:first').is(':visible')) {
							jQuery('html, body').animate({
								scrollTop: jQuery('.VoteCounterControls:first').offset().top
							}, 300);
						}
					});
				}
			};
		}));
	}));
}

if (location.href.indexOf('showtopic=') > -1) {
	runInJQuery(
		VoteCounter.toString() +
		'VoteCounter();'
	);
}