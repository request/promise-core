'use strict';

var core = require('../'),
    isArray = require('lodash/isArray'),
    isFunction = require('lodash/isFunction');


module.exports = function (options) {

    var errorText = 'Please verify options.'; // For better minification because this string is repeating

    if (!isFunction(options.request)) {
        throw new TypeError(errorText + 'request');
    }

    if (!isArray(options.expose) || options.expose.length === 0) {
        throw new TypeError(errorText + 'expose');
    }


    var plumbing = core({
        PromiseImpl: options.PromiseImpl
    });

    plumbing.interceptInit(options.request);

    var proto = options.request.Request.prototype;
    for ( var i = 0; i < options.expose.length; i+=1 ) {
        var method = options.expose[i];
        plumbing[ method === 'promise' ? 'exposePromise' : 'exposePromiseMethod' ](proto, null, '_rp_promise', method);
    }

};
