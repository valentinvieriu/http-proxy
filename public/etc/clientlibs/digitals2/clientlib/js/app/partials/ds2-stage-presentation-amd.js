define( 'ds2-stage-presentation', [
    'use!jquery',
    'use!foundation',
    'use!jquery-fittext',
    'use!velocity',
    'ds2-main'
    ], function( $, fitText, velocity ,foundation) {

    // selector cache
    var stagePresentationKeyVisual = '.ds2-stage-presentation--keyvisual';

    var sel = {
        footNote:                                    '.ds2-footnote',
        preloaderWrapper:                            '.ds2-preloader-wrapper',
        preloadingContent:                           '.ds2-preloading-content',
        stagePresentationKeyVisualCtaContainerH1:    stagePresentationKeyVisual + '-cta-container h1',
        stagePresentationKeyVisualCtaContainerH3:    stagePresentationKeyVisual + '-cta-container h3',
        stagePresentationKeyVisualImageContainerImg: stagePresentationKeyVisual + '-image-container img'
    };

    var StagePresentation = function(element) {
        this.$element = $(element);
        this._create();
    };

    var proto = StagePresentation.prototype;

    proto._create = function() {
        var self = this;

        // CHECK: line-height must be in percent
        self._fontScaling(
            sel.stagePresentationKeyVisualCtaContainerH1,
            self.$element,
            3,
            '25px',
            '48px',
            $(stagePresentationKeyVisual)
        );

        self._fontScaling(
            sel.stagePresentationKeyVisualCtaContainerH3,
            self.$element,
            3,
            '18px',
            '25px',
            $(stagePresentationKeyVisual)
        );

        self._footnotePositioning();

        window.digitals2.main.$window.on('resize', Foundation.utils.throttle(function(e) {
            self._footnotePositioning();
        }, 250));

        //PreLoader
        $(sel.stagePresentationKeyVisualImageContainerImg).ready(function() {
            $(sel.preloaderWrapper).velocity({ opacity: 0 }, { duration: 400 });
            $(sel.preloadingContent).velocity({ opacity: 1 }, {
                duration: 400,
                complete: function() {$(window).trigger('ds2-stage-presentation-loaded')}
            });

        });
    };

    proto._fontScaling = function(element, parentElement, pFactor, pSizeMin, pSizeMax, masterElement) {
        var self = this;

        $(self.$element, parentElement).fitText(pFactor, {
                                                    minFontSize:       pSizeMin,
                                                    maxFontSize:       pSizeMax,
                                                    masterWithElement: masterElement
                                                    });
    };

    proto._footnotePositioning = function() {
        var self      = this,
            h1element = $(sel.stagePresentationKeyVisualCtaContainerH1, self.$element),
            h3element = $(sel.stagePresentationKeyVisualCtaContainerH3, self.$element),
            h1size    = parseFloat(h1element.css('font-size')),
            h3size    = parseFloat(h3element.css('font-size'));

        $(sel.footNote, h1element ).each(function(i) {
            $( self ).css({top:h1size*-0.75});
        });

        $(sel.footNote, h3element ).each(function(i) {
            $( self ).css({top:h3size*-0.75});
        });
    };

    return StagePresentation;

} );
