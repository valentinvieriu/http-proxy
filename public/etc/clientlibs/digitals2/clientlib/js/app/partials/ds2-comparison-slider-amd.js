/**
 * partial: comprison-slider
 * author: gimre
 *
 */

define('ds2-comparison-slider', [
    'use!cocoen',
    'use!jquery',
    'use!jquery-slick',
    'ds2-main'
], function (Cocoen, $) {

    //
    var comparisonCount = 2;
    var jquerify = function (v) {
            return $(v)
        },
        isUnique = function (v, i, arr) {
            return arr.indexOf(v) === i;
        },
        markAsSelected = function (image) {
            return $(image)
                .addClass('active')
                .get(0);
        };

    var ComparisonSlider = function ($element) {

        var $element = $($element),
            self = this;

        self.$element = $element;
        self.$close = $element.find('.ds2-comparison-slider-layer--close');
        self.$confirm = $element.find('.ds2-comparison-slider-layer--confirm');
        self.$selector = $element.find('.ds2-comparison-slider--selector');
        self.$stage = $element.find('.ds2-comparison-slider--stage');
        self.$thumbs = $element.find('.ds2-comparison-slider--thumbs');
        self.$images = self.$thumbs.find('.ds2-comparison-slider-item');

        self.comparisonQueue = [];
        self.confirmEvent = $.when();
        self.highlightedTextIndex = 0;
        self.savedQueue = [];
        self.thumbSliderOptions = {
            infinite: false,
            // nextArrow: $( '<span class="ds2-icon ds2-icon--arrow-big-r-white ds2-icon--l ds2-icon--bg"></span>' ),
            // prevArrow: $( '<span class="ds2-icon ds2-icon--arrow-big-l-white ds2-icon--l ds2-icon--bg"></span>' ),
            slidesToScroll: 3,
            slidesToShow: 1,
            variableWidth: true
        };

        // add first two images in the comparison
        self.$images.toArray()
            .slice(0, comparisonCount)
            .map(self.addImageToComparisonQueue.bind(self));

        // attach handlers
        self.$images.on('click', function () {
            var imageAddedEvent = self.addImageToComparisonQueue(this);

            $.when(imageAddedEvent, self.confirmEvent).then(function () {
                // settimeout is needed here to push the reinit of the Cocoen
                // stage after the stage loses display:none - the size of the
                // Cocoen widget is not properly calculated before that and
                // dragging will not work until a resize/recalculation
                setTimeout(function () {
                    self.renderComparison();
                }, 0);
            });
        });

        self.$selector.on('click', function () {
            self.openLayer();
        });

        self.$confirm.on('click', function () {
            self.confirmEvent.resolve();
            self.closeLayer();
        });

        self.$close.on('click', function () {
            self.resetQueue();
            self.closeLayer();
        });

        if (!$element.is('.editmode')) {
            self.initThumbSlider();
        }

        var imageWaitCount = 2,
            imagesLoaded = 0;

        self.$thumbs
            .find('img')
            .slice(0, imageWaitCount)
            .on('load', function () {
                if (imageWaitCount == ++imagesLoaded) {
                    self.renderComparison();
                }
            })
            .each(function () {
                if (this.complete) {
                    $(this).load();
                }
            });

        $(window).trigger('comparison-slider-resize', window.digitals2.main.mediaQueryWatcherCheck());
    };


    var proto = ComparisonSlider.prototype;


    proto.addImageToComparisonQueue = function (image) {

        // clear selection
        this.$images.removeClass('active');

        this.comparisonQueue = this.comparisonQueue
            .concat(image)
            .filter(isUnique)
            .slice(-comparisonCount)
            .map(markAsSelected);

        return $.when();
    };


    proto.closeLayer = function () {
        this.$element.removeClass('layer-opened');
        this.confirmEvent = $.when();
        this.initThumbSlider();

        $(window).scrollTop(0);
        $(window.digitals2.main).off('ds2ResizeLarge.slider');
    };


    proto.destroyThumbSlider = function () {
        this.$thumbs.slick('unslick');
    };


    proto.getImageRenderDetails = function ($image) {
        return {
            url: $image.find('.ds2-comparison-slider-item--image')
                .attr('src')
        };
    };


    proto.getImageRenderOutput = function (renderDetails) {
        return '<img src="' + renderDetails.url + '">';
    };


    proto.getTextRenderDetails = function ($image) {
        return {
            content: $image.find('.ds2-comparison-slider-item--content')
                .prop('outerHTML')
        };
    };


    proto.getTextRenderOutput = function (renderDetails) {
        return renderDetails.content
    };


    proto.highlightText = function () {
        var self = this;

        this.$stage.find('.ds2-comparison-slider-item--content')
            .removeClass('highlighted')
            .each(function (i) {
                var $this = $(this)
                if (i === self.highlightedTextIndex) {
                    $this.addClass('highlighted');
                }
            });
    };


    proto.highlightTextByRatio = function (ratio) {
        var newIndex = ( 1 - ratio ) * this.comparisonQueue.length | 0;
        if (newIndex !== this.highlightedTextIndex) {
            this.highlightedTextIndex = newIndex;
            this.highlightText();
        }
    };


    proto.initThumbSlider = function () {
        this.$thumbs.slick(this.thumbSliderOptions);
    };


    proto.openLayer = function () {
        var self = this;

        self.destroyThumbSlider();
        self.saveQueue();
        self.confirmEvent = $.Deferred();
        self.$element.addClass('layer-opened');

        $(window.digitals2.main).one('ds2ResizeLarge.slider', function () {
            self.resetQueue();
            self.closeLayer();
        });
    };


    proto.renderComparison = function () {
        var self = this,
            imageHtml = this.comparisonQueue
                .map(jquerify)
                .map(this.getImageRenderDetails)
                .map(this.getImageRenderOutput)
                .join(''),
            textHtml = this.comparisonQueue
                .map(jquerify)
                .map(this.getTextRenderDetails)
                .map(this.getTextRenderOutput)
                .join('');

        this.$stage
        // injecting a root node for cocoen to bootstrap on that will
        // always be overwritten - this is needed to force a cleanup of all
        // handlers attached to that node, since cocoen doesn't clean up
        // after itself
            .html([
                '<div class="cocoen">' + imageHtml + '</div>',
                '<div>' + textHtml + '</div>',
            ].join(''))
            .find('.cocoen')
            .each(function () {
                var instance = new Cocoen(this, {
                    dragCallback: self.highlightTextByRatio.bind(self)
                });

                // increase min/max margins
                instance.minLeftPos = instance.elementOffsetLeft + 18;
                instance.maxLeftPos = (instance.elementOffsetLeft + instance.elementWidth) - instance.dragElementWidth - 18;
            });
        this.clickHandler();
        this.highlightText();
    };


    proto.resetQueue = function () {
        this.savedQueue.map(this.addImageToComparisonQueue.bind(this));
    };


    proto.saveQueue = function () {
        this.savedQueue = this.comparisonQueue.slice();
    };

    proto.clickHandler = function () {
        $('.cocoen').on('click', function() {
            $(window).trigger('cocoen', 'image');
        });

        $('.cocoen-drag').on('mousedown', function(e) {
            $(window).trigger('cocoen', 'slider');
            e.stopPropagation();
        });

        $('.cocoen-drag').on('touchstart', function(e) {
            $(window).trigger('cocoen', 'slider');
            e.stopPropagation();
        });

        $(window.digitals2.main).on('ds2ResizeSmall ds2ResizeMedium ds2ResizeLarge', function(){
            $(window).trigger('comparison-slider-resize', window.digitals2.main.mediaQueryWatcherCheck());
        });
    };


    return ComparisonSlider;
});
