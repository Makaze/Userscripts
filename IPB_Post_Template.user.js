// ==UserScript==
// @name	IP.Board Post Template
// @namespace	Makaze
// @include	*
// @grant	none
// @version	1.1
// ==/UserScript==

var auto = false,

/*
opts = (localStorage.getItem('MakazeScriptOptions')) ? JSON.parse(localStorage.getItem('MakazeScriptOptions')) : {},
templateStart = (opts.hasOwnProperty('ipb_post_template_start')) ? opts.ipb_post_template_start :
'[color=#fff].[/color][font=Consolas, \'Ubuntu Mono\', helvetica, arial, sans-serif][background=#f3f3f3] ',
templateEnd = (opts.hasOwnProperty('ipb_post_template_end')) ? opts.ipb_post_template_end :
' [/background][/font][color=#fff].[/color]';
*/

templateStart = '[color=#fff].[/color][font=Consolas, \'Ubuntu Mono\', helvetica, arial, sans-serif][background=#f3f3f3] ',
templateEnd = ' [/background][/font][color=#fff].[/color]';


function selectRange(elem, start, end) {
	if (elem.setSelectionRange) {
		elem.focus();
		elem.setSelectionRange(start, end);
	} else if (elem.createTextRange) {
		var range = elem.createTextRange();
		range.collapse(true);
		range.moveEnd('character', end);
		range.moveStart('character', start);
		range.select();
	}
}

function wrapText(elementSelector, openTag, closeTag) {
	var textArea = elementSelector;
	len = textArea.value.length,
	start = textArea.selectionStart,
	end = textArea.selectionEnd,
	selectedText = textArea.value.substring(start, end),
	replacement = openTag + selectedText + closeTag,
	paste = document.createEvent('TextEvent');
	if (paste.initTextEvent) {
		paste.initTextEvent('textInput', true, true, null, replacement);
		textArea.dispatchEvent(paste);
	} else {
		textArea.value = textArea.value.substring(0, start) + replacement + textArea.value.substring(end, len);
	}
	selectRange(textArea, start + openTag.length, end + openTag.length);
}

function cursor(elem, position) {
	selectRange(elem, position, position);
}

if (document.body.id === 'ipboard_body') {
	/*
	if (!opts.hasOwnProperty('ipb_post_template_start')) {
		opts.ipb_post_template_start = templateStart;
		opts.ipb_post_template_end = templateEnd;
		localStorage.setItem('MakazeScriptOptions', JSON.stringify(opts));
	}
	*/

	document.addEventListener('keydown', function(event) {
		var hasContent = false;

		var focusedElem = document.activeElement;

		if (focusedElem == null) {
			return false;
		}

		if (focusedElem.tagName !== 'TEXTAREA') {
			return false;
		}

		if (!focusedElem.hasAttribute('aria-label') || !focusedElem.getAttribute('aria-label').match(/Rich text editor/gi)) {
			return false;
		}

		if (event.shiftKey && event.altKey) {
			if (event.keyCode === 84) {
				hasContent = (focusedElem.value.length);

				if (hasContent) {
					focusedElem.value += '\n\n';
				}

				focusedElem.value += templateStart + templateEnd;
				cursor(focusedElem, focusedElem.value.length - templateEnd.length);
			}

			if (event.keyCode === 87) {
				wrapText(focusedElem, templateStart, templateEnd);
			}
		}
	}, false);

	if (auto) {
		document.addEventListener('click', function(event) {
			var elem = event.target,
			tag = elem.tagName,
			hasContent = false;

			if (tag !== 'TEXTAREA') {
				return false;
			}

			if (!elem.hasAttribute('aria-label') || !elem.getAttribute('aria-label').match(/Rich text editor/gi)) {
				return false;
			}

			if (elem.hasAttribute('post-template')) {
				return false;
			}

			elem.setAttribute('post-template', '');

			hasContent = (event.target.value.length);

			if (hasContent) {
				event.target.value += '\n\n';
			}

			event.target.value += templateStart + templateEnd;
			cursor(event.target, event.target.value.length - templateEnd.length);
		});
	}
}