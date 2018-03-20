var aemsearch = aemsearch || {};

var console = window.console || { log: function() {},debug: function() {},dir: function() {}};


/*
 * AUSU jQuery-Ajax Auto Suggest http://www.oslund.ca/
 * 
 * @version 1.0.1 (Jan 28 2011)
 * 
 * @copyright Copyright (C) 2011 Isaac Oslund Dual licensed under the MIT and
 * GPL licenses. http://www.opensource.org/licenses/mit-license.php
 * http://www.opensource.org/licenses/gpl-license.php
 */

aemsearch.autosuggest = function(config) {
    var liTag, ulTag, regx, parentWrapper, offFocus, queryString;
    var suggestTimeOut = false;

    /*
     * default values for autosuggest function. will be overwritten when
     * initialized
     */
    var defaults = {
        searchInputfieldID : 'aems-inputsearch',
        suggestrionsContainerID : 'aems-sf-overlay',
        listContainerClass : 'aems-sf-suggestions',
        itemEntryClass : 'aems-sf-suggestionentry',
        itemEntrySelectedClass : 'aems-sf-suggestionselected',
        itemEntryHighlightClass : 'aems-sf-suggestionmatch',
        searchFunction : function(searchTerm) {
            console.debug("call searchFunction " + searchTerm);
        },
        fadeTime : 100,
        minCharsForAutoSuggest : 3
    };

    var config = jQuery.extend(defaults, config);
    jQuery("#" + config.searchInputfieldID).attr("autocomplete", "off");

    function getAutosuggestResult(data) {
        ulTag = jQuery('<ul/>')
        if (data.results && data.results.length > 0) {
            jQuery(ulTag).addClass(config.listContainerClass);
            jQuery(data.results)
                    .each(
                        function(indexList, value) {

                            liTag = jQuery('<li>'
                                    + value
                                            .replace(
                                                    regx,
                                                    "<em class='"
                                                            + config.itemEntryHighlightClass
                                                            + "'>$1</em>")
                                    + '</li>');
                            liTag.addClass(config.itemEntryClass);
                            ulTag.append(liTag);
                        })
        }
        parentWrapper.append(ulTag);
        registerMouseClick(config);
        jQuery(
            "#" + config.suggestrionsContainerID + " ul li."
                    + config.itemEntryClass).bind(
            'mouseover',
            function() {
                jQuery(this).parent().parent().find(
                        "li[class='" + config.itemEntryClass + " "
                                + config.itemEntrySelectedClass
                                + "']").removeClass(
                        config.itemEntrySelectedClass);
                jQuery(this).addClass(config.itemEntrySelectedClass);
            });
        };

    function buildLayerFromProxyResult(data, config) {
        if (data.query && data.results && data.results.length > 0) {
            queryString = data.query;
            parentWrapper = jQuery("#" + config.suggestrionsContainerID);

            jQuery(parentWrapper).html("");
            jQuery("#" + config.suggestrionsContainerID).fadeIn();

            regx = new RegExp("(?![^&;]+;)(?!<[^<>]*)(" + data.query + ")(?![^<>]*>)(?![^&;]+;)", "gi");
            getAutosuggestResult(data);
        } else {
            jQuery("#" + config.suggestrionsContainerID).fadeOut();
        }
    };

    function keyEventHandlerForSearchInputField(event, fieldChild,
            config, Self) {
        var $searchInputFieldReference = jQuery("#" + config.searchInputfieldID);
        switch (event.which) {
        /*
         * Event for key pressed @Key down arrow
         */
        case 40: {
            arrowKeyEvent(fieldChild, 'next', $searchInputFieldReference);
            break;
        }
            /*
             * Event for key pressed @Key up arrow
             */
        case 38: {
            arrowKeyEvent(fieldChild, 'prev', $searchInputFieldReference);
            break;
        }
            /*
             * Event for key pressed @Key escape
             */
        case 27: {
            jQuery("#" + config.suggestrionsContainerID).hide();
            break;
        }
            /*
             * Event for key pressed @Key enter
             */
        case 13: {
            if (suggestTimeOut) {
                window.clearTimeout(suggestTimeOut);
            }
            var selectedListElement = jQuery("li[class='"
                    + config.itemEntryClass + " "
                    + config.itemEntrySelectedClass + "'] a");
            if (typeof selectedListElement.attr("href") != "undefined"
                    && selectedListElement.attr("href")) {
                window.location.href = selectedListElement.attr("href");
                return false;
            } else {
                var qParam = $searchInputFieldReference.val();
                jQuery("#" + config.suggestrionsContainerID).hide();
                config.searchFunction(qParam);
                return false;
            }
            break;
        }
            /*
             * Event for key pressed @Key tab
             */
        case 9: {
            offFocus(Self);
            removeSelectedListClass();
            break;
        }
        }
    };

    function arrowKeyEvent(fieldChild, action,
            searchInputFieldReference) {
        var selectedListElement = -1;
        var allListItems = fieldChild.find("li."
                + config.itemEntryClass);
        allListItems.each(function(index, item) {
            if (jQuery(this).attr("class") == config.itemEntryClass + " "
                    + config.itemEntrySelectedClass + "") {
                selectedListElement = index;
            }
        });

        var newSel;
        if (selectedListElement >= 0) {
            var sel = fieldChild.find("li[class='"
                    + config.itemEntryClass + " "
                    + config.itemEntrySelectedClass + "']");
            if (action === 'next') {
                newSel = allListItems[selectedListElement + 1];
            } else {
                newSel = allListItems[selectedListElement - 1];
            }
            newSel = jQuery(newSel);
            newSel.addClass(config.itemEntrySelectedClass);
            sel.removeClass(config.itemEntrySelectedClass);

        } else {
            if (action === 'next') {
                newSel = fieldChild.find("li." + config.itemEntryClass
                        + ":first");
            } else {
                newSel = fieldChild.find("li." + config.itemEntryClass
                        + ":last");
            }
            newSel.addClass(config.itemEntrySelectedClass);
        }

        selectedListElement = jQuery("li[class='" + config.itemEntryClass
                + " " + config.itemEntrySelectedClass + "'] a");
        if (newSel && newSel.length > 0) {
            if (typeof selectedListElement.attr("href") != "undefined"
                    && selectedListElement.attr("href")) {
                searchInputFieldReference.val(queryString);
            } else {
                searchInputFieldReference.val(newSel.text());
            }
        } else if (queryString && queryString !== "") {
            searchInputFieldReference.val(queryString);
        } else {
            searchInputFieldReference.val("");
        }
    };// end arrowKeyEvent

    function eventForSuggestLayer(event) {
        /*
         * send autosuggest when not pressed this keys: right arrow, up
         * arrow left arrow, down arrow, enter, escape, tab
         */
        if (event.type === "focus"
                || (event.which != 39 && event.which != 37
                        && event.which != 38 && event.which != 40
                        && event.which != 13 && event.which != 27 && event.which != 9)) {
            if (suggestTimeOut) {
                window.clearTimeout(suggestTimeOut);
            }

            suggestTimeOut = window.setTimeout(function() {
                removeSelectedListClass();
                suggest(jQuery("#" + config.searchInputfieldID).val());
            }, 400);

        } else {
            var fieldChild = jQuery("#" + config.suggestrionsContainerID);
            var Self = this;

            /*
             * do anything else whith the key event
             */
            keyEventHandlerForSearchInputField(event, fieldChild, config, Self);
        }
    };
    var $searchInputField = jQuery("#" + config.searchInputfieldID);
    $searchInputField.bind('keyup paste focus',
        function(event) {
            eventForSuggestLayer(event);
        });

    registerMouseClick(config);

    function removeSelectedListClass() {
        jQuery("li." + config.itemEntryClass).removeClass(
                config.itemEntrySelectedClass);
    };

    $searchInputField.blur(function() {
        offFocus(this);
        removeSelectedListClass();
    });

    function suggest(dataInput) {
        if (dataInput.length < config.minCharsForAutoSuggest) {
            jQuery("#" + config.suggestrionsContainerID).fadeOut();
        } else {
            var contextPath=jQuery("#searchFieldContextPath").val();
            contextPath= typeof(contextPath) === "undefined" ? jQuery("#searchResultContextPath").val() : contextPath;
            jQuery.ajax({
                url : "/bin/public/aemsearch/suggest.json",
                dataType : "json",
                data : {
                    q : jQuery("#" + config.searchInputfieldID).val(),
                    p : contextPath
                },
                success : function(data) {
                    buildLayerFromProxyResult(data, config);
                }
            });
        }
    };

    offFocus = function(fieldChild) {
        jQuery("#" + config.suggestrionsContainerID).delay(config.fadeTime) .fadeOut();
        removeSelectedListClass();
    };

    function registerMouseClick(thisConfig) {
        var suggestionContainer = jQuery("#" + config.suggestrionsContainerID + " ul li." + config.itemEntryClass);

        if(suggestionContainer.length){
            suggestionContainer.bind("click", function() {
                            thisConfig.searchFunction(this.innerText);
                            jQuery("#" + config.suggestrionsContainerID)
                                    .fadeOut();
                        });
        }

    };
};
