'use strict';

const { parallel, series, task } = require('gulp');

task
(
    'clean',
    async () =>
    {
        const { promises: { rm } } = require('fs');

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
                src: 'index.d.ts',
                parserOptions: { project: 'tsconfig.json', sourceType: 'module' },
            },
            {
                src: ['*.js', 'lib/**/*.js', 'test/**/*.js'],
                envs: 'node',
                parserOptions: { ecmaVersion: 9 },
            },
        );
    },
);

task
(
    'check-eslint-rules',
    done =>
    {
        let error;
        {
            const eslintRulesOk = require('./check-eslint-rules');

            if (!eslintRulesOk)
            {
                const PluginError = require('plugin-error');

                error = new PluginError('check-eslint-rules', 'Task check-eslint-rules failed');
            }
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
        const c8Path = resolve('c8/bin/c8');
        const mochaPath = resolve('mocha/bin/mocha');
        const childProcess =
        fork
        (
            c8Path,
            [
                '--reporter=html',
                '--reporter=text-summary',
                mochaPath,
                '--check-leaks',
                'test/**/*.spec.js',
            ],
        );
        childProcess.on('exit', code => callback(code && 'Test failed'));
    },
);

task('default', series(parallel('clean', 'lint'), 'check-eslint-rules', 'test'));
