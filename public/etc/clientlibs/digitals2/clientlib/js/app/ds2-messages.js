window.digitals2 = window.digitals2 || {};
window.digitals2.messages = (function(){

  var showDeviceError = function() {
    $('#ds2-messages-js--device-error').foundation('reveal', 'open');
  };

  var showErrorLayer = function(index) {
    $('.ds2-layer-error:eq(' + index + ')').foundation('reveal', 'open');

    //Tracking the error layer
    $('.ds2-layer-error:eq(' + index + ')').ds2TrackingErrorLayer('triggerTrackingErrorEvent');
  };


  var showCookieBrowserDisabled = function() {
    $('#ds2-messages-js--cookie-browser-disabled').foundation('reveal', 'open');
  };

  var showCookieDisclaimer = function($targetLayer, highlightSrc) {
    var $disclaimer = $('#ds2-messages-js--cookie-disclaimer');

    if($targetLayer) {
      $disclaimer.attr('data-targetlayer', $targetLayer.selector);
      $disclaimer.attr('data-targetsrc', highlightSrc);
    }

    $disclaimer.foundation('reveal', 'open');

    // Trigger regulationAccepted event on submit click.
    $disclaimer.on('click', '.ds2-messages-js--submit', function(e) {
      var $newTarget = $($disclaimer.data('targetlayer')),
          newSrc = $disclaimer.data('targetsrc');

      e.preventDefault();
      e.stopImmediatePropagation();

      // User decided to accept regulation. Trigger event.
      window.digitals2.main.$window.trigger('ds2-setRegulationAccepted');

      if($newTarget) {
        // Open target layer on closed disclaimer.
        $(document).one('closed.fndtn.reveal', $disclaimer, function() {
          $('iframe', $newTarget).attr('src', newSrc);
          $newTarget.foundation('reveal', 'open');
        });
        // On opened target layer remove event handler for closed disclaimer.
        $(document).on('opened.fndtn.reveal', $newTarget, function() {
          $(document).off('closed.fndtn.reveal', $disclaimer);

          // Remove iframe src on target layer close.
          $(document).one('close.fndtn.reveal', $newTarget, function() {
            $('iframe', $newTarget).attr('src', '');
          });
        });
      }

      // Close disclaimer.
      $disclaimer.foundation('reveal', 'close');
    });

  };

  return {
    showDeviceError: showDeviceError,
    showErrorLayer: showErrorLayer,
    showCookieBrowserDisabled: showCookieBrowserDisabled,
    showCookieDisclaimer: showCookieDisclaimer
  }

})();
