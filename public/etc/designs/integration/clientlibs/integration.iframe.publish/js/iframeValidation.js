var IFRAME = {};

IFRAME.Class = function () {
};

IFRAME.validateWidth = function(value){
    if("" == value){
        return true;
    }
    if (value == parseInt(value, 10) && value > 0 && value < 10000) {
        return true;
    }

    return "Please enter valid number up to 10000.";
};

IFRAME.validateHeight = function(dialog, value){

    if (value == parseInt(value, 10) && value > 0 && value < 10000) {
        return true;
    }

    if(value.length == 0) {
        var autoHeight = dialog.find('name', './autoHeight')[0];
        if (!autoHeight.getValue()[0]) {
            return 'This field is mandatory if the "Auto Height" checkbox has not been marked.';
        } else {
            return true;
        }
    }

    return "Please enter valid number up to 10000.";
};

IFRAME.validateMobileLinkTitle = function(dialog, value) {
    if (value.length != 0 && value.length < 101) {
        return true;
    }
    if (value.length > 100) {
        return 'Mobile title link can contain maximum 100 characters.';
    }
    var mobileLinkText = dialog.find('name', './showLinkForMobile')[0];
    if (mobileLinkText.getValue()[0]) {
        return 'This field is mandatory if the "Show Link for Mobile" checkbox has been marked.';
    }
    return true;
};

IFRAME.validateFallbackPagePath = function(dialog, value) {
    if (value.length != 0) {
        if(value.indexOf("/content") == 0) {
            return true;
        } else {
            return 'Please enter a valid page path';
        }
    }
    var fallbackStrategy = dialog.find('name', './fallbackStrategy')[0];
    if (fallbackStrategy.getValue() == 'showFallbackPage') {
        return 'This field is mandatory if the "Show Link for Mobile" checkbox has been marked.';
    }
    return true;
};

IFRAME.validateHttp = function(value){
    if (value.length == 0 || value.toLowerCase().indexOf("http://") == 0) {
        return true;
    }

    return "Please enter valid HTTP URL";
};

IFRAME.validateSsl = function(value){
    if (value.length == 0 || value.toLowerCase().indexOf("https://") == 0) {
        return true;
    }

    return "Please enter valid HTTPS URL";
};

IFRAME.validateScrolling = function(value){
    if (value == 'auto' || value == 'yes' || value == 'no') {
        return true;
    }

    return "Please select valid Scrolling value";
};