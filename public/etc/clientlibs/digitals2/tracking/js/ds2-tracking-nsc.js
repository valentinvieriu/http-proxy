(function (window, document, $, undefined) {
    $.widget('digitals2.ds2TrackingNsc', $.digitals2.ds2TrackingBase, {

        _listnersInit: function () {
            var self = this;
            self.countryChanged = false;
            $(self.element).find('.ds2-layer--interaction .ds2-nsc--js-button').on('click', function (e) {
                self._trackLayerButtonClick(e);
                self.countryChanged = false;
            });

            $(self.element).parent('.ds2-nsc-js--data').find('.ds2-link, .ds2-layer.ds2-nsc')
                .on('ds2-nsc-reveal-modal-open', function (e) {
                    self._trackOpenLayer(e); })
                .on('json-loaded', function (e) {
                    self._trackOpenLayer(e); });

            $(self.element).find('.ds2-dropdown-js--area').on('click', function () {
                self.countryChanged = true;
            });

            self._super();
        },
        _trackOpenLayer: function (e) {
            var self = this;
            var $target = $(e.currentTarget);
            var $button = $('[data-reveal-id=' + e.currentTarget.id + ']').first();
            var trackOptions = $button.data('tracking-event');
            var eventName = $button.text().trim();
            //var revealId = $target.data('reveal-id');
            var cause = $target.find('.ds2-dropdown--title').text();
            var href = '';
            var eventPoints = self._getEventPoints($button);

            var pEvent = self.eventBuilder.newEvent()
                .from(trackOptions)
                .cause(cause)
                .effect(trackOptions.eventInfo.effect)
                .eventName(eventName)
                .eventAction(trackOptions.eventInfo.eventAction)
                .target(href)
                .eventPoints(eventPoints)
                .build();

            self._addEventAttributes(pEvent);
            pEvent.category.primaryCategory = self.TC.INTERACTION;
            window.digitals2.tracking.dispatcher.trackEvent(pEvent, trackOptions);
        },
        _trackLayerButtonClick: function (e) {
            var self = this;

            var $elem = $(e.currentTarget).closest('.ds2-layer--copy');
            var activeItem = $elem.find('.ds2-dropdown-js--item.active a');
            var href = activeItem.attr('data-nsc-link');
            if (!href || !href.trim()) {
                return;
            }

            var dropdownHeader = $elem.find('.ds2-dropdown--title-item').text();
            var dropdownTitle = $elem.find('.ds2-layer--dropdown .ds2-dropdown--title');

            var trackOptions = self.bmwTrackOptionsBuilder.options().build();
            var eventName = $(e.currentTarget).text().trim();
            var cause = dropdownHeader;
            var href = activeItem.attr('data-nsc-link');
            var active = {active: true};
            var eventPoints = '';

            if (dropdownTitle.hasClass('ds2-dropdown--title-item')) {
                eventPoints = self.countryChanged;
            } else {
                eventPoints = 'na';
            }

            trackOptions.content = active;
            trackOptions.name = 'external_link';

            var pEvent = self._populateClickEvent(e, trackOptions.name, href, eventName, cause);
            pEvent.eventInfo.eventPoints = eventPoints;
            pEvent.eventInfo.eventAction = self.TC.OUTBOUND_CLICK;
            pEvent.category.primaryCategory = self.TC.INTERACTION;
            self._parseDataFromEvent(pEvent, trackOptions, e, false);
        }
    });

}(window, document, jQuery));