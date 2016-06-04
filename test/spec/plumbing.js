'use strict';

var Bluebird = require('bluebird'),
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
                PromiseImpl: function () {}
            });
        }).not.to.throw();

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
