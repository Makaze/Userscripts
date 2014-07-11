// ==UserScript==
// @name	Freeze All GIFs
// @namespace	Makaze
// @description	Freezes all animated GIFs on a page.
// @include	*
// @grant	none
// @version	1.0
// ==/UserScript==

function createElement(type, callback) {
	var element = document.createElement(type);

	callback(element);

	return element;
}

function freezeGif(img) {
	var width = img.width,
	height = img.height,
	canvas = createElement('canvas', function(clone) {
		clone.width = width;
		clone.height = height;
	}),
	attr,
	i = 0;

	var freeze = function() {
		canvas.getContext('2d').drawImage(img, 0, 0, width, height);

		for (i = 0; i < img.attributes.length; i++) {
			attr = img.attributes[i];

			if (attr.name !== '"') {
				canvas.setAttribute(attr.name, attr.value);
			}
		}

		canvas.style.position = 'absolute';
		
		img.parentNode.insertBefore(canvas, img);
		img.style.opacity = 0;
	};

	if (img.complete) {
		freeze();
	} else {
		img.addEventListener('load', freeze, true);
	}
}

function freezeAllGifs() {
	return new Array().slice.apply(document.images).map(freezeGif);
}

freezeAllGifs();