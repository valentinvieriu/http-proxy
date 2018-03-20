var aemsearch = aemsearch || {};
aemsearch.$ = $;

/** Send data when 'Enter' key is pressed */
aemsearch.addEnterKeyListener = function(event){
    if(event.keyCode == 13 && jQuery('#aems-inputsearch-box').val()){
        event.preventDefault();
        jQuery("#aems-buttonsearch-box").click();
    }
};

/**
 * Redirect the search to searchResult.html, which will perform the real search
 * @param redirectUrl
 */
aemsearch.sendRedirect = function(){
    var redirectUrl = jQuery('#aems-buttonsearch-box-resultpage').attr('href');
    var searchTerm = jQuery('#aems-inputsearch-box').val();
    if (redirectUrl != undefined && searchTerm != null && searchTerm.length != 0) {
        window.location = redirectUrl + '#' +    aemsearch.$.base64.encode(aemsearch.$.toJSON({q:encodeURIComponent(searchTerm)}));
    }
};

/**
 * Register the event listeners
 *  - Register the enter key to the search field
 *  - Register the search button click
 */
jQuery(document).ready(function(){
    if (window['cookiecontroller'] && window['digitals2'] && window['digitals2']['tracking'] && window['digitals2']['tracking']['impl']) {
        var tracking = window.digitals2.tracking,
            ccApi = window.cookiecontroller.api;

        if (!ccApi.isInitialized()) {
            ccApi.registerOnInitialized(function () {
                    aemsearch.initComponent();
                }
            );
        }
        else {
            aemsearch.initComponent();
        }
    }
});

aemsearch.initComponent = function() {
    jQuery('#aems-inputsearch-box').keyup(function(event){
        aemsearch.addEnterKeyListener(event);
    });

    jQuery('#aems-buttonsearch-box, .aems-sf-searchbox .aems-sf-loupe').click(function(){
        aemsearch.sendRedirect();
    });
};


/**
 * initialize the autosuggest for the search field
 */
jQuery(function(){
	aemsearch.autosuggest({
        searchInputfieldID: 'aems-inputsearch-box',
        suggestrionsContainerID: 'aems-sf-overlay',
        listContainerClass: 'aems-sf-suggestions',
        itemEntryClass: 'aems-sf-suggestionentry',
        itemEntrySelectedClass: 'aems-sf-suggestionselected',
        itemEntryHighlightClass: 'aems-sf-suggestionmatch',
        searchFunction : function(value){
        	jQuery('#aems-inputsearch-box').val(value);
        	jQuery('#aems-buttonsearch').click()
        },
        fadeTime:  100,
        minCharsForAutoSuggest: 3
    });
	
	aemsearch.trackSearchFieldIdentification();
});