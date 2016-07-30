'use strict';

var Bluebird = require('bluebird'),
    configure = require('../../configure/request-next.js'),
    errors = require('../../errors'),
    nodeVersion = require('node-version'),
    startServer = require('../fixtures/server.js');


describe('Promise-Core for Request@next', function () {

    if (Number(nodeVersion.major) < 4) {
        return; // request@next uses ES6 and thus wouldn't run on old node.js versions
    }

    var api = require('@request/api'),
        client = require('@request/client');


    describe('during configuration', function () {

        it('should verify the options', function () {

            expect(function () {
                configure();
            }).to.throw('Please verify options');

            expect(function () {
                configure('not an object');
            }).to.throw('Please verify options');

            expect(function () {
                configure({});
            }).to.throw('Please verify options.client');

            expect(function () {
                configure({
                    client: 'not a function'
                });
            }).to.throw('Please verify options.client');

            expect(function () {
                configure({
                    client: client
                });
            }).to.throw('Please verify options.expose');

            expect(function () {
                configure({
                    client: client,
                    expose: 'not an array'
                });
            }).to.throw('Please verify options.expose');

            expect(function () {
                configure({
                    client: client,
                    expose: []
                });
            }).to.throw('Please verify options.expose');

            expect(function () {
                configure({
                    client: client,
                    expose: ['then', 'promise']
                });
            }).to.throw('Please verify options.PromiseImpl');

            expect(function () {
                configure({
                    client: client,
                    expose: ['then', 'promise'],
                    PromiseImpl: 'not a function'
                });
            }).to.throw('Please verify options.PromiseImpl');

            expect(function () {
                configure({
                    client: client,
                    expose: ['then', 'promise'],
                    PromiseImpl: Bluebird
                });
            }).not.to.throw();

            expect(function () {
                configure({
                    client: client,
                    expose: ['promise'],
                    PromiseImpl: Bluebird
                });
            }).to.throw('Please expose "then"');

        });

        it('should forward the constructorMixin', function () {

            var mixinCalled = false; // eslint-disable-line no-unused-vars

            var request = api({
                type: 'basic',
                define: {
                    request: configure({
                        client: client,
                        PromiseImpl: Bluebird,
                        expose: [
                            'then',
                            'catch'
                        ],
                        constructorMixin: function () {
                            mixinCalled = true;
                        }
                    })
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

            request = api({
                type: 'basic',
                define: {
                    request: configure({
                        client: client,
                        PromiseImpl: Bluebird,
                        expose: [
                            'then',
                            'catch',
                            'finally',
                            'promise'
                        ]
                    })
                }
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

        // TODO: Check if request@next fixed passing the response to the callback
        xit('that is successful with non-default options', function (done) {

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
                    // TODO: Check if request@next fixed sending the body
                    // expect(body).to.eql('POST /200 - {"a":"b"}');
                    expect(body).to.eql('POST /200 - {}');
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
                    // TODO: Check if request@next fixed sending the body
                    // expect(body).to.eql('POST /200 - {"a":"b"}'.split('').reverse().join(''));
                    expect(body).to.eql('POST /200 - {}'.split('').reverse().join(''));
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

        // TODO: Add tests for Request's non-promise related features

    });

});
