/**
 * @author Andrei Dumitrescu
 * @description Article Overview component refactoring using AMD 
 */
define(
    'ds2-article-overview',
    [
        'use!jquery',
        'use!log',
        'use!foundation',
        'use!velocity',
        'use!isotope',
        'ds2-main'
    ], 
    function($) {
        'use strict';
        function ds2ArticleOverview(element) {
            var self = this;
            this.create(element);

            //The event it's used to reload the component
            self.element.parent().on('cq-edit-trigger-ds2', function() {
                var magazine = $(this).find('.ds2-magazine')[0];
                self.create(magazine);
            });
        };

        var proto = ds2ArticleOverview.prototype;

        proto.create = function(element) {
            var self = this;
            this.element = $(element);
            this.options = {
                // media queries ( different from stage 2)
                breakpointSmall: 480,
                breakpointMedium: 768,
                breakpointLarge: 1280,
                HERO_TEASER_CONTAINER: '.ds2-magazine--heroteaser',
                SHOW_MORE_BUTTON: '.js-ds2-magazine--overview-showmore',
                CATEGORY_CONTAINER: '.ds2-magazine--overview-filter',
                FILTER_CLICKABLE: '.ds2-magazine--overview-filter-clickable',
                ARTICLES_CONTAINER: '.ds2-magazine--overview-articles',
                CATEGORY_LIST: '.ds2-magazine--overview-category-list',
                OVERVIEW: '.ds2-magazine--overview',
                IMAGE_TEASER: 'imageteaser',
                TEXT_TEASER: 'textteaser',
                ANIMATION_DURATION: 250,
                MAGAZINE_HEADLINE : '.ds2-magazine--headline'
            };

            self._registerHandlebarHelpers();
            self.dataPath = null;
            self.heroTeaser = null;
            self.articles = null;
            self.vipArticlesLink = null;
            self.vipArticles = null;

            self.window = $(window);
            self.mediaQuery = null;
            self.isotopeElement = null;

            self.desktopStep = null;
            self.step = null;
            self.currentViewPort = null;
            self.prevViewport = null;
            self.tagName = null;

            self.currentIndex = 0;

            self.categories = [];

            self.indexPic = 0;
            self.isotopeFired = false;
            self.currentSplicedData = null;
            self.showFilters = false;
            self.showMore = false;
            self.showTags = false;

            self.tagHeadline = null;

            self.hideFilterString = null;
            self.showFilterString = null;

            self.currentIsotopeFilters = null;

            self.articlesSection = $(this.options.ARTICLES_CONTAINER, this.element);
            self.showMoreButton = $(this.options.SHOW_MORE_BUTTON, this.element);
            self.filterSection = $(this.options.CATEGORY_CONTAINER, this.element);
            self.filterClickable = $(this.options.FILTER_CLICKABLE, this.element);
            self.overview = $(this.options.OVERVIEW, this.element);
            self.categoryListContainer = $(this.options.CATEGORY_LIST, this.element);
            self.magazineHeadline = $(this.options.MAGAZINE_HEADLINE);

            self.showMoreButton.on('click', function(e) {
                e.preventDefault();

                var $this = this;

                self.currentIndex += self.step;
                self.element.addClass('ds2-magazine--overview-deactivate');

                self._transitionFilteringSorting(
                    function() {
                        $('.ds2-magazine--overview-articles', self.element).isotope({filter: self.currentIsotopeFilters.toString()});
                    },
                    function() {
                        self._trackEvent('ds2-articles-show-more', $this);
                    }
                );

                // remove inview event
                // (if layout is complete, event will be attached again)
                self._removeImageInviewEvent();
                self._showMoreManager();
            });

            if (self.overview.hasAttr('data-step')) {
                self.desktopStep = Number(self.overview.attr('data-step'));
            }

            self.desktopStep = self.desktopStep || 6;
            self._checkMediaQuery();

            $(window.digitals2.main).on('ds2ResizeSmall ds2ResizeMedium ds2ResizeLarge', self, Foundation.utils.throttle(function (e) {
                self._onResize(self);
            }, self.ANIMATION_DURATION*2));

            // listen for foundation image change and reinit layout
            self.window.on('resize.fndtn.interchange', function() {
                if (self.isotopeElement) {
                    self._reinitLayout();
                }
            });

            if (self.overview.hasAttr('data-vip-articles')) {
                self.vipArticlesLink = self.overview.attr('data-vip-articles').split(",");
            }else{
                self.vipArticlesLink =[];
            }

            if (self.overview.hasAttr('data-tag-over-view-page')) {
                self.showTags = JSON.parse(self.overview.attr('data-tag-over-view-page'));
            }

            if (self.overview.hasAttr('data-show-filters')) {
                self.showFilters = JSON.parse(self.overview.attr('data-show-filters'));
            }

            if (self.overview.hasAttr('data-showmore-button')) {
                self.showMore = JSON.parse(self.overview.attr('data-showmore-button'));
            }

            if (self.overview.hasAttr('data-hero-teaser-url')) {
                self.heroTeaser = self.overview.attr('data-hero-teaser-url');
            }

            if (self.overview.hasAttr('data-tag-error-message')) {
                self.errorMessage = self.overview.attr('data-tag-error-message');
            }

            if (self.overview.hasAttr('data-articles-url')) {
                self.dataPath = self._generateJsonPath(self.overview.attr('data-articles-url'));
                self._loadData();
            } else {
                throw 'data articles url needs to be set';
            }
        };

        proto._generateJsonPath = function(originalPath) {
            var dataPathSliced = originalPath.slice(0, originalPath.length - 5);
            var d1 = new Date();
            var year = d1.getUTCFullYear();
            var month = ('0' + (d1.getUTCMonth() + 1)).slice(-2);
            var dayInMonth = ('0' + d1.getUTCDate()).slice(-2);
            var hour = ('0' + d1.getUTCHours()).slice(-2);
            return dataPathSliced + '.' + year + month + dayInMonth + '-' + hour +'.json';
        };

        proto._onResize = function(self) {
            self._checkMediaQuery();
        };

        proto._checkMediaQuery = function () {
            var self = this;
            switch (window.digitals2.main.mediaQueryWatcherCheck()) {
                case 'ds2ResizeSmall':
                    self.step = Math.floor(self.desktopStep/2);
                    self.currentViewPort = 'small';
                    break;
                case 'ds2ResizeMedium':
                    self.currentViewPort = 'medium';
                    self.step = self.desktopStep;
                    break;
                default:
                    self.currentViewPort = 'large';
                    self.step = self.desktopStep;
                    self.choosedStep = self.desktopStep;
            }

            if(self.prevViewport !== self.currentViewPort){
                self.prevViewport = self.currentViewPort;
                if(self.isotopeElement) {
                    self._resizeLayout();
                }
            }
            else {
                if(self.isotopeElement) {
                    self._reinitLayout();
                }
            }
        };

        proto._showMoreManager = function () {
            var self = this;
            var query;
            //var numberOfelements;

            if (self.currentIsotopeFilters.length === 0) {
                query = $('.ds2-magazine--thumb', self.element);
            } else {
                query = $(self.currentIsotopeFilters.toString(), self.element);
            }

            //numberOfelements = query.length;
            if (self.currentIndex >= query.length) {
                self.showMoreButton.css('display', 'none');
            } else {
                self.showMoreButton.css('display', 'table');
                //self.showMoreButton.addClass("ds2-magazine--overview-showmore-visible");
            }
        };

        proto._createDynamicSizeClasses = function () {
            var self = this;
            // var articles = self.articles;
            var articles = _.map(self.articles, function (elem) {
                if (elem.hasOwnProperty('size')) {
                    elem.size = 'ds2-magazine--teaser-' + elem.size.toLowerCase();
                }
                if (elem.hasOwnProperty('background')) {
                    elem.background = 'ds2-magazine--teaser-background-' + elem.background.toLowerCase();
                }
                if (elem.hasOwnProperty('author')) {
                    if (elem.author.length === 0) {
                        delete elem.author;
                        delete elem.authorLabel;
                    } else {
                      if (elem.hideDate) {
                        elem.authorLabel = elem.authorLabel + ' ';
                      } else {
                        elem.authorLabel = ' | ' + elem.authorLabel + ' ';
                      }
                    }
                }
                if (elem.hasOwnProperty('text')) {
                    elem.text = 'ds2-magazine--teaser-text-' + elem.text.toLowerCase();
                }
                if (elem.hasOwnProperty('font')) {
                    elem.font = 'ds2-magazine--teaser-font-' + elem.font.toLowerCase();
                }

                if (elem.hasOwnProperty('textPosition')) {
                    elem.textPosition = 'ds2-magazine--teaser-textposition-' + elem.textPosition.toLowerCase();
                }
                return elem;
            });
            self.articles = articles;
        };

        proto._removeHeroTeaserFromData = function (teaserPath) {
            var self = this;
            var articles = self.articles;
            articles = _.filter(self.articles, function (elem) {
                return elem.articlepath !== teaserPath;
            });
            self.articles = articles;
        };

        proto._filterByTag = function (articles) {
            var self = this;
            var filteredarticles = [];
            var tagName = '${tagName}';
            var tagId = null;
            if (location.hash || self.showTags === true) {
                $(self.options.CATEGORY_CONTAINER, self.element).css('display', 'none');

                var hash = location.hash;
                var tagNameStart;
                var tagIdStart;

                if (hash.search('#/tagId=') > -1 && hash.includes('#/tagId=')) {
                    tagIdStart = hash.indexOf('#/tagId=');
                    if (hash.search('&tagName=') > -1 && hash.includes('&tagName=')) {
                        tagNameStart = hash.indexOf('&tagName=');

                        tagId = hash.substring(tagIdStart, tagNameStart);
                        tagId = tagId.replace('#/tagId=', '');

                        tagName = hash.substring(tagNameStart, hash.length);
                        tagName = tagName.replace('&tagName=', '');
                        var tagDecoded = self._decodeString(tagName);
                        tagName = tagDecoded ? tagDecoded : '${tagName}';
                    } else {
                        tagId = hash.substring(tagIdStart, hash.length);
                        tagId = tagId.replace('#/tagId=', '');
                    }

                    if (tagId.length > 0) {
                        var decoded = null;
                        decoded = self._decodeString(tagId);
                        if (decoded) {
                            filteredarticles = _.filter(articles, function (elem) {
                                var tags = elem.tags;
                                return _.contains(tags, decoded);
                            });
                        } else {
                            tagId = null;
                        }
                    }
                }
                self._setHeadlineText(tagId, tagName);
                return filteredarticles;
            }
            return articles;

        };

        proto._decodeString = function(stringToDecode) {
            var decoded = null;
            try {
                decoded = atob(stringToDecode);
            } catch(error) {
                log('Could not decode string');
            }
            return decoded;
        };

        proto._setHeadlineText = function(tagId, tagName) {
            // if no tagId, use error text
            // otherwise show tagName, even if null
            var self = this;
            var newHeadlineText = self.errorMessage;
            if (tagId) {
                var headlineText = self.magazineHeadline.text();
                newHeadlineText = headlineText.replace('${tagName}', tagName);
            }
            self.magazineHeadline.text(newHeadlineText);
        };

        proto._registerHandlebarHelpers = function () {
            Handlebars.registerHelper('x', function (expression) {
                var fn = function () {
                }, result;
                try {
                    fn = Function.apply(
                        this,
                        [
                            'window',
                            'return ' + expression + ';'
                        ]
                    );
                } catch (e) {
                    console.warn('[warning] {{x ' + expression + '}} is invalid javascript', e);
                }

                try {
                    result = fn.call(this, window);
                } catch (e) {
                    console.warn('[warning] {{x ' + expression + '}} runtime error', e);
                }
                return result;
            });
            Handlebars.registerHelper('xif', function (expression, options) {
                return Handlebars.helpers.x.apply(this, [expression, options]) ? options.fn(this) : options.inverse(this);
            });
        };

        proto._handleComplete = function () {
            var self = this;
            self._compileElements(self.articles, '#magazine-thumb-template', self.articlesSection);
            if (!self.isotopeFired) {
                self.currentIsotopeFilters = [];
                self._initIsotope();
                self.isotopeFired = true;
            }
        };

        proto._createElements = function () {
            var self = this;
            var end;
            if (self.currentIndex + self.step >= self.articles.length) {
                end = self.articles.length;
            } else {
                end = self.currentIndex + self.step;
            }

            self.currentSplicedData = self.articles.slice(self.currentIndex, end);
            self._handleComplete();
            self.currentIndex = end;
        };


        proto._addVipClasses = function (container){

          var self = this;
          var elements = container;
          var allElements = $('.ds2-magazine--thumb', container);
          var vipElementsLength = self.vipArticlesLink.length;

          allElements.each(function (index, element) {
            var link = $(element).find("a").attr('href').toString();
            var isContained = _.find(self.vipArticlesLink, function(item){ return item  === link });

            if (typeof isContained !== "undefined") {
              var vipArticleIndex = self.vipArticlesLink.indexOf(isContained);
              $(element).attr( "data-vip", vipElementsLength - vipArticleIndex);
            } else {
              $(element).attr( "data-vip", 0 );
            }
          });
        };

        proto._compileElements = function (data, template, container) {
            var self = this;
            var source = $(template).html();
            var compiledTemplate = Handlebars.compile(source);
            var html = compiledTemplate(data);
            var child = $(html).children();
            html = child.unwrap();

            // add in view functionality
            // add constants
            // a bit too dirty , change it next


            if (self.isotopeFired && container === self.articlesSection) {
                $(container).isotope('insert', html);

                setTimeout(function () {
                    self._reinitLayout();
                }, 100);

            } else {
                $(container).append(html);
            }
            if(container === self.articlesSection){
              self._addVipClasses();
            }


            self.element.find('.ds2-magazine--thumb').on('inview', function (event, isInView) {
                var $element = $(event.currentTarget),
                    $headline = $element.find('[data-component-path="ds2-bmwm-headline"]');

                if($headline.length){
                    require(['componentInitializer'], function(componentInitializer) {
                        componentInitializer.initAll($element);
                    });
                }

                $element.toggleClass('ds2-magazine--thumb-inviewport', isInView);
            });

            if (container === self.categoryListContainer) {
                var firstOne = $('.ds2-magazine--category-button', self.element).eq(0);
                firstOne.addClass('ds2-magazine--category-button-selected');
            }
        };

        proto._initIsotope = function () {
            var self = this;
            var init = true;
            self.isotopeElement = self.articlesSection.isotope({
                transitionDuration: 0,
                resizable: true,
                itemSelector: '.ds2-magazine--thumb',
                sortAscending: false,
                layoutMode: 'fitRows',
                fitRows: {
                    gutter: 30
                },
                getSortData: {
                    views: function ($elem) {
                        return parseInt($($elem).attr('data-articleviews'), 10);
                    },
                    time: function ($elem) {
                        return parseInt($($elem).attr('data-timestamp'), 10);
                    },
                    vip: function ($elem) {
                        return parseInt($($elem).attr('data-vip'), 10);
                    }

                }
            });

            $(document).foundation('interchange', 'reflow');
            self.isotopeElement.on('arrangeComplete', function () {
                self._addCustomClasses();
                self._reinitLayout();

                if(init) {
                    self._trackComponent();
                    init = false;
                }
            });

            self.isotopeElement.on('layoutComplete', function(event, laidOutItems) {
                // remove events and attach again
                self._removeImageInviewEvent();
                self._initImageInviewEvent();
            });

            // a bit of time out to make it work
            setTimeout(function () {
                self.isotopeElement.isotope({sortBy: [ 'vip','time']});
            }, 200);

            // add image loaded event
            self._initImageLoadedEvent();
        };

        proto._removeCustomClasses = function () {
            $('.ds2-magazine--thumb', this.element).removeClass('ds2-magazine--teaser-hidden ds2-magazine--thumb-odd');
        };

        proto._addCustomClasses = function () {
            var self = this;
            var arrayOrderedElements = [];
            var allElements = $('.ds2-magazine--thumb', self.element);
            var allElementsVisible = allElements.filter(':visible');

            allElementsVisible.each(function (index, element) {
                var sortableObj = {
                    y: $(element).offset().top,
                    x: $(element).offset().left,
                    element: $(element)
                };
                arrayOrderedElements.push(sortableObj);
            });

            var arrayOrderedElementsY = _.sortBy(arrayOrderedElements, 'y');
            var bidimensional = [];
            var initialY = 'undefined';
            var yElementsLenght = arrayOrderedElementsY.length;
            var firstOne;

            for (var i = 0; i < yElementsLenght; i++) {
                if (arrayOrderedElementsY[i].y !== initialY) {
                    firstOne = [];
                    initialY = arrayOrderedElementsY[i].y;
                    bidimensional.push(firstOne);
                }
                firstOne.push(arrayOrderedElementsY[i]);
            }

            var allElementsIndex = 0;
            yElementsLenght = bidimensional.length;
            var finalArray = _.flatten(bidimensional);
            allElements = finalArray.length;
            var singleElementsRowIndex = 0;

            for (var x = 0; x < yElementsLenght; x++) {
                var currentArray = bidimensional[x];
                var sortedCurrentArray = _.sortBy(currentArray, 'x');
                bidimensional[x] = sortedCurrentArray;
                var nestedArrayLenght = bidimensional[x].length;

                for (var k = 0; k < nestedArrayLenght; k++) {
                    if (nestedArrayLenght > 1) {
                        if (allElementsIndex < self.currentIndex) {
                            if (self.currentViewPort !== 'small') {
                                if (k % 2 === 1) {
                                    bidimensional[x][k].element.addClass('ds2-magazine--thumb-odd');
                                }
                            }
                        }
                    } else {
                        if (self.currentViewPort !== 'small') {
                            if (bidimensional[x][k].element.hasClass('ds2-magazine--teaser-m')) {
                                if (singleElementsRowIndex % 2 === 1) {
                                    bidimensional[x][k].element.addClass('ds2-magazine--teaser-right');
                                }else{
                                    bidimensional[x][k].element.removeClass('ds2-magazine--teaser-right');
                                }
                                singleElementsRowIndex++;
                            }
                        }
                    }
                    allElementsIndex++;
                }
            }

            finalArray = _.flatten(bidimensional);

            finalArray.forEach(function (item, index) {
                (item.element).attr('data-article-index', index);

                    if (index < self.currentIndex) {
                        item.element.removeClass('ds2-magazine--teaser-hidden');
                    } else {
                        item.element.addClass('ds2-magazine--teaser-hidden');
                    }
                }
            );
        };

        proto._transitionFilteringSorting = function (fadeOutCallback, fadeInCallback) {
            var self = this;
            self.element.addClass('ds2-magazine--overview-deactivate');
            $('.ds2-magazine--overview-articles', this.element)
                .velocity('stop')
                .velocity(
                    {opacity: 0},
                    {
                        duration: self.options.ANIMATION_DURATION,
                        complete: function () {
                            self._removeCustomClasses();
                            fadeOutCallback();
                        }
                    }
                ).velocity(
                {opacity: 1},
                {
                    duration: self.options.ANIMATION_DURATION,
                    complete: function () {
                        self.element.removeClass('ds2-magazine--overview-deactivate');
                        fadeInCallback();
                    }
                }
            );
        };

        proto._addSelectedClassSorting = function (element) {
            element.removeClass('ds2-magazine--overview-sorting-button');
            element.addClass('ds2-magazine--overview-sorting-button-selected');
        };

        proto._resetSortingButtons = function () {
            //var self = this;
            var sortingButtons = $('.ds2-magazine--overview-sorting-list >li >a');

            sortingButtons.each(function () {
                var sortingButton = $(this);
                if (sortingButton.hasClass('ds2-magazine--overview-sorting-button-selected')) {
                    sortingButton.removeClass('ds2-magazine--overview-sorting-button-selected');
                    if (!sortingButton.hasClass('ds2-magazine--overview-sorting-button')) {
                        sortingButton.addClass('ds2-magazine--overview-sorting-button');
                    }
                }
            });
        };

        proto._loadData = function () {
            var self = this;
            var promise = $.getJSON(self.dataPath);

            promise.done(function (data) {
                self.hideFilterString = data.hideFiltersLabel;
                self.showFilterString = data.expandFilterLabel;
                self.articles = data.articles;
                self._removeHeroTeaserFromData(self.heroTeaser);
                self._createDynamicSizeClasses();
                self.categories = data.categories;
                self.articles = self._filterByTag(self.articles);

                // create first set of thumbnails
                self._createElements();

                // create categories is data is set
                if (self.showFilters) {
                    self._compileElements(data.categories, '#magazine-thumb--category-template', self.categoryListContainer);
                    var categoryButton = $('.ds2-magazine--category-listitem > a', self.element);

                    self.filterClickable.on('click', function (e) {
                        e.stopPropagation();
                        var target = $(e.target);
                        var isCategory = target.hasClass('js-ds2-magazine--category-button') || target.hasClass('ds2-magazine--thumb-category-button');
                        var isSorting = target.hasClass('ds2-magazine--overview-sorting-button-selected') || target.hasClass('ds2-magazine--overview-sorting-button');
                        if (!isCategory && !isSorting) {
                            self.filterSection.toggleClass('ds2-magazine--overview-filter-closed');
                            var icon = $('.ds2-magazine--overview-filter-icon', self.element);
                            icon.toggleClass('ds2-magazine--overview-filter-icon-close');
                            icon.toggleClass('ds2-magazine--overview-filter-icon-open');
                        }
                        var hideTextDiv = $('.ds2-magazine--overview-filter-hide', self.element);
                        if (self.filterSection.hasClass('ds2-magazine--overview-filter-closed')) {
                            hideTextDiv.text(self.showFilterString);
                        } else {
                            hideTextDiv.text(self.hideFilterString);
                        }
                    });

                    // remove duplicate calls and so on
                    categoryButton.on('click', function (e) {
                        e.preventDefault();
                        var $this = $(this);

                        // reset all and show all
                        if ($this.attr('data-filter') === '*') {
                            $('.ds2-magazine--category-button', self.element).removeClass('ds2-magazine--category-button-selected');
                            $this.toggleClass('ds2-magazine--category-button-selected');
                            self.currentIsotopeFilters = [];
                            self._transitionFilteringSorting(
                                function () {
                                    $('.ds2-magazine--overview-articles', self.element).isotope({filter: '*'});
                                },
                                function() {
                                    self._trackEvent('ds2-articles-filter', $this);
                                }
                            );
                        } else {
                            // reset the first one
                            var showAll = $('.js-ds2-magazine--category-button', self.element).eq(0);
                            showAll.removeClass('ds2-magazine--category-button-selected');
                            $this.toggleClass('ds2-magazine--category-button-selected');

                            // activate show all
                            var selectedQuery = $('.ds2-magazine--category-button-selected', self.element);
                            if (selectedQuery.length === 0) {
                                selectedQuery.removeClass('ds2-magazine--category-button-selected');
                                showAll.addClass('ds2-magazine--category-button-selected');
                                self.currentIsotopeFilters = [];
                                self._transitionFilteringSorting(
                                    function () {
                                        $('.ds2-magazine--overview-articles', self.element).isotope({filter: '*'});
                                    },
                                    function() {
                                        self._trackEvent('ds2-articles-filter', $this);
                                    }
                                );
                            } else {
                                if ($this.hasAttr('data-filter')) {
                                    var selector = $this.attr('data-filter');
                                    if (selector !== '*') {
                                        selector = '.' + selector;
                                    }
                                    if ($this.hasClass('ds2-magazine--category-button-selected')) {
                                        self.currentIsotopeFilters.push(selector);
                                    } else {
                                        self.currentIsotopeFilters = _.without(self.currentIsotopeFilters, selector);
                                    }
                                    var selectors = self.currentIsotopeFilters.toString();

                                    self._transitionFilteringSorting(
                                        function () {
                                            $('.ds2-magazine--overview-articles', self.element).isotope({filter: selectors});
                                        },
                                        function() {
                                            self._trackEvent('ds2-articles-filter', $this);
                                        }
                                    );
                                }
                            }
                        }
                        self._showMoreManager();
                    });

                    var viewButton = $(self.options.CATEGORY_CONTAINER, self.element).find('.js-ds2-magazine--overview-filter-views');
                    var timeButton = $(self.options.CATEGORY_CONTAINER, self.element).find('.js-ds2-magazine--overview-filter-time');

                    viewButton.on('click', function (e) {
                        e.preventDefault();
                        if ($(this).hasClass('ds2-magazine--overview-sorting-button-selected')) {
                            return;
                        }
                        self._resetSortingButtons();
                        self._addSelectedClassSorting($(this));
                        self._transitionFilteringSorting(
                            function () {
                                $('.ds2-magazine--overview-articles', self.element).isotope({sortBy: 'views'});
                            },
                            function() {
                                self._trackEvent('ds2-articles-filter', $this);
                            }
                        );
                    });

                    timeButton.on('click', function (e) {
                        e.preventDefault();
                        if ($(this).hasClass('ds2-magazine--overview-sorting-button-selected')) {
                            return;
                        }
                        self._resetSortingButtons();
                        self._resetSortingButtons();
                        self._addSelectedClassSorting($(this));
                        self._transitionFilteringSorting(
                            function () {
                                $('.ds2-magazine--overview-articles', self.element).isotope({sortBy: 'time'});
                            },
                            function() {
                                self._trackEvent('ds2-articles-filter', $this);
                            }
                        );
                    });
                } else {
                    $('.ds2-magazine--overview-filter', self.element).css('display', 'none');
                }
            });

            promise.fail(function () {
                throw 'error loading the articles json data';
            });
        };

        proto._removeImageInviewEvent = function() {
            var self = this;
            // remove event
            self.element.find('img.ds2-lazy').off('inview');
        };

        proto._initImageInviewEvent = function() {
            var self = this;
            self.element.find('img.ds2-lazy').one('inview', function(event, isInView) {
                var $ele = $(event.currentTarget);
                // remove event from current target
                $ele.off('inview');
                if (isInView) {
                    // change img src
                    $ele.attr('src', $ele.attr('data-img'));
                }
            });
        };

        proto._initImageLoadedEvent = function() {
            var self = this;
            self.element.find('img.ds2-lazy').on('load', function(e) {
                if (!$(e.currentTarget).hasClass('ds2-loaded')) {
                    self._reinitLayout();
                }
                // remove events from current target
                $(e.currentTarget).off('load inview');
                // add class loaded, so _loadAllVisibleImages will not take care of this element anymore
                // remove class lazy, so foundation interchange replaces the src tag on resize
                $(e.currentTarget).toggleClass('ds2-loaded', true).toggleClass('ds2-lazy', false);
            });
        };

        proto._resizeLayout = function() {
            var self = this;

            // remove previous height & classes
            self.isotopeElement.height('auto');
            self._removeCustomClasses();

            // let isotope calculate new positions
            setTimeout(function () {
                self._reinitLayout();
            }, 100);

            // add new custom classes based on the new layout
            setTimeout(function () {
                self._addCustomClasses();
            }, 200);
        };

        proto._reinitLayout = function() {
            this.isotopeElement.isotope('layout');
        };

        proto._trackComponent = function() {
            var self = this;
            self.overview.trigger('ds2-articles-loaded');
        };

        proto._trackEvent = function(eventType, element) {
            var self = this;
            self.overview.trigger(eventType, element);
        };

        return ds2ArticleOverview;
        
    }
);
