function doOK(item) {
	var textbox = document.getElementById("tbox");
	addFilter(textbox.value, window.arguments[1]);
	return true;
}

// adds the filter to prefs
function addFilter(filter) {
	filter = cgprefs.trim(filter)
	if (filter != "") {
		var where = "extensions.optimizegoogle.misc.filterlist";
		var oldpref = cgprefs.getPref("string", where, "");
		cgprefs.setPref("string", where, oldpref + "\n" + filter);
	}
}

function doCancel() {  	
	return true;
}

function onLoad() {
	var textelement = document.getElementById("tbox");
	textelement.setAttribute("value", window.arguments[0]);
}
