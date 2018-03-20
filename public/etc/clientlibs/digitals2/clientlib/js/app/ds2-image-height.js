/**
 * Created by Joel Köbner on 6/21/2017.
 */
define('ds2-image-height',
    [
        'use!jquery'
    ], function($) {
        var setHeight = function(component) {

            var $images = $(component).find('img'),
                length = $images.length;

            for (i = 0; i < length; i++) {
                var $img = $images.eq(i),
                    $parent = $img.parent();
                if ( $img.parents("div[data-component-path]").length && $img.attr('data-ds2-lazy-load') ) {
                    // add lazy loading class to have 100% width before height calculation
                    if (!$img.hasClass('ds2-image-lazy-loading')) {
                        $img.addClass('ds2-image-lazy-loading');
                    }
                    if ($img.data('desktop-aspect-ratio') && window.digitals2.main.mediaQuery !== 'ds2ResizeSmall') {
                        if (!$img.width() || $parent.hasClass('ds2-basic-teaser--image-container')) {
                            $img.width("100%");
                        }
                        var desktopHeight = $img.width() / $img.data('desktop-aspect-ratio');
                        if (desktopHeight) {
                            $img.height(desktopHeight);
                        }
                    } else if ($img.data('mobile-aspect-ratio') && window.digitals2.main.mediaQuery === 'ds2ResizeSmall') {
                        if (!$img.width() || $parent.hasClass('ds2-basic-teaser--image-container')) {
                            $img.width("100%");
                        }
                        var mobileHeight = $img.width() / $img.data('mobile-aspect-ratio');
                        if (mobileHeight) {
                            $img.height(mobileHeight);
                        }
                    }
                } else {
                    $img.css('height', 'auto');
                }
            }
        };
        return {
            setHeight: setHeight
        }
    }
);
