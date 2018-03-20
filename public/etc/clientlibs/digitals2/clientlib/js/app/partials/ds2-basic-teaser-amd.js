/**
 * Created by maxchristl on 11.12.16.
 * modified Andrei C 6/6/2017 added lazy loading
 */
define(
    'ds2-basic-teaser',
    [
        'use!jquery',
        'imageLoader',
        'use!log',
        'ds2-image-lazyLoad',
        'ds2-main'
    ],
    function ($, imageLoader, log, ds2imagelazyLoad) {

        'use strict';

        function BasicTeaser(component) {


            this.$component = $(component);
            new ds2imagelazyLoad(component);
            this.initTrigger();

        }

        BasicTeaser.prototype.initTrigger = function() {
            this._getDomElements();
            this._registerEventListeners();

            log('BasicTeaser initialized', this);


        };

        BasicTeaser.prototype._getDomElements = function() {
            this.$link = this.$component.find('.ds2-basic-teaser--component-link');
            this.link = this.$link.attr('href');
            this.linkTarget = this.$link.attr('target');

        };

        BasicTeaser.prototype._registerEventListeners = function() {
            var self = this,
                $allTeasers = $('.ds2-basic-teaser'),
                $equalizeItems = $allTeasers.parent();

            $('.ds2-footnote, .ds2-tooltip, .ds2-basic-teaser--iframe-container', this.$component).on('click', function(event) {
                event.stopPropagation();
            });

            if (this.$component.not('.slider-padding').not('.ds2-video-layer-link').length === 0) {
                // wenn slider dann click fläche auf ds2-basic-teaser--content-container
                $('.ds2-basic-teaser--content-container', this.$component)
                    .not('.slider-padding').not('.ds2-video-layer-link')
                    .on('click', function(event) {
                        self._click(this, event);
                    });
            } else {
                this.$component.not('.slider-padding')
                    .not('.ds2-video-layer-link')
                    .on('click', function(event) {
                        self._click(this, event);
                    });
            }

            // call equal teaser height function
            // 1) on init and 2) on resize
            $(window.digitals2.main).off().on('ds2ResizeSmall ds2ResizeMedium ds2ResizeLarge', function () {
                window.digitals2.main._equalheight(undefined, $equalizeItems);
            });
            // 3) on image load or replace (foundation interchange) //needed for slow connections
            this.$component.on('replace', 'img', function (e, new_path, original_path) {
                $(e.currentTarget).on('load', function () {
                    window.digitals2.main._equalheight(undefined, $equalizeItems);
                })
            });
            Foundation.libs.interchange.reflow();
        };

        BasicTeaser.prototype._click = function(clicked, event) {
            event.preventDefault();
            var childHasVideo = $(clicked).children().has('.ds2-video-layer-link').length > 0;

            if(!childHasVideo) {
                 $(window).trigger('ds2-manual-click:ds2-basic-teaser', [$(event.target), event]);
                event.stopPropagation();

                setTimeout(function() {
                    if (this.link && this.linkTarget) {

                        window.open(this.link, this.linkTarget);
                    } else if (this.link) {
                        window.location.href = this.link;
                    }
                }.bind(this), 500);

            }
        };

        return  BasicTeaser;
    }
);

