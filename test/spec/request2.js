'use strict';

var Bluebird = require('bluebird'),
    configure = require('../../configure/request2.js'),
    errors = require('../../errors'),
    stealthyRequire = require('stealthy-require'),
    startServer = require('../fixtures/server.js');


describe('Promise-Core for Request@2', function () {

    describe('during configuration', function () {

        it('should verify the options', function () {

            var request = stealthyRequire(require.cache, function () {
                return require('request');
            });

            expect(function () {
                configure();
            }).to.throw('Please verify options');

            expect(function () {
                configure('not an object');
            }).to.throw('Please verify options');

            expect(function () {
                configure({});
            }).to.throw('Please verify options.request');

            expect(function () {
                configure({
                    request: 'not a function'
                });
            }).to.throw('Please verify options.request');

            expect(function () {
                configure({
                    request: request
                });
            }).to.throw('Please verify options.expose');

            expect(function () {
                configure({
                    request: request,
                    expose: 'not an array'
                });
            }).to.throw('Please verify options.expose');

            expect(function () {
                configure({
                    request: request,
                    expose: []
                });
            }).to.throw('Please verify options.expose');

            expect(function () {
                configure({
                    request: request,
                    expose: ['then', 'promise']
                });
            }).to.throw('Please verify options.PromiseImpl');

            expect(function () {
                configure({
                    request: request,
                    expose: ['then', 'promise'],
                    PromiseImpl: 'not a function'
                });
            }).to.throw('Please verify options.PromiseImpl');

            expect(function () {
                configure({
                    request: request,
                    expose: ['then', 'promise'],
                    PromiseImpl: Bluebird
                });
            }).not.to.throw();

            request = stealthyRequire(require.cache, function () {
                return require('request');
            });

            expect(function () {
                configure({
                    request: request,
                    expose: ['promise'],
                    PromiseImpl: Bluebird
                });
            }).to.throw('Please expose "then"');

        });

        it('should forward the constructorMixin', function () {

            var mixinCalled = false; // eslint-disable-line no-unused-vars

            var request = stealthyRequire(require.cache, function () {
                return require('request');
            });

            configure({
                request: request,
                expose: ['then', 'catch'],
                PromiseImpl: Bluebird,
                constructorMixin: function () {
                    mixinCalled = true;
                }
            });

            return request('http://localhost:4000') // not started yet so expecting ECONNREFUSED
                .catch(function () {
                    expect(mixinCalled).to.eql(true);
                });

        });

    });

    /**
     * The following tests are testing the correct integration of plumbing.init and plumbing.callback.
     *
     * That means their test coverage is not 100% (the plumbing unit tests already do that)
     * but instead focus on the following integration aspects:
     * - All input parameters are passed to the two functions as expected.
     * - All return values of the two functions are processed by Request as expected.
     * - All operations on the context (this) of the two functions have the expected effect.
     * - Plus 100% coverage of the configuration code.
     */
    describe('doing requests', function () {

        var request = null, stopServer = null;

        before(function (done) {

            request = stealthyRequire(require.cache, function () {
                return require('request');
            });

            configure({
                request: request,
                PromiseImpl: Bluebird,
                expose: [
                    'then',
                    'catch',
                    'finally',
                    'promise'
                ]
            });

            startServer(4000, function (stop) {
                stopServer = stop;
                done();
            });

        });

        after(function (done) {

            stopServer(done);

        });

        it('that is successful', function (done) {

            request('http://localhost:4000/200')
                .then(function (body) {
                    expect(body).to.eql('GET /200');
                    done();
                })
                .catch(function (err) {
                    done(err);
                });

        });

        it('that is successful with non-default options', function (done) {

            request({
                uri: 'http://localhost:4000/404',
                simple: false,
                resolveWithFullResponse: true,
                transform: function () {
                    return 'must not be called';
                },
                transform2xxOnly: true
            })
                .then(function (response) {
                    expect(response.body).to.eql('GET /404');
                    done();
                })
                .catch(function (err) {
                    done(err);
                });

        });

        it('with method "post" in lower case', function (done) {

            request({
                method: 'post',
                uri: 'http://localhost:4000/200',
                body: {
                    a: 'b'
                },
                json: true
            })
                .then(function (body) {
                    expect(body).to.eql('POST /200 - {"a":"b"}');
                    done();
                })
                .catch(function (err) {
                    done(err);
                });

        });

        it('with a transform function', function (done) {

            request({
                method: 'post',
                uri: 'http://localhost:4000/200',
                body: {
                    a: 'b'
                },
                json: true,
                transform: function (body, response, resolveWithFullResponse) {
                    return body.split('').reverse().join('');
                }
            })
                .then(function (body) {
                    expect(body).to.eql('POST /200 - {"a":"b"}'.split('').reverse().join(''));
                    done();
                })
                .catch(function (err) {
                    done(err);
                });

        });

        it('that is successfully redirected', function (done) {

            request('http://localhost:4000/301')
                .then(function (body) {
                    expect(body).to.eql('GET /200');
                    done();
                })
                .catch(function (err) {
                    done(err);
                });

        });

        it('that fails', function (done) {

            request('http://localhost:1/200')
                .then(function () {
                    done(new Error('Expected promise to be rejected.'));
                })
                .catch(function (err) {
                    expect(err instanceof errors.RequestError).to.eql(true);
                    done();
                });

        });

        it('that gets a 500 response', function (done) {

            request('http://localhost:4000/500')
                .then(function () {
                    done(new Error('Expected promise to be rejected.'));
                })
                .catch(function (err) {
                    expect(err instanceof errors.StatusCodeError).to.eql(true);
                    done();
                });

        });

        it('calling the callback, too', function (done) {

            var callbackWasCalled = false;

            request('http://localhost:4000/200', function () {
                callbackWasCalled = true;
            })
                .then(function (body) {
                    expect(body).to.eql('GET /200');
                    expect(callbackWasCalled).to.eql(true);
                    done();
                })
                .catch(function (err) {
                    done(err);
                });

        });

    });

    describe('should support Request\'s', function () {

        var request = null, stopServer = null;

        before(function (done) {

            request = stealthyRequire(require.cache, function () {
                return require('request');
            });

            configure({
                request: request,
                PromiseImpl: Bluebird,
                expose: [
                    'then',
                    'catch',
                    'finally',
                    'promise'
                ]
            });

            startServer(4000, function (stop) {
                stopServer = stop;
                done();
            });

        });

        after(function (done) {

            stopServer(done);

        });

        it('method shortcuts', function (done) {

            request.post({
                uri: 'http://localhost:4000/404',
                body: {
                    a: 'b'
                },
                json: true,
                simple: false // <-- ensures that parameter is forwarded
            })
                .then(function (body) {
                    expect(body).to.eql('POST /404 - {"a":"b"}');
                    done();
                })
                .catch(function (err) {
                    done(err);
                });

        });

        it('.defaults(...) feature', function (done) {

            var rpSimpleOff = request.defaults({ simple: false });

            rpSimpleOff({
                uri: 'http://localhost:4000/404',
                resolveWithFullResponse: true
            })
                .then(function (response) {
                    expect(response.body).to.eql('GET /404');
                    done();
                })
                .catch(function (err) {
                    done(err);
                });

        });

        if (process.env.V_REQUEST !== '2.34.0') { // Was never supported in this version so fixing it wouldn't make sense.

            it('.defaults(...) feature using it multiple times', function (done) {

                var rpSimpleOff = request.defaults({ simple: false });
                var rpSimpleOffWithFullResp = rpSimpleOff.defaults({ resolveWithFullResponse: true });

                rpSimpleOffWithFullResp('http://localhost:4000/404')
                    .then(function (response) {
                        expect(response.body).to.eql('GET /404');
                        done();
                    })
                    .catch(function (err) {
                        done(err);
                    });

            });

        }

        it('event emitter', function (done) {

            request('http://localhost:4000/200')
                .on('complete', function (httpResponse, body) {
                    expect(httpResponse.statusCode).to.eql(200);
                    expect(body).to.eql('GET /200');
                    done();
                });

        });

        it('main function to take extra options as the second parameter', function (done) {

            request('http://localhost:4000/200', { method: 'POST', json: { foo: 'bar' } })
                .then(function (body) {
                    expect(body).to.eql('POST /200 - {"foo":"bar"}');
                    done();
                })
                .catch(function (err) {
                    done(err);
                });

        });

    });

});
