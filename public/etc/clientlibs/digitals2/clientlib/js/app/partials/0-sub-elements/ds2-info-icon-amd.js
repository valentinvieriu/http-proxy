define( 'ds2-info-icon', [
    'use!jquery',
    'ds2-main'
], function( $ ) {

  var InfoIcon = function(element) {

    this.$element = $(element);

    this._create();
  };

  var proto = InfoIcon.prototype;

  proto._create = function() {
    var self = this;

    //info (i) not linked to teaserlink if whole basic teaser is linked
    $('.ds2-tooltip', self.$element).on('click', function(e) {
      e.preventDefault();
    });
  }

  return InfoIcon;

});
