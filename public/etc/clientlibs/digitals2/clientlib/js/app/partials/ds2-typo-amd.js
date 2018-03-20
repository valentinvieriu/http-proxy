/**
 * partial: typo
 * author: gimre
 *
 * this file is referenced in /app/templates/pages/typo.hbs
 */

define( 'ds2-typo', [
    'use!jquery',
    'ds2-image-lazyLoad',
    'use!jquery-bigtext',
    'ds2-main'
], function($, ds2imagelazyLoad ) {
    var resizeEvents = 'ds2ResizeLarge ds2ResizeMedium ds2ResizeSmall',
        sel = {
            title: '.ds2-typo--title',
            titleContainer: '.ds2-typo--title-container'
        };

    var Typo = function( element ) {
        // save DOM references
        this.$element        = $( element );
        new ds2imagelazyLoad(element);
        this.$title          = $( sel.title, this.$element );
        this.$titleContainer = $( sel.titleContainer , this.$element );
        this.mainObj         = window.digitals2.main;
        this.$window         = this.mainObj.$window;
        /*
         * TODO: this (above) will break if any object on this chain is not
         * properly defined - refactor/fix (define as separate AMD module,
         * maybe)
         */

        // save width
        this.originalWidth = this.$window.width( );

        // resize text on creation
        this._applyBigText( );
        this._applyFontSpacing( );

        // bind event handlers
        this._bindEvents( );
    };

    // store prototype
    var proto = Typo.prototype;

    proto._applyBigText = function( ) {
        this.$titleContainer.bigtext( );
    };

    proto._applyFontSpacing = function( ) {
        var height = this.$title.height( );
        this.$title.css( {
            'margin-top':    height * -0.045,    //BMWST-5216
            'margin-bottom': height * 0.12 + 10  //BMWST-2563
        } );
    };

    proto._bindEvents = function( ) {
        var self = this;
        // TODO: very... not OK, change to something more reasonable
        $( self.mainObj ).on( resizeEvents, function( event ) {
            var newWidth = self.$window.width( );
            if( newWidth !== self.originalWidth ) {
                self._applyBigText( );
                self._applyFontSpacing( );
                originalWidth = newWidth;
            }
        } );
    };

    return Typo;
} );

