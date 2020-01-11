'use strict';

/*
The following code is extracted and adapted from the lodash library.
It is protected by the the MIT License.

Copyright JS Foundation and other contributors <https://js.foundation/>

Based on Underscore.js, copyright Jeremy Ashkenas,
DocumentCloud and Investigative Reporters & Editors <http://underscorejs.org/>

This software consists of voluntary contributions made by many
individuals. For exact contribution history, see the revision history
available at https://github.com/lodash/lodash

The following license applies to all parts of this software except as
documented below:

====

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

var
    asyncTag = '[object AsyncFunction]',
    funcTag = '[object Function]',
    genTag = '[object GeneratorFunction]',
    proxyTag = '[object Proxy]',
    nullTag = '[object Null]',
    stringTag = '[object String]',
    undefinedTag = '[object Undefined]';

function baseGetTag(value) {
    if (value === undefined) {
        return undefinedTag;
    }

    if (value === null) {
        return nullTag;
    }

    return Object.prototype.toString.call(value);
}

function isObject(value) {
    var type = typeof value;
    return value !== undefined && value !== null && (type === 'object' || type === 'function');
}

function isFunction(value) {
    if (!isObject(value)) {
        return false;
    }

    var tag = baseGetTag(value);
    return tag === funcTag || tag === genTag || tag === asyncTag || tag === proxyTag;
}

function isObjectLike(value) {
    return value !== undefined && value !== null && typeof value === 'object';
}

function isString(value) {
    return typeof value === 'string' ||
    !Array.isArray(value) && isObjectLike(value) && baseGetTag(value) === stringTag;
}

module.exports = {
    isFunction: isFunction,
    isString: isString,
    isObjectLike: isObjectLike
};
