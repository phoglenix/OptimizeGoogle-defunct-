// settings
var _DEBUG = false;
var AUTO_SET_PREFS = true;

if(_DEBUG) dump("in prefutils\n");

var cgprefs =
{

	saveHandler: function() {
		// web
		var websave = document.getElementById("web-save");
		if (websave) {
			var savehandler = document.getElementById("web-save-handler");
			if (websave && savehandler) {
				if (websave.checked) {
					savehandler.disabled = false;
				} else {
					savehandler.disabled = true;
				}
			}
		}

		// cookies
		var cookies = document.getElementById("cookies-enable");
		if (cookies) {
			var cinterface = document.getElementById("cookies-interface");
			var interfacelanguage = document.getElementById("cookies-interface-language");
			var search = document.getElementById("cookies-search");
			var searchselection = document.getElementById("cookies-search-selection");
			var searchlanguage = document.getElementById("cookies-search-language");
			var safe = document.getElementById("cookies-safe");
			var safesearch = document.getElementById("cookies-safesearch");
			var results = document.getElementById("cookies-results-per-page");
			var resultsnumber = document.getElementById("cookies-results-per-page-number");
			var cwindow = document.getElementById("cookies-window");
			var newwindow = document.getElementById("cookies-open-new-window");
			var suggest = document.getElementById("cookies-suggest");
			var enablesuggest = document.getElementById("cookies-enable-suggest");

			if (cookies.checked) {
				cinterface.disabled = false;
				if (cinterface.checked) {
					interfacelanguage.disabled = false;
				} else {
					interfacelanguage.disabled = true;
				}
				search.disabled = false;
				if (search.checked) {
					searchselection.disabled = false;
					searchlanguage.disabled = false;
				} else {
					searchselection.disabled = true;
					searchlanguage.disabled = true;
				}
				safe.disabled = false;
				if (safe.checked) {
					safesearch.disabled = false;
				} else {
					safesearch.disabled = true;
				}
				results.disabled = false;
				if (results.checked) {
					resultsnumber.disabled = false;
				} else {
					resultsnumber.disabled = true;
				}
				cwindow.disabled = false;
				if (cwindow.checked) {
					newwindow.disabled = false;
				} else {
					newwindow.disabled = true;
				}

				suggest.disabled = false;
				if (suggest.checked) {
					enablesuggest.disabled = false;
				} else {
					enablesuggest.disabled = true;
				}

			} else {
				cinterface.disabled = true;
				interfacelanguage.disabled = true;
				search.disabled = true;
				searchselection.disabled = true;
				searchlanguage.disabled = true;
				safe.disabled = true;
				safesearch.disabled = true;
				results.disabled = true;
				resultsnumber.disabled = true;
				cwindow.disabled = true;
				newwindow.disabled = true;
				suggest.disabled = true;
				enablesuggest.disabled = true;
			}
		}
	},


  findIndex: function(groupedItem, value){
  	if (groupedItem.childNodes) {
	    for (var i=0; i<groupedItem.childNodes.length; i++){
    	    if (groupedItem.childNodes[i].value && groupedItem.childNodes[i].value==value){
        	    return i;
	        }
    	}
	}

	if (groupedItem.firstChild && groupedItem.firstChild.childNodes) {
	    for (var i=0; i<groupedItem.firstChild.childNodes.length; i++){
    	    if (groupedItem.firstChild.childNodes[i].value && groupedItem.firstChild.childNodes[i].value==value){
        	    return i;
	        }
		}
    }

    return 0; // default: return index 0 if value was not found
  },

  _onLoad: function(aDialogId, doResetValues)
  {
    var aWindow = document.getElementById(aDialogId);
    if(_DEBUG) dump("in onLoad\n");
    if(!aWindow) {
      if(_DEBUG) dump("No dialog id supplied?\n");
      return;
    }

    var prefElements = aWindow.getElementsByAttribute("prefstring", "*");
    if(!prefElements) {
      if(_DEBUG) dump("prefElements empty\n");
      return;
    }
    for(var i=0; i<prefElements.length; i++) {
      var prefstring = prefElements[i].getAttribute("prefstring");
      var prefid = prefElements[i].getAttribute("id");
      var preftype = prefElements[i].getAttribute("preftype");
      var elt = prefElements[i].localName;
      var prefdefval = prefElements[i].getAttribute("prefdefval");
      if(!prefdefval)
        prefdefval = "";

      if (!preftype) {
        if (elt == "textbox")
          preftype = "string";
        else if (elt == "checkbox" || elt == "button")
          preftype = "bool";
        else if (elt == "radiogroup" || elt == "menulist" || elt == "listbox")
          preftype = "string";
      }

      var prefvalue = cgprefs.getPref(preftype, prefstring, prefdefval);

      if (doResetValues){
        prefvalue="!/!ERROR_UNDEFINED_PREF!/!";
      } else {
      }

      if(_DEBUG) dump("pref collected: "+ prefvalue+"\n");
      if(_DEBUG) dump("elementtype: "+ elt+"\n\n");

      if(prefvalue == "!/!ERROR_UNDEFINED_PREF!/!") {
        prefvalue = prefdefval;
        if(AUTO_SET_PREFS)
          cgprefs.setPref(preftype, prefstring, prefvalue);
      }
      switch(elt) {
        case "textbox":
          prefElements[i].value = prefvalue;
          break;
        case "checkbox":
          prefElements[i].checked = prefvalue;
          break;
        case "button":
          prefElements[i].checked = prefvalue;
          break;
        case "radiogroup":
          prefElements[i].selectedIndex = cgprefs.findIndex(prefElements[i], prefvalue);
          break;
        case "menulist":
          prefElements[i].selectedIndex = cgprefs.findIndex(prefElements[i], prefvalue);
          break;
        case "listbox":
          var items = prefvalue.split('|');
		  for (var j=0; j<items.length; j++) {
	        prefElements[i].addItemToSelection(prefElements[i].getItemAtIndex(cgprefs.findIndex(prefElements[i], items[j])));
		  }
          break;
		default:
		  break;
      }
    }

	this.saveHandler();

    if(_DEBUG) dump("init finished\n");

  },// end init

  onLoad: function(aDialogId)
  {
    return this._onLoad(aDialogId, false);
  },

  onReset: function(aDialogId){
    return this._onLoad(aDialogId, true);
  },

  onOK: function(aDialogId)
  {
    var aWindow = document.getElementById(aDialogId);
    var prefElements = aWindow.getElementsByAttribute("prefstring", "*");

    for(var i=0; i<prefElements.length; i++) {
      var prefstring = prefElements[i].getAttribute("prefstring");
      var preftype = prefElements[i].getAttribute("preftype");

      var elt = prefElements[i].localName;
      if (!preftype) {
        if (elt == "textbox")
          preftype = "string";
        else if (elt == "checkbox" || elt == "button")
          preftype = "bool";
        else if (elt == "radiogroup" || elt == "menulist" || elt == "listbox")
          preftype = "string";
      }
      var prefvalue;
      if (elt == "checkbox")
        prefvalue = prefElements[i].checked;
      else if (elt == "button")
        prefvalue = prefElements[i].checked;
      else if (elt == "radiogroup" || elt == "menulist")
        prefvalue = prefElements[i].value;
      else if (elt == "textbox")
        prefvalue = prefElements[i].value;
      else if (elt == "listbox") {
	  	var items = prefElements[i].selectedItems;
		prefvalue = '';
		for (var j=0; j<items.length; j++) {
	        prefvalue += items[j].value + '|';
		}
		if (prefvalue.length > 0) {
			prefvalue = prefvalue.substring(0, prefvalue.length-1);
		}
      }

      cgprefs.setPref(preftype, prefstring, prefvalue);
      if(_DEBUG) dump("setpref:" +prefstring+" "+ prefvalue + "\n");
    }
    return true;
  },// end onOk


  getPref: function(aPrefType, aPrefString, aDefaultFlag)
  {
    if(_DEBUG) dump("in getpref\n");
    var pref = Components.classes["@mozilla.org/preferences-service;1"]
        .getService(Components.interfaces.nsIPrefBranch);
    try {
      switch(aPrefType) {
        case "bool":
          return pref.getBoolPref(aPrefString);
        case "int":
          return pref.getIntPref(aPrefString);
        case "localizedstring":
          return pref.getLocalizedUnicharPref(aPrefString); // not working?
        case "color":
        case "string":
        default:
          return pref.getCharPref(aPrefString);
      }
    }catch(e) {
		return aDefaultFlag=="false"?false:aDefaultFlag;
    }
  },

  setPref: function(aPrefType, aPrefString, aValue)
  {
    var pref = Components.classes["@mozilla.org/preferences-service;1"]
        .getService(Components.interfaces.nsIPrefBranch);
    try {
      switch (aPrefType) {
        case "bool":
          pref.setBoolPref(aPrefString, aValue);
          break;
        case "int":
          pref.setIntPref(aPrefString, aValue);
          break;
        case "color":
        case "string":
        case "localizedstring":
        default:
          pref.setCharPref(aPrefString, cgprefs.trim(aValue));
          break;
      }
    }catch(e){
      if(_DEBUG) dump(e + "\n");
    }
  },

  trim: function(s) {
    while ((s.substring(0,1) == ' ') || (s.substring(0,1) == '\n') || (s.substring(0,1) == '\r')) {
	s = s.substring(1,s.length);
	}

	while ((s.substring(s.length-1,s.length) == ' ') || (s.substring(s.length-1,s.length) == '\n') || (s.substring(s.length-1,s.length) == '\r')) {
	s = s.substring(0,s.length-1);
	}
	return s;
   },

   importList: function() {
	var fp = Components.classes["@mozilla.org/filepicker;1"].createInstance(Components.interfaces.nsIFilePicker);
	var stream = Components.classes["@mozilla.org/network/file-input-stream;1"].createInstance(Components.interfaces.nsIFileInputStream);
	var streamIO = Components.classes["@mozilla.org/scriptableinputstream;1"].createInstance(Components.interfaces.nsIScriptableInputStream);
	var overwriteCurrentList = false;
	var validFile = false;

	var dialog_texts = parent.document.getElementById("dialog_texts");
	fp.init(window, dialog_texts.getString("selectfile"), fp.modeOpen);
	fp.appendFilters(fp.filterText);

	if (fp.show() != fp.returnCancel) {
		stream.init(fp.file, 0x01, 0444, null);
		streamIO.init(stream);
		var input = streamIO.read(stream.available());
		streamIO.close();
		stream.close();

		var inputArray = input.split(/\s/);
		if (inputArray.length > 0 && inputArray[0].match(/^\[OptimizeGoogle\]$/i)) {
			inputArray.shift();
			overwriteCurrentList = confirm("Do you want to overwrite the current list?\n..if not, pressing 'cancel' will append.");
			var where = "extensions.optimizegoogle.misc.filterlist";
			var newpref = "";
			if (!overwriteCurrentList) {
				newpref = cgprefs.getPref("string", where, "");
			}
			for (var i=0;i<inputArray.length;i++) {
				cgprefs.trim(inputArray[i]);
				if (inputArray[i].length > 0) {
				    if (newpref.length > 0) {
						newpref += "\n";
					}
					newpref += inputArray[i];
					cgprefs.setPref("string", where, newpref);
				}
			}
			var listarea = document.getElementById("misc-filterlist")
			listarea.value = newpref;
		} else {
			alert("File not valid.");
	    }
	}
   },

   exportList: function() {
	var fp = Components.classes["@mozilla.org/filepicker;1"].createInstance(Components.interfaces.nsIFilePicker);
	var stream = Components.classes["@mozilla.org/network/file-output-stream;1"].createInstance(Components.interfaces.nsIFileOutputStream);

	var dialog_texts = parent.document.getElementById("dialog_texts");
	fp.init(window, dialog_texts.getString("selectfile"), fp.modeSave);
	fp.appendFilters(fp.filterText);

	if (fp.show() != fp.returnCancel) {
		if (fp.file.exists())
			fp.file.remove(true);

		fp.file.create(fp.file.NORMAL_FILE_TYPE, 0666);

		stream.init(fp.file, 0x02, 0x200, null);
		stream.write("[OptimizeGoogle]\n", 18);

		var where = "extensions.optimizegoogle.misc.filterlist";
		var oldpref = cgprefs.getPref("string", where, "");
		stream.write(oldpref, oldpref.length);
		stream.close();
	}
   },

   _changePage: function(pageList) {
    	document.getElementById("cgoptions-iframe").setAttribute("src", pageList.selectedItem.value);
   },

   onOKcurrent: function(aDialogId) {
      var iFrame = document.getElementById("cgoptions-iframe");
      var pageDocument = iFrame.contentDocument;
	  var iElement = pageDocument.getAttribute("id");
	  alert(iElement.value);
	  alert(iElement.nodeValue);
	  alert(iElement.nodeName);

      //this.onOK(aDialogId);
   }

};
