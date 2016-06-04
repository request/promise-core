'use strict';

var Bluebird = require('bluebird'),
    configure = require('../../configure/request2.js'),
    stealthyRequire = require('stealthy-require')(require);


describe('Promise-Core for Request@2', function () {

    describe('during configuration', function () {

        it('should verify the options', function () {

            var request = stealthyRequire('request');

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

            request = stealthyRequire('request');

            expect(function () {
                configure({
                    request: request,
                    expose: ['promise'],
                    PromiseImpl: Bluebird
                });
            }).to.throw('Please expose "then"');

        });

    });

});
