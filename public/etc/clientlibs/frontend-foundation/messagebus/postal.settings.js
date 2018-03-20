/**
 * This module obtains the postaljs settings from the cloud configuration and aggregates it as a
 * plain JSON object.
 *
 * @module postal.settings
 * @return {object} public API
 */
var deps=[];
 //>>excludeStart("standaloneBuild", pragmas.standaloneBuild);
var  surl=window.location.href;

//DST-5892 fix
//surl= https://www.bmw.ca/en/fastlane/dealer-locator.newfoundland.html
var orurl= surl.substr(0,surl.lastIndexOf('.html')+5);
//orurl= https://www.bmw.ca/en/fastlane/dealer-locator.newfoundland.html

var furl= orurl.substr(0,orurl.lastIndexOf('/')+1);
//furl= https://www.bmw.ca/en/fastlane/

var eurl=orurl.substr(orurl.lastIndexOf('/')+1,orurl.lenght);
//eurl= dealer-locator.newfoundland.html

var ur=furl+eurl.substr(0,eurl.indexOf('.'))+eurl.substr(eurl.lastIndexOf('.'),eurl.lenght);
//ur= https://www.bmw.ca/en/fastlane/ + dealer-locator + .html
//ur= https://www.bmw.ca/en/fastlane/dealer-locator.html

var messagebusconfigServletUrl = ur.substr(0,ur.lastIndexOf('.html')) + ".ff-messagebusdefinition.config.js";//.js will be added 
//messagebusconfigServletUrl= https://www.bmw.ca/en/fastlane/dealer-locator + .ff-messagebusdefinition.config.js

deps.push(messagebusconfigServletUrl);
//>>excludeEnd("standaloneBuild");
define('postal.settings', deps, function(iframeCloudConfig) {
    'use strict';

    var defaultFilters = [
        // Make sure to pass-through messages required for the request-response plugin
        {
            channel: 'postal.request-response',
            topic: '#',
            direction: 'both'
        }
    ];
    var defaultAllowedOrigins = [
        // Communication with frames on the same host and protocol are allowed by default
        location.origin || (location.protocol + '//' + location.host)
    ];

    var getFilterCloudConfigs = function(){
        // fetch configs from cloudconfigs
        return iframeCloudConfig && iframeCloudConfig.filter  ? iframeCloudConfig.filter : [];
    };
    var getAllowedOriginsCloudConfigs = function(){
        // fetch configs from cloudconfigs
        return iframeCloudConfig && iframeCloudConfig.allowedOrigins ? iframeCloudConfig.allowedOrigins : [];
    };

    
    return {
        filter: defaultFilters.concat(getFilterCloudConfigs()),
        allowedOrigins: defaultAllowedOrigins.concat(getAllowedOriginsCloudConfigs())
    };
});
