/**
 * postal.request-response - postal.js add-on that provides a request/response pattern API.
 * Author: Jim Cowart (http://ifandelse.com)
 * Version: v0.3.1
 * Url: https://github.com/postaljs/postal.request-response
 * License(s): MIT
 */
(function(root, factory) { /* istanbul ignore if  */
    if (typeof define === "function" && define.amd) {
        // AMD. Register as an anonymous module.
        define(["lodash", "postal"], function(_, postal) {
            return factory(_, postal, root);
        }); /* istanbul ignore else */
    } else if (typeof module === "object" && module.exports) {
        // Node, or CommonJS-Like environments
        module.exports = function(postal) {
            return factory(require("lodash"), postal, this);
        };
    } else {
        // Browser globals
        root.postal = factory(root._, root.postal, root);
    }
}(this, function(_, postal, global, undefined) {
    var REQ_RES_CHANNEL = "postal.request-response";
    // I want this lib to be compatible with nearly any
    // promises-A-spec-compliant promise lib. For that
    // to happen, though, you have to provide a factory
    // method implementation that returns a promise
    postal.configuration.promise = {
        createDeferred: function() {
            throw new Error("You need to provide an implementation for postal.configuration.promise.createDeferred that returns a deferred/promise instance.");
        },
        getPromise: function() {
            throw new Error("You need to provide an implementation for postal.configuration.promise.getPromise that returns a promise safe for consuming APIs to use.");
        },
        fulfill: "resolve",
        fail: "reject"
    };
    /**
     * Fast UUID generator, RFC4122 version 4 compliant.
     * @author Jeff Ward (jcward.com).
     * @license MIT license
     * @link http://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid-in-javascript/21963136#21963136
     **/
    var UUID = (function() {
        var self = {};
        var lut = [];
        for (var i = 0; i < 256; i++) {
            lut[i] = (i < 16 ? "0" : "") + (i).toString(16);
        }
        self.create = function() {
            var d0 = Math.random() * 0xffffffff | 0;
            var d1 = Math.random() * 0xffffffff | 0;
            var d2 = Math.random() * 0xffffffff | 0;
            var d3 = Math.random() * 0xffffffff | 0;
            return lut[d0 & 0xff] + lut[d0 >> 8 & 0xff] + lut[d0 >> 16 & 0xff] + lut[d0 >> 24 & 0xff] + "-" + lut[d1 & 0xff] + lut[d1 >> 8 & 0xff] + "-" + lut[d1 >> 16 & 0x0f | 0x40] + lut[d1 >> 24 & 0xff] + "-" + lut[d2 & 0x3f | 0x80] + lut[d2 >> 8 & 0xff] + "-" + lut[d2 >> 16 & 0xff] + lut[d2 >> 24 & 0xff] + lut[d3 & 0xff] + lut[d3 >> 8 & 0xff] + lut[d3 >> 16 & 0xff] + lut[d3 >> 24 & 0xff];
        };
        return self;
    })();
    postal.ChannelDefinition.prototype.request = function(options) {
        var env = options.envelope ? options.envelope : {
            topic: options.topic,
            data: options.data,
            headers: options.headers
        };
        var requestId = UUID.create();
        var replyTopic = options.replyTopic || requestId;
        var replyChannel = options.replyChannel || REQ_RES_CHANNEL;
        var timeout;
        var promise = postal.configuration.promise.createDeferred();
        env.headers = env.headers || {};
        env.headers.replyable = true;
        env.headers.requestId = requestId;
        env.headers.replyTopic = replyTopic;
        env.headers.replyChannel = replyChannel;
        var sub = postal.subscribe({
            channel: replyChannel,
            topic: replyTopic,
            callback: function(data, env) {
                if (env.headers && env.headers.isError) {
                    /**
                     * BMW modification:
                     * JSON -> Error conversion
                     * If the data object most likely contains an error information but is not a
                     * valid instance of `Error`, an implicit conversion is done. This ensures that
                     * `Error` instances that have been converted due to the `postMessage`
                     * limitations (see below) are converted back to their original format.
                     */
                    if (!(data instanceof Error) && data.message && data.stack) {
                        var newData = new Error();
                        _.extend(newData, data);
                        data = newData;
                    }
                    promise[postal.configuration.promise.fail](data);
                } else {
                    promise[postal.configuration.promise.fulfill](data);
                }
            }
        }).once();
        if (options.timeout) {
            timeout = setTimeout(function() {
                promise[postal.configuration.promise.fail](new Error("Timeout limit exceeded for request."));
            }, options.timeout);
        }
        this.publish(env);
        return postal.configuration.promise.getPromise(promise);
    };
    /*
    var oldPub = postal.publish;
    postal.publish = function (envelope) {
        if (envelope.headers && envelope.headers.replyable) {
            envelope.reply = function (err, data) {
                postal.publish({
                    channel: envelope.headers.replyChannel,
                    topic: envelope.headers.replyTopic,
                    headers: {
                        isReply: true,
                        isError: !! err,
                        requestId: envelope.headers.requestId,
                        resolverNoCache: true
                    },
                    data: err || data
                });
            };
        }
        oldPub.call(this, envelope);
    };
    */

    /**
     * BMW modification:
     * This is the modification from origin request-response plugin. Postal
     * does not allow to send data that is not safeSerializable, however the
     * request-response plugin adds a reply-function just before handing the
     * data over for transport. The modification is to create the reply-function
     * on the receiver-side, so that no function-object is part of the data at
     * transport-time.
     */
    var oldInvokeSubscriber = postal.SubscriptionDefinition.prototype.invokeSubscriber;
    postal.SubscriptionDefinition.prototype.invokeSubscriber = function(data, envelope) {
        if (envelope.headers && envelope.headers.replyable) {
            envelope.reply = function(err, data) {

                /**
                 * BMW modification:
                 * Error -> JSON conversion
                 * Convert the `Error` instance to a JSON object with the same properties. This will
                 * ensure that the error can be sent within a federation of postal.js instances
                 * without a problem. Instances of `Error` cannot be sent between windows/frames via
                 * the `postMessage` method.
                 * (see https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage)
                 */
                if (err && err instanceof Error) {
                    err = _.chain(Object.getOwnPropertyNames(err))
                        .map(function(propName) {
                            return [propName, err[propName]];
                        }).object().value();
                }

                postal.publish({
                    channel: envelope.headers.replyChannel,
                    topic: envelope.headers.replyTopic,
                    headers: {
                        isReply: true,
                        isError: !!err,
                        requestId: envelope.headers.requestId,
                        resolverNoCache: true
                    },
                    data: err || data
                });
            };
        }
        oldInvokeSubscriber.call(this, data, envelope);
    };
    return postal;
}));