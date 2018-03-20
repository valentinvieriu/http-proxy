define('ds2-accessories', ['use!jquery', 'historyManager'], function ($, historyManager) {
    'use strict';

    // constants
    var
    // CSS Classes
        bannerClass = 'md-acc-banner',
        dropDownDisable = 'ds2-dropdown-disabled',
        ds2DropDown = 'digitals2-ds2Dropdown',
        chooseMINIRangeInputClass = 'md-acc-selected-range',
        chooseMINISerieInputClass = 'md-acc-selected-serie',
        chooseMINIShelfWrapperClass = 'md-acc-filters',
        filterFormClass = 'md-acc-ff',
        itemLoadedClass = 'ds2-zso-accessory-show',
        itemsClass = 'ds2-zso-accessory',
        itemsLoadingClass = 'md-acc-loading',
        loadMoreContainerClass = 'ds2-acc-loadmore',
        noResultsSearchTermClass = 'md-acc-no-results-search',
        noResultsTemplateClass = 'md-acc-nr-temp',
        toppicksClass = 'md-toppicks',
        toppicksSelector = '.main .ds2-row-padding > .acs-commons-resp-colctrl-col',
    // Data attributes
        imageDataSrc = 'acc-img',
        dataTextLoadMore = 'textLoadmore',
        rangeNameData = 'rangeName',
        rangeCodeData = 'rangeCode', // url for range selector - eg /accessories.mini-3-door-2015.html
        modelCodeData = 'modelCode', // url for model selector - eg /accessories.mini-3-door-2015.one.html
        resultList = 'ds2-zso-list',
        accessoriesList = 'ds2-accessories-list',
        resultsNumber = 'ds2-zso-num-results--number',
        $accessorySkeletonClass = 'ds2-zso-accessory-skeleton',
    // Events
        events = {
            filter: 'md:accessories:filter',
            modelListbuilt: 'md:accessories:model:list:built'
        },
    // Settings
        itemsToShowInitially = 20,
        durationBetweenItemReveal = 83,

        itemsToShowPerLoadMore = 20;

    var ds2accessories = function (element) {
        this.element = $(element);
        this._create();
    };

    Object.assign(ds2accessories.prototype, {
        // State
        chooseMINIOpen: false,

        // content
        $noResults: undefined,
        joinText: '',
        previousSelectedRange: undefined,
        $allGroupElements: undefined,
        $allRangeElements: undefined,
        previousSelectedModel: undefined,
        isAccessoriesRoot: false,
        $accSkeletString: "",
        catalogAccessoriesPath: undefined,
        sectiomAccessoriesPath: undefined,

        _create: function () {
            var self = this,
                $accessories = this.element,
                $items = self.getItems($accessories),
                $skeleton = $accessories.find('.' + $accessorySkeletonClass),
                noResultsTemplate = $accessories.find('.' + noResultsTemplateClass).html();
            if ($skeleton) {
                var skeletonHtml = $skeleton.prop('outerHTML');
                if (skeletonHtml !== undefined) {
                    self.$accSkeletString = skeletonHtml.replace('data-src', 'src').replace('anchor', 'a').replace('ds2-zso-accessory-skeleton', '');
                }
            }

            this.$noResults = $(noResultsTemplate);
            if (this.$noResults.length != 0) {
                this.joinText = ' ' + this.$noResults.data('mdAccJoinText').trim() + ' ';
            }
            var accList = $accessories.find("." + accessoriesList);
            
            var $resultList = $accessories.find('.' + resultList);
            this.isAccessoriesRoot = $resultList.data('catalog-root');
            this.catalogAccessoriesPath = $resultList.data('catalog-accessories-path');
            this.sectionAccessoriesPath = $resultList.data('section-accessories-path');
            
            if (!this.isAccessoriesRoot) {
                self._hideToppicks();
            }

            self.init($accessories);
            self.initialiseEventHandlers($accessories);
            if ($items.length) {
                self.initialiseItems($accessories, $items);
            } else {
                self._showNoResults(accList);
            }

            if (!this.isAccessoriesRoot) {
                self._removeToppicks();
            }
        },

        /**
         * Init call
         */
        init: function ($accessories) {
            var $filters = $accessories.find('.md-acc-filters'),
                $categoriesSelect = $("#categorySelection"),
                $groupsSelect = $("#categoryOptGroup"),
                $seriesSelect = $("#seriesSelection"),
                $rangeSelect = $("#rangeSelection"),
                filterBlock = $(".md-acc-ff"),
                self = this,
                $catproddata = $filters.children('.md-acc-categories'),
                $seriesrangesdata = $filters.children('.bmw-series-ranges');

            self.$allGroupElements = self.initializeFiltersDom($catproddata, $categoriesSelect, $groupsSelect);
            self.$allRangeElements = self.initializeFiltersDom($seriesrangesdata, $seriesSelect, $rangeSelect);

            $(filterBlock).click(function (evt) {
                if ($(this).hasClass("ds2-filtering")) {
                    evt.stopPropagation();
                    evt.preventDefault();
                }
            });

            /*
             * Check to see if there is actually a previously selected model. If not, we dont set the val
             * because otherwise this will overwrite the value from the back-end.
             */
            if (this.previousSelectedRange) {
                $accessories.find('input[name=range]').val(this.previousSelectedRange);
            }

            if (this.previousSelectedModel) {
                $accessories.find('input[name=model]').val(this.previousSelectedModel);
            }
            self.hideAnimation();
        },
        
        _addQueryParams: function (url) {
            if (url === undefined) {
                return url;
            }
            var query = window.location.search;
            var i = url.indexOf('?');
            if (i != -1) {
                return url;
            }
            return url + query;
        },

        /**
         * initialise the DOM content for the category and group drop downs
         * @function initializeFiltersDom
         * @memberOf mini.digital.comp.accessories
         * @private
         * @param {jQuery} $accessories DOM element for the accessories component instance
         */
        initializeFiltersDom: function ($rawData, $parentSelect, $childSelect) {
            var self = this,
                $allChildElements = undefined;

            $parentSelect.empty();
            $childSelect.empty();

            $rawData.children().each(function (index, element) {
                var $_element = $(element),
                    $anchor = $_element.children('a'),
                    text,
                    target;

                if ($anchor.length) {
                    text = $anchor.text();
                    target = self._addQueryParams($anchor.attr('href'));
                }

                if (text === undefined || target === undefined) {
                    return;
                }

                var $parentOption = $('<li class="ds2-dropdown-js--item" data-parent-target="' + target + '"> <a class="ds2-dropdown--link">' + text + '</a></li>');
                $parentOption.addClass($_element.attr("class"));

                if ($anchor.data('selected')) {
                    $parentOption.addClass("active");
                    $childSelect.parent().removeClass("ds2-dropdown-disabled");
                }

                $parentSelect.append($parentOption);
                //$childSelect.append($categoryOptGroup);

                $_element.children('ul').children().each(function (index, childElement) {
                    var $_childElement = $(childElement),
                        $childAnchor = $_childElement.children('a'),
                        childText,
                        childTarget;
                    if ($childAnchor.length) {
                        childText = $childAnchor.text();
                        childTarget = self._addQueryParams($childAnchor.attr('href'));
                    }

                    var $childOption = $('<li class="ds2-dropdown-js--item" data-child-target="' + childTarget + '"data-parent-text=' + encodeURI(text.trim()) + '> <a class="ds2-dropdown--link">' + childText + '</a></li>');

                    if ($childAnchor.data('selected')) {
                        $childOption.addClass("active");
                    }
                    $childSelect.append($childOption);
                });
            });

            self.reInitializeDropdown($parentSelect);
            //Need this class variables for updating the group dropdwn when category clicked
            $allChildElements = $childSelect.children();
            this.updateChildSelect($parentSelect, $childSelect, $allChildElements);

            !$parentSelect.find("li.active").length ? $parentSelect.find("li:first").addClass("active") : "";
            !$childSelect.find("li.active").length ? $childSelect.find("li:first").addClass("active") : "";

            return $allChildElements;
        },

        /**
         * This utility method os used to re-initialize dropdowns
         * @function reInitializeDropdown
         * @memberOf mini.digital.comp.accessories
         * @param drpdwn
         */
        reInitializeDropdown: function (drpdwn) {
            var controller = drpdwn.parent().data("controller");
            if (controller) {
                controller._create();
            }
        },

        /**
         * initialise event handlers for the filter select - namely that when a category is selected, the related groups are shown in the groups drop down
         * @function initialiseFilterSelectEventHandlers
         * @memberOf mini.digital.comp.accessories
         * @private
         * @param {jQuery} $accessories DOM element for the accessories component instance
         */

        initialiseFilterSelectEventHandlers: function ($accessories) {

            var $categoriesSelect = $("#categorySelection"),
                $groupsSelect = $("#categoryOptGroup"),
                $seriesSelect = $("#seriesSelection"),
                $rangeSelect = $("#rangeSelection"),
                self = this;

            $categoriesSelect.on('closed.fndtn.dropdown', function (event, dropdwon, item) {
                if (self.isOptionItemClicked(item)) {
                    var selectedOption = $categoriesSelect.find("li.active");
                    if (selectedOption && !selectedOption.hasClass("default")) {
                        $groupsSelect.parent().removeClass(dropDownDisable);
                        self.updateChildSelect($categoriesSelect, $groupsSelect, self.$allGroupElements);
                    } else {
                        self._resetParentSelect($groupsSelect, self.$allGroupElements);
                    }
                    $accessories.find(".md-acc-ff").submit();
                }
            });

            $groupsSelect.on('closed.fndtn.dropdown', function (event, dropdwon, item) {
                if (self.isOptionItemClicked(item)) {
                    var selectedOption = $groupsSelect.find("li.active");
                    if (selectedOption && !selectedOption.hasClass("default")) {
                        $accessories.find(".md-acc-ff").submit();
                    }
                }
            });

            $seriesSelect.on('closed.fndtn.dropdown', function (event, dropdwon, item) {
                if (self.isOptionItemClicked(item)) {
                    var selectedOption = $seriesSelect.find("li.active");
                    if (selectedOption && !selectedOption.hasClass("default")) {
                        $rangeSelect.parent().removeClass(dropDownDisable);
                        self.updateChildSelect($seriesSelect, $rangeSelect, self.$allRangeElements);
                    } else {
                        self._resetParentSelect($rangeSelect, self.$allRangeElements);
                    }
                    self._seriesRangeSelected();
                }
            });

            $rangeSelect.on('closed.fndtn.dropdown', function (event, dropdwon, item) {
                if (self.isOptionItemClicked(item)) {
                    var selectedOption = $rangeSelect.find("li.active");
                    if (selectedOption && !selectedOption.hasClass("default")) {
                        self._seriesRangeSelected();
                    }
                }
            });
        },

        /**
         * Reset parent dropdown is chosen. child select has to be restted to firstelement.
         * @param event
         * @returns {*}
         */
        _resetParentSelect: function (childSelect, rawData) {
            var $drpDwnElement = childSelect.parent(),
                $title = $('.ds2-dropdown-js--title', $drpDwnElement);
            var defaultText = $drpDwnElement.data("defaultText");
            $title.text(defaultText);
            childSelect.empty();
            //Remove the active elements from childGroup
            $(rawData).map(function () {
                $(this).removeClass("active");
            });
            $drpDwnElement.addClass(dropDownDisable);
            this.reInitializeDropdown(childSelect);
        },
        
        getToppicks: function() {
        	var toppicks = $(toppicksSelector).parent();
        	toppicks = toppicks.slice(1, toppicks.length-1);
        	return toppicks;
        },
        
        /**
         * Check weather event came from option.
         * @param event
         * @returns {*}
         */
        isOptionItemClicked: function (item) {
            return item && item.hasClass("ds2-dropdown-js--item");
            //&& target.hasClass("active");
        },

        /**
         * populate $groupsSelect with the content from $allGroups that falls under the category selected in $categoriesSelect
         * @function updateGroupSelect
         * @memberOf mini.digital.comp.accessories
         * @private
         * @param {jQuery} $parentSelect the select dom element for categories
         */
        updateChildSelect: function ($parentSelect, $childSelect, $completeList) {
            var self = this;

            var selectedParentVal = encodeURI($parentSelect.children('.active').text().trim());
            var activeElement = undefined;

            var dataList = $($completeList).map(function () {
                if ($(this).data("parentText") === selectedParentVal) {
                    if ($(this).hasClass("active")) {
                        activeElement = this;
                    }
                    return this;
                }
            }).get();

            !activeElement ? $(dataList[0]).addClass("active") : "";

            $childSelect.empty().append(dataList);
            self.reInitializeDropdown($childSelect);
        },

        /**
         * given the accessories dom object, returns an array of all items (whether shown or not)
         * @function getItems
         * @memberOf mini.digital.comp.accessories
         * @private
         * @param {jQuery} $accessories DOM element for the accessories component instance
         * @return {jQuery} an array of all items
         */
        getItems: function ($accessories) {
            return $accessories.find('.' + itemsClass);
        },

        /**
         * Initialise all per-instance event handlers needed by the accessories component
         * @function initialiseEventHandlers
         * @memberOf mini.digital.comp.accessories
         * @private
         * @param {jQuery} $accessories DOM element for the accessories component instance
         */
        initialiseEventHandlers: function ($accessories) {
            var self = this;
            $accessories.on('click', '.' + loadMoreContainerClass, function (e) {
                self.loadMoreClicked(e)
            });

            $accessories.on('submit', '.' + filterFormClass, function (e) {
                self._filterSubmitted(e);
            });
            self.initialiseFilterSelectEventHandlers($accessories);
        },

        /**
         * Initialise the full set of items, when first added to the page.
         *
         * This is called on page load or after a filter submit, but not on Load More.
         *
         * @function initialiseItems
         * @memberOf mini.digital.comp.accessories
         * @private
         * @param {jQuery} $accessories DOM element for the accessories component instance
         * @param {jQuery} $items all items (passed in to avoid having to look up a second time)
         */
        initialiseItems: function ($accessories, $items) {
            var self = this;
            // on first load, reveal the first 9 items
            this.showItems($accessories, $items.slice(0, itemsToShowInitially), true);
            //if there are more than 9 items, ensure load more is visible, else ensure it is hidden
            if ($items.length > itemsToShowInitially) {
                self.ensureLoadMoreVisible($accessories);
            } else {
                self.ensureLoadMoreHidden($accessories);
            }
        },

        /**
         * Shows a set if item in the results panel
         *
         * @function showItems
         * @memberOf mini.digital.comp.accessories
         * @private
         * @param {jQuery} $accessories DOM element for the accessories component instance
         * @param {jQuery} $items the set of items to show
         * @param {boolean} animate if true, adds a delay between revealing each item
         *
         */
        showItems: function ($accessories, $items, animate) {
            var self = this,
                accList = $accessories.find("." + accessoriesList),
                $accessorySkeleton = $accessories.find('.' + $accessorySkeletonClass),
                rowcount = 0,
                newRow;
            $items.each(function (index, item) {
                if (rowcount === 0) {
                    newRow = accList.append($('<div class="row" ></div>'));
                }
                var $item = $(item);
                rowcount++;
                var itemDom = self.showItem($item, $accessorySkeleton);
                itemDom.css({ opacity: 0 });
                itemDom.velocity({ opacity: 1 }, { duration: 400 });
                newRow.append(itemDom);

                if (rowcount === 4) {
                    rowcount = 0;
                }
            });
        },

        /**
         * Shows a specific item in the results panel.
         *
         * @function showItem
         * @memberOf mini.digital.comp.accessories
         * @private
         * @param {Element} item The item to show
         */
        showItem: function ($item, skelet) {
            var self = this,
                accData = self.collectItemData($item),
                accDomStr = self.$accSkeletString,
                regExp = /(?:){{acc.(.*?)}}/g;
            $item.addClass(itemLoadedClass);

            var match = regExp.exec(accDomStr);
            while (match != null) {
                accDomStr = accDomStr.replace(match[0], accData[match[1]]);
                match = regExp.exec(accDomStr);
            }
            return $(accDomStr);
        },
        /**
         * collects the data from item to fill it in skeleton
         *
         * @function collectItemData
         * @memberOf mini.digital.comp.accessories
         * @private
         * @param {Element} item The item to show
         */

        collectItemData: function ($item) {
            var accData = {};

            accData ['accUrl'] = this._addQueryParams($item.find('a').attr('href'));
            accData ['accLink'] = $item.data('accLink');
            accData ['accName'] = $item.data('accName');
            accData ['accImgSrc'] = $item.data('accImgSrc');

            var priceDiv = $item.find("[data-acc-price]");
            var priceAvailable = $item.data('accPriceAvailable');
            if (priceDiv.length) {
                accData ['accPrice'] = $item.data('accFrom') + " " + priceDiv.data('accPrice');
            } else if (priceAvailable) {
                accData ['accPrice'] = $item.data('accPriceOnReq');
            } else {
            	accData ['accPrice'] = '';
            }


            /*var img = $item.find("img");

            accData ['img.uuid'] = img.data('uuid');
            accData ['img.src'] = img.data('img');
            accData ['tracking '] = img.data('trackingEvent');
*/
            return accData;
        },


        /**
         * Ensures that the load more button is hidden
         * @param {jQuery} $accessories DOM element for the accessories component instance
         */
        ensureLoadMoreHidden: function ($accessories) {
            $accessories.find('.' + loadMoreContainerClass).remove();
        },

        /**
         * Ensures that the load more button is visible
         * @function ensureLoadMoreVisible
         * @memberOf mini.digital.comp.accessories
         * @private
         * @param {jQuery} $accessories DOM element for the accessories component instance
         */
        ensureLoadMoreVisible: function ($accessories) {
            var self = this;
            var $loadMoreContainer = $accessories.find('.' + loadMoreContainerClass);
            if (!$loadMoreContainer.length) {
                $loadMoreContainer = self.createLoadMore($accessories.find('.' + chooseMINIShelfWrapperClass).data(dataTextLoadMore));
                $accessories.append($loadMoreContainer);
            }
        },

        /**
         * Creates DOM content for 'Load More' button and container
         * @function createLoadMore
         * @memberOf mini.digital.comp.accessories
         * @private
         * @param {string} text the text content for the button
         * @return {jQuery} new DOM content for load more container
         */
        createLoadMore: function (text) {
            var respLine = $('<span class="ds2-button--responsive-line"></span>'),
                $loadMoreButton = $('<a></a>').addClass("ds2-tracking-js--event button expand ").append(respLine),
                $loadMoreContainer = $('<div></div>').addClass("columns small-12 medium-6 large-4 small-centered ds2-acc-loadmore").append($loadMoreButton);

            respLine.html(text);
            return $loadMoreContainer;
        },

        /**
         * Loads data from the server for the selected filter options.
         * @function loadData
         * @memberOf mini.digital.comp.accessories
         * @private
         * @param {jQuery} $accessories DOM element for the accessories component instance
         * @param {string} url end point to load the accessories data from
         */
        loadData: function ($accessories, url, callBack, ref) {
            var self = this,
                accList = $accessories.find("." + accessoriesList),
                $categoriesSelect = $("#categorySelection");
            self.showAnimation();

            if (self.isAccessoriesRoot) {
                self._hideToppicks();
            }
            //console.log("call ajax:", url);
            $.when(self.ajaxCall(url)).done(
                function (ajaxResponse) {
                    var $ajaxResponse = $(ajaxResponse),
                        $newItems = $ajaxResponse.find('.' + itemsClass),
                        $newResults = $ajaxResponse.find('.' + resultsNumber).text();

                    $accessories.find('.' + resultsNumber).text($newResults);
                    // remove toppicks, if starting form catalog root page

                    accList.animate({"visibility": 0}, 500);

                    // check if any results returned
                    accList.empty();
                    if ($newItems.length) {
                        accList.append($newItems);
                    } else {
                        self._showNoResults(accList);
                    }
                    accList.animate({"visibility": 1}, 500);
                    if (callBack) {
                        callBack(ajaxResponse, ref);
                    }

                    if (self.isAccessoriesRoot) {
                        self._removeToppicks();
                        self.isAccessoriesRoot = false;
                    }

                    var historyUrl = url.replace(new RegExp(self.getNestedAccessoriesPath()), '');
                    historyUrl = historyUrl.replace(/\.nossi\.html/, '.html');
                    historyUrl = historyUrl.replace(/\.all\.html/, '.html');
                    //console.log("done ajax:", url, historyUrl);
                    self.pushHistoryState(historyUrl, self.getTitleFromAjaxResponse(ajaxResponse));
                    self.initialiseItems($accessories, self.getItems($accessories));
                    self.hideAnimation();
                }).fail(function () {
                    self.hideAnimation();
                });
        },

        getNestedAccessoriesPath: function() {
        	if (this._getSelectedIsFirstOption('#categorySelection')) {
        		return this.catalogAccessoriesPath;
        	} else {
        		return this.sectionAccessoriesPath;
        	}
        },
        
        showAnimation: function () {
            $('.ds2-preloading-content').velocity({ opacity: 0 }, { duration: 400 });
            $('.ds2-preloader-wrapper').velocity({ opacity: 1 }, { duration: 400, complete: function () {
                $(this).css({'display': 'block'});
            } });

            var filterBlock = $(".md-acc-ff");
            filterBlock.addClass("ds2-filtering");
        },

        hideAnimation: function () {
        	var preloadingOpacity = this.isAccessoriesRoot ? 0 : 1;
            $('.ds2-preloading-content').velocity({ opacity: preloadingOpacity }, { duration: 400 });
            $('.ds2-preloader-wrapper').velocity({ opacity: 0 }, { duration: 400, complete: function () {
                $(this).css({'display': 'none'});
            } });

            var filterBlock = $(".md-acc-ff");
            filterBlock.removeClass("ds2-filtering");
        },

        _showNoResults: function (accList) {
            accList.append(this.$noResults);
            var $searchTerm = this.$noResults.find('.' + noResultsSearchTermClass);

            // display the options selected
            var selectedSeries = this._getSelectedLabel('seriesSelection');
            var selectedRange = this._getSelectedLabel('rangeSelection');
            var selectedCategory = this._getSelectedLabel('categorySelection');
            var selectedGroup = this._getSelectedLabel('categoryOptGroup');
            var searchTermText = "'" + selectedSeries + "'" + this.joinText +
            	"'" + selectedRange + "'" + this.joinText +
            	"'" + selectedCategory + "'" + this.joinText +
                "'" + selectedGroup.replace(/\(.*?\)/g, '').trim() + "'";

            $searchTerm.text(searchTermText);

        },

        /**
         * Gets the page title from an ajax response
         * @function getTitleFromAjaxResponse
         * @memberOf mini.digital.comp.accessories
         * @private
         * @param {string} ajaxResponse html content from the server
         * @return {string} page title
         */
        getTitleFromAjaxResponse: function (ajaxResponse) {
            return $(ajaxResponse).find('html head title').text();
        },

        /**
         * Updates the url to reflect newly loaded data/filters
         * @function pushHistoryState
         * @memberOf mini.digital.comp.accessories
         * @private
         * @param {string} uri uri of target page
         * @param {string} title title of target page
         */
        pushHistoryState: function (uri, title) {
            var state = {
                uri: uri
            };
            if (title !== undefined) {
                state.title = title;
            }
            historyManager.pushState(state);
        },

        /**
         * gets the accessories items element if it exists, else creates and appends a new ul to the dom if it doesn't
         * @function getOrCreateItemsElement
         * @memberOf mini.digital.comp.accessories
         * @private
         * @param {jQuery} $accessories the accessories element
         * @return {jQuery} the accessories items element
         */
        getOrCreateItemsElement: function ($accessories) {
            var $items = $accessories.find('.' + itemsClass);
            if (!$items.length) {
                $items = $('<ul></ul>').addClass(itemsClass);
                $accessories.append($items);
            }
            return $items;
        },

        /**
         * Makes a call to the server to get the results for a specific filter selection.
         *
         * @function ajaxCall
         * @memberOf mini.digital.comp.accessories
         * @private
         * @param {string} url end point to load the accessories data from
         * @return {jQuery} A jQuery defer that returns an array of accessory items
         */
        ajaxCall: function (url) {
            var settings = {
                type: 'GET',
                url: url,
                timeout: 30000,
                error: function (jqXHR, textStatus, errorThrown) {
                    console.log('WARN: accessories.ajaxCall: ajax-call returned error "' + textStatus + '" using call settings:', settings);
                }
            };
            return $.ajax(settings);
        },

        /**
         * Finds the first 9 items that are not marked with a class 'md-acc-item-show' and shows them
         * @function showNextSet
         * @memberOf mini.digital.comp.accessories
         * @private
         * @param {jQuery} $accessories DOM element for the accessories component instance
         */
        showNextSet: function ($accessories) {
            var self = this;
            var $items = self.getItems($accessories),
                $hiddenItems = $items.not('.' + itemLoadedClass);

            self.showItems($accessories, $hiddenItems.slice(0, itemsToShowPerLoadMore), true);
            if ($hiddenItems.length > itemsToShowPerLoadMore) {
                self.ensureLoadMoreVisible($accessories);
            } else {
                self.ensureLoadMoreHidden($accessories);
            }
        },

        /**
         * Parses the accessories filter and calculates the URL that should be used for AJAX load or page refresh
         *
         * Takes in to account:
         *     - selected category
         *     - selected group
         *     - selected range
         *     - selected model
         *
         *  url format {category}/{group}.{range}.{model}.html
         *
         * @function getSelectedFilterUrl
         * @memberOf mini.digital.comp.accessories
         * @private
         * @param {jQuery} $accessories The accessories component DOM element
         * @return {string} The url that will list accessories for the selected filters
         */
        getSelectedFilterUrl: function ($accessories) {
            //if the groups drop down has a selected item with a val, use that
            var $groupSelectedOption = this._getSelectedOption('#categoryOptGroup'),
                $categoriesSelectedOption = this._getSelectedOption('#categorySelection'),
                $serieSelectedOption = this._getSelectedOption('#seriesSelection'),
                $rangeSelectedOption = this._getSelectedOption('#rangeSelection'),
                url = undefined;


            if ($groupSelectedOption.length > 0) {
                url = $groupSelectedOption.data("childTarget")
            }

            if (!url) {
                //otherwise use the value selected in the category drop down
                url = $categoriesSelectedOption.data("parentTarget")
            }

            // if no category was selected use current page url for model selection
            if (url === undefined) {
                url = window.location.href;
            }

            var selector = undefined;

            //Check weather the first element of Range selector is selected. which is "All Ranges" for a serie.

            if ($rangeSelectedOption && !this._getSelectedIsFirstOption('#rangeSelection')) {
                selector = this._getSerieRangeSelector($rangeSelectedOption.data("childTarget"));
            }
            // add series
            if (selector === undefined && $serieSelectedOption) {
                selector = this._getSerieRangeSelector($serieSelectedOption.data("parentTarget"));
            }
            if (selector === undefined) {
            	// make sure that the result are coming from the backend
            	selector = '.all'; 
            }
            if (selector !== undefined) {
                url = url.replace(/(\.[^\.]*)?\.html/, this.getNestedAccessoriesPath() + selector + '.nossi.html');
            }
            return url;

        },

        _getSelectedUrl: function (parent, child) {
            var url = undefined;

            if (child.length > 0) {
                url = child.data("group-target")
            }

            if (!url) {
                //otherwise use the value selected in the category drop down
                url = $categoriesSelectedOption.data("category-target")
            }
            var $select = $(dropDownSelector);
            var $selectedOption = $select.find("li.active");
            return $selectedOption;
        },


        _getSelectedOption: function (dropDownSelector) {
            var $select = $(dropDownSelector);
            var $selectedOption = $select.find("li.active");
            return $selectedOption;
        },

        /**
         * This is to find out weather first element in the list is selected.
         * @param dropDownSelector
         * @returns {*}
         * @private
         */
        _getSelectedIsFirstOption: function (dropDownSelector) {
            var $select = $(dropDownSelector);
            var $selectedOption = $select.find("li.active");
            var firstLi = $('ul' + dropDownSelector + ' li:first');
            return $selectedOption.is(firstLi);
        },

        _getSerieRangeSelector: function (targetUrl) {
            var match = /(\.[^\.]*)?\.html/.exec(targetUrl);
            return match != null ? match[1] : undefined;
        },

        _getSelectedLabel: function (dropDownSelector) {
            var $selectedAnchor = this.element.find('[data-dropdown="' + dropDownSelector + '"]');
            return $selectedAnchor.text().trim();
        },

        /**
         * Event handlers
         */

        /**
         * Called when a user submits the filter form
         * @function filterSubmitted
         * @memberOf mini.digital.comp.accessories
         * @private
         * @param {Event} event User event
         */
        _filterSubmitted: function (event) {
            var self = this,
                $accessories = $(event.delegateTarget),
                url = self.getSelectedFilterUrl($accessories);
            self.loadData($accessories, url);
            event.preventDefault();
        },

        /**
         * Called when a user submits the filter form
         * @function filterSubmitted
         * @memberOf mini.digital.comp.accessories
         * @private
         * @param {Event} event User event
         */

        _seriesRangeSelected: function () {
            var self = this,
                $accessories = this.element,
                url = self.getSelectedFilterUrl($accessories);
            self.loadData($accessories, url, self.callBackForModelSelection, self);
        },

        _hideToppicks: function () {
            var toppicks = this.getToppicks();
            toppicks.animate({"opacity": 0}, 500);
        },


        _removeToppicks: function () {
            var toppicks = this.getToppicks();
            toppicks.empty();
        },


        callBackForModelSelection: function (ajaxResponse, ref) {
            var $categoriesSelect = $("#categorySelection"),
                $groupsSelect = $("#categoryOptGroup");
            var $filters = $(ajaxResponse).find('.md-acc-filters'),
                $catproddata = $filters.children('.md-acc-categories');

            ref.$allGroupElements = ref.initializeFiltersDom($catproddata, $categoriesSelect, $groupsSelect);
        },


        /**
         * Called when a user clicks on the load more button
         * @function loadMoreClicked
         * @memberOf mini.digital.comp.accessories
         * @private
         * @param {Event} event User event
         */
        loadMoreClicked: function (event) {
            var self = this;
            var $accessories = $(event.delegateTarget);
            self.showNextSet($accessories);
            event.preventDefault();
        },

    });

    return ds2accessories;
});