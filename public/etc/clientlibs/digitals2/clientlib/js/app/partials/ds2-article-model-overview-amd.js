/**
 * partial: article-model-overview
 */

define( 'ds2-article-model-overview',
    [
        'use!jquery',
        'use!velocity',
        'ds2-main'
    ],
    function( $ ) {

        var ds2ArticleModelOverview = function(element) {
            var self = this;
            self.$element = $(element);
            self._init(element);

            //The event it's used to reload the component
            self.$element.parent().on('cq-edit-trigger-ds2', function() {
                var model = $(this).find('.ds2-article-model-overview')[0];
                self._init(model);
            });
        };

        Proto = ds2ArticleModelOverview.prototype;

        /**
        * Initialize the the ModelOverview
        * @param  {object} element
        */
        Proto._init = function(element){
            var self = this;
            self.opt = {
                modelItems:   '.ds2-article-model-overview--model-container',
                modelList:    '.ds2-article-model-overview--model',
                slidersItem:  '.ds2-article-model-overview--sliders',
                slidersList:  '.ds2-article-model-overview--model-slider',
                togglers:     '.ds2-article-model-overview-js--slide-toggler',
                animDuration: 250
            };
            self.$element = $(element);
            self.modelList   = self.$element.find(self.opt.modelList);
            self.modelItems  = self.$element.find(self.opt.modelItems);
            self.slidersList = self.$element.find(self.opt.slidersList);
            self.slidersItem = self.$element.find(self.opt.slidersItem);
            self.togglers    = self.$element.find(self.opt.togglers);

            self.togglers.on('click', function() {
                var model = $(this);
                if (model.hasClass('ds2-link')) {
                    model = model.closest(self.modelItems).find(self.modelList);
                }
                if ( self.slidersList.hasClass('ds2-article-model-overview--active-model-slider') ) {
                    if (model.hasClass('ds2-article-model-overview--active-model')) {
                        self._hideSlider(model);
                    } else {
                        self._switchSlider(model);
                    }
                } else {
                    self._showSlider(model);
                }
            });
            // set module as ready to interact with
            self.$element.addClass('ds2-article-model-overview--ready');

            //neede for the component afteredit event
            $(element).foundation('interchange','reflow');
        };

        /** Handler Functions **/
        // make navi active and show models from active series
        Proto._showSlider = function(model) {
            var self = this,
                thisModelIndex = model.parent().index(),
                thisSlider;
            self.activeModel = model;

            if (self.slidersItem.index() > thisModelIndex) {
                thisSlider = $(self.slidersList[thisModelIndex]);
            } else {
                thisSlider = $(self.slidersList[thisModelIndex - 1]);
            }

            self._findSliderRow();
            self._toggleMarginBottom('open');
            model.addClass('ds2-article-model-overview--active-model');
            thisSlider.addClass('ds2-article-model-overview--active-model-slider');
            self.slidersItem.velocity({opacity: 1}, {duration: (self.opt.animDuration * 2), easing: 'swing'});
            self.slidersItem.velocity("slideDown", {queue: false, duration: (self.opt.animDuration * 2), easing: 'swing'});
        };

        // make navi de-active and hide all models
        Proto._hideSlider = function(model) {
            var self = this;
            self._toggleMarginBottom('close');
            self.modelList.removeClass('ds2-article-model-overview--active-model');
            self.slidersItem.velocity({opacity: 0}, {duration: self.opt.animDuration, easing: 'swing'});
            self.slidersItem.velocity('slideUp', {duration: (self.opt.animDuration * 2), easing: 'swing', complete: function() {
                self.slidersList.removeClass('ds2-article-model-overview--active-model-slider');
            }});
        };

        // switch between models from 2 series
        Proto._switchSlider = function(model) {
            var self = this,
                thisModelIndex = model.parent().index(),
                thisSlider     = $(self.slidersList[thisModelIndex]);
            currentModel   = self.modelItems.find('.ds2-article-model-overview--active-model');

            if ($(model).offset().top == $(currentModel).offset().top) {
                self.modelList.removeClass('ds2-article-model-overview--active-model');
                model.addClass('ds2-article-model-overview--active-model');
                self.slidersItem.velocity({opacity: 0}, { duration: self.opt.animDuration, easing: 'swing', complete: function() {
                    self.slidersList.removeClass('ds2-article-model-overview--active-model-slider');
                    thisSlider.addClass('ds2-article-model-overview--active-model-slider');
                    self.slidersItem.velocity({opacity: 1}, {duration: (self.opt.animDuration * 2), easing: 'swing'});
                }});
            } else {
                self._toggleMarginBottom('close');
                self.modelList.removeClass('ds2-article-model-overview--active-model');
                self.slidersItem.velocity({opacity: 0}, {duration: self.opt.animDuration, easing: 'swing'});
                self.slidersItem.velocity('slideUp', {duration: (self.opt.animDuration * 2), easing: 'swing', complete: function() {
                    self.slidersList.removeClass('ds2-article-model-overview--active-model-slider');
                    self._showSlider(model);
                }});
            }
        };

        /** Helper Functions **/
        // load model images for active series
        Proto._loadImg = function() {
        };

        // detach + attach series list to match the right row under active navi item
        Proto._findSliderRow = function() {
            var self = this,
                lastItemThisRow = self.modelItems.last();
            // find row break
            self.modelItems.each(function() {
                if ($(self.activeModel).offset().top == $(this).offset().top) {
                    lastItemThisRow = $(this);
                }
            });
            // attach in row break
            self._attachSliderTo(lastItemThisRow);
        };

        // attach series to the end of list (reset)
        Proto._toggleMarginBottom = function(status) {
            var self = this;
            var selfActiveModel = $(self.activeModel);
            self.modelItems.each(function() {
                var _this = $(this);
                if ( status === 'open' ) {
                    if ( selfActiveModel.offset().top == _this.offset().top) {
                        _this.addClass('ds2-article-model-overview--active-row');
                    }
                } else if ( status === 'close' ) {
                    _this.removeClass('ds2-article-model-overview--active-row');
                }
            });
        };

        // // attach series to the end of list (reset)
        Proto._attachSliderTo = function(position) {
            this.slidersItem.detach();
            this.slidersItem.insertAfter(position);
        };

        return ds2ArticleModelOverview;
    }
);
