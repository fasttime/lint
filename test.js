/* eslint-env mocha */

'use strict';

describe
(
    'In a supported environemnt',
    () =>
    {
        const lint              = require('.');
        const assert            = require('assert');
        const gulpTap           = require('gulp-tap');
        const mergeStream       = require('merge-stream');
        const PluginError       = require('plugin-error');
        const vinylBuffer       = require('vinyl-buffer');
        const vinylSourceStream = require('vinyl-source-stream');

        async function assertPluginError(stream, expectedMessage)
        {
            let options;
            try
            {
                await endOfStrean(stream);
                options = { message: 'PluginError expected but not thrown' };
            }
            catch (error)
            {
                if (!(error instanceof PluginError))
                    throw error;
                const actualMessage = error.message;
                if (actualMessage !== expectedMessage)
                {
                    options =
                    {
                        message: 'Unexpected error message',
                        actual: actualMessage,
                        expected: expectedMessage,
                    };
                }
            }
            if (options)
            {
                options.stackStartFn = assertPluginError;
                const assertionError = new assert.AssertionError(options);
                throw assertionError;
            }
        }

        const createFilename = () => `\0${++fileNumber}`;

        function endOfStrean(stream)
        {
            const executor =
            (resolve, reject) =>
            {
                stream.on('data', noop);
                stream.on('end', resolve);
                stream.on('error', reject);
            };
            const promise = new Promise(executor);
            return promise;
        }

        function noop()
        { }

        let fileNumber = 0;

        const vinylDest = () => gulpTap(file => file);

        function vinylSrc(src)
        {
            const streams =
            Object.entries(src).map
            (
                ([filename, contents]) =>
                {
                    const stream = vinylSourceStream(filename);
                    stream.write(contents);
                    process.nextTick(() => stream.end());
                    const stream2 = stream.pipe(vinylBuffer());
                    return stream2;
                },
            );
            const stream = mergeStream(...streams);
            return stream;
        }

        const testLint = lint.with({ vinylDest, vinylSrc, writable: noop });

        it
        (
            'should find no errors',
            async () =>
            {
                const filename = createFilename();
                const src = { [filename]: '\'use strict\';\n' };
                const stream = testLint({ src });
                const actualFiles = [];
                stream.on('data', file => actualFiles.push(file));
                await endOfStrean(stream);
                assert.equal(actualFiles.length, 1);
                const [file] = actualFiles;
                assert.strictEqual(file.basename, filename);
            },
        );

        it
        (
            'should find one error',
            async () =>
            {
                const filename = createFilename();
                const src = { [filename]: '\'use strict\';' };
                const stream = testLint({ src });
                await assertPluginError(stream, 'Failed with 1 error');
            },
        );

        it
        (
            'should find two errors',
            async () =>
            {
                const filename = createFilename();
                const src = { [filename]: '"use strict";' };
                const stream = testLint({ src });
                await assertPluginError(stream, 'Failed with 2 errors');
            },
        );

        it
        (
            'should apply ES6 rules',
            async () =>
            {
                const filename = createFilename();
                const src = { [filename]: '\'use strict\';\n\nSymbol();\n' };
                const stream = testLint({ src, parserOptions: { ecmaVersion: 6 } });
                await endOfStrean(stream);
            },
        );

        it
        (
            'should fix a file',
            async () =>
            {
                const filename = createFilename();
                const src = { [filename]: '\'use strict\';' };
                const stream = testLint({ src, fix: true });
                await endOfStrean(stream);
            },
        );
    },
);

describe
(
    'In an unsupported environment',
    () =>
    {
        const proxyquire = require('proxyquire');

        beforeEach
        (
            () =>
            {
                originalError = console.error;
                console.error = Function();
            },
        );

        afterEach
        (
            () =>
            {
                console.error = originalError;
            },
        );

        let originalError;

        it
        (
            'should do nothing',
            () =>
            {
                const lint = proxyquire('.', { semver: { satisfies: () => false } });
                lint();
                lint.with()();
            },
        );
    },
);
