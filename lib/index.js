'use strict';

var semver = require('semver');

if (semver.satisfies(process.version, '>=6.0.0'))
    module.exports = require('./gulp-fasttime-lint');
else
{
    var gutil = require('gulp-util');

    module.exports = gutil.noop;
    console.error(gutil.colors.red('Validation not available in Node.js < 6'));
}
