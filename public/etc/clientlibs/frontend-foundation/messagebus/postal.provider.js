/**
 * This module aggregates and configures various postaljs plugins. The module itself simply returns
 * reference to postaljs, so it can be used to obtain a reference to the postaljs namespace after a
 * successful initialization.
 *
 * @module postal.provider
 * @return postal
 */
define('postal.provider', [
    'postal',
    'postal.settings',
    'bluebird',
    'postal.reqres',
    'postal.preserve',
    'postal.xframe',
    'postal.uuid'
], function(postal, postalSettings, BluebirdPromise) {

    'use strict';

    /**
     * To use `postal.request-response` a configuration is needed to define how deferred objects and
     * their public-facing promises are created.
     * @see {@link https://github.com/postaljs/postal.request-response}
     */
    postal.configuration.promise.createDeferred = function() {
        var resolve, reject;
        var promise = new BluebirdPromise(function(res, rej) {
            resolve = res;
            reject = rej;
        });
        return {
            resolve: resolve,
            reject: reject,
            promise: promise
        };
    };
    postal.configuration.promise.getPromise = function(dfd) {
        return dfd.promise;
    };


    /**
     * `postal.federation` requires a unique id for the current postaljs instance, as well as a
     * policy how to exchange messages within the federation. The `instanceId`of postaljs will be
     * the URL of the page with an additional random number as query parameter.
     *
     * @see {@link https://github.com/postaljs/postal.federation}
     * @see {@link https://github.com/postaljs/postal.xframe}
     */
    var updateQueryStringParameter = function(uri, key, value) {
        var re = new RegExp('([?|&])' + key + '=.*?(&|#|$)', 'i');
        if (uri.match(re)) {
            return uri.replace(re, '$1' + key + '=' + value + '$2');
        } else {
            var hash = '';
            if (uri.indexOf('#') !== -1) {
                hash = uri.replace(/.*#/, '#');
                uri = uri.replace(/#.*/, '');
            }
            var separator;
            if (uri.indexOf('?') !== -1) {
                separator = '&';
            } else {
                separator = '?';
            }
            return uri + separator + key + '=' + value + hash;
        }
    };
    var randomNumber = parseInt(Math.random() * Math.pow(10, 7), 10);
    var newPostalId = updateQueryStringParameter(location.href, 'postalid', randomNumber);
    postal.instanceId(newPostalId);
    postal.fedx.addFilter(postalSettings.filter);
    postal.fedx.transports.xframe.configure({
        allowedOrigins: postalSettings.allowedOrigins
    });

    //>>excludeStart('configOverrideWarningExclude', pragmas.configOverrideWarningExclude);
    /**
     * Override `addFilter` and `xframe.configure` to warn in case of a manual change of the
     * messagebus configuration.
     */
    var warningWrapper = function(origFunc) {
        return function() {
            /*eslint no-console: 'off'*/
            if (console && typeof console.warn === 'function') {
                var msg = 'An attempt to modify the messagebus settings has been detected. ' +
                    'Please use the messagebus configuration to change any settings.';
                console.warn(msg); // NOSONAR
            }
            return origFunc.apply(this, arguments);
        };
    };
    postal.fedx.addFilter = warningWrapper(postal.fedx.addFilter);
    postal.fedx.transports.xframe.configure = warningWrapper(
        postal.fedx.transports.xframe.configure);
    //>>excludeEnd('configOverrideWarningExclude');

    /**
     * Signal the readiness to other postaljs instances. This will start the federation handshake
     * procedure over all available transports.
     */
    postal.fedx.signalReady();


    /**
     * The `postal.provider` AMD module simply returns a reference to the configured postal.js, so
     * it can be used as a substitute and be assured that the configuration is complete.
     *
     * @return postal
     */
    return postal;
});