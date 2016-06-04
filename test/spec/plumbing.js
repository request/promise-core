'use strict';

var plumbing = require('../../');


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
                PromiseImpl: function () {}
            });
        }).not.to.throw();

    });

});
