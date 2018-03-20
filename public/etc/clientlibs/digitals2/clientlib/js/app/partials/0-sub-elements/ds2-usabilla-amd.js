define('ds2-usabilla', [
        'use!jquery'
    ],
    function($) {
        'use strict';

        function ds2Usabilla(element) {
            this.element = $(element);
            this.init();
        };

        ds2Usabilla.prototype.init = function() {
            var self = this;
            $(self.element).on('click', function(e) {
                e.preventDefault();
                window.usabilla_live("click");
            });
        }

        return ds2Usabilla;
    }
);

require(['componentInitializer'], function(componentInitializer) {
    var $elementToBeInitialized = $(".usabilla-integrated-button");
    componentInitializer.initElement($elementToBeInitialized);
});