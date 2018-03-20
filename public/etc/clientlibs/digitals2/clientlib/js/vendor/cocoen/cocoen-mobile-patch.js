'use strict'

if( window.Cocoen ) {
    var proto = window.Cocoen.prototype,
        toPatch = [ 'onDrag', 'onDragStart' ];

    toPatch.forEach( function( handlerName ) {
        var original = proto[ handlerName ];
        proto[ handlerName ] = function( e ) {
            e.originalEvent = e;
            original.call( this, e );
        };
    } );
}