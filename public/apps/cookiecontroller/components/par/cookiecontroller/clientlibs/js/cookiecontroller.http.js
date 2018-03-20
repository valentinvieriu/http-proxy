cookiecontroller.http = (function() {
	var xmlhttp;

	if (window.XMLHttpRequest) {
		xmlhttp = new XMLHttpRequest();
	} else {
		xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
	}

	function ajax (url, callback, async, scope) {
		xmlhttp.onreadystatechange = function() {
			if (xmlhttp.readyState == 4) {
				if (xmlhttp.status == 200) {
					callback.call(scope,xmlhttp.responseText);
				} else {
					console.dir(xmlhttp.status);
				}
			}
		}
		xmlhttp.open("GET", url, async);
		xmlhttp.send();
	}

	function json(url, callback, async, scope) {
		ajax(url, function(responseText, async) {
			callback.call(scope, JSON.parse(responseText));
		});
	}

	return {
		ajax : ajax,
		json : json
	}
})();

// cc.ajax2.ajax("http://localhost:6200/content/geometrixx/de/products.cpc.json?wcmmode=disabled",function(ddd){console.dir(ddd)});
