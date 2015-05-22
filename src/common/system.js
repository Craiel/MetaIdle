//This will implement isArray if its not there, older browsers don't have it
if (typeof Array.isArray === 'undefined') {
    Array.isArray = function(obj) {
        return Object.toString.call(obj) === '[object Array]';
    };
};

// Implement format for string
String.prototype.format = function() {
	var formatted = this;
	for (var i = 0; i < arguments.length; i++) {
		var key = '{' + i.toString() + '}';
		if(formatted.indexOf(key) < 0) {
			throw new Error(StrLoc("Index {0} was not defined in string: {1}").format(i, formatted));
		}
		
    	formatted = formatted.replace(key, arguments[i]);
	}
	
	return formatted;
};

// http://stackoverflow.com/questions/7616461/generate-a-hash-from-string-in-javascript-jquery
// Won't work on older browsers because of Array.reduce();
String.prototype.getHashCode = function() {
    return this.split("").reduce(function(a,b){a=((a<<5)-a)+b.charCodeAt(0);return a&a},0);
};

Number.prototype.clamp = function(min, max) {
    return Math.min(Math.max(this, min), max);
};

$.fn.textWidth = function(text, font) {
    if (!$.fn.textWidth.fakeEl) $.fn.textWidth.fakeEl = $('<span>').appendTo(document.body);
    var htmlText = text || this.val() || this.text();
    htmlText = $.fn.textWidth.fakeEl.text(htmlText).html(); //encode to Html
    htmlText = htmlText.replace(/\s/g, "&nbsp;"); //replace trailing and leading spaces
    $.fn.textWidth.fakeEl.html(htmlText).css('font', font || this.css('font'));
    return $.fn.textWidth.fakeEl.width();
};