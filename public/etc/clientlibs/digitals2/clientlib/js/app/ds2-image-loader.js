define('imageLoader',
    [
        'use!jquery'
    ],
    function($) {

        'use strict';

        var _loadImages = function($component) {
            var $placeholders;
            $placeholders = $component.find('.ds2-image-loader--defer-image');
            $placeholders.each(function() {
                var $self = $(this);
                var $img = $self.find('img');
                var attrSrc = $img.attr('src');
                var dataImg = $img[0].dataset.img;

                // toggle classes when image loaded
                $img.one('load', function() {
                    $self.toggleClass('is-loading', false);
                    $self.toggleClass('is-loaded', true);

                    // remove preloader
                    $component.find('.ds2-image-loader--preloader-wrapper').velocity({ opacity: 0 }, { duration: 400, complete:function() {
                        $(this).css({'display':'none'});
                    } });
                    $component.find('.ds2-image-loader--preloader-content').velocity({ opacity: 1 }, { duration: 400 });
                });

                // change img src
                if (!attrSrc || (attrSrc !== dataImg)) {
                    $img.attr('src', dataImg);
                }
            });
        };

        var _addEvent = function(component) {
            var cm = component;
            // list to interchange event from foundation
            $(window).on('resize.fndtn.interchange', function() {
                setTimeout(function(){ _loadImages(cm); }, 10);
            });
        };

        var initImages = function(component) {
            _addEvent(component);
            _loadImages(component);
        };

        return {
            initImages: initImages
        };
});