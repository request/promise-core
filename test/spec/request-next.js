'use strict';

var client = require('@request/client'),
    Bluebird = require('bluebird'),
    configure = require('../../configure/request-next.js');


describe('Promise-Core for Request@next', function () {

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

    });

});
