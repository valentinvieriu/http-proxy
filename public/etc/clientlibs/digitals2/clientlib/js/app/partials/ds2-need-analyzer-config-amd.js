/**
 * @author Daniel Heckrath
 */

define(
    'ds2-na-config',
    [
        'use!jquery',
        'use!log'
    ], function ($, log) {
        'use strict';
        var instance = null;

        var options = {};
        /*
         collect configuration bits and merge them into a single object
         //TODO update documentation
         */
        $('.na-app-config').each(function () {
            $.extend(true, options, JSON.parse($(this).html()));
        });

        log(options);

        return options;
    });
