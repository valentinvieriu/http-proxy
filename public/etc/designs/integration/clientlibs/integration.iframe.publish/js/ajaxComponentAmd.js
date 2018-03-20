/**
 * @author Christoph Behounek
 * @description Function to retrieve component after checking Privacy and if it's valid for current device.
 *
 */
define(
    'ds2-iframe-content-loader-ajax',
    [
        'use!jquery',
        'iFrameResize'
    ],
    function($) {
        'use strict';
        function loadContentAjax(element) {
            this.element = $(element);
            this.create();
        };

        loadContentAjax.prototype.create = function () {


        };

        loadContentAjax.executeComponentAjaxCall = function(id, path, deviceType, privacyFallbackPage, callback) {
            var self = this;
            $.get(this.buildFullPath(path)).done(function(data){

                if (self.isDeviceValid(data.devices, deviceType)) {
                    //if privacy is excluded or cookies accepted - replaces content
                    if (data.privacyNotPrivacyRelevant || cookiecontroller.api.isRegulationAccepted()) {
                        var privacy = true;
                    } else {
                        var privacy = false;
                    }

                    $.get(path + ".ajax?" + window.integration.getQueryParameters()).done(function(data){
                        var $iFrame = $(data);
                        $.each($iFrame, function(i) {
                            var url = $($iFrame[i]).attr('data-int-url');
                            if(url !==undefined) {
                                callback(privacy, url);
                            }
                        });
                    });
                }
            });
        };

        loadContentAjax.prototype.getUrl = function(fallback) {
            if(fallback.lastIndexOf('.html') > 0){
                return fallback;
            }

            return fallback + '.html'
        }

        loadContentAjax.isDeviceValid = function(devices, deviceType) {
            var valid = true;
            if (devices !== undefined) {
                if (typeof devices === 'string') {
                    if (devices.localeCompare(deviceType) == 0) {
                        valid = false;
                    }
                } else {
                    $.each(devices, function(){
                        if(this.localeCompare(deviceType) == 0){
                            valid = false;
                        }
                    });
                }
            }
            return valid;
        }

        loadContentAjax.getDeviceType = function() {
            if (window.integration.deviceType == 2) {
                return "smartphone";
            } else if (window.integration.deviceType == 1) {
                return "tablet";
            } else {
                return "desktop";
            }
        };

        loadContentAjax.buildFullPath = function(path){
            return path+".integration-iframe.json";
        };

        return loadContentAjax;

    }

);





