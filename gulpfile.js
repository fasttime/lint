'use strict';

const { parallel, series, task } = require('gulp');

task
(
    'clean',
    async () =>
    {
        const { promises: { rmdir } } = require('fs');

        const paths = ['.nyc_output', 'coverage'];
        const options = { recursive: true };
        await Promise.all(paths.map(path => rmdir(path, options)));
    },
);

task
(
    'lint',
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
                src: 'index.d.ts',
                parserOptions: { project: 'tsconfig.json', sourceType: 'module' },
            },
            {
                src: ['*.js', 'test/**/*.js', '!index.js'],
                envs: 'node',
                parserOptions: { ecmaVersion: 9 },
            },
            {
                src: 'lib/**/*.js',
                envs: 'node',
                parserOptions: { ecmaVersion: 9 },
            },
        );
        return stream;
    },
);

task
(
    'check-eslint-rules',
    done =>
    {
        let error;
        const eslintRulesOk = require('./check-eslint-rules');
        if (!eslintRulesOk)
        {
            const PluginError = require('plugin-error');

            error = new PluginError('check-eslint-rules', 'Task check-eslint-rules failed');
        }
        done(error);
    },
);

task
(
    'test',
    callback =>
    {
        const { fork } = require('child_process');

        const { resolve } = require;
        const nycPath = resolve('nyc/bin/nyc');
        const mochaPath = resolve('mocha/bin/mocha');
        const childProcess =
        fork
        (
            nycPath,
            [
                '--reporter=html',
                '--reporter=text-summary',
                '--',
                mochaPath,
                '--check-leaks',
                'test/test.js',
            ],
        );
        childProcess.on('exit', code => callback(code && 'Test failed'));
    },
);

task('default', series(parallel('clean', 'lint'), 'check-eslint-rules', 'test'));
