'use strict';

var core = require('../'),
    isArray = require('lodash/isArray'),
    isFunction = require('lodash/isFunction');


module.exports = function (options) {

    var errorText = 'Please verify options.'; // For better minification because this string is repeating

    if (!isFunction(options.client)) {
        throw new TypeError(errorText + 'client');
    }

    if (!isArray(options.expose) || options.expose.length === 0) {
        throw new TypeError(errorText + 'expose');
    }


    var plumbing = core({
        PromiseImpl: options.PromiseImpl
    });

    return function (requestOptions) {

        var self = {};

        plumbing.init.call(self, requestOptions);

        var request = options.client(requestOptions);

        for ( var i = 0; i < options.expose.length; i+=1 ) {
            var method = options.expose[i];
            plumbing[ method === 'promise' ? 'exposePromise' : 'exposePromiseMethod' ](request, self, '_rp_promise', method);
        }

        return request;

    };

};
