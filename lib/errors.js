'use strict';

var MESSAGES = require('http').STATUS_CODES;

function buildMessage(statusCode) {

    var prefix = String(statusCode);
    var padding = ' - ';
    var suffix = MESSAGES[statusCode];

    // if node's http lib does not define a message default to the generic
    // message defined in Section 10 of RFC 2616
    if (!suffix) {
        /* eslint-disable yoda */
        if (100 <= statusCode && statusCode < 200) suffix = 'Informational';
        else if (200 <= statusCode && statusCode < 300) suffix = 'OK';
        else if (300 <= statusCode && statusCode < 400) suffix = 'Redirection';
        else if (400 <= statusCode && statusCode < 500) suffix = 'Client Error';
        else if (500 <= statusCode && statusCode < 600) suffix = 'Server Error';
        else return prefix;
        /* eslint-enable yoda */
    }

    return prefix + padding + suffix;
}

function RequestError(cause, options, response) {

    this.name = 'RequestError';
    this.message = String(cause);
    this.cause = cause;
    this.error = cause; // legacy attribute
    this.options = options;
    this.response = response;

    if (Error.captureStackTrace) { // required for non-V8 environments
        Error.captureStackTrace(this);
    }

}
RequestError.prototype = Object.create(Error.prototype);
RequestError.prototype.constructor = RequestError;


function StatusCodeError(statusCode, body, options, response) {

    this.name = 'StatusCodeError';
    this.statusCode = statusCode;
    this.message = this.buildMessage(statusCode, body, options, response);
    this.error = body; // legacy attribute
    this.options = options;
    this.response = response;

    if (Error.captureStackTrace) { // required for non-V8 environments
        Error.captureStackTrace(this);
    }

}
StatusCodeError.prototype = Object.create(Error.prototype);
StatusCodeError.prototype.constructor = StatusCodeError;
StatusCodeError.prototype.buildMessage = buildMessage;


function TransformError(cause, options, response) {

    this.name = 'TransformError';
    this.message = String(cause);
    this.cause = cause;
    this.error = cause; // legacy attribute
    this.options = options;
    this.response = response;

    if (Error.captureStackTrace) { // required for non-V8 environments
        Error.captureStackTrace(this);
    }

}
TransformError.prototype = Object.create(Error.prototype);
TransformError.prototype.constructor = TransformError;


module.exports = {
    RequestError: RequestError,
    StatusCodeError: StatusCodeError,
    TransformError: TransformError
};
