<a href="http://promisesaplus.com/">
    <img src="https://promises-aplus.github.io/promises-spec/assets/logo-small.png"
         align="right" alt="Promises/A+ logo" />
</a>

# @request/promise-core

[![Gitter](https://img.shields.io/badge/gitter-join_chat-blue.svg?style=flat-square)](https://gitter.im/request/request-promise?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
[![Build Status](https://img.shields.io/travis/request/promise-core/master.svg?style=flat-square)](https://travis-ci.org/request/promise-core)
[![Coverage Status](https://img.shields.io/coveralls/request/promise-core.svg?style=flat-square)](https://coveralls.io/r/request/promise-core)
[![Dependency Status](https://img.shields.io/gemnasium/request/promise-core.svg?style=flat-square)](https://gemnasium.com/github.com/request/promise-core)
[![Known Vulnerabilities](https://snyk.io/test/npm/promise-core/badge.svg?style=flat-square)](https://snyk.io/test/npm/promise-core)


This package will shortly become the core for the following packages:

- [`request-promise`](https://github.com/request/request-promise)
- [`request-promise-any`](https://github.com/request/request-promise-any)
- [`request-promise-bluebird`](https://github.com/request/request-promise-bluebird)
- [`request-promise-native`](https://github.com/request/request-promise-native)

# Usage

Description forthcoming.

## Contributing

To set up your development environment:

1. clone the repo to your desktop,
2. in the shell `cd` to the main folder,
3. hit `npm install`,
4. hit `npm install gulp -g` if you haven't installed gulp globally yet, and
5. run `gulp dev`. (Or run `node ./node_modules/.bin/gulp dev` if you don't want to install gulp globally.)

`gulp dev` watches all source files and if you save some changes it will lint the code and execute all tests. The test coverage report can be viewed from `./coverage/lcov-report/index.html`.

If you want to debug a test you should use `gulp test-without-coverage` to run all tests without obscuring the code by the test coverage instrumentation.

## Change History

Not released yet.

## License (ISC)

In case you never heard about the [ISC license](http://en.wikipedia.org/wiki/ISC_license) it is functionally equivalent to the MIT license.

See the [LICENSE file](LICENSE) for details.