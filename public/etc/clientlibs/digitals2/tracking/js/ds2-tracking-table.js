(function(window, document, $, undefined) {
  $.widget('digitals2.ds2TrackingTable', $.digitals2.ds2TrackingBase, {

    _addCustomWidgetEventProps: function(pEventObj, interactionEvent) {
      var currentTarget = $(interactionEvent.currentTarget);
      var closestTd = currentTarget.closest('td');
      var closestTr = currentTarget.closest('tr');
      var closestTdIndex = $(closestTd).index();
      pEventObj.eventInfo.eventPoints = closestTdIndex + ':' + $(closestTr).index();
      pEventObj.eventInfo.cause = $('.ds2-table-element--head-row ', this.element)
          .find('th').eq(closestTdIndex).text().trim();
      return pEventObj;
    }
  });
}(window, document, jQuery));
