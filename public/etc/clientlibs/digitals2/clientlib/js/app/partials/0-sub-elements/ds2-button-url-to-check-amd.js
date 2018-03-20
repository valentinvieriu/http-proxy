/**
 * @author Andrei Dumitrescu    
 * @description Changes a link href and other properties based on some data attributes
 */
define(
    'ds2-button-url-to-check',
    [
        'use!jquery',
        'ds2-main'
    ], 
    function($) {
        'use strict';
        
        function ds2ButtonUrlToCheck(element) {
            this.element = $(element);
            this.init();
        };
        ds2ButtonUrlToCheck.prototype.init = function() {
            this.lUrl = window.location.protocol +"//" + this.element.data("desktopHost") + window.location.pathname + "?desktop=";
            this.lTitle = this.element.data("urlToCheckFoundTitle");
            this.lText = this.element.data("urlToCheckFoundText");
            this.lLayout = this.element.data("urlToCheckFoundLayout");
            this.changeButton();
        };
        ds2ButtonUrlToCheck.prototype.changeButton = function(url) {
             this.element.attr('href',this.lUrl).attr('title',this.lTitle).addClass(this.lLayout).find('span').text(this.lText);
        };
        ds2ButtonUrlToCheck.prototype.checkURL = function(url) {
            var self = this;
            var http = new XMLHttpRequest();
            http.open('HEAD', url);
            http.onreadystatechange = function() {
                if (this.readyState == this.DONE && this.status >= 200 && this.status < 300) {
                    self.changeButton();
                }
            };
            http.send();
        };
        return ds2ButtonUrlToCheck;
    }
);
