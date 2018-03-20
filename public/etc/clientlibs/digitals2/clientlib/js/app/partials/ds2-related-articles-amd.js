/**
 * partial: related-articles
 */
define( 'ds2-related-articles', [
    'use!jquery',
    'use!lodash',
    'use!isotope',
    'use!handlebars',
    'ds2-main'
], function( $ ) {
    var RelatedArticles = function( element ) {
        var self = this;
        self._init(element);

        //The event it's used to reload the component
        self.$element.parent().on('cq-edit-trigger-ds2', function() {
            var article = $(this).find('.ds2-related-articles')[0];
            self._init(article);
        });
    };
    /**
     * Store the related article object prototype
     * @type {object}
     */
    var proto = RelatedArticles.prototype;


    /**
     * Initialize the the Article
     * @param  {object} element
     */
    proto._init = function(element){
        var self = this;
        self.$element = $(element);
        // register handlebar helpers
        self._registerHandlebarHelpers();
        self.options = {
            // media queries ( different from stage 2)
            ANIMATION_DURATION: 250,
            ARTICLES_CONTAINER: '.ds2-related-articles--container',
            SHOW_MORE_BUTTON: '.js-ds2-magazine--overview-showmore',
            HEADLINE: '.ds2-related-articles--headline'
        };
        self.articles = null;
        self.choosedStep = null;
        self.currentArticle = null;
        self.currentIndex = 0;
        self.dataPath = null;
        self.dataTags = null;
        self.dataTopArticles = null;
        self.desktopStep = null;
        self.isotopeElement = null;
        self.mobileStep = null;
        self.tabletStep = null;
        self.topArticles = [];
        self.window = $(window);
        self.relatedArticlesHeadline = $(self.options.HEADLINE, self.$element);
        self.relatedArticlesContainer = $(self.options.ARTICLES_CONTAINER, self.$element);
        self.showMoreButton = $(self.options.SHOW_MORE_BUTTON, self.$element);
        self.showMoreButton.css('display', 'none');
        self.relatedArticlesContainer.css({'height': 0, 'opacity': 0});
        // update the step properties based on the data attributes
        if (self.$element.hasAttr('data-step-destktop')) {
            self.desktopStep = Number(self.$element.attr('data-step-destktop')) || 3;
        }
        if (self.$element.hasAttr('data-step-tablet')) {
            self.tabletStep = Number(self.$element.attr('data-step-tablet')) || 2;
        }
        if (self.$element.hasAttr('data-step-mobile')) {
            self.mobileStep = Number(self.$element.attr('data-step-tablet')) || 2;
        }
        // update the choosedStep property
        self.checkMediaQuery();
        self.currentIndex = self.choosedStep;
        // bind the window resize event
        $(window.digitals2.main).on('ds2ResizeSmall ds2ResizeMedium ds2ResizeLarge', self, self._onResize);
        // listen for foundation image change and reinit layout
        self.window.on('resize.fndtn.interchange', function() {
            if (self.isotopeElement) {
                self._reinitLayout();
            }
        });
        if (self.$element.hasAttr('data-current-page-url')) {
            self.currentArticle = self.$element.attr('data-current-page-url');
        }
        if (self.$element.hasAttr('data-tags')) {
            self.dataTags = self.$element.attr('data-tags');
            self.dataTags = self.dataTags.replace(/'/g, '"');
            self.dataTags = JSON.parse(self.dataTags);
        }
        if (self.$element.hasAttr('data-custom-mode')) {
            self.dataCustomMode = self.$element.attr('data-custom-mode');
            self.dataCustomMode = self.dataCustomMode.replace(/'/g, '"');
            self.dataCustomMode = JSON.parse(self.dataCustomMode);
        }
        if (self.$element.hasAttr('data-top-articles')) {
            self.dataTopArticles = self.$element.attr('data-top-articles');
            self.dataTopArticles = self.dataTopArticles.replace(/'/g, '"');
            self.dataTopArticles = JSON.parse(self.dataTopArticles);
        }
        if (self.$element.hasAttr('data-articles-url')) {
            self.dataPath = self._generateJsonPath(self.$element.attr('data-articles-url'));
            self._loadData();
        } else {
            throw 'data articles url needs to be set';
        }
    };

    /**
     * Generate a path to the JSON object based on the current date and time
     * @param  {string} originalPath
     * @return {string}
     */
    proto._generateJsonPath = function(originalPath) {
        var dataPathSliced = originalPath.slice(0, originalPath.length - 5);
        var d1 = new Date();
        var year = d1.getUTCFullYear();
        var month = ('0' + (d1.getUTCMonth() + 1)).slice(-2);
        var dayInMonth = ('0' + d1.getUTCDate()).slice(-2);
        var hour = ('0' + d1.getUTCHours()).slice(-2);
        return dataPathSliced + '.' + year + month + dayInMonth + '-' + hour +'.json';
        // NOTE: use the following string if you want to access the component-nsc-links-temp.json
        // return '/en' + originalPath;
    };
    /**
     * Get the articles's data from a JSON
     * and update it's properties
     */
    proto._loadData = function () {
        var self = this,
            promise = $.getJSON(self.dataPath);
        promise.done(function (data) {
            // get the top articles
            self.articles = self._createTopArticles(data.articles);
            // remove the current article from the data array
            self.articles = self._removeCurrentArticle(self.articles);
            if (!self.dataCustomMode) {
                self.articles = self._filterByTags(self.articles);
            }
            self.articles = _.union(self.topArticles, self.articles);
            // Hide the Related Articles Headline if there aren't any related articles
            if (!self.articles.length) {
                self.relatedArticlesHeadline.css('display', 'none');
            }
            self._createDynamicSizeClasses();
            self._createElements(self.articles);
        });
        promise.fail(function () {
            throw 'error loading the articles json data';
        });
    };
    /**
     * Filter the top acticles from the data object
     * @return {object}
     */
    proto._createTopArticles = function(data) {
        var self = this;
        // Return the data if it is undefined
        // NOTE: TODO: needs to be tested when this case is possible because it's defined as null
        if (typeof self.dataTopArticles === 'undefined' || self.dataTopArticles === null) {
            return data;
        }
        if (!self.dataTopArticles.length) {
            return data;
        } else {
            // Get these articles from data which are included in dataTopArticles obj
            // TODO: this section and filtered varible can be refactored with one lodash function
            var lenghtTopArticles = self.dataTopArticles.length;
            self.topArticles = _.filter(data, function(elem) {
                var articlePath = elem.articlepath;
                for (var i = 0; i < lenghtTopArticles; i++) {
                    var currentTopArticle = self.dataTopArticles[i];
                    if (articlePath === currentTopArticle) {
                        return true;
                    }
                }
                return false;
            });
        }
        // Return the data object which don't exist in topArticles object
        var filtered = _.difference(data, self.topArticles);
        return filtered;
    };
    /**
     * Remove the current arrticle from the array with related articles
     * @return {object}
     */
    proto._removeCurrentArticle = function(data) {
        var self = this;
        // Return the data if it is undefined
        // NOTE: TODO: needs to be tested when this case is possible because it's defined as null
        if (typeof self.currentArticle === 'undefined' || self.dataTopArticles === null) {
            return data;
        }
        // Remove the current article from data array
        var articles = _.filter(data, function(elem) {
            return elem.articlepath !== self.currentArticle;
        });
        return articles;
    };
    /**
     * Filter the data articles by tags
     * @return {object}
     */
    proto._filterByTags = function(data) {
        var self = this;
        // Return the data if it is undefined
        // NOTE: TODO: needs to be tested when this case is possible because it's defined as null
        if (typeof self.dataTags === 'undefined' || self.dataTags === null) {
            return data;
        }
        var lenghtTags = self.dataTags.length;
        var articles = _.filter(data, function(elem) {
            var elementTags = elem.tags;
            for (var i = 0; i < lenghtTags; i++) {
                if (_.contains(elementTags, self.dataTags[i])) {
                    return true;
                }
            }
            return false;
        });
        return articles;
    };
    /**
     * Append classes to the articles and update the articles property
     * This refactored functions is coming with a TO DO from the previous version:
     * TO DO !!!! IMPLEMENT A DECORATOR FOR THE NEXT 2 FUNCTIONS
     *
     */
    proto._createDynamicSizeClasses = function() {
        var self = this,
            articles = self.articles;
        articles = _.map(self.articles, function (elem) {
            if (elem.hasOwnProperty('background')) {
                elem.background = 'ds2-relatedarticle--teaser-background-' + elem.background.toLowerCase();
            }
            if (elem.hasOwnProperty('author')) {
                if (!elem.author.length) {
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
                elem.text = 'ds2-relatedarticle--teaser-text-' + elem.text.toLowerCase();
            }
            if (elem.hasOwnProperty('font')) {
                elem.font = 'ds2-relatedarticle--teaser-font-' + elem.font.toLowerCase();
            }
            if (elem.hasOwnProperty('textPosition')) {
                elem.textPosition = 'ds2-relatedarticle--teaser-textposition-' + elem.textPosition.toLowerCase();
            }
            return elem;
        });
        self.articles = articles;
    };
    proto._handleComplete = function() {
        //var self = this;
        //self._compileElements(self.articles, "#magazine-thumb-template", self.articlesSection);
    };
    // TO implement
    proto._removeShowMoreButton = function() {
    };
    /**
     * Create the first elements and fire isotope
     * @param  {data}
     */
    proto._createElements = function(data) {
        var self = this;
        self._compileElements(data, '#relatedarticles-thumb-template', self.relatedArticlesContainer);
    };

    proto._compileElements = function (data, template, container) {
        // debugger;
        var self = this,
            source = $(template).html(),
            compiledTemplate = Handlebars.compile(source),
            html = compiledTemplate(data),
            child = $(html).children();

        html = child.unwrap();
        $(container).append(html);
        //$('.ds2-relatedarticles--thumb',container).css("display","none");
        var elementsLenght = $('.ds2-relatedarticles--thumb', container).length;
        
        $('.ds2-relatedarticles--thumb', container).each(function( index ) {
            $(this).attr('data-article-index', index);
        });

        if (elementsLenght > self.choosedStep) {
            self.showMoreButton.css('display', 'table');
            self.showMoreButton.on('click', function (e) {
                // remove inview event
                // (if layout is complete, event will be attached again)
                self._removeImageInviewEvent();
                self.currentIndex += self.choosedStep;
                if (self.currentIndex >= elementsLenght) {
                    $(e.target).parent().css('display', 'none');
                    $(e.target).off();
                }
                //$('.ds2-relatedarticles--thumb',container).slice(0, self.currentIndex).css("display","block");
                $('.ds2-relatedarticles--thumb', container).slice(0, self.currentIndex).addClass('js-related-articles-active');
                self.isotopeElement.isotope({filter: '.js-related-articles-active'});
                e.preventDefault();
                self._trackEvent('ds2-relatedarticles-show-more', self.$element);
            });
        }

        $('.ds2-relatedarticles--thumb', container).slice(0, self.currentIndex).addClass('js-related-articles-active');
        
        self.$element.find('.ds2-relatedarticles--thumb').on('inview', function (event, isInView) {
            $(event.currentTarget).toggleClass('ds2-relatedarticles--thumb-inviewport', isInView);
        }).click(function(e) {
            window.location = $(this).find(".ds2-relatedarticles--thumb-link").attr("href");
        });

        self.isotopeElement = self.relatedArticlesContainer.isotope({
            transitionDuration: 0,
            resizable: true,
            itemSelector: '.ds2-relatedarticles--thumb',
            layoutMode: 'fitRows',
            fitRows: {
                gutter: 24
            }
        });

        self.isotopeElement.isotope({ filter:'.js-related-articles-active'});

        $(document).foundation('interchange', 'reflow');
        self.isotopeElement.on('arrangeComplete', function () {
            self.relatedArticlesContainer.css({'height': 'auto', 'opacity': 1});
            self._reinitLayout();
        });

        self.isotopeElement.on('layoutComplete', function(event, laidOutItems) {
            // remove events and attach again
            self._removeImageInviewEvent();
            self._initImageInviewEvent();
        });

        // add image loaded event
        self._initImageLoadedEvent();
        // This is a temporary fix for BMWST-5977
        // TODO: check for callback from compiling template
        setTimeout(function(){
            self.isotopeElement.isotope();
            self.relatedArticlesContainer.css('display', 'block');
            self._trackComponent();
        }, 200);
    };
    /**
     * Remove the inview event
     */
    proto._removeImageInviewEvent = function() {
        var self = this;
        self.$element.find('img.ds2-lazy').off('inview');
    };
    /**
     * Initialize the inview event
     */
    proto._initImageInviewEvent = function() {
        var self = this;
        self.$element.find('img.ds2-lazy').one('inview', function(event, isInView) {
            var $ele = $(event.currentTarget);
            // remove event from current target
            $ele.off('inview');
            if (isInView) {
                // change img src
                $ele.attr('src', $ele.attr('data-img'));
            }
        });
    };
    /**
     * Reinit the isotope layout when the image load
     */
    proto._initImageLoadedEvent = function() {
        var self = this;
        self.$element.find('img.ds2-lazy').on('load', function(e) {
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
    /**
     * Reinit the layout of the isotop
     */
    proto._reinitLayout = function() {
        var self = this;
        self.isotopeElement.isotope('layout');
    };
    proto._trackComponent = function() {
        var self = this;
        self.$element.trigger('ds2-related-articles-loaded');
    };
    proto._trackEvent = function(eventType, element) {
        var self = this;
        self.$element.trigger(eventType, element);
    };
    /**
     * Register handlebar helpers
     */
    proto._registerHandlebarHelpers = function() {
        Handlebars.registerHelper('x', function (expression, options) {
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
    /**
     * Update the choosedStep property
     * based on the device screen size step
     */
    proto.checkMediaQuery = function() {
        var self = this;
        switch (window.digitals2.main.mediaQueryWatcherCheck()) {
            case 'ds2ResizeSmall':
                self.choosedStep = self.mobileStep;
                break;
            case 'ds2ResizeMedium':
                self.choosedStep = self.tabletStep;
                break;
            default:
                self.choosedStep = self.desktopStep;
        }
    };
    /**
     * Update the choosedStep property
     * on window resize event
     */
    proto._onResize = function(event) {
        event.data.checkMediaQuery();
    };
    return RelatedArticles;
} );
