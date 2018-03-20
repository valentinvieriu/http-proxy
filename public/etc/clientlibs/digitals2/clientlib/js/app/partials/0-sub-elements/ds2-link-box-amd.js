define( 'ds2-link-box', [
    'use!jquery',
    'ds2-main'
], function ( $ ) {

    var LinkBox = function( element ) {

        this.$element = $(element);

        this._create();
    };

    var proto = LinkBox.prototype;

    proto._create = function() {

        var self = this,
            $trigger = self.$element,
            $link = $( '.ds2-link', $trigger );

        // if click on container trigger click on link
        $trigger.click( function() {
            $link[ 0 ].click();
        } );

    }

    return LinkBox;

} );
