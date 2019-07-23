"use strict";

(function (screenRatioByDesign) {
	var docEle = document.documentElement;
	function setHtmlFontSize() {
		var screenRatio = docEle.clientWidth / docEle.clientHeight;
		var fontSize = (screenRatio > screenRatioByDesign ? screenRatioByDesign / screenRatio : 1) * docEle.clientWidth / 10;

		docEle.style.fontSize = fontSize.toFixed(3) + "px";
	}
	setHtmlFontSize();
	window.addEventListener('resize', setHtmlFontSize);
})(16 / 9);