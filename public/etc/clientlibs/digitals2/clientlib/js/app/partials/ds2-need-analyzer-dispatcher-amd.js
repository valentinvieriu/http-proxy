/**
 * Created by john on 08.05.17.
 */

define(
    'ds2-na-dispatcher',
    [
        'use!log'
    ], function (log) {
        'use strict';
        var instance = null;

        function NADispatcher() {
            this.listeners = {};
            this.history = {};
        }

        NADispatcher.getInstance = function(){
            if(instance === null){
                instance = new NADispatcher();
            }
            return instance;
        };

        NADispatcher.prototype.post = function (eventName, payload) {
            if (this.listeners[eventName]) {
                this.listeners[eventName].forEach(function (listener) {
                    listener(payload);
                });
            }
            else {
                log('Attention! post to unknown listener ', eventName, payload);
            }
        };

        NADispatcher.prototype.listen = function (eventName, receiver) {
            if (!this.listeners[eventName]) {
                this.listeners[eventName] = [];
            }

            this.listeners[eventName].push(receiver);
        };

        NADispatcher.prototype.unlisten = function (eventName, receiver) {
            if (this.listeners[eventName]) {
                this.listeners[eventName].splice(this.listeners[eventName].indexOf(receiver));
            }
        };

        NADispatcher.prototype.setHistoryObj = function (historyName, data) {
            this.history[historyName] = data;
        };

        NADispatcher.prototype.getHistoryObj = function (historyName) {
            if (this.history[historyName]) {
                return this.history[historyName];
            }
        };

        NADispatcher.prototype.destroyHistoryObj = function (historyName) {
            if (this.history[historyName]) {
                delete  this.history[historyName];
            }
        };

        return NADispatcher.getInstance();
    });