'use strict';

var errors = require('../../errors');

describe('StatusCodeError', function () {

    it('should use http message string for errors', function () {

        var e = new errors.StatusCodeError(302);
        expect(e.message).to.eql('302 - Found');

        e = new errors.StatusCodeError(400);
        expect(e.message).to.eql('400 - Bad Request');

        e = new errors.StatusCodeError(502);
        expect(e.message).to.eql('502 - Bad Gateway');

    });

    it('should default to generic suffix for unknown status codes', function () {

        var e = new errors.StatusCodeError(160);
        expect(e.message).to.eql('160 - Informational');

        e = new errors.StatusCodeError(260);
        expect(e.message).to.eql('260 - OK');

        e = new errors.StatusCodeError(360);
        expect(e.message).to.eql('360 - Redirection');

        e = new errors.StatusCodeError(440);
        expect(e.message).to.eql('440 - Client Error');

        e = new errors.StatusCodeError(550);
        expect(e.message).to.eql('550 - Server Error');

    });

    it('should default to just status code if it is not in range [100, 599]', function () {

        var e = new errors.StatusCodeError(99);
        expect(e.message).to.eql('99');

        e = new errors.StatusCodeError(600);
        expect(e.message).to.eql('600');

    });

});
