'use strict';

exports.default =
() =>
{
    const lint = require('.');

    const stream =
    lint
    (
        {
            src: 'index.js',
            envs: 'node',
        },
        {
            src: ['*.js', '!index.js'],
            envs: 'node',
            parserOptions: { ecmaVersion: 8 },
        },
        {
            src: 'lib/**/*.js',
            envs: 'node',
            parserOptions: { ecmaVersion: 6 },
        },
    );
    return stream;
};
