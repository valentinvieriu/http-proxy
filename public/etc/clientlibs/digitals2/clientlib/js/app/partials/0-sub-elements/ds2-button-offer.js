/**
 * partial: buuton-ofer
 * author: patrick
 */

(function(window, document, $, undefined) {

  $.widget('digitals2.ds2ButtonOffer', {
    options: {
    },

    _create: function() {
      //Offerplate with info (i) never clickable
      $('.ds2-button--area', this.element).on('click', function(e) {
        e.preventDefault();
      });
    }
  });

  $(window).on('initializeComponents', function() {
    $('.ds2-button--offerinfo').ds2ButtonOffer();
  });

}(window, document, jQuery));
