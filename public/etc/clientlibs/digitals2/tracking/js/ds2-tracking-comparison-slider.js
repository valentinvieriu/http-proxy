(function (window, document, $, undefined) {
    $.widget('digitals2.ds2TrackingComparisonSlider', $.digitals2.ds2TrackingBase, {
        imagesClickCount: 0,
        userAlreadyDrag: false,
        firstImageHeadline: '',
        secondImageHeadline: '',
        isSliderLarge: true,
        _initialize: function (widget) {
            var self = this;
            self._super(widget);

            self._initializeHeadlines();

            $('.ds2-comparison-slider-item').on('click', function (e) { // image item on click
                var $element = $(this);
                var isSelected = $element.hasClass('active');
                if (!isSelected) {
                    self.imagesClickCount++;
                    if (self.imagesClickCount % 2 === 0) {
                        self.secondImageHeadline = self._getImageHeadline($element);
                        self.imagesClickCount = 0;
                    } else {
                        self.firstImageHeadline = self._getImageHeadline($element);
                    }
                    if (self.isSliderLarge) {
                        self.userAlreadyDrag = false;
                        self._trackComparisonSlider(e);
                    }
                }
            });

            $('.ds2-comparison-slider--button').on('click', function (e) { // confirm button on click
                self.userAlreadyDrag = false;
                self._trackComparisonSlider(e);

            });

            $(window).on('cocoen', function (e, element) { // slider on drag
                if (self.userAlreadyDrag === false) {
                    if (element === 'slider') {
                        element = self.TC.OTHER;
                    } else {
                        element = self.TC.IMAGE;
                    }
                    self._trackComparisonSlider(e, element);
                    self.userAlreadyDrag = true;
                }
            });

            $(window).on('comparison-slider-resize', function (e, size) { // get info about component size
                if (size === "ds2ResizeLarge") {
                    self.isSliderLarge = true;
                } else {
                    self.isSliderLarge = false;
                }
            });
        },
        _initializeHeadlines: function () {
            var self = this;
            var items = $('.ds2-comparison-slider-item--headline-wrapper');
            if (items !== undefined) {
                if (items.length > 0) {
                    self.firstImageHeadline = items[0].innerText.trim();
                }
                if (items.length > 1) {
                    self.secondImageHeadline = items[1].innerText.trim();
                }
            }
        },
        _trackComparisonSlider: function (mouseEvent, element) {
            var self = this;

            var trackOptions = self.bmwTrackOptionsBuilder.options().build();
            var target = "";
            var eventName = "";
            var cause = "";
            var effect = self.firstImageHeadline + "|" + self.secondImageHeadline;
            var eventPoints = "";
            var eventAction = "";

            if (element === undefined) {
                eventName = "Compare";
                trackOptions.name = 'compare_images';
            } else {
                eventName = "";
                trackOptions.name = 'slider_interaction';
            }
            var pEvent = self._populateClickEvent(mouseEvent, trackOptions.name, target, eventName, cause, effect);
            pEvent.eventInfo.eventPoints = eventPoints;
            if (element === undefined) {
                pEvent.eventInfo.element = self._getElementValue(mouseEvent.target.className);
                eventAction = "Compare images";
            } else {
                pEvent.eventInfo.element = element;
                eventAction = "Slider interaction";
            }
            pEvent.eventInfo.eventAction = eventAction;
            self._parseDataFromEvent(pEvent, trackOptions, mouseEvent, false);
        },
        _getElementValue: function (className) {
            var self = this;
            if (className.startsWith('ds2-comparison-slider-item--headline-wrapper')) return self.TC.TEXT_LINK;
            if (className.startsWith('ds2-comparison-slider-item--image')) return self.TC.IMAGE;
            if (className.startsWith('ds2-comparison-slider--button')) return 'Button';
            return self.TC.OTHER;
        },
        _getImageHeadline: function ($element) { // get headline from image element
            return $element.children()[0].innerText.trim();
        }
    });

}(window, document, jQuery));
