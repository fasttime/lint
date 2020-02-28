'use strict';

var semver = require('semver');

function noLint()
{
    var through = require('through2');

    var stream = through.obj();
    process.nextTick
    (
        function ()
        {
            stream.end();
        }
    );
    return stream;
}

function redText(str)
{
    str = '\u001b[31m' + str + '\u001b[0m';
    return str;
}

if (semver.satisfies(process.version, '>=10.0.0'))
    module.exports = require('./lib/gulp-lint');
else
{
    var exports = module.exports = noLint.bind();
    exports.with =
    function ()
    {
        return noLint;
    };
    console.error(redText('Linting not available in Node.js < 10'));
}
