/**
 * sub: VideoLayerLink
 * author: Christoph Behounek <cb@eggs.de>
 */

define(
    'ds2-video-layer-link',
    [
        'use!jquery',
        'use!log',
        'ds2-main'
    ],
    function($, log) {
        'use strict';

        function ds2LayerLink(element) {
            this.element = $(element);
            this.init();
        }

        var proto = ds2LayerLink.prototype;

        proto.init = function() {

            if (this.element.length &&
                this.element.data('reveal-id') &&
                this.element.data('reveal-id').length &&
                window.digitals2.main.cqIsInEditMode) {

                log('disable video playing in layer when in author mode');
                this.element.removeAttr('data-reveal-id');
            }
        };

        return ds2LayerLink;

    });
