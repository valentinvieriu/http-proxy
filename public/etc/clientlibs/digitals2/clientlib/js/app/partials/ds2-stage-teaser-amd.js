define( 'ds2-stage-teaser', [
   'use!jquery',
   'use!jquery-fittext',
   'ds2-main'
], function( $ ){    
    
    function StageTeaser(component){
        this.$component = $(component);
        this.options = {
            fontScalingBodyActivated: false,
            h1: '.ds2-stage-slider--keyvisual-cta-location.show-for-large-up h1',
            h3: '.ds2-stage-slider--keyvisual-cta-location.show-for-large-up h3',
            masterWithElementSel: '.ds2-stage-teaser'
        };
        this.initTrigger();
    }
    
    var proto = StageTeaser.prototype;
    
    proto.initTrigger = function(){
        var self = this;
        var hasSpecialDisclaimer = !!$('.ds2-disclaimer--cq--special', self.element).length;
        //CHECK: line-height must be in percent
        self._fontScaling(
            self.options.h1, self.element, 3, '25px', '48px', $(self.options.masterWithElementSel)
        );
        self._fontScaling(
            self.options.h3, self.element, 3, '18px', '25px', $(self.options.masterWithElementSel)
        );

        if (hasSpecialDisclaimer) {
            self._copySpecialDisclaimer();
        }
    };
    
    // the fontScaling setter
    proto._fontScaling = function(element, parentElement, pFactor, pSizeMin, pSizeMax, masterElement){
        $(element, parentElement).fitText(pFactor, { minFontSize: pSizeMin, maxFontSize: pSizeMax, masterWithElement: masterElement });
    };

    proto._copySpecialDisclaimer = function () {
        var self = this;
        var $slides = $('.ds2-slider--slide', this.element);

        $slides.each(function () {
            var $this = $(this);
            var $original = $('.ds2-disclaimer--cq--special', $this);
            var $copy = $original.clone();

            $original.addClass('show-for-large-up');
            $copy.addClass('hide-for-large-up');

            var $ctaContainer = $original.siblings('.ds2-stage-slider--keyvisual-cta-location');
            var $buttonList = $('.ds2-buttonlist', $ctaContainer);

            $buttonList.before($copy);
        });
    };
    
    return StageTeaser;
});
