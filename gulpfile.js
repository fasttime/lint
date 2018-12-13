'use strict';

exports.default =
() =>
{
    const lint = require('.');

    const stream =
    lint
    (
        {
            src: 'lib/index.js',
            envs: ['node'],
        },
        {
            src: ['**/*.js', '!lib/index.js'],
            envs: ['node'],
            parserOptions: { ecmaVersion: 6 },
        }
    );
    return stream;
};
