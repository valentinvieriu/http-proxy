/**
 * postal.preserve - Add-on for postal.js that provides message durability features.
 * Author: Jim Cowart (http://freshbrewedcode.com/jimcowart)
 * Version: v0.2.0
 * Url: http://github.com/postaljs/postal.preserve
 * License(s): MIT
 */
(function(root, factory) {
    if (typeof define === "function" && define.amd) {
        // AMD. Register as an anonymous module.
        define(["lodash", "conduitjs", "postal"], function(_, Conduit, postal) {
            return factory(_, Conduit, postal, root);
        });
    } else if (typeof module === "object" && module.exports) {
        // Node, or CommonJS-Like environments
        module.exports = function(postal) {
            factory(require("lodash"), require("conduitjs"), postal, this);
        };
    } else {
        // Browser globals
        root.postal = factory(root._, root.Conduit, root.postal, root);
    }
}(this, function(_, Conduit, postal, global, undefined) {
    var plugin = postal.preserve = {
        store: {},
        expiring: []
    };
    var system = postal.channel(postal.configuration.SYSTEM_CHANNEL);
    var dtSort = function(a, b) {
        return b.expires - a.expires;
    };
    var tap = postal.addWireTap(function(d, e) {
        var channel = e.channel;
        var topic = e.topic;

        /**
         * BMW modification:
         * Also check for the `preserveOne` flag in the headers
         */
        if (e.headers && (e.headers.preserve || e.headers.preserveOne)) {
            plugin.store[channel] = plugin.store[channel] || {};
            plugin.store[channel][topic] = plugin.store[channel][topic] || [];

            /**
             * BMW modification:
             * When given the `preserveOne` header, only the latest value is stored and any pre-
             * existing messages in the store will be removed. Messages in the expiring-array will
             * automatically cleanup after a while.
             */
            if (e.headers.preserveOne) {
                plugin.store[channel][topic] = [e];
            } else {
                plugin.store[channel][topic].push(e);
            }

            // a bit harder to read, but trying to make
            // traversing expired messages faster than
            // iterating the store object's multiple arrays
            if (e.headers.expires) {
                plugin.expiring.push({
                    expires: e.headers.expires,
                    purge: function() {
                        plugin.store[channel][topic] = _.without(plugin.store[channel][topic], e);
                        plugin.expiring = _.without(plugin.expiring, this);
                    }
                });
                plugin.expiring.sort(dtSort);
            }
        }
    });

    function purgeExpired() {
        var dt = new Date();
        var expired = _.filter(plugin.expiring, function(x) {
            return x.expires < dt;
        });
        while (expired.length) {
            expired.pop().purge();
        }
    }
    if (!postal.subscribe.after) {
        var orig = postal.subscribe;
        postal.subscribe = new Conduit.Sync({
            context: postal,
            target: orig
        });
    }
    postal.SubscriptionDefinition.prototype.enlistPreserved = function() {
        var channel = this.channel;
        var binding = this.topic;
        var self = this;
        purgeExpired(true);
        if (plugin.store[channel]) {
            _.each(plugin.store[channel], function(msgs, topic) {
                if (postal.configuration.resolver.compare(binding, topic)) {
                    _.each(msgs, function(env) {
                        /*
                        self.callback.call(
                        self.context || (self.callback.context && self.callback.context()) || this, env.data, env);
                        */

                        /**
                         * BMW modification:
                         * This is the modification from origin preserve-plugin.
                         * Instead of invoking the callback directly, we use the
                         * invokeSubscriber-method, so that modifications by the
                         * request-response plugin can be used.
                         */
                        self.invokeSubscriber(env.data, env);
                    });
                }
            });
        }
        return this;
    };
    return postal;
}));