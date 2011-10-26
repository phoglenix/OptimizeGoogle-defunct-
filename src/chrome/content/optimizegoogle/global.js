function cg_getPref(aPrefType, aPrefString, aDefaultValue){
	var prefs = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranch);
    try {
      switch(aPrefType) {
        case "bool":
          return prefs.getBoolPref(aPrefString);
        case "int":
          return prefs.getIntPref(aPrefString);
        case "localizedstring":
        case "color":
        case "string":
        default:
          return prefs.getCharPref(aPrefString);
      }
    }catch(e) {
      return aDefaultValue;
    }
}

function cg_getMyPref(aPrefType, aPrefString, aDefaultValue)
{
	return cg_getPref(aPrefType, "extensions.optimizegoogle." + aPrefString, aDefaultValue);
}

function cg_disablePrefChoice(id, val)
{
    document.getElementById(id).disabled = val;
	if (val) {
		document.getElementById(id).removeAttribute('prefstring');
		document.getElementById(id).checked = true;
	}
}

function cg_useAnyDisablePref(id, prefEnd)
{
	cg_disablePrefChoice(id, cg_getMyPref("bool","all." + prefEnd, false));
}
