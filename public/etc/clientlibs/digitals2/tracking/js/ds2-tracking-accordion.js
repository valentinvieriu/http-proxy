(function(window, document, $, undefined) {
  $.widget('digitals2.ds2TrackingAccordion', $.digitals2.ds2TrackingBase, {

    _listnersInit: function() {
      var self = this;

      if ($('.ds2-accordion--element', this.element).length) {
        //$(this.element).on('ds2-accordion-expandTrack', sendAccordionEvent);
        $(this.element).on('ds2-accordion-event', function(e, cause, evt) {
          self._expandTracking($(this), cause, Date.now(), evt);
        });
      }
      // dont remove !!!
      this._super();
    },
    _sendAccordionEvent: function(event, trackObj) {
      var eventInfo = event.eventInfo;
      this._callExpandEvent(
          this.eventBuilder.newEvent()
              .eventName(eventInfo.eventName)
              .eventPoints(eventInfo.eventPoints)
              .cause(eventInfo.cause)
              .target(eventInfo.target)
              .eventActionIsExpand()
              .primaryCategoryIsInteraction()
              .build(),
          this.bmwTrackOptionsBuilder.options()
              .expandOptions()
              .build());
    },
    _expandTracking: function(pThis, pCause, pTimestamp, evt) {
      var $this = $(pThis),
          pOptions = undefined,
          pEvent = undefined,
          pSelector = $('.ds2-accordion--title', $this),
          //pEventPoints = $( pThis ,$this.parent('.ds2-accordion--list') ).index($this)+1,
          pEventPoints = $(pThis, $this.parent('.ds2-accordion--list')).index() + 1,
          // pName = pSelector.text().trim(),
          pName = evt.target.innerText,
          isAccordionSelected = pSelector.hasClass('ui-state-active');

        //check if accordion is expanded
        if (isAccordionSelected) {

          pEvent = this._getEvent();

          if (pName) {
              pEvent.eventInfo.eventName = pName;
          }

          pEvent.eventInfo.eventAction = 'Expand';
          pEvent.eventInfo.eventPoints = pEventPoints;
          pEvent.eventInfo.timeStamp = pTimestamp;
          pEvent.eventInfo.cause = pCause;
          pEvent.eventInfo.timing = true;
          pEvent.category.primaryCategory = 'Interaction';
          if (window !== undefined) {
            pEvent.eventInfo.target = window.location.href;
          }
          // pOptions = this.optionsGet($this);
          pOptions = {
              active: true,
              type: 'expand',
              name: 'expand',
              useTimer: false,
              timing: true,
              clearVars: false
          };

          this._sendAccordionEvent(pEvent, pOptions);
        }
      },
      _getEvent: function() {
        return {
          eventInfo: {
            eventName: '',
            eventAction: '',
            eventPoints: '',
            timeStamp: Date.now().toString(),
            target: '',
            cause: '',
            effect: ''
          },
          category: {
          primaryCategory: '',
          mmdr: '',
          eventType: ''

          },
          attributes: {
            relatedPageName: '',
            relatedPageCategory: '',
            relatedComponent: {
                componentInfo: '',
                category: '',
                attributes: ''
            }
          }
        };
      }
  });

}(window, document, jQuery));
