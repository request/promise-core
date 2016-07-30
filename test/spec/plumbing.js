'use strict';

var _ = require('lodash'),
    Bluebird = require('bluebird'),
    errors = require('../../errors'),
    plumbing = require('../../');


describe('Promise-Core\'s Plumbing', function () {

    it('should verify the options', function () {

        expect(function () {
            plumbing();
        }).to.throw('Please verify options');

        expect(function () {
            plumbing('not an object');
        }).to.throw('Please verify options');

        expect(function () {
            plumbing({});
        }).to.throw('Please verify options.PromiseImpl');

        expect(function () {
            plumbing({
                PromiseImpl: 'not a function'
            });
        }).to.throw('Please verify options.PromiseImpl');

        expect(function () {
            plumbing({
                PromiseImpl: function () {},
                constructorMixin: false
            });
        }).to.throw('Please verify options.PromiseImpl');

        expect(function () {
            plumbing({
                PromiseImpl: function () {},
                constructorMixin: function () {}
            });
        }).not.to.throw();

    });

    describe('should provide .init(...)', function () {

        var pl = null;

        before(function () {

            pl = plumbing({
                PromiseImpl: Bluebird
            });

        });

        it('that sets up the promise and the resolve function', function (done) {

            var context = {};

            pl.init.call(context, {});

            expect(_.isFunction(context._rp_promise.then)).to.eql(true);
            expect(_.isFunction(context._rp_resolve)).to.eql(true);

            context._rp_resolve();

            context._rp_promise
                .then(function () {
                    done();
                })
                .catch(function (err) {
                    done(err);
                });

        });

        it('that sets up the promise and the reject function', function (done) {

            var context = {};
            pl.init.call(context, {});

            expect(_.isFunction(context._rp_promise.then)).to.eql(true);
            expect(_.isFunction(context._rp_reject)).to.eql(true);

            context._rp_reject(new Error('Rejected by test case'));

            context._rp_promise
                .then(function () {
                    done(new Error('Expected promise to be rejected.'));
                })
                .catch(function (err) {
                    expect(err.message).to.eql('Rejected by test case');
                    done();
                });

        });

        it('that invokes the constructorMixin', function (done) {

            var pl2 = plumbing({
                PromiseImpl: Bluebird,
                constructorMixin: function (resolve, reject) {
                    if (this._rp_reject === reject) {
                        reject('mixin invoked and this binding correct');
                    } else {
                        reject('mixin invoked but this binding not correct');
                    }
                }
            });

            var context = {};
            pl2.init.call(context, {});

            context._rp_promise
                .then(function () {
                    done(new Error('Expected rejected promise'));
                })
                .catch(function (message) {
                    try {
                        expect(message).to.eql('mixin invoked and this binding correct');
                        done();
                    } catch (e) {
                        done(e);
                    }
                });

        });

        it('that sets up the default options', function () {

            var context = {};
            pl.init.call(context, {});

            expect(_.isFunction(context._rp_options.callback)).to.eql(true);
            delete context._rp_options.callback;

            expect(context._rp_options).to.eql({
                simple: true,
                resolveWithFullResponse: false,
                transform: undefined,
                transform2xxOnly: false
            });

        });

        it('that forwards any custom options', function () {

            var context = {};
            pl.init.call(context, {
                custom: 'test'
            });

            delete context._rp_options.callback;

            expect(context._rp_options).to.eql({
                custom: 'test',
                simple: true,
                resolveWithFullResponse: false,
                transform: undefined,
                transform2xxOnly: false
            });

        });

        it('that allows custom values for the Request-Promise options', function () {

            var customTransform = function () {};

            var context = {};
            pl.init.call(context, {
                simple: false,
                resolveWithFullResponse: true,
                transform: customTransform,
                transform2xxOnly: true
            });

            delete context._rp_options.callback;

            expect(context._rp_options).to.eql({
                simple: false,
                resolveWithFullResponse: true,
                transform: customTransform,
                transform2xxOnly: true
            });

        });

        it('that converts the method to upper case', function () {

            var context = {};
            pl.init.call(context, {
                method: 'get'
            });

            expect(context._rp_options.method).to.eql('GET');

        });

        it('that applies a default transform for HEAD requests', function () {

            var context = {};
            pl.init.call(context, {
                method: 'head'
            });

            expect(context._rp_options.transform).to.eql(pl.defaultTransformations.HEAD);

        });

        it('that keeps the already existing callback', function () {

            var alreadyExistingCallback = function () {};

            var context = {};
            pl.init.call(context, {
                callback: alreadyExistingCallback
            });

            expect(context._rp_callbackOrig).to.eql(alreadyExistingCallback);

        });

    });

    describe('should provide .callback(...)', function () {

        var pl = null;

        before(function () {

            pl = plumbing({
                PromiseImpl: Bluebird
            });

        });

        it('that rejects if an error is passed', function (done) {

            var context = {};
            pl.init.call(context, {});

            var passedError = new Error('test error');
            pl.callback.call(context, passedError, 'dummy response');

            context._rp_promise
                .then(function () {
                    done(new Error('Expected promise to be rejected.'));
                })
                .catch(function (err) {
                    expect(err instanceof errors.RequestError).to.eql(true);
                    expect(err.name).to.eql('RequestError');
                    expect(err.message).to.eql(String(passedError));
                    expect(err.cause).to.eql(passedError);
                    expect(err.error).to.eql(passedError);
                    expect(err.options).to.eql(context._rp_options);
                    expect(err.response).to.eql('dummy response');
                    done();
                });

        });

        it('that resolves a 200 response', function (done) {

            var context = {};
            pl.init.call(context, {});

            var response = {
                statusCode: 200,
                body: {
                    a: 'b'
                }
            };
            pl.callback.call(context, null, response, response.body);

            context._rp_promise
                .then(function (body) {
                    expect(body).to.eql(response.body);
                    done();
                })
                .catch(function (err) {
                    done(err);
                });

        });

        it('that resolves a 201 response', function (done) {

            var context = {};
            pl.init.call(context, {});

            var response = {
                statusCode: 201,
                body: {
                    a: 'b'
                }
            };
            pl.callback.call(context, null, response, response.body);

            context._rp_promise
                .then(function (body) {
                    expect(body).to.eql(response.body);
                    done();
                })
                .catch(function (err) {
                    done(err);
                });

        });

        it('that resolves a 2xx response with full response', function (done) {

            var context = {};
            pl.init.call(context, {
                resolveWithFullResponse: true
            });

            var response = {
                statusCode: 201,
                body: {
                    a: 'b'
                }
            };
            pl.callback.call(context, null, response, response.body);

            context._rp_promise
                .then(function (fullResponse) {
                    expect(fullResponse).to.eql(response);
                    done();
                })
                .catch(function (err) {
                    done(err);
                });

        });

        it('that rejects a non-2xx response in simple mode', function (done) {

            var context = {};
            pl.init.call(context, {});

            var response = {
                statusCode: 404,
                body: {
                    a: 'b'
                }
            };
            pl.callback.call(context, null, response, response.body);

            context._rp_promise
                .then(function () {
                    done(new Error('Expected promise to be rejected.'));
                })
                .catch(function (err) {
                    expect(err instanceof errors.StatusCodeError).to.eql(true);
                    expect(err.name).to.eql('StatusCodeError');
                    expect(err.statusCode).to.eql(404);
                    expect(err.message).to.eql('404 - {"a":"b"}');
                    expect(err.error).to.eql(response.body);
                    expect(err.options).to.eql(context._rp_options);
                    expect(err.response).to.eql(response);
                    done();
                });

        });

        it('that resolves a non-2xx response in non-simple mode', function (done) {

            var context = {};
            pl.init.call(context, {
                simple: false
            });

            var response = {
                statusCode: 404,
                body: {
                    a: 'b'
                }
            };
            pl.callback.call(context, null, response, response.body);

            context._rp_promise
                .then(function (body) {
                    expect(body).to.eql(response.body);
                    done();
                })
                .catch(function (err) {
                    done(err);
                });

        });

        it('that applies the transform function to 2xx responses', function (done) {

            var context = {};
            pl.init.call(context, {
                transform: function (body, response, resolveWithFullResponse) {
                    return JSON.stringify(body) + ' - ' + JSON.stringify(response) + ' - ' + resolveWithFullResponse;
                }
            });

            var res = {
                statusCode: 200,
                body: {
                    a: 'b'
                }
            };
            pl.callback.call(context, null, res, res.body);

            context._rp_promise
                .then(function (transformed) {
                    expect(transformed).to.eql(JSON.stringify(res.body) + ' - ' + JSON.stringify(res) + ' - false');
                    done();
                })
                .catch(function (err) {
                    done(err);
                });

        });

        it('that applies the transform function to 2xx responses which throws an error', function (done) {

            var cause = new Error('transform failed');

            var context = {};
            pl.init.call(context, {
                transform: function (body, response, resolveWithFullResponse) {
                    throw cause;
                }
            });

            var res = {
                statusCode: 200,
                body: {
                    a: 'b'
                }
            };
            pl.callback.call(context, null, res, res.body);

            context._rp_promise
                .then(function () {
                    done(new Error('Expected promise to be rejected.'));
                })
                .catch(function (err) {
                    expect(err instanceof errors.TransformError).to.eql(true);
                    expect(err.name).to.eql('TransformError');
                    expect(err.message).to.eql(String(cause));
                    expect(err.cause).to.eql(cause);
                    expect(err.error).to.eql(cause);
                    expect(err.options).to.eql(context._rp_options);
                    expect(err.response).to.eql(res);
                    done();
                });

        });

        it('that applies the transform function to 2xx responses which returns a promise', function (done) {

            var context = {};
            pl.init.call(context, {
                transform: function (body, response, resolveWithFullResponse) {
                    return Bluebird.resolve(JSON.stringify(body) + ' - ' + JSON.stringify(response) + ' - ' + resolveWithFullResponse);
                }
            });

            var res = {
                statusCode: 200,
                body: {
                    a: 'b'
                }
            };
            pl.callback.call(context, null, res, res.body);

            context._rp_promise
                .then(function (transformed) {
                    expect(transformed).to.eql(JSON.stringify(res.body) + ' - ' + JSON.stringify(res) + ' - false');
                    done();
                })
                .catch(function (err) {
                    done(err);
                });

        });

        it('that applies the transform function to 2xx responses which returns a rejected promise', function (done) {

            var cause = new Error('transform failed');

            var context = {};
            pl.init.call(context, {
                transform: function (body, response, resolveWithFullResponse) {
                    return Bluebird.reject(cause);
                }
            });

            var res = {
                statusCode: 200,
                body: {
                    a: 'b'
                }
            };
            pl.callback.call(context, null, res, res.body);

            context._rp_promise
                .then(function () {
                    done(new Error('Expected promise to be rejected.'));
                })
                .catch(function (err) {
                    expect(err instanceof errors.TransformError).to.eql(true);
                    expect(err.name).to.eql('TransformError');
                    expect(err.message).to.eql(String(cause));
                    expect(err.cause).to.eql(cause);
                    expect(err.error).to.eql(cause);
                    expect(err.options).to.eql(context._rp_options);
                    expect(err.response).to.eql(res);
                    done();
                });

        });

        it('that applies the transform function to 2xx responses for simple = true and transform2xxOnly = true', function (done) {

            var context = {};
            pl.init.call(context, {
                transform: function (body, response, resolveWithFullResponse) {
                    return JSON.stringify(body) + ' - ' + JSON.stringify(response) + ' - ' + resolveWithFullResponse;
                },
                transform2xxOnly: true
            });

            var res = {
                statusCode: 200,
                body: {
                    a: 'b'
                }
            };
            pl.callback.call(context, null, res, res.body);

            context._rp_promise
                .then(function (transformed) {
                    expect(transformed).to.eql(JSON.stringify(res.body) + ' - ' + JSON.stringify(res) + ' - false');
                    done();
                })
                .catch(function (err) {
                    done(err);
                });

        });

        it('that applies the transform function to 2xx responses for simple = false and transform2xxOnly = true', function (done) {

            var context = {};
            pl.init.call(context, {
                simple: false,
                transform: function (body, response, resolveWithFullResponse) {
                    return JSON.stringify(body) + ' - ' + JSON.stringify(response) + ' - ' + resolveWithFullResponse;
                },
                transform2xxOnly: true
            });

            var res = {
                statusCode: 200,
                body: {
                    a: 'b'
                }
            };
            pl.callback.call(context, null, res, res.body);

            context._rp_promise
                .then(function (transformed) {
                    expect(transformed).to.eql(JSON.stringify(res.body) + ' - ' + JSON.stringify(res) + ' - false');
                    done();
                })
                .catch(function (err) {
                    done(err);
                });

        });

        it('that applies the transform function to non-2xx responses in simple mode', function (done) {

            var context = {};
            pl.init.call(context, {
                transform: function (body, response, resolveWithFullResponse) {
                    return JSON.stringify(body) + ' - ' + JSON.stringify(response) + ' - ' + resolveWithFullResponse;
                }
            });

            var res = {
                statusCode: 404,
                body: {
                    a: 'b'
                }
            };
            pl.callback.call(context, null, res, res.body);

            context._rp_promise
                .then(function () {
                    done(new Error('Expected promise to be rejected.'));
                })
                .catch(function (err) {
                    expect(err instanceof errors.StatusCodeError).to.eql(true);
                    expect(err.name).to.eql('StatusCodeError');
                    expect(err.statusCode).to.eql(404);
                    expect(err.message).to.eql('404 - {"a":"b"}');
                    expect(err.error).to.eql(res.body);
                    expect(err.options).to.eql(context._rp_options);
                    expect(err.response).to.eql(JSON.stringify(res.body) + ' - ' + JSON.stringify(res) + ' - false');
                    done();
                });

        });

        it('that applies the transform function to non-2xx responses in simple mode which throws an error', function (done) {

            var cause = new Error('transform failed');

            var context = {};
            pl.init.call(context, {
                transform: function (body, response, resolveWithFullResponse) {
                    throw cause;
                }
            });

            var res = {
                statusCode: 404,
                body: {
                    a: 'b'
                }
            };
            pl.callback.call(context, null, res, res.body);

            context._rp_promise
                .then(function () {
                    done(new Error('Expected promise to be rejected.'));
                })
                .catch(function (err) {
                    expect(err instanceof errors.TransformError).to.eql(true);
                    expect(err.name).to.eql('TransformError');
                    expect(err.message).to.eql(String(cause));
                    expect(err.cause).to.eql(cause);
                    expect(err.error).to.eql(cause);
                    expect(err.options).to.eql(context._rp_options);
                    expect(err.response).to.eql(res);
                    done();
                });

        });

        it('that applies the transform function to non-2xx responses in simple mode which returns a promise', function (done) {

            var context = {};
            pl.init.call(context, {
                transform: function (body, response, resolveWithFullResponse) {
                    return Bluebird.resolve(JSON.stringify(body) + ' - ' + JSON.stringify(response) + ' - ' + resolveWithFullResponse);
                }
            });

            var res = {
                statusCode: 404,
                body: {
                    a: 'b'
                }
            };
            pl.callback.call(context, null, res, res.body);

            context._rp_promise
                .then(function () {
                    done(new Error('Expected promise to be rejected.'));
                })
                .catch(function (err) {
                    expect(err instanceof errors.StatusCodeError).to.eql(true);
                    expect(err.name).to.eql('StatusCodeError');
                    expect(err.statusCode).to.eql(404);
                    expect(err.message).to.eql('404 - {"a":"b"}');
                    expect(err.error).to.eql(res.body);
                    expect(err.options).to.eql(context._rp_options);
                    expect(err.response).to.eql(JSON.stringify(res.body) + ' - ' + JSON.stringify(res) + ' - false');
                    done();
                });

        });

        it('that applies the transform function to non-2xx responses in simple mode which returns a rejected promise', function (done) {

            var cause = new Error('transform failed');

            var context = {};
            pl.init.call(context, {
                transform: function (body, response, resolveWithFullResponse) {
                    return Bluebird.reject(cause);
                }
            });

            var res = {
                statusCode: 404,
                body: {
                    a: 'b'
                }
            };
            pl.callback.call(context, null, res, res.body);

            context._rp_promise
                .then(function () {
                    done(new Error('Expected promise to be rejected.'));
                })
                .catch(function (err) {
                    expect(err instanceof errors.TransformError).to.eql(true);
                    expect(err.name).to.eql('TransformError');
                    expect(err.message).to.eql(String(cause));
                    expect(err.cause).to.eql(cause);
                    expect(err.error).to.eql(cause);
                    expect(err.options).to.eql(context._rp_options);
                    expect(err.response).to.eql(res);
                    done();
                });

        });

        it('that applies the transform function to non-2xx responses for simple = false and transform2xxOnly = false', function (done) {

            var context = {};
            pl.init.call(context, {
                simple: false,
                transform: function (body, response, resolveWithFullResponse) {
                    return JSON.stringify(body) + ' - ' + JSON.stringify(response) + ' - ' + resolveWithFullResponse;
                }
            });

            var res = {
                statusCode: 404,
                body: {
                    a: 'b'
                }
            };
            pl.callback.call(context, null, res, res.body);

            context._rp_promise
                .then(function (transformed) {
                    expect(transformed).to.eql(JSON.stringify(res.body) + ' - ' + JSON.stringify(res) + ' - false');
                    done();
                })
                .catch(function (err) {
                    done(err);
                });

        });

        it('that does not apply the transform function to non-2xx responses for simple = true and transform2xxOnly = false', function (done) {

            var context = {};
            pl.init.call(context, {
                transform: function (body, response, resolveWithFullResponse) {
                    return JSON.stringify(body) + ' - ' + JSON.stringify(response) + ' - ' + resolveWithFullResponse;
                },
                transform2xxOnly: true
            });

            var res = {
                statusCode: 404,
                body: {
                    a: 'b'
                }
            };
            pl.callback.call(context, null, res, res.body);

            context._rp_promise
                .then(function () {
                    done(new Error('Expected promise to be rejected.'));
                })
                .catch(function (err) {
                    expect(err instanceof errors.StatusCodeError).to.eql(true);
                    expect(err.name).to.eql('StatusCodeError');
                    expect(err.statusCode).to.eql(404);
                    expect(err.message).to.eql('404 - {"a":"b"}');
                    expect(err.error).to.eql(res.body);
                    expect(err.options).to.eql(context._rp_options);
                    expect(err.response).to.eql(res);
                    done();
                });

        });

        it('that does not apply the transform function to non-2xx responses for simple = false and transform2xxOnly = false', function (done) {

            var context = {};
            pl.init.call(context, {
                simple: false,
                transform: function (body, response, resolveWithFullResponse) {
                    return JSON.stringify(body) + ' - ' + JSON.stringify(response) + ' - ' + resolveWithFullResponse;
                },
                transform2xxOnly: true
            });

            var res = {
                statusCode: 404,
                body: {
                    a: 'b'
                }
            };
            pl.callback.call(context, null, res, res.body);

            context._rp_promise
                .then(function (body) {
                    expect(body).to.eql(res.body);
                    done();
                })
                .catch(function (err) {
                    done(err);
                });

        });

        it('that applies the default HEAD transform', function (done) {

            var context = {};
            pl.init.call(context, {
                method: 'HEAD'
            });

            var res = {
                statusCode: 200,
                headers: {
                    a: 'b'
                }
            };
            pl.callback.call(context, null, res, res.body);

            context._rp_promise
                .then(function (transformed) {
                    expect(transformed).to.eql(res.headers);
                    done();
                })
                .catch(function (err) {
                    done(err);
                });

        });

        it('that applies the default HEAD transform doing nothing when resolving full response', function (done) {

            var context = {};
            pl.init.call(context, {
                method: 'HEAD',
                resolveWithFullResponse: true
            });

            var res = {
                statusCode: 200,
                headers: {
                    a: 'b'
                }
            };
            pl.callback.call(context, null, res, res.body);

            context._rp_promise
                .then(function (transformed) {
                    expect(transformed).to.eql(res);
                    done();
                })
                .catch(function (err) {
                    done(err);
                });

        });

        it('that applies a custom HEAD transform', function (done) {

            var context = {};
            pl.init.call(context, {
                method: 'HEAD',
                transform: function () {
                    return 'custom';
                }
            });

            var res = {
                statusCode: 200,
                headers: {
                    a: 'b'
                }
            };
            pl.callback.call(context, null, res, res.body);

            context._rp_promise
                .then(function (transformed) {
                    expect(transformed).to.eql('custom');
                    done();
                })
                .catch(function (err) {
                    done(err);
                });

        });

        it('that ignores the transform option if it is not a function', function (done) {

            // IMHO input validation should reject this but behavior is kept this way for backwards compatibility.

            var context = {};
            pl.init.call(context, {
                method: 'HEAD',
                transform: 'not a function',
                resolveWithFullResponse: true
            });

            var res = {
                statusCode: 200,
                headers: {
                    a: 'b'
                }
            };
            pl.callback.call(context, null, res, res.body);

            context._rp_promise
                .then(function (response) {
                    expect(response.headers).to.eql(res.headers);
                    done();
                })
                .catch(function (err) {
                    done(err);
                });

        });

        it('that ignores the transform option for non-2xx responses if it is not a function', function (done) {

            // IMHO input validation should reject this but behavior is kept this way for backwards compatibility.

            var context = {};
            pl.init.call(context, {
                method: 'HEAD',
                transform: 'not a function',
                resolveWithFullResponse: true
            });

            var res = {
                statusCode: 404,
                headers: {
                    a: 'b'
                }
            };
            pl.callback.call(context, null, res, res.body);

            context._rp_promise
                .then(function () {
                    done(new Error('Expected promise to be rejected.'));
                })
                .catch(function (err) {
                    expect(err instanceof errors.StatusCodeError).to.eql(true);
                    expect(err.name).to.eql('StatusCodeError');
                    expect(err.statusCode).to.eql(404);
                    expect(err.message).to.eql('404 - undefined');
                    expect(err.error).to.eql(res.body);
                    expect(err.options).to.eql(context._rp_options);
                    expect(err.response).to.eql(res);
                    done();
                });

        });

        it('that also calls an already existing callback', function (done) {

            var callbackWasCalled = 0;
            var callbackArgs = {};

            var context = {};
            pl.init.call(context, {
                callback: function (err, response, body) {
                    callbackWasCalled += 1;
                    callbackArgs.err = err;
                    callbackArgs.response = response;
                    callbackArgs.body = body;
                }
            });

            var res = {
                statusCode: 200,
                body: {
                    a: 'b'
                }
            };
            pl.callback.call(context, null, res, res.body);

            context._rp_promise
                .then(function (body) {

                    expect(body).to.eql(res.body);

                    expect(callbackWasCalled).to.eql(1);
                    expect(callbackArgs).to.eql({
                        err: null,
                        response: res,
                        body: res.body
                    });

                    done();

                })
                .catch(function (err) {
                    done(err);
                });

        });

        it('that also calls an already existing callback while handlings an error it throws', function (done) {

            var error = new Error('thrown by callback');

            var context = {};
            pl.init.call(context, {
                callback: function () {
                    throw error;
                }
            });

            var res = {
                statusCode: 200,
                body: {
                    a: 'b'
                }
            };

            expect(function () {
                pl.callback.call(context, null, res, res.body);
            }).to.throw('thrown by callback');

            context._rp_promise
                .then(function (body) {
                    expect(body).to.eql(res.body);
                    done();
                })
                .catch(function (err) {
                    done(err);
                });

        });

    });

    describe('should expose a method', function () {

        var exposePromiseMethod = plumbing({ PromiseImpl: Bluebird }).exposePromiseMethod;

        it('with default binding', function () {

            var target = {
                fakePromise: {
                    attr: 5,
                    then: function () {
                        return this.attr;
                    }
                }
            };

            exposePromiseMethod(target, null, 'fakePromise', 'then');

            expect(target.then()).to.eql(5);

        });

        it('with custom binding', function () {

            var target = {};
            var source = {
                fakePromise: {
                    attr: 5,
                    then: function () {
                        return this.attr;
                    }
                }
            };

            exposePromiseMethod(target, source, 'fakePromise', 'then');

            expect(target.then()).to.eql(5);

        });

        it('with a different name', function () {

            var target = {
                fakePromise: {
                    attr: 5,
                    then: function () {
                        return this.attr;
                    }
                }
            };

            exposePromiseMethod(target, null, 'fakePromise', 'then', 'next');

            expect(target.next()).to.eql(5);

        });

        it('and not overwrite existing method', function () {

            var target = {
                fakePromise: {
                    attr: 5,
                    then: function () {
                        return this.attr;
                    }
                }
            };

            expect(function () {
                exposePromiseMethod(target, null, 'fakePromise', 'then', 'fakePromise');
            }).to.throw('Unable to expose method "fakePromise"');

        });

        it('and forward arguments when called', function () {

            var target = {
                fakePromise: {
                    attr: 5,
                    then: function (a, b) {
                        return this.attr + a + b;
                    }
                }
            };

            exposePromiseMethod(target, null, 'fakePromise', 'then');

            expect(target.then(7, 11)).to.eql(5+7+11);

        });

    });

    describe('should expose the promise', function () {

        var exposePromise = plumbing({ PromiseImpl: Bluebird }).exposePromise;

        it('with default binding', function () {

            var target = {
                fakePromise: {
                    attr: 5,
                    then: function () {
                        return this.attr;
                    }
                }
            };

            exposePromise(target, null, 'fakePromise');

            expect(target.promise().then()).to.eql(5);

        });

        it('with custom binding', function () {

            var target = {};
            var source = {
                fakePromise: {
                    attr: 5,
                    then: function () {
                        return this.attr;
                    }
                }
            };

            exposePromise(target, source, 'fakePromise');

            expect(target.promise().then()).to.eql(5);

        });

        it('with a different name', function () {

            var target = {
                fakePromise: {
                    attr: 5,
                    then: function () {
                        return this.attr;
                    }
                }
            };

            exposePromise(target, null, 'fakePromise', 'promise2');

            expect(target.promise2().then()).to.eql(5);

        });

        it('and not overwrite existing method', function () {

            var target = {
                fakePromise: {
                    attr: 5,
                    then: function () {
                        return this.attr;
                    }
                }
            };

            expect(function () {
                exposePromise(target, null, 'fakePromise', 'fakePromise');
            }).to.throw('Unable to expose method "fakePromise"');

        });

    });

});
