'use strict';

var core = require('../'),
    isFunction = require('lodash.isfunction'),
    isObjectLike = require('lodash.isobjectlike');


module.exports = function (options) {

    var errorText = 'Please verify options'; // For better minification because this string is repeating

    if (!isObjectLike(options)) {
        throw new TypeError(errorText);
    }

    if (!isFunction(options.client)) {
        throw new TypeError(errorText + '.client');
    }

    if (!Array.isArray(options.expose) || options.expose.length === 0) {
        throw new TypeError(errorText + '.expose');
    }

    var thenExposed = false;
    for ( var i = 0; i < options.expose.length; i+=1 ) {
        if (options.expose[i] === 'then') {
            thenExposed = true;
            break;
        }
    }
    if (!thenExposed) {
        throw new Error('Please expose "then"');
    }


    var plumbing = core({
        PromiseImpl: options.PromiseImpl,
        constructorMixin: options.constructorMixin
    });

    return function (requestOptions) {

        var self = {};

        plumbing.init.call(self, requestOptions);

        var request = options.client(requestOptions);

        for ( var k = 0; k < options.expose.length; k+=1 ) {

            var method = options.expose[k];

            plumbing[ method === 'promise' ? 'exposePromise' : 'exposePromiseMethod' ](
                request,
                self,
                '_rp_promise',
                method
            );

        }

        return request;

    };

};
