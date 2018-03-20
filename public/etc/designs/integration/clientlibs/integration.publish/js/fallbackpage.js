window.integration=window.integration || {};
window.integration.AjaxComponent=window.integration.AjaxComponent || {};
window.integration.fallbackpage = window.integration.fallbackpage || {};

window.integration.AjaxComponent.getUrl = function(fallback) {
    if(fallback.lastIndexOf('.html') > 0){
        return fallback;
    }

    return fallback + '.html'
}

/**
 * This method adds the selector 'content' to the path of the passed fallback page
 * @param {string} fallback the raw fallback path
 * @returns {string} the cooked path
 */
window.integration.fallbackpage.addSelectorToFallbackPagePath = function(fallback) {
    var endsWith=function(text, suffix) {
        return text.indexOf(suffix, text.length - suffix.length) !== -1;
    };
    if(endsWith(fallback , '.html')){
        fallback = fallback.slice(0,-5);
    }
    return fallback + '.content.html';
};
/**
 * This method replaces the element with the passed id by the result of the fallback page.
 * If the fallback page is not defined, the default fallback page will be used.
 * @param {string} id of the html element to replace
 * @param {string} fallbackPagePath the path to the fallback page
 */
window.integration.fallbackpage.replaceElementWithFallbackpage=function(id, fallbackPagePath){
    if (fallbackPagePath) {
        window.integration.fallbackpage.replaceElement(id, fallbackPagePath);
    } else {
        var href = window.location.href.replace(".html", '.in-fallback.json');
        $.get(href).done(function(data) {
            var defaultFallbackPath = window.integration.AjaxComponent.getUrl(data.defaultFallbackPath);
            window.integration.fallbackpage.replaceElement(id, defaultFallbackPath);
        });
    }
};

window.integration.fallbackpage.replaceElement = function (id, fallbackPagePath) {
    var url = window.integration.fallbackpage.addSelectorToFallbackPagePath(fallbackPagePath);
    var $frameWindow = $("#"+id);
  
    $frameWindow.load(url, function() {
      window.digitals2.main.componentsUpdate();
      window.integration.fallbackpage.triggerHiresinit($frameWindow);
    });
};

window.integration.fallbackpage.triggerHiresinit = function ($frameWindow) {
    //@TODO check if this is still needed
    require(['ds2-iframe','ds2-expand-copy'],function(ds2Iframe,ds2expandCopy){
        try {
            new ds2Iframe($frameWindow.find('.ds2-iframe'));
            new ds2expandCopy($frameWindow.find('.ds2-expand--body-copy-container'));
        }
        catch (e) {
            console.error("could not initialise fallback component elements");
        }
    });
};
