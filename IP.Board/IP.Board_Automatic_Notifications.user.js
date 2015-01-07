// ==UserScript==
// @name	IP.Board - Automatic Notifications
// @namespace	Makaze
// @description	Automatically loads new Forum and Messages notifications without refreshing the page.
// @include	*
// @grant	none
// @version	1.0.0
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

function autoNotify() {
	var doc = new DocumentFragment().appendChild(document.createElement('div')),
	loc = window.location.href,
	noteElem = jQuery('#notify_link > .ipsHasNotifications'),
	msgElem = jQuery('#inbox_link > .ipsHasNotifications'),
	timer;

	if (!noteElem.length) {
		jQuery('#notify_link').prepend(createElement('span', function(num) {
			num.className = 'ipsHasNotifications';
			num.style.display = 'none';
		}));

		noteElem = jQuery('#notify_link > .ipsHasNotifications');
	}

	if (!msgElem.length) {
		jQuery('#inbox_link').prepend(createElement('span', function(num) {
			num.className = 'ipsHasNotifications';
			num.style.display = 'none';
		}));

		msgElem = jQuery('#inbox_link > .ipsHasNotifications');
	}

	timer = setInterval(function() {
		var notes = parseInt(
			(jQuery(noteElem).not('.ipsHasNotifications_blank')) ? jQuery(noteElem).not('.ipsHasNotifications_blank').text().trim() : 0
		),
		msgs = parseInt(
			(jQuery(msgElem).not('.ipsHasNotifications_blank')) ? jQuery(msgElem).not('.ipsHasNotifications_blank').text().trim() : 0
		);

		jQuery(doc).load(loc +  ' #user_navigation', function() {
			var newNotes = parseInt(
				(jQuery(this).find('#notify_link > .ipsHasNotifications').not('.ipsHasNotifications_blank')) ? jQuery(this).find('#notify_link > .ipsHasNotifications').not('.ipsHasNotifications_blank').text().trim() : 0
			),
			newMsgs = parseInt(
				(jQuery(this).find('#inbox_link > .ipsHasNotifications').not('.ipsHasNotifications_blank')) ? jQuery(this).find('#inbox_link > .ipsHasNotifications').not('.ipsHasNotifications_blank').text().trim() : 0
			);

			if (newNotes) {
				jQuery(noteElem).text(newNotes);

				if (jQuery(noteElem).hasClass('ipsHasNotifications_blank') || !jQuery(noteElem).is(':visible')) {
					jQuery(noteElem).fadeIn('medium');
					jQuery(noteElem).removeClass('ipsHasNotifications_blank');
				} else if (newNotes !== notes) {
					jQuery(noteElem).fadeOut(10).fadeIn('medium');
				}
			} else {
				jQuery(noteElem).fadeOut('medium');
			}

			if (newMsgs) {
				jQuery(msgElem).text(newMsgs);

				if (jQuery(msgElem).hasClass('ipsHasNotifications_blank') || !jQuery(msgElem).is(':visible')) {
					jQuery(msgElem).fadeIn('medium');
					jQuery(msgElem).removeClass('ipsHasNotifications_blank');
				} else if (newMsgs !== msgs) {
					jQuery(msgElem).fadeOut(10).fadeIn('medium');
				}
			} else {
				jQuery(msgElem).fadeOut('medium');
			}
		});
	}, 5000);

	jQuery('#notify_link, #inbox_link').on('click', function() {
		var clicked = jQuery(this).data('clicked');

		if (clicked) {
			jQuery(this).find('.ipsHasNotifications').fadeOut('medium');
		} else {
			jQuery(this).data('clicked', true);
		}
	});
}

if (document.getElementsByTagName('body')[0].id === 'ipboard_body') {
	if (document.getElementById('notify_link') != null) {
		runInJQuery(
			createElement.toString() +
			autoNotify.toString() +
			'autoNotify();'
		);
	}
}