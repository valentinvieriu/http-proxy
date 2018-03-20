define('ds2-navigation-model', ['use!jquery', 'use!velocity',
    'ds2-main'], function ($) {
    var ds2NavigationModel = function (element) {
        this.options = {
            models: '.ds2-navigation-model--model',
            modelContainer: '.ds2-navigation-model--model-container',
            list: '.ds2-navigation-model--series',
            card: '.ds2-model-card',
            cardImg: '.ds2-model-card--image',
            cardContainer: '.ds2-navigation-model--card-container',
            cardList: '.ds2-navigation-model--serie',
            animDuration: 250
        };
        this.element = $(element);
        this._create();
    };
    Object.assign(ds2NavigationModel.prototype, {
        _create: function () {
            var self = this;
            var opt = self.options;
            self.models = $(opt.models, this.element);
            self.modelContainer = $(opt.modelContainer, this.element);
            self.list = $(opt.list, this.element);
            self.cardContainer = $(opt.cardContainer, this.element);
            self.cardList = $(opt.cardList, this.element);
            self.activeModel = undefined;
            self.activeSeries = undefined;


            $(window.digitals2.main).on('ds2ResizeSmall ds2ResizeMedium ds2ResizeLarge', function () {
                self._resizeHandler();
            });
            self.models.off('click').on('mouseover', function () {
                $(this).addClass('ds2-active-hover');
            }).on('touchstart', function () {
                self.scrolling = false;
                $(this).removeClass('ds2-active-hover');
            }).on('touchmove', function () {
                self.scrolling = true;
                $(this).removeClass('ds2-active-hover');
            }).on('mouseleave touchmove click', function () {
                $(this).removeClass('ds2-active-hover');
            }).on('mouseup touchend', function (e) {
                var model = this, offset = $(model).offset();
                if (self.scrolling === true) {
                    $(this).removeClass('ds2-active-hover');
                } else {
                    e.preventDefault();
                    if (self.activeModel && self.activeModel == model) {
                        self._hideModels(model, true, false);
                        log('modelNavigation', 'close');
                    } else if (self.activeModel && self.activeModel != model) {
                        self._toggleModels(model, offset);
                        log('modelNavigation', 'toggle');
                    } else {
                        self._showModels(model);
                        log('modelNavigation', 'open');
                    }
                }
            });
            $(this.element).addClass('ds2-model-navi--ready');
        },
        _resizeHandler: function () {
            var self = this, windowWidth = $(window).width();
            if (windowWidth > 520 && windowWidth <= 720) {
                self.modelContainer.removeClass('medium-3').addClass('medium-4');
                self.cardContainer.removeClass('medium-4').addClass('medium-6');
            } else if (windowWidth > 720 && windowWidth <= 1023) {
                self.modelContainer.removeClass('medium-4').addClass('medium-3');
                self.cardContainer.removeClass('medium-6').addClass('medium-4');
            }
            if (self.activeModel) {
                log('modelNavigation', 'resize');
                self._equalHeight();
                self._expandSeries();
                self._findSeriesRow();
            }
        },
        _showModels: function (model) {
            var self = this, $model = $(model), $series = $('[data-model-id=' + $model.attr('data-model-id') + ']', self.list);
            self.activeModel = model;
            self.activeSeries = $series;
            self.models.removeClass('ds2-active');
            $model.addClass('ds2-active');
            $series.css({display: 'block'}).velocity({opacity: 1}, {duration: self.options.animDuration});
            self._equalHeight();
            self._expandSeries();
            self._findSeriesRow();
            self._scrollToSeries();
        },
        _hideModels: function (model, collapse, reopen) {
            var self = this, $series = $(self.activeSeries);
            self.models.removeClass('ds2-active');
            self.activeModel = undefined;
            self.activeSeries = undefined;
            if (collapse)
                self._collapseSeries(model, reopen);
            $series.velocity({opacity: 0}, {
                duration: self.options.animDuration,
                complete: function () {
                    $series.css({display: 'none'});
                    if (!collapse && reopen)
                        self._showModels(model);
                }
            });
        },
        _toggleModels: function (model, clickedOffset) {
            var self = this;
            if (clickedOffset.top != $(self.activeModel).offset().top) {
                self._hideModels(model, true, true);
            } else {
                self._hideModels(model, false, true);
            }
        },
        _expandSeries: function () {
            var self = this;
            self.list.velocity('stop').velocity({height: self.activeSeries.height()}, {
                duration: self.options.animDuration * 2,
                easing: 'swing',
                complete: function () {
                    self._loadImg();
                }
            });
        },
        _collapseSeries: function (model, reopen) {
            var self = this;
            self.list.velocity('stop').velocity({height: 0}, {
                duration: self.options.animDuration * 2,
                easing: 'swing',
                complete: function () {
                    if (reopen) {
                        self._showModels(model);
                    } else {
                        self._attachSeriesTo(self.modelContainer.last());
                    }
                }
            });
        },
        _scrollToSeries: function () {
            var spacing = 5, offset = $(this.activeModel).offset().top - spacing, contentBarSelector = $('.ds2-page--wrapper .ds2-navigation-content-bar');
            if (contentBarSelector) {
                offset -= contentBarSelector.height();
            }
            $('html,body').stop().animate({scrollTop: offset}, {
                duration: 300,
                easing: 'swing'
            });
        },
        _loadImg: function () {
            var self = this, $images = $('img[data-src]', self.activeSeries), $load = $($images[0]);
            if ($images.length > 0) {
                var src = $load.attr('data-src');
                if (src)
                    $load.attr('src', src).removeAttr('data-src');
                $load.on('load', function () {
                    $(this).velocity({opacity: 1}, {duration: self.options.animDuration * 2});
                    $(this).closest(self.options.cardImg).addClass('ds2-img-loaded');
                    self._loadImg();
                });
            }
        },
        _findSeriesRow: function () {
            var self = this, $insertTarget = self.modelContainer.last(), $items = $(self.modelContainer, $(self.list));
            self._attachSeriesTo($insertTarget);
            $items.each(function () {
                if ($(self.activeModel).offset().top == $(this).position().top)
                    $insertTarget = $(this);
            });
            self._attachSeriesTo($insertTarget);
        },
        _attachSeriesTo: function (position) {
            this.list.detach();
            this.list.insertAfter(position);
        },
        _equalHeight: function () {
            window.digitals2.main._equalheight(this.models, this.activeSeries);
        }
    });

    return ds2NavigationModel;
});
