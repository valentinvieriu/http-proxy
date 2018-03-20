window.integration=window.integration || {};
window.integration.iframeintegration = window.integration.iframeintegration || {};

/**
 * This method puts all parameter in the anchor to a hashmap representation
 * @returns {Object}
 */
window.integration.iframeintegration.getAllHashParameter = function() {
    var hashMap={};
    window.location.hash.substr(1).split('&').forEach(function(parameter){
        var parameterArray=parameter.split('=');
        hashMap[parameterArray[0]]=parameterArray[1];
    });
    return hashMap;
};
/**
 * This method extracts all placeholder for the passed string.
 * @param {string} urlString
 * @returns {Array}
 */
window.integration.iframeintegration.extractAllUrlParameterPlaceholer = function(urlString){
    var placeholdernames = [];
    var expression = /\$\{urlParameter\.([^\}]*)\}/g;
    var result;
    while (result = expression.exec(urlString)) {
        if(!(placeholdernames.indexOf(result[1]) >= 0)){
            placeholdernames.push(result[1]);
        }
    }
    return placeholdernames;
};

/**
 * @returns {String} mobile|tablet|default
 */
window.integration.iframeintegration.getDeviceTypeSelector = function() {
    if (window.integration.deviceType == 2) {
        return "mobile";
    } else if (window.integration.deviceType == 1) {
        return "tablet";
    } else {
        return "default";
    }
};

if (!String.prototype.startsWith) {
    String.prototype.startsWith = function(searchString, position) {
        position = position || 0;
        return this.lastIndexOf(searchString, position) === position;
    };
}

window.integration.getQueryParameters = function () {
    var urlClean = window.location.href.replace("cf#", "");
    var queryString = "";

    if(urlClean.indexOf('#') != -1) {
        var urlArray = urlClean.split("#");
        $.each(urlArray, function() {
            if (this.length > 0 && !this.startsWith('http') && !this.startsWith('bookmark')) {
                queryString += this;
            }
        });
    }

    return queryString;
};

function isIphoneOrIpad() {
    return !!(navigator.userAgent.toLowerCase().indexOf("ipad") > 0 || navigator.userAgent.toLowerCase().indexOf("iphone") > 0);
}




