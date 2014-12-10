// ==UserScript==
// @name           OMF Question Time Generation
// @namespace      Makaze
// @include        *://*onemangaforums.com/*
// @version        1.0.1
// ==/UserScript==

if (document.getElementById('add_poll') && typeof(document.getElementById('add_poll')) !== 'undefined') {
	document.getElementById('topic_title').parentNode.innerHTML = document.getElementById('topic_title').parentNode.innerHTML + '<a id="question_time" style="background-color: #F8F8F8; padding: 3px 5px; border-radius: 5px; border-top: 1px solid #FFF; border-bottom: 1px solid #EEE; box-shadow: 0px -1px 0px #CCC, -1px 0px 0px #CCC, 1px 0px 0px #CCC, 0px 1px 0px #CCC; cursor: pointer; font-weight: bolder; text-transform: uppercase; float: right;">Question Time</a>';
	document.getElementById('question_time').onclick = function() {
		document.getElementById('add_poll').click();
		questionTimePollGenerator();
	}
}

var questionTimePollGenerator = function() {
	if (!document.getElementById('question-time-list') || typeof(document.getElementById('question-time-list')) == 'undefined') {
		var request = document.createElement('div');
		request.id = "question-time-list";
		request.setAttribute('style', 'position: fixed; top: 50%; left: 50%; z-index: 99999999 ! important; width: 150px; height: 226px; min-width: 150px; min-height: 226px; margin-left: -75px; margin-top: -113px; box-shadow: 0px 0px 3px #111; border-radius: 3px;');
		request.innerHTML = '<div id="list-handle" style="text-align: center; background-color: #eee; height: 15px; border-top-left-radius: 3px; border-top-right-radius: 3px; padding: 3px; color: #666;text-transform: lowercase; letter-spacing: 2px;">Normal</div><textarea style="background-color: #FAFAFA; border: 0px; padding: 2px; width: 146px; height: 201px; min-width: 146px; min-height: 201px; border-bottom-left-radius: 3px; border-bottom-right-radius: 3px; font-size: 10px; outline: none;" placeholder="Enter a list of names. Press Shift + Enter to submit. Press Ctrl + Enter to close this box."></textarea>';
		document.getElementsByTagName('body')[0].appendChild(request);
	} else {
		document.getElementById('question-time-list').show();
	}

	document.getElementById('question-time-list').getElementsByTagName('textarea')[0].onkeypress = function(e) {
		if (e.keyCode == 13 && e.shiftKey) {
			e.preventDefault();
			
			document.getElementById('1').value = "Who should we question next?";
			document.getElementById('multi_1').checked = true;
			
			var list = [], cap;
			list = document.getElementById('question-time-list').getElementsByTagName('textarea')[0].value.split('\n');
			if (list.length > 20) {
				cap = 20;
			} else {
				cap = list.length;
			}
			for (i = 0; i < cap; i++) {
				if (i > 0 && !document.getElementById('poll_1_' + (i + 1))) {
					document.getElementById('add_choice_1').click();
				}
				document.getElementById('poll_1_' + (i + 1)).value = list[i];
			}
			if (list.length > 20) {
				for (i = 0; i < 20; i++) {
					list.push(list[i]);
				}
				list.splice(0, 20);
				document.getElementById('question-time-list').getElementsByTagName('textarea')[0].value = list.join('\n');
				document.getElementById('list-handle').innerHTML = 'Reordered';
			}
			document.getElementById('close_poll').onclick = function() {
				 document.getElementById('question-time-list').remove();
			}
		} else if (e.keyCode == 13 && e.ctrlKey) {
			document.getElementById('question-time-list').remove();
		}
	}
}
