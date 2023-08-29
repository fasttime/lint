'use strict';

const { parallel, series, task } = require('gulp');

task
(
    'clean',
    async () =>
    {
        const { rm } = require('node:fs/promises');

        const options = { force: true, recursive: true };
        await rm('coverage', options);
    },
);

task
(
    'lint',
    async () =>
    {
        const { lint } = require('.');

        await
        lint
        (
            {
                src:            'index.d.ts',
                tsVersion:      'latest',
                parserOptions:  { project: 'tsconfig.json', sourceType: 'module' },
            },
            {
                src:            ['*.js', 'lib/**/*.js', 'test/**/*.js'],
                jsVersion:      2022,
                envs:           'node',
            },
        );
    },
);

task
(
    'test',
    async () =>
    {
        const { default: c8js } = await import('c8js');
        const mochaPath = require.resolve('mocha/bin/mocha');
        await c8js
        (
            mochaPath,
            ['--check-leaks', 'test/**/*.spec.js'],
            {
                reporter:       ['html', 'text-summary'],
                useC8Config:    false,
                watermarks:
                {
                    branches:   [90, 100],
                    functions:  [90, 100],
                    lines:      [90, 100],
                    statements: [90, 100],
                },
            },
        );
    },
);

task('default', series(parallel('clean', 'lint'), 'test'));
