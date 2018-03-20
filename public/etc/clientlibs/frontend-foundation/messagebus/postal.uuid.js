/**
 * This module modifies the `publish` function of postaljs to always inject an UUID into the message
 * envelope header. This allows for simpler message tracing througout the system.
 *
 * @module postal.uuid
 * @return postal
 */
define('postal.uuid', [
    'postal'
], function(postal) {

    'use strict';

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
            lut[i] = (i < 16 ? '0' : '') + (i).toString(16); // NOSONAR Conditional operator enhances readability here
        }
        self.create = function() {
            var d0 = Math.random() * 0xffffffff | 0; // NOSONAR Bit operations are needed for fast UUID generation
            var d1 = Math.random() * 0xffffffff | 0; // NOSONAR Bit operations are needed for fast UUID generation
            var d2 = Math.random() * 0xffffffff | 0; // NOSONAR Bit operations are needed for fast UUID generation
            var d3 = Math.random() * 0xffffffff | 0; // NOSONAR Bit operations are needed for fast UUID generation
            return lut[d0 & 0xff] + lut[d0 >> 8 & 0xff] + lut[d0 >> 16 & 0xff] + lut[d0 >> 24 & 0xff] + '-' + lut[d1 & 0xff] + lut[d1 >> 8 & 0xff] + '-' + lut[d1 >> 16 & 0x0f | 0x40] + lut[d1 >> 24 & 0xff] + '-' + lut[d2 & 0x3f | 0x80] + lut[d2 >> 8 & 0xff] + '-' + lut[d2 >> 16 & 0xff] + lut[d2 >> 24 & 0xff] + lut[d3 & 0xff] + lut[d3 >> 8 & 0xff] + lut[d3 >> 16 & 0xff] + lut[d3 >> 24 & 0xff]; // NOSONAR Bit operations are needed for fast UUID generation
        };
        return self;
    })();

    // Wrap the original `postal.publish` function to inject the UUID
    var originalPublish = postal.publish;
    postal.publish = function(envelope) {
        if (envelope && envelope.headers && !envelope.headers.uuid) {
            envelope.headers.uuid = UUID.create();
        }
        originalPublish.apply(this, arguments);
    };

    return postal;
});
