(function () {
    var parameters = window.location.hash.substr(1) || "";
    var brandValue = "";
    // fix for BMWST-7487
    // to check for 'BM' or 'BI' is not enough
    if (parameters.indexOf('brand=BM') >= 0) {
        brandValue = "BM";
    } else if (parameters.indexOf('brand=BI') >= 0) {
        brandValue = "BI";
    }

    $('.ds2-link--forward-parameters').each(function () {

        // remove "/" from params to prevent DLO error
        if (parameters.indexOf('/') !== -1) {
            parameters = parameters.replace("/", "");
        }

        if (brandValue && this.href.indexOf('brand=' + brandValue) >= 0) {
            window.location.href = this.href.replace('brand=' + brandValue, '') + parameters;
        }

        if (parameters.indexOf('&') == 0 || parameters.length == 0) {
            this.href = this.href + parameters;
        } else {
            this.href = this.href + '&' + parameters;
        }
    });
})();