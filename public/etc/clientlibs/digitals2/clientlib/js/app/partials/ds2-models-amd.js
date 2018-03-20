define('ds2-models', [
    'use!jquery',
    'ds2-image-lazyLoad',
    'use!velocity',
    'ds2-main'
], function($, ds2imagelazyLoad) {
    var ds2ModelSeries = function (element) {
        this.options = {
            modelsCardItems: '.ds2-models-js--card-item',
            modelsOptions: '.ds2-models-js--options',
            modelsSeries: '.ds2-models-js--series',
            modelsSeriesHeader: '.ds2-models-js--series-header',
            modelsWrapper: '.ds2-models-js--container',
            modelsAnchors: '.ds2-models-js--anchors li',
            modelsCounterId: '#ds2-models-js--counter',
            checkbox: '.ds2-models--filter input[type="checkbox"]',
            baseMargin: 15,
            animSpeed: 500,
            modelsRowClasses: 'ds2-row-padding row',
            modelsWrapperClass: 'ds2-models--series-wrap',
            modelsWrapperId: 'ds2-models-js--series-wrap'
        };
        this.element = $(element);
        new ds2imagelazyLoad(element);
        this._create();
    };
    Object.assign(ds2ModelSeries.prototype, {
        _create: function () {
            var self = this;
            this.checkboxes = $(this.options.checkbox, $('.show-for-medium-up', this.element));
            this.modelSeries = $(this.options.modelsSeries, this.element);
            this.modelSeriesHeader = $(this.options.modelsSeriesHeader, this.modelSeries);
            this.modelsWrapper = $(this.options.modelsWrapper, this.element);
            this.modelsCardItems = $(this.options.modelsCardItems, this.element).addClass('ds2-active');
            this.activeModelsCount = this.modelsCardItems.length;
            this.modelsCounter = $(this.options.modelsCounterId, this.element);
            this.modelsOptions = $(this.options.modelsOptions, this.element);
            this.anchorsList = $(this.options.modelsAnchors, this.modelsOptions);
            this.layerCheckboxes = $(this.options.checkbox, '.ds2-tooltip-element--filter');
            self._setDeviceValues();
            self._updateCounter(); //seems to be needless
            self._handleModelOptions();
            self._addCategoryName();
            self._loadImg();
            self.modelsToAnimateOut = {};
            self.modelsToAnimateIn = {};
            this.checkboxes.on('click', function (e) {
                self._filter();
                self._trackFilter(this);
            });
            this.layerCheckboxes.on('click', function (e) {
                self._syncCheckboxes(true);
                self._filter();
                self._trackFilter(this);
            });
            window.digitals2.main._equalheight(this.element);
            $(window).on('scroll', function () {
                self._handleModelOptions();
            });
            $(window.digitals2.main).on('ds2ResizeSmall ds2ResizeMedium ds2ResizeLarge ds2ResizeLargeNavi ds2ResizeMediumNavi ds2ResizeSmallNavi', function () {
                self._onResize();
            });
        },
        _handleModelOptions: function () {
            var self = this;
            if (self.isMobile) {
                this.modelsOptions.addClass('ds2-visible');
                var optionsHeight = this.modelsOptions.height(), componentTop = this.element.offset().top, componentBottom = componentTop + this.element.height(), scrollTop = $(window).scrollTop(), minOffset = this.options.baseMargin * 3;
                if (componentBottom - optionsHeight - scrollTop < minOffset) {
                    this.modelsOptions.css({
                        position: 'absolute',
                        top: 'auto',
                        bottom: '0'
                    });
                } else if (componentTop - scrollTop < minOffset) {
                    this.modelsOptions.css({
                        position: 'fixed',
                        top: minOffset,
                        bottom: 'auto'
                    });
                } else {
                    this.modelsOptions.css({
                        position: 'absolute',
                        top: '0',
                        bottom: 'auto'
                    });
                }
            } else {
                this.modelsOptions.removeClass('ds2-visible').css({
                    position: '',
                    top: '',
                    bottom: ''
                });
            }
        },
        _setDeviceValues: function () {
            var self = this;
            switch (window.digitals2.main.mediaQueryWatcherCheck()) {
                case 'ds2ResizeSmall':
                    self.isMobile = true;
                    self.isTablet = false;
                    break;
                case 'ds2ResizeMedium':
                    self.isTablet = true;
                    self.isMobile = false;
                    break;
                default:
                    self.isMobile = false;
                    self.isTablet = false;
                    break;
            }
            switch (window.digitals2.main.mediaQueryNaviWatcherCheck()) {
                case 'ds2ResizeSmallNavi':
                    self.isTablet = true;
                    this.modelsCardItems.removeClass('medium-4').addClass('medium-6');
                    break;
                case 'ds2ResizeMediumNavi':
                    self.isTablet = true;
                    this.modelsCardItems.removeClass('medium-6').addClass('medium-4');
                    break;
            }
        },
        _filter: function () {
            var self = this;
            this.checkedBoxes = this.checkboxes.filter(':checked');
            if (this.checkedBoxes.length === 0) {
                this.modelsCardItems.addClass('ds2-active');
                self.modelsToAnimateIn = this.modelsCardItems.filter('.ds2-inactive');
                this._animModels(true, self.modelsToAnimateIn, []);
                this.modelSeriesHeader.removeClass('ds2-inactive');
                this.modelSeries.addClass(this.options.modelsRowClasses);
                this.modelsWrapper.unwrap();
            } else {
                this.checkedBoxes.each(function (idx) {
                    var id = $(this).val();
                    self.modelsCardItems.filter('.' + id).addClass('ds2-set-active');
                });
                self.modelsToAnimateIn = this.modelsCardItems.filter('.ds2-set-active').filter(':not(.active)');
                self.modelsToAnimateOut = this.modelsCardItems.filter('.ds2-active').filter(':not(.ds2-set-active)');
                this._animModels(false, self.modelsToAnimateIn, self.modelsToAnimateOut);
            }
            self._syncCheckboxes();
            self._updateCounter();
            self._addCategoryName();
            window.digitals2.main._equalheight(this.element);
        },
        _trackFilter: function (clickedElement) {
            var id = $(clickedElement).attr('id');
            var label = $(clickedElement).closest('.ds2-label--group').find('label[for="' + id + '"]');
            if (label.data('trackingEvent')) {
                var dataTrackObj = label.data('trackingEvent');
                dataTrackObj.eventName = dataTrackObj.cause = $.trim(label.text());
                $(window).trigger('ds2-model-overview--filtered', dataTrackObj, this);
            }
        },
        _toggleRows: function () {
            var self = this;
            if ($('#' + this.options.modelsWrapperId).length != 1) {
                this.modelsWrapper.wrap('<div id="' + this.options.modelsWrapperId + '" class="' + this.options.modelsRowClasses + ' ' + this.options.modelsWrapperClass + '"></div>');
            }
            this.modelSeries.removeClass(this.options.modelsRowClasses);
            this.modelSeriesHeader.addClass('ds2-inactive');
        },
        _addCategoryName: function () {
            var self = this;
            self.anchorsList.removeClass('ds2-active');
            this.modelsCardItems.filter('.ds2-active').each(function () {
                var category = '.' + $(this).closest('.ds2-models--series').data('category-class');
                self.anchorsList.filter(category).addClass('ds2-active');
            });
        },
        _syncCheckboxes: function (layer) {
            if (layer) {
                this.layerCheckboxes.each(function () {
                    var a = $(this);
                    var b = $($(this).data('checkbox-sync'));
                    var prop = a.prop('checked');
                    b.prop('checked', prop);
                });
            } else {
                this.checkboxes.each(function () {
                    var a = $(this);
                    var b = $($(this).data('checkbox-sync'));
                    var prop = a.prop('checked');
                    b.prop('checked', prop);
                });
            }
        },
        _updateCounter: function () {
            this.activeModelsCount = this.modelsCardItems.filter('.ds2-active').length;
            this.modelsCounter.text(this.activeModelsCount);
        },
        _onResize: function () {
            this._setDeviceValues();
            this._handleModelOptions();
            window.digitals2.main._equalheight(this.element);
        },
        _animModels: function (all, modelsToAnimateIn, modelsToAnimateOut) {
            var self = this, firstIn = true, itemsIn = modelsToAnimateIn.length, itemsOut = modelsToAnimateOut.length;
            if (itemsOut !== 0) {
                modelsToAnimateOut.each(function () {
                    itemsOut--;
                    $(this).css({'opacity': 1}).removeAttr('data-newequalizer-watch').velocity({'opacity': 0}, {
                        duration: self.options.animSpeed,
                        complete: function () {
                            $(this).removeClass('ds2-active').addClass('ds2-inactive').css({
                                'opacity': '',
                                'height': ''
                            });
                            if (!all && itemsOut === 0) {
                                self._toggleRows();
                                self._updateCounter();
                            }
                        }
                    });
                });
            }
            if (itemsIn !== 0) {
                modelsToAnimateIn.attr('data-newequalizer-watch', '');
                modelsToAnimateIn.removeClass('ds2-set-active').removeClass('ds2-inactive').addClass('ds2-active').attr('data-newequalizer-watch', '');
                window.digitals2.main._equalheight(this.element);
                modelsToAnimateIn.each(function () {
                    $(this).removeClass('ds2-set-active').removeClass('ds2-inactive').addClass('ds2-active').css({'opacity': 0}).velocity({'opacity': 1}, {
                        duration: self.options.animSpeed,
                        delay: self.options.animSpeed,
                        complete: function () {
                            $(this).css({'opacity': ''});
                            if (firstIn) {
                                firstIn = false;
                                window.digitals2.main._equalheight(this.element);
                            }
                        }
                    });
                });
            }
        },
        _loadImg: function() {
            var $imageToLoad = this.element.parent().find('img[data-src]').eq(0);
            if ($imageToLoad.length) {
                var imageUrl = $imageToLoad.data('src');
                $imageToLoad.removeAttr('data-src');
                if (imageUrl) {
                    $imageToLoad.attr('data-img', imageUrl);
                    $imageToLoad.on('load', function() {
                        var $this = $(this);
                        $this.velocity({opacity: 1}, {duration: 500});
                        $this.closest('.ds2-model-card--image').addClass('ds2-img-loaded');
                    });
                }
                this._loadImg();
            }
        }
    });
    return ds2ModelSeries;
});
