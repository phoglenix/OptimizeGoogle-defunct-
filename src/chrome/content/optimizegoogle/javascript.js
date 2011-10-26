var get_search_form = function() {
	var val = document.evaluate("//form[@action='/search']", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue ||
			  document.evaluate("//form[@action='http://www.google.com/search']", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue ||
			  document.evaluate("//form[@action='/custom']", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue ||
			  document.evaluate("//form[@action='/unclesam']", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue ||
			  document.evaluate("//form[@action='/linux']", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue ||
			  document.evaluate("//form[@action='/bsd']", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue ||
			  document.evaluate("//form[@action='/mac']", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue ||
			  document.evaluate("//form[@action='/microsoft']", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
	return val;
};

var get_random_id = function(size) {
	var chars = new Array('0','1','2','3','4','5','6','7','8','9','a','b','c','d','e','f');
	var id = '';
	for (var i=0;i<size;++i) {
		id += chars[Math.round(Math.random()*(chars.length-1))];
	}
	return id;
};
var selectAllNodes = function(doc, context, xpath) {
   var nodes = doc.evaluate(xpath, context, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
   var result = new Array( nodes.snapshotLength );
   for (var x=0; x<result.length; x++) {
	  result[x] = nodes.snapshotItem(x);
   }
   return result;
};

var createLinks = function() {
	//var googFonts = selectAllNodes(document, document.body, "//FONT[contains(@color,'#008000')]");
	//Changed on 16-08-2009. Thanks go to Chris000001 & bugblatter
	var googFonts = selectAllNodes(document, document.body, "//div[@id='ImgContent']/table/tbody/tr/td[starts-with(@id, 'tDataText')]/div/div/cite");
	var googLinks = selectAllNodes(document, document.body, "//A[contains(@href,'/imgres?imgurl=')][contains(@href,'&imgrefurl=')]");
	
	for (var x=0; x<googLinks.length; x++) {
		var target = googLinks[x].getAttribute("target");
		if (!target) {
			target = "";
		}
		
		
		var gmatch   = googLinks[x].href.match( /\/imgres\?imgurl\=(.*?)\&imgrefurl\=/ );
		//var urlmatch = googLinks[x].href.match(/\&imgrefurl\=(.*?)\&([a-z]+)=/);
		//Changed on 16-08-2009. Thanks go to bugblatter
		var urlmatch = googLinks[x].href.match(/\&imgrefurl\=(.*?)\&usg=/);
		if (googFonts[x].innerHTML.length==0) {
			googFonts[x].innerHTML = "...";
		}
		
		if (gmatch) {
			googFonts[x].innerHTML="<a href=\""+unescape(urlmatch[1])+"\" target=\""+target+"\">"+googFonts[x].innerHTML+"</a>";
			googLinks[x].setAttribute("class", "ext");
			
			// make compatible with piclens
			// googLinks[x].href = unescape(gmatch[1]);
			//googLinks[x].setAttribute('onclick', "document.location.href='" + unescape(gmatch[1]) + "';return false;")
			googLinks[x].setAttribute('onmouseup', "this.href='" + unescape(gmatch[1]) + "';return true;")
		}
	}
};

// start auto scroll
var startNr;
var itemsQuantity;
var storageContainer;
var query;
var requested;

var Remain = {
	valueOf : function() {
		var sc = window.scrollY; //document.body.scrollTop;
		var wh = window.innerHeight ? window.innerHeight : document.body.clientHeight;
		var total = (document.body.scrollHeight - wh);
		return total - sc;
	}
};

var watch_scroll = function() {
	var self = arguments.callee;
	if (Remain < 500) {
		do_request();
	}
	setTimeout(self,100);
};

var do_request = function() {
	if (requested == startNr) return;
	requested = startNr;
	
	var iframe = document.createElement("iframe");
	iframe.width = document.width;
	iframe.height = 1;
	iframe.style.margin = "0 0 0 -10000px";
	iframe.style.position = "absolute";
	iframe.style.top = 0;
	iframe.style.left = 0;
	document.body.appendChild(iframe);
	iframe.addEventListener("load", function() {
		var isNextExist = iframe.contentDocument.evaluate("//div[@id='nn']", iframe.contentDocument.body, null, 9, null).singleNodeValue
			|| iframe.contentDocument.evaluate("//span[@id='nn']", iframe.contentDocument.body, null, 9, null).singleNodeValue
			|| document.evaluate("//span[@class='csb ch']/parent::a", document, null, 9, null).singleNodeValue;;
		//var list = iframe.contentDocument.evaluate("//li[contains(@class,'g')]", iframe.contentDocument.body, null, 6, null);
		// Changed on 16-08-2009
		var list = iframe.contentDocument.evaluate("//li[@class='g' or @class='g w0']", iframe.contentDocument.body, null, 6, null);
		if (list.snapshotLength==0) {
			// if images
			list = iframe.contentDocument.evaluate("//div[@id='ImgContent']/table/tbody/tr", iframe.contentDocument.body, null, 6, null);
		}
		for (var i = 0; i < list.snapshotLength; i++) {
			var oldNode = list.snapshotItem(i);
			var newNode = document.importNode(oldNode,true);
			storageContainer.appendChild(newNode);
		}
		if (!!isNextExist) {
			startNr += itemsQuantity;
		} else {
			// add option to remove filter
			var removefilter = iframe.contentDocument.evaluate("//a[contains(@href,'filter=0')]/parent::i/parent::p", iframe.contentDocument.body, null, 9, null).singleNodeValue;
			if (removefilter) {
				storageContainer.appendChild(removefilter);
			}
			var n = storageContainer;
			do {
				while (n.nextSibling) {
					n = n.nextSibling;
					if (n.tagName != 'SCRIPT' && n.id != 'navbar' && n.id != 'nav' && n.style) n.style.display = 'block';
				}
				n = n.parentNode;
			} while (n);
		}
		iframe.src = "";
		document.body.removeChild(iframe);
	}, false);
	iframe.src = "http://"+location.host+location.pathname+query.replace(/start=\d*/,"start=" + startNr) + "#disable-userscript";
};
// end autoscroll

var OptimizeGoogle = {
	
	t: function(name) {
		try {
			return textarr[name];
		} catch (e) {
			return name;
		}
	},
	
	truncateURL: function(url, maxChars) {
		if (url.length <= maxChars) return url;
		var newurl = "";
		for (var i = 0; i <= url.length; i+= maxChars + 1) {
			newurl += url.substring(i, i+maxChars);
			if (i+maxChars <= url.length)
				newurl += "<wbr>";
		}
		return newurl;
	},
	
	addAutoPager: function() {
		window.onresize = function() { return true; }
		var next = document.evaluate("//div[@id='nn']/parent::a", document, null, 9, null).singleNodeValue
				|| document.evaluate("//span[@id='nn']/parent::a", document, null, 9, null).singleNodeValue
				|| document.evaluate("//span[@class='csb ch']/parent::a", document, null, 9, null).singleNodeValue;
		// web search || image search
		//storageContainer =   document.evaluate("//li[contains(@class,'g')]/parent::ol", document, null, 9, null).singleNodeValue
		//					|| document.evaluate("//div[@id='ImgContent']/table/tbody", document, null, 9, null).singleNodeValue;
		//Changed on 16-08-2009
		storageContainer = document.evaluate("//li[@class='g' or @class='g w0']/parent::ol", document, null, 9, null).singleNodeValue
						|| document.evaluate("//div[@id='ImgContent']/table/tbody", document, null, 9, null).singleNodeValue;
		
		// if next page and result
		if ( next && storageContainer ) {
			query = next.href.substr(next.href.indexOf("?"));
			startNr = (query.match(/start=(\d*)/))[1] - 0;
			var tmp = query.match(/num=(\d*)/);
			itemsQuantity = tmp ? (tmp[1] - 0) : 10;
			window.addEventListener("load", watch_scroll, false);
			var navbar = document.getElementById('navbar') || document.getElementById('nav');
			if (navbar) navbar.style.display = 'none';
		}
	},
	
	addGlobalStyle: function(css) {
		var style = document.createElement("style");
		style.type = "text/css";
		style.innerHTML = css;
		document.getElementsByTagName('head')[0].appendChild(style);
	},
	
	cacheContinue: function() {
		var curl = window.location.href;
		var res = selectAllNodes(document, document.body.childNodes[1], ".//a[@href]");
		if (!document.title.match(/^cache/)) {
			for (var x=0; x<res.length; x++) {
				if (res[x].protocol == 'http:' || res[x].protocol == 'https:') {
					res[x].href = curl.replace(/cache:.*?\+/,'cache:'+encodeURIComponent(res[x].href)+'+');
				}
			}
		} else {
			var match = curl.match(/cache:(.*?)\+/);
			if (match) {
				window.location.href = decodeURIComponent(match[1]);
			}
		}
	},
	
	removeInternalAds: function() {
		var toolbar = document.evaluate("//a[contains(@href,'http://tools.google.com/firefox')]/ancestor::table[@cellpadding='9'][@border='0']", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
		if (toolbar) {
			toolbar.parentNode.removeChild(toolbar);
		}
	},
	
	removeSponsoredLinksById: function(ids) {
		for(var i = 0; i < ids.length; i++) {
			var ad = document.getElementById(ids[i]);
			while (ad && ad.parentNode) {
				ad.parentNode.removeChild(ad);
				ad = document.getElementById(ids[i]);
			}
		}
	},
	
	removeSponsoredLinksByIdGmail: function(ids) {
		for(var i = 0; i < ids.length; i++) {
			var ad = document.getElementById(ids[i]);
			if (ad && ad.parentNode && (ad.parentNode.className == 'rh' || ad.parentNode.className == 'rhs')) {
				ad.parentNode.removeChild(ad);
			}
		}
	},
	removeSponsoredLinksGmail: function(ids) {
		this.addGlobalStyle('.slwyWc { display: none !important }');
	},
	
	removeSponsoredLinksFrame: function() {
		this.addGlobalStyle('iframe[name="google_ads_frame"] { display: none !important }');
	},
	
	isRegExp: function(filter) {
		return filter.match(/^\/.+\/[i]?$/);
	},

	convertToRegExp: function(pattern) {
		var s = new String(pattern);
		var res = new String("^");
		for (var i = 0 ; i < s.length ; i++) {
			switch(s[i]) {
				case '*' : 
					res += ".*";
					break;
				case '.' : 
				case '?' :
				case '^' : 
				case '$' : 
				case '+' :
				case '{' :
				case '[' : 
				case '|' :
				case '(' : 
				case ')' :
				case ']' :
					res += "\\" + s[i];
					break;
				case '\\' :
					res += "\\\\";
					break;
				case ' ' :
					// Remove spaces from URLs.
					break;
				default :
					res += s[i];
					break;
			}
		}
		return res + '$';
	},
	
	removeSponsoredLinksRight: function() {
		var ra = document.evaluate("//table[@align='right'][@width='25%'][@border='0']", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
		if (ra) {
			ra.parentNode.removeChild(ra);
		} else {
			// update 2008-03-13
			ra = document.evaluate("//table[@align='right'][@width='30%'][@border='0']", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
			if (ra) {
				ra.parentNode.removeChild(ra);
			}
		}
	},
	
	removeSponsoredLinksProducts: function() {
		var res = selectAllNodes(document, document.body, "//table[@width='100%'][@bgcolor='#e5ecf9']");
		for (var x=0; x<res.length; x++) {
			res[x].parentNode.removeChild(res[x]);
		}
		var fr = document.evaluate("//table[@align='right'][@bgcolor='#ffffff'][@border='0'][@cellspacing='0'][@cellpadding='0']", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
		if (fr) {
			fr.parentNode.removeChild(fr);
		}
	},

	removeSponsoredLinksLocal: function() {
		var s = document.createElement("style");
		s.setAttribute("type","text/css");
 		//s.innerHTML=(".ads, #mclip {display: none !important;}");
		//Changed on 16-08-2009
		s.innerHTML=(".ads{display: none !important;}");
		document.body.appendChild(s);
	},
	
	removeSponsoredLinksPrint: function() {
		var ra = document.evaluate("//table[@class='lads']", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
		if (ra) {
			ra.parentNode.removeChild(ra);
		}
		var ta = document.evaluate("//td[@class='btblinks']/ancestor::table[@style='margin-bottom: 0.8em;']", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
		if (ta) {
			ta.parentNode.removeChild(ta);
		}	
		var ad = document.getElementById('bottom_ad');
		if (ad) {
			ad.parentNode.removeChild(ad);
		}
	},
	
	removeSponsoredLinksImages: function() {
		var ra = document.evaluate("//table[contains(@style,'255, 249, 221')]/parent::td/parent::tr/parent::tbody/parent::table", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
		if (ra) {
			ra.parentNode.removeChild(ra);
		}
	},
	
	removeSearchWiki: function() {
		//promptService.alert("This is not prompting me - which means the problem isn't here");
		this.addGlobalStyle('#wml,.w10,.w20,.wcd,.wci,.ws,.wce{display:none!important}');
	},
	
	removeSponsoredLinksYouTube: function() {
		this.addGlobalStyle('#search-pva, #leaderboardAd, #ad_creative_1, .ad-div, #watch-channel-brand-div, #chrome-promo {display:none!important}');

		/*
		var player = document.getElementById("watch-player-div");
		if (player && document.getElementById("embed_code").value.indexOf("<") != -1){
			var embed_code = document.getElementById("embed_code").value;
			embed_code = embed_code.replace(/height="[0-9]+"/g, 'height="385"');
			embed_code = embed_code.replace(/width="[0-9]+"/g, 'width="640"');
			embed_code = embed_code.replace(/&fs=1/g, '&fs=1&showsearch=0&ap=%2526fmt%3D18');
			player.innerHTML = embed_code;
		}
		*/
	},

	hideGmailSpam: function(spamname) {
		//if (spamname) {
			//spamname = spamname.replace(/^\s*|\s*$/g,"");
			//this.addGlobalStyle('#ds_spam b {visibility: hidden;}');
			//this.addGlobalStyle('#ds_spam b::before {content: "'+spamname+'"; visibility: visible; font-weight: normal;}');
			//this.addGlobalStyle("span#ds_spam b,.ACpQre a[href$='#spam']{visibility:hidden;}span#ds_spam b::before,.ACpQre a[href$='#spam']::before{content:'"+spamname+"';visibility:visible;font-weight:400;text-decoration:none;}");
			//this.addGlobalStyle("span#ds_spam b,.ACpQre a[href$='#spam']{visibility:hidden;}span#ds_spam b::before,.ACpQre a[href$='#spam']::before{content:'"+spamname+"';visibility:visible;font-weight:400;}");

			var canvas = document.getElementById("canvas_frame");
			if (!canvas) {
				canvas = document;
			} else {
				canvas = canvas.contentDocument;
			}
			var spam = canvas.evaluate("//a[contains(@href,'#spam')]", canvas, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue
					|| canvas.evaluate("//a[contains(@href,'?s=m')]", canvas, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
			if (spam) {
				spam.innerHTML = spam.innerHTML.replace(/(&nbsp;|[\s]*)\(\d+\)/, "");
				spam.style.fontWeight = "normal";
			} else {
				window.setTimeout(OptimizeGoogle.hideGmailSpam, 500);
			}
			
			

		//}
	},
	
	hideID: function(id) {
		var s = document.createElement("style");
		s.setAttribute("type","text/css");
 		s.innerHTML=("#" + id + "{display: none !important;}");
		document.body.appendChild(s);
	},
	hideClass: function(id) {
		this.addGlobalStyle("." + id + "{display: none !important;}");
	},
	
	useMonoSpaceFont: function() {
 		this.addGlobalStyle(".mb, .tb, .compose .mi, div.msg, .ArwC7c, .iE5Yyc {font-family: MonoSpace !important; font-size: 90% !important; }");
	},
	
	addOtherWebSearches: function(urls) {
		var header = document.evaluate("//div[@id='center_col']/..",											document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue
			|| document.evaluate("//div[@id='ssb']",															document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue
			|| document.evaluate("//div[@class='bb bt t']",														document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue
			|| document.evaluate("//table[@class='t bt'][@width='100%'][@cellspacing='0'][@cellpadding='0']",	document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
		if (!header) return;
		if (!document.gs || !document.gs.q) return;
		var q = encodeURIComponent(document.gs.q.value);
		var q2 = escape(document.gs.q.value);
		if (!q) return;
		var other = document.createElement('div');
		other.setAttribute("style", "font-size:small;padding: 0 0 14px 14px;");
		if (document.cookie && document.cookie.match(/:NW=1:/)) {
			urls = urls.replace(/a href/ig, "a target=nw href");
		}
		other.innerHTML = this.t("try_search") + ' ' + urls.replace(/\[QUERY\]/g, q).replace(/\[QUERYISO88591\]/g, q2);
		header.parentNode.insertBefore(other, header);
	},
	
	addOtherImageSearches: function(urls) {
		var table = document.evaluate("//div[@id='ssb']",														document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue
			|| document.evaluate("//table[@class='t bt'][@width='100%'][@cellspacing='0'][@cellpadding='0']",	document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;//Old
		if (!table) return;
		if (!document.gs || !document.gs.q) return;
		var q = encodeURIComponent(document.gs.q.value);
		var q2 = escape(document.gs.q.value);
		
		if (document.cookie.match(/:NW=1:/)) {
			urls = urls.replace(/a href/ig, "a target=nw href");
		}
		
		var other = document.createElement('div');
		other.setAttribute("style", "font-size:small;padding:4px 0 0 0;");
		other.innerHTML = this.t("try_search") + ' ' + urls.replace(/\[QUERY\]/g, q).replace(/\[QUERYISO88591\]/g, q2);
		
		table.parentNode.insertBefore(other, table.nextSibling);
	},
	
	addOtherBlogSearches: function(urls) {
		var table = document.evaluate("//table[@class='ttt'][@width='100%'][@cellspacing='0'][@cellpadding='0']", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
		if (!table) return;
		if (!document.gs || !document.gs.q) return;
		var q = encodeURIComponent(document.gs.q.value);
		var q2 = escape(document.gs.q.value);
		
		if (document.cookie.match(/:NW=1:/)) {
			urls = urls.replace(/a href/ig, "a target=nw href");
		}
		
		var other = document.createElement('div');
		other.setAttribute("style", "font-size:small;padding:4px 0 0 0;");
		other.innerHTML = this.t("try_search") + ' ' + urls.replace(/\[QUERY\]/g, q).replace(/\[QUERYISO88591\]/g, q2);
		
		table.parentNode.insertBefore(other, table.nextSibling);
	},

	addOtherVideoSearches: function(urls) {
		var table = document.evaluate("//table[@id='resultsheadertable']", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
		if (!table) return;
		if (!document.f || !document.f.q) return;
		var q = encodeURIComponent(document.f.q.value);
		var q2 = escape(document.f.q.value);
		if (document.cookie.match(/:NW=1:/)) {
			urls = urls.replace(/a href/ig, "a target=nw href");
		}
		
		var other = document.createElement('div');
		other.setAttribute("style", "font-size:small;padding:4px 0 4px 5px;");
		other.innerHTML = this.t("try_search") + ' ' + urls.replace(/\[QUERY\]/g, q).replace(/\[QUERYISO88591\]/g, q2);
		
		table.parentNode.insertBefore(other, table.nextSibling);
	},
	
	addOtherNewsSearches: function(urls) {
		//Alternative from 0.76.2 Doesn't seem to work any better.
		//var table = document.evaluate("//font[@class='ks']/ancestor::table[@cellspacing='0'][@cellpadding='0'][@border='0'][@width='100%']", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
		var table = document.evaluate("//div[@class='sub-header']", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
		// Removed Feb 2010
		//document.evaluate("//font[@class='ks']/parent::td/parent::tr/parent::tbody/parent::table", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
		if (!table) return;

		var searchField = document.evaluate("//input[@class='searchField']", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
		if (!searchField) return;
		var q = encodeURIComponent(searchField.value);
		var q2 = escape(searchField.value);

		// Removed Feb 2010
		//if (!document.gs || !document.gs.q) return;
		//var q = encodeURIComponent(document.gs.q.value);
		//var q2 = escape(document.gs.q.value);

		if (document.cookie.match(/:NW=1:/)) {
			urls = urls.replace(/a href/ig, "a target=nw href");
		}

		var other = document.createElement('div');
		other.setAttribute("style", "font-size:small;padding:4px 0 4px 5px;");
		other.innerHTML = this.t("try_search") + ' ' + urls.replace(/\[QUERY\]/g, q).replace(/\[QUERYISO88591\]/g, q2);

		table.parentNode.insertBefore(other, table.nextSibling);
	},
	
	addOtherProductSearches: function(urls) {
		var table = document.evaluate("//table[@id='ps-titlebar'][@cellspacing='0']", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
		if (!table) return;
		var frm = document.gs || document.f;
		if (!frm || !frm.q) return;
		
		var q = encodeURIComponent(frm.q.value);
		var q2 = escape(frm.q.value);
		
		if (document.cookie.match(/:NW=1:/)) {
			urls = urls.replace(/a href/ig, "a target=nw href");
		}
		
		var other = document.createElement('div');
		other.setAttribute("style", "font-size:small;padding:4px 0 4px 5px;");
		other.innerHTML = this.t("try_search") + ' ' + urls.replace(/\[QUERY\]/g, q).replace(/\[QUERYISO88591\]/g, q2);

		table.parentNode.insertBefore(other, table.nextSibling);
	},
	
	addFavicons: function() {
		//Changed 16-08-2009
		var list = document.evaluate("//li[@class='g' or @class='g w0']/descendant::h3/a", document, null, 6, null);
		for (var i=0; i < list.snapshotLength; ++i) {
			var a = list.snapshotItem(i);

			var url = "data:image/png,%89PNG%0D%0A%1A%0A%00%00%00%0DIHDR%00%00%00%10%00%00%00%10%08%06%00%00%00%1F%F3%FFa%00%00%00%19tEXtSoftware%00Adobe%20ImageReadyq%C9e%3C%00%00%00%EDIDATx%DA%A4%93K%0A%830%10%86'%A1%1B%1F%E0%CA%13%E8%D6%95'%D1%A5%97%F4%1C%0A%5Dy%02%2F%E0%0B%1F%08%82%25%A1%13%F2%B2%B5t%60H%C8%FC%FF7%1A%1Dr%9E'%FC%13%0F%DC%94e%99%EA%C5y%9E%C1%F7%7D%BE%CF%B2%EC%F9%11%F0%16)%C5m%DB%C0q%1CX%D7%15%9A%A6I%93%241%20T%3F%60b%CCeY%F8%99%EB%BA%10E%11%B4m%9B~%05%5C%05%83%84ah%BC%AA%00%DC%B9L%06%D1u%E2%0E%A6i%B2%9A%AA%AA%E2%2B!%04(%A5P%D75%E4yn%02%C6q%B4%02%E28%E6f%CC%20%08%ECO%D0%F7%BDa%F6%3C%8Fw%C5%EE%2C%F6%7D%B7%03%BA%AES%0AhB%00%A6%AE%13%80a%18%D4%CF%23%99q%B5%E9%04%E08%0E%C5%2Cw%C5%D4u%97%FF%81l%92%BB%DB%82%DA%CC%F2z%7B%98X%14E%F1%F34%92%7F%C7%F9%25%C0%00%F6%19T%09%A3%B3%D1%A8%00%00%00%00IEND%AEB%60%82";
			if (a.href.match(/\/interstitial\?url=/)) {
				url = "data:image/png,%89PNG%0D%0A%1A%0A%00%00%00%0DIHDR%00%00%00%10%00%00%00%10%08%06%00%00%00%1F%F3%FFa%00%00%00%04gAMA%00%00%AF%C87%05%8A%E9%00%00%00%19tEXtSoftware%00Adobe%20ImageReadyq%C9e%3C%00%00%02OIDAT8%CB%A5%93%CBK%94a%14%C6%1F%BF%D4%09%95%E9SA%9C%11oc%8A%94%AB%886%E1%C6.PD%04C%8B%C4%0B%B8%EA%82%F4%17D%10%15%D5%A2%CD%40%ABZx%C1h1%E0N%10%8C%A2%22%A4%85C%8DN%A9%A3%98%3Av%19%9D%14%9Df%E6%7D%CF%F3%B6%B0%BE%19%B36uv%EF%E1%9C%DFy%0E%EFy%F2%8C1%F8%9F%C8%FF%3D!%B7%AF4%D0%98vCv%91%AC%24%09%92%9FH%F6S8d%DF%E9%8F%E6%D6%E7%E5*P%B7.%FB%0DM%60%2B%AF%D0S%D8%B0%1F%F9n%F7v~c%1D%C9H%04Vr%7D%85%94%DE%8A%FBO%82%BB%00%99%9B%97%FC%86%ECKW%D4%14%1755Bb%0B%60l%01%00%60yj%60yk%B11%15Aj%FA%DD%16E%BA%AB%1F%0C%07%1D%40%FA%C6E%1F%C9%17%99%CA%1AoqS%132%AFF%01%00E%D7%1E%02%006%AF%F7%004(l%3D%89%F5%F0%246%23%131!%5B%F7%3F%1A%99%B3%00%40Dw%24-W%B6%D9%18%18fW%A3%26D%1B%24%C7F%E0n%3E%00SR%EE%D5Ju%00%80%05%00Z%EBNWc%23di%1E%86%06%14%03%A3%B9%03%40%25%90%0C%91%9E%8Bb_s%0B%94R%9D%B9%80%AA%02%DB%86%5E%9C%87%D1t%26%3A%3F%93!Dm%E7S%B3Q%14%D8e%D0JWe%01J%C3%88q%1A%7FMT%D3%E1%EC%0A%EA'D%08%08%A1%B5B%8E%02%B5%9C%8E%AF%C1%F2%D4%3ARE%11%DF_%8Eas%F8%B13%9D%8A%C8%AF%AEC2%1E%87Vz9W%C1%C0%B7%F0%5B%EC%F1%D69%C5%A2%08w%CFU%94%9C%BB%00*B4!B%B8%EA%7C%F8%12z%03%AD%F5%80%03PJ%0DfVc%B1%C4d%18Em%A7%1C%C8Z%E0%1EV%03w!%B2%FD%B6O%9F%C1%D7p%08%89%C5%99%98%D6zp%C7!Mu%1E%F3S%A4%CF%3Ex%A4%B8%B4%B9%05%A9%F99%A4f%A30%C6%C0U%EF%83%AB%DE%87x8%84%8F%AFG%B7Hv%B7%3D%7D%1F%DCu%CA%A1%F3G%FDB%06%F6%96y%3D%E5-%87%E0%B2Ka%0C%90J%AC%E1%F3%C48%12K%B3%2B%24%7B%8F%3F%FB%10%FC%A3%17%00%60%FC%EC%E1%06%92%ED%14v%91%B2%D3L%E4%D0%89%E73%7F7%D3%BF%C4%0F%95%D1%AFLj%05%EB%FF%00%00%00%00IEND%AEB%60%82";
			}
			
			var img = new Image();
			img.src = url;
			img.setAttribute("style","height:16px;width:16px;border:0;padding-top:2px;padding-right:4px;display:block;float:left;");
			a.parentNode.parentNode.insertBefore(img, a.parentNode.nextSibling);
			(function(a,img){
			if (!a.href.match(/^https/) && !a.href.match(/\/interstitial\?url=/)) {
				var url = "http://"+a.href.split('/')[2]+"/favicon.ico";
				var tmpimg = new Image();
				tmpimg.src = url;
				tmpimg.addEventListener("load",function() { img.src = url; },false);
			}
			})(a,img);
		}
	},
	
	removeUrlClickTrack: function() {
		var match = null;
		var a = selectAllNodes(document,document.body,"//a[@href]");
		for (var y=0; y<a.length; y++) {
			// if internal
			match = a[y].href.match(/^https?:\/\/[^\/]*google\.[a-z\.]+\/(aclk|pagead|url).+?(url|q|adurl)=(http[s]?:[^&]+)/i);
			if (match) {
				a[y].href = unescape(match[3]);
			}
			// if external
			if (a[y].href.match(/^(http|https|ftp):\/\//) && !a[y].href.match(/google\.[a-z\.]+\//)) {
				a[y].onmousedown = function() { return true; }
			}
		}
		// sneaky google sometimes bypass the above, this will fix it
		window.clk = function() { };
	},
	
	showAdPreviews: function() {
		var match = null;
		var a = selectAllNodes(document, document.body, "//a");
		for (var y=0; y<a.length; y++) {
			match = a[y].href.match(/^https?:\/\/[^\/]*google\.[a-z\.]+\/(pagead|url).+?(q|adurl)=(http[s]?:[^&]+)/i);
			if (match) {
				a[y].onmouseover = function() { };
			}
			
		}
		var td = selectAllNodes(document, document.body, "//td[@onmouseover='return ss()']");
		for (var y=0; y<td.length; y++) {
			td[y].onmouseover = function() { };
		}
		td = selectAllNodes(document, document.body, "//td[@onmouseover='return true']");
		for (var y=0; y<td.length; y++) {
			td[y].onmouseover = function() { };
		}
	},

	filterWebsitesFromSearch: function(preflist,color) {
	
		var prefarr = preflist.split(/\s+/);
		var l = new Array();
		for (var i=0;i< prefarr.length;i++) {
			var cg_regexp = null;
			if (!this.isRegExp(prefarr[i])) {
				cg_regexp = new RegExp(this.convertToRegExp(prefarr[i]), "i");
			} else {
				cg_regexp = new RegExp(prefarr[i].replace(/^\/(.+)\/[i]?$/, "($1)"), "i");
			}
			l[l.length] = cg_regexp;
		}
	
		var re = null;
		var match = null;
		//var res = selectAllNodes(document, document.body, "//li[contains(@class,'g')]");
		//Changed 16-08-2009
		var res = selectAllNodes(document, document.body, "//li[@class='g' or @class='g w0']");
		for (var x=0; x<res.length; x++) {
			var a = document.evaluate(".//a", res[x], null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
			if (!a) continue;
			var lnk = a.href;
			
			match = lnk.match(/^(http:\/\/www\.google|\/url).+?q=(.+)(&|&amp;)e=/i);
			if (match) {
				lnk = unescape(match[2]);
			}
			
			var nobr = document.evaluate(".//span[@class='gl']", res[x], null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue || document.evaluate(".//nobr/font", res[x], null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue || document.evaluate(".//nobr", res[x], null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
			if (nobr) {
				nobr.innerHTML = nobr.innerHTML + ' - ';

				var newa = document.createElement('a');
				newa.setAttribute("href", "javascript:void(0);");
				newa.setAttribute("cg_filter", lnk);
				newa.setAttribute("class", "fl");
				if (document.cookie.match(/:NW=1:/)) {
					newa.setAttribute("target", "nw");
				}
				newa.innerHTML = this.t("filter");
				nobr.appendChild(newa);
			}
			
			if (l && l.length > 0) {  
				for (var i=0;i< l.length;i++) {
					if (lnk.match(l[i])) {
						var np = document.createElement('li');
						var npa = document.createElement('a');
						npa.setAttribute("href", lnk);
						npa.setAttribute("style", "color:"+color+";text-decoration:none;");
						npa.setAttribute("title", this.t("filter_match"));
						npa.setAttribute("class", "l");
						npa.innerHTML = lnk;
						np.appendChild(npa);
						
						if (document.cookie.match(/:NW=1:/)) {
							np.setAttribute("target", "nw");
						}
						//np.setAttribute("class", "g w0");
						//Changed 16-08-2009
						np.setAttribute("class", "g");
						np.setAttribute("style", "font-size:small;");
						res[x].parentNode.replaceChild(np, res[x]);
						break;
					}
				}
			}
		}
	},
	
	filterWebsitesFromNews: function(preflist, color) {
		var prefarr = preflist.split(/\s+/);
		var l = new Array();
		for (var i=0;i< prefarr.length;i++) {
			var cg_regexp = null;
			if (!this.isRegExp(prefarr[i])) {
				cg_regexp = new RegExp(this.convertToRegExp(prefarr[i]), "i");
			} else {
				cg_regexp = new RegExp(prefarr[i].replace(/^\/(.+)\/[i]?$/, "($1)"), "i");
			}
			l[l.length] = cg_regexp;
		}
	
		var re = null;
		var match = null;
		var res = selectAllNodes(document, document.body, "//table[@cellspacing='7'][@cellpadding='2'][@border='0'][@valign='top']");
		for (var x=0; x<res.length; x++) {
			var counter = selectAllNodes(document, res[x], ".//a");
			if (!counter || counter.length > 2) continue;
			
			var a = document.evaluate(".//a", res[x], null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
			if (!a) continue;
			var lnk = a.href;
			
			match = lnk.match(/^(http:\/\/www\.google|\/url).+?q=(.+)(&|&amp;)e=/i);
			if (match) {
				lnk = unescape(match[2]);
			}
			
			var nobr = document.evaluate(".//nobr/font", res[x], null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue || document.evaluate(".//nobr", res[x], null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
			if (nobr) {
				var span = document.createElement('span');
				span.innerHTML = ' - ';
				nobr.appendChild(span);
				var newa = document.createElement('a');
				newa.setAttribute("href", "javascript:void(0);");
				newa.setAttribute("cg_filter", lnk);
				newa.setAttribute("class", "fl");
				newa.innerHTML = this.t("filter");
				nobr.appendChild(newa);
			}
			
			if (l && l.length > 0) {
				for (var i=0;i< l.length;i++) {
					if (lnk.match(l[i])) {
						var np = document.createElement('div');
						var npa = document.createElement('a');
						npa.setAttribute("href", lnk);
						npa.setAttribute("style", "color:"+color+";text-decoration:none;");
						npa.setAttribute("title", this.t("filter_match"));
						npa.innerHTML = lnk;
						np.appendChild(npa);
						np.setAttribute("style", "font-size:small;margin-left:5px;");
						res[x].parentNode.replaceChild(np, res[x]);
						break;
					}
				}
			}
		}
	},
	
	addWayBackMachine: function() {
		var match = null;
		//var res = selectAllNodes(document, document.body, "//li[contains(@class,'g')]");
		//Changed 16-08-2009
		var res = selectAllNodes(document, document.body, "//li[@class='g' or @class='g w0']");
		for (var x=0; x<res.length; x++) {
			var a = document.evaluate(".//a", res[x], null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
			if (!a) continue;
			
			var lnk = a.href;
			match = lnk.match(/^(http:\/\/www\.google|\/url).+?q=(.+)(&|&amp;)e=/i);
			if (match) {
				lnk = unescape(match[2]);
			}
			
			var nobr = document.evaluate(".//span[@class='gl']", res[x], null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue || document.evaluate(".//nobr/font", res[x], null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue || document.evaluate(".//nobr", res[x], null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
			if (nobr) {
				nobr.innerHTML = nobr.innerHTML + ' - ';
				
				var newa = document.createElement('a');
				newa.setAttribute("href", "http://web.archive.org/web/*/" + lnk);
				newa.setAttribute("class", "fl");
				
				if (document.cookie.match(/:NW=1:/)) {
					newa.setAttribute("target", "nw");
				}
				
				newa.innerHTML = this.t("history");
				nobr.appendChild(newa);
			}
		}
	},
	
	addBookmarks: function(handler) {
		
		if (!document.gs || !document.gs.q) return;
		var q = encodeURIComponent(document.gs.q.value);
		if (!q) return;
		
		var match = null;
		//var res = selectAllNodes(document, document.body, "//li[contains(@class,'g')]");
		//Changed 16-08-2009
		var res = selectAllNodes(document, document.body, "//li[@class='g' or @class='g w0']");
		for (var x=0; x<res.length; x++) {
			var a = document.evaluate(".//a", res[x], null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
			if (!a) continue;
			
			var lnk = a.href;
			var title = a.innerHTML.replace(/<[^>]+>/g,"");
			
			match = lnk.match(/^(http:\/\/www\.google|\/url).+?q=(.+)(&|&amp;)e=/i);
			if (match) {
				lnk = unescape(match[2]);
			}
			
			var nobr = document.evaluate(".//span[@class='gl']", res[x], null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue || document.evaluate(".//nobr/font", res[x], null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue || document.evaluate(".//nobr", res[x], null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
			if (nobr) {
				nobr.innerHTML = nobr.innerHTML + ' - ';
				var newa = document.createElement('a');
				newa.setAttribute("class", "fl");
				
				switch (handler){
					case "del.icio.us":
						newa.setAttribute("href", "http://del.icio.us/post?title=" + encodeURIComponent(title) + "&url=" + encodeURIComponent(lnk) + "&encoding=UTF-8&tags=" + q);
						break;
					case "furl":
						newa.setAttribute("href", "http://www.furl.net/storeIt.jsp?t=" + encodeURIComponent(title) + "&u=" + encodeURIComponent(lnk) + "&encoding=UTF-8&tags=" + q);
						break;
					case "digg":
						newa.setAttribute("href", "http://digg.com/submit?phase=2&url=" + encodeURIComponent(lnk) + "&encoding=UTF-8&tags=" + q);
						break;
					case "spurl":
						newa.setAttribute("href", "http://www.spurl.net/spurl.php?v=3&title=" + encodeURIComponent(title) + "&url=" + encodeURIComponent(lnk) + "&encoding=UTF-8&tags=" + q);
						break;
					case "simpy":
						newa.setAttribute("href", "http://simpy.com/simpy/LinkAdd.do?title=" + encodeURIComponent(title) + "&href=" + encodeURIComponent(lnk) + "&encoding=UTF-8&v=6&tags=" + q);
						break;
					case "blinklist":
						newa.setAttribute("href", "http://www.blinklist.com/index.php?Action=Blink/addblink.php&Description=&Url=" + encodeURIComponent(lnk) + "&Title=" + encodeURIComponent(title) + "&encoding=UTF-8&Tag=" + q);
						break;
					case "yahoo-myweb":
						newa.setAttribute("href", "http://synergy2.search.yahoo.com/myresults/bookmarklet?u=" + encodeURIComponent(lnk) + "&t=" + encodeURIComponent(title) + "&encoding=UTF-8&Tag=" + q);
						break;
					case "google":
						newa.setAttribute("href", "http://www.google.com/bookmarks/mark?op=edit&output=popup&bkmk=" + encodeURIComponent(lnk) + "&title=" + encodeURIComponent(title));
						break;
					case "ma.gnolia":
						newa.setAttribute("href", "http://ma.gnolia.com/bookmarklet/popup/add?url=" + encodeURIComponent(lnk) + "&title=" + encodeURIComponent(title) + "&description=");
						break;
					case "reddit":
						newa.setAttribute("href", "http://reddit.com/submit?url=" + encodeURIComponent(lnk));
						break;
					default:
						newa.setAttribute("href", "javascript:void(0);");
						newa.setAttribute("cg_url", lnk);
						newa.setAttribute("cg_title", title);
				}
				
				if (document.cookie.match(/:NW=1:/)) {
					newa.setAttribute("target", "nw");
				}
				
				newa.innerHTML = this.t("save");
				nobr.appendChild(newa);
			}
		}
	},

	restoreGooglePrint: function() {
		var cleardots = document.evaluate("//img[@src='/images/cleardot.gif']", document, null, XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE, null);
		var cleardot, i, div, theimg;
		for(cleardot = null, i = 0; (cleardot = cleardots.snapshotItem(i)); i++) {
			div = cleardot.parentNode;
			if (div.nodeName != "DIV") {
				div = div.parentNode;
			}
			theimg = getComputedStyle(div, '').backgroundImage;
			theimg = theimg.replace(/url\((.*?)\)/g, "$1");
			cleardot.style.border = "none";
			cleardot.src = theimg;
		}
		
		document.oncontextmenu = null;
	},
	
	addOtherBookReviews: function(urls) {
		var table = document.evaluate("//table[@bgcolor='#e5ecf9'][@width='100%'][@border='0'][@cellpadding='1'][@cellspacing='0']", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
		if (!table) return;
		if (!document.gs || !document.gs.q) return;
		var q = encodeURIComponent(document.gs.q.value);
		var q2 = escape(document.gs.q.value);
		if (!q) return;
		
		if (document.cookie.match(/:NW=1:/)) {
			urls = urls.replace(/a href/ig, "a target=nw href");
		}

		var other = document.createElement('div');
		var s = '<span style="font-size:small;padding:4px 0 4px 5px;">' + this.t("try_search") + ' ';
		s += urls.replace(/\[QUERY\]/g, q).replace(/\[QUERYISO88591\]/g, q2);
		s += '</span>';
		other.innerHTML = s;
		table.parentNode.insertBefore(other, table.nextSibling);
	},
	
	addGoogleSuggest: function() {
			
		// only add suggest if it is not there already
		if (!document.body.innerHTML.match(/google\.ac\.i\(document/)) {
			var f = get_search_form();
			if (!f || !f.q) return;
			if (!window.google)	window.google={};
			if (!window.google.y || !window.google.y.first) window.google.y={first:[]};
			window.setTimeout(function(){var xjs=document.createElement('script');
			xjs.src='/extern_js/f/CgJlbiswCjgNLCswDjgELCswGDgDLA/F21IcsWnMZA.js';
			document.getElementsByTagName('head')[0].appendChild(xjs)},0);
			window.google.y.first.push(function(){window.google.ac.i(f,f.q,'','')})
			f.q.setAttribute("autocomplete", "off");
		}
	},
	
	pointLinksToImages: function() {
		createLinks();
		window.addEventListener("resize", createLinks, true);
	},
	
	secureGoogle: function() {
		if (window.location.href.match(/^http:/)) {
			window.location.href = window.location.href.replace(/^http:/, 'https:');
		}
	 },
	anonymizeGoogleUID: function() {
		if (location.host.match(/google\..+$/)) {
			var domain = location.host.match(/google\..+$/)[0];
			var parts  = document.cookie.split('; ');
			var c = null;
			for(var i=0; c=parts[i]; ++i) {
				if(c.match(/^PREF=/)) {
					document.cookie = c.replace(/ID=\w+:/,'ID='+get_random_id(16)+':')
														.replace(/:U=\w+:/,':U='+get_random_id(16)+':') +
														'; domain=.' + domain + '; path=/; expires=Mon, 01 Jan 2038 00:00:00 GMT';
				}
			}
		}
	 },

	defaultPreferences: function(FF,LR,LD,NR,NW,SG) {
		var domain = location.host.match(/google\..+$/)[0];
		var parts  = document.cookie.split('; ');
		var c = null;
			
		for(var i=0; c=parts[i]; ++i) {
			// if pref cookie
			if (c.match(/^PREF=/)) {
				// parse cookie
				var namevalues = c.match(/^PREF=(.*)/)[1].split(':');
				var hash   = new Object();
				for(var j=0; j < namevalues.length; j++) {
					var pair = namevalues[j].split('=');
					hash[pair[0]] = pair[1];
				}
				
				// if valid cookie
				if (hash['ID'] && hash['TM'] && hash['LM'] && hash['S']) {
				
					var modified = false;
					
					// SafeSearch: 4 = Off, 1 = Strict, empty = Moderate
					// if set but should be empty
					if (FF && hash['FF'] && FF == 'empty') {
						hash['FF'] = '';
						modified = true;
					// if set but not should be empty
					}  else if (FF && hash['FF'] && FF != hash['FF'] && FF != 'empty') {
						hash['FF'] = FF;
						modified = true;
					// if not set and should not be empty
					} else if (FF && !hash['FF'] && FF != 'empty') {
						hash['FF'] = FF;
						modified = true;
					}
					
					// Search only for pages written in these language(s)
					// if set but should be empty
					if (LR && hash['LR'] && LR == 'empty') {
						hash['LR'] = '';
						modified = true;
					// if set but not should be empty
					}  else if (LR && hash['LR'] && LR != hash['LR'] && LR != 'empty') {
						hash['LR'] = LR;
						modified = true;
					// if not set and should not be empty
					} else if (LR && !hash['LR'] && LR != 'empty') {
						hash['LR'] = LR;
						modified = true;
					}

					// Display Google tips and messages in this language
					if (LD && (!hash['LD'] || LD != hash['LD'])) {
						hash['LD'] = LD;
						modified = true;
					}
					
					// Display X results per page
					if (NR && (!hash['NR'] || NR != hash['NR'])) {
						hash['NR'] = NR;
						modified = true;
					}

					// Open search results in a new browser window.
					// if set but should be empty
					if (NW && hash['NW'] && NW == 'empty') {
						hash['NW'] = '';
						modified = true;
					// if set but not should be empty
					}  else if (NW && hash['NW'] && NW != hash['NW'] && NW != 'empty') {
						hash['NW'] = NW;
						modified = true;
					// if not set and should not be empty
					} else if (NW && !hash['NW'] && NW != 'empty') {
						hash['NW'] = NW;
						modified = true;
					}
					
					// Use Google Suggest
					// if set but should be empty
					if (SG && SG == 'empty' && (!hash['SG'] || hash['SG'] != '0')) {
						hash['SG'] = '0';
						modified = true;
					// if set but not should be empty
					}  else if (SG && SG == '1' && (hash['SG'])) {
						hash['SG'] = '';
						modified = true;
					}
					
					// if any changes
					if (modified) {
						var newpref = "PREF=";
						// keep order
						newpref += 'ID' + '=' + hash['ID'] + ':';
						// prefs
						for (key in hash) {
							if (key != 'ID' && key != 'S' && hash[key]) {
								newpref += key + '=' + hash[key] + ':';
							}
						};
						// keep order
						newpref += 'S'  + '=' + hash['S'];
						document.cookie = newpref + '; domain=.' + domain + '; path=/; expires=Mon, 01 Jan 2038 00:00:00 GMT';
						window.location.href = window.location.href;
					}
				}
				// else invalid cookie
				return;
			}
		}
	},
	
	addCountSearchResults: function() {
		var x, i, p, s=0, n=0, R=/start=([^&]*)/;
		if ((x=R.exec(document.location.search)) && x[1]) s = n = parseInt(unescape(x[1]),10);
		//var res = selectAllNodes(document, document.body, "//li[contains(@class,'g')]/descendant::h3/a");
		//Changed 16-08-2009
		var res = selectAllNodes(document, document.body, "//li[@class='g' or @class='g w0']/descendant::a[@class='l']");
		for (i=0;i<res.length;++i) {
			if (!res[i].getAttribute("href").match(/google\.[a-z\.]+\/(videosearch|products)\?/)) {
				var tn  = document.createElement("span");
				tn.innerHTML = ++n + ". ";
				//var tn = document.createTextNode(++n + ". ");
				tn.setAttribute("style", res[i].getAttribute("style"));
				res[i].parentNode.insertBefore(tn, res[i]);
			}
		};
	},
	
	anonymizeGoogleAnalytics: function() {
		var parts  = document.cookie.split('; ');
		var c = null;
		for(var i=0; c=parts[i]; ++i) {
			var match = c.match(/^(__utm[a-z])=/);
			if (match) {
				var d = document.domain;
				if (d.substring(0,4)=="www.") {
					d=d.substring(4,d.length);
				}
				document.cookie = match[1] + '=; domain=' + d + '; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
			}
		}
	 },
	
	bypassChineseFirewall: function() {
		// The Chinese Firewall filters infomation on the internet
		// Google cache is disabled by the supervisor
		// This method bypass the firewall by rewriting the links
		var match = null;
		var a = selectAllNodes(document, document.body, "//a[contains(@href, 'search?q=cache')]");
		for (var y=0; y<a.length; y++) {
			a[y].href = a[y].href.replace(/q=cache/, "&q=cache");
		}
	},
	
	addSearchFieldFocus: function() {
		var f = get_search_form();
		if (!f || !f.q) return;
		window.addEventListener("load", function() {f.q.focus();}, false);
	}
};
