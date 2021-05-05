/* eslint-env mocha */

'use strict';

const LONG_TIMEOUT = 10000;

describe
(
    'gulp-lint in a supported environemnt',
    () =>
    {
        const lint              = require('..');
        const assert            = require('assert');
        const gulpTap           = require('gulp-tap');
        const mergeStream       = require('merge-stream');
        const vinylBuffer       = require('vinyl-buffer');
        const vinylSourceStream = require('vinyl-source-stream');

        async function assertPluginError(stream, expectedMessage)
        {
            let options;
            try
            {
                await endOfStream(stream);
                options = { message: 'PluginError expected but not thrown' };
            }
            catch (error)
            {
                if (!(error instanceof Error) || error.constructor.name !== 'PluginError')
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

        const createFilename = (extension = '.js') => `\0${++fileNumber}${extension}`;

        function endOfStream(stream)
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

        const mockLint = writable => lint.with({ vinylDest, vinylSrc, writable });

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

        const testLint = mockLint(noop);

        it
        (
            'finds no errors',
            async () =>
            {
                const filename = createFilename();
                const src = { [filename]: '\'use strict\';\n' };
                const stream = testLint({ src });
                const actualFiles = [];
                stream.on('data', file => actualFiles.push(file));
                await endOfStream(stream);
                assert.strictEqual(actualFiles.length, 1);
                const [file] = actualFiles;
                assert.strictEqual(file.basename, filename);
            },
        );

        it
        (
            'finds one error in a JavaScript file',
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
            'finds two errors in one file',
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
            'finds multiple errors in files with the same configuration',
            async () =>
            {
                const setPrepareWatchProgram = require('./set-prepare-watch-program');

                const tsSourceText = 'Object();';
                setPrepareWatchProgram(() => tsSourceText);
                const filename_cjs      = createFilename('.cjs');
                const filename_js       = createFilename('.js');
                const filename_mjs      = createFilename('.mjs');
                const filename_ts       = createFilename('.ts');
                const filename_feature  = createFilename('.feature');
                const src =
                {
                    [filename_cjs]:     '\'use strict\'; \n',
                    [filename_js]:      '\'use strict\';',
                    [filename_mjs]:     '"use strict";\n',
                    [filename_ts]:      tsSourceText,
                    [filename_feature]: '!\n',
                };
                const stream =
                testLint({ src, parserOptions: { project: 'test/tsconfig-test.json' } });
                await assertPluginError(stream, 'Failed with 5 errors');
            },
        )
        .timeout(LONG_TIMEOUT);

        it
        (
            'finds multiple errors in files with different configurations',
            async () =>
            {
                const filename1 = createFilename('.js');
                const filename2 = createFilename('.js');
                const src1 = { [filename1]: '\'use strict\';' };
                const src2 = { [filename2]: 'Object();\n' };
                const stream = testLint({ src: src1 }, { src: src2 });
                await assertPluginError(stream, 'Failed with 2 errors');
            },
        );

        it
        (
            'infers es6 environment from ecmaVersion explicitly ≥ 2015',
            async () =>
            {
                const filename = createFilename();
                const src = { [filename]: '\'use strict\';\n\nSymbol();\n' };
                const stream = testLint({ src, parserOptions: { ecmaVersion: 6 } });
                await endOfStream(stream);
            },
        );

        it
        (
            'infers es2017 environment from ecmaVersion explicitly ≥ 2017',
            async () =>
            {
                const filename = createFilename();
                const src = { [filename]: '\'use strict\';\n\nSharedArrayBuffer();\n' };
                const stream = testLint({ src, parserOptions: { ecmaVersion: 2017 } });
                await endOfStream(stream);
            },
        );

        it
        (
            'infers es2020 environment from ecmaVersion explicitly ≥ 2020',
            async () =>
            {
                const filename = createFilename();
                const src = { [filename]: '\'use strict\';\n\nBigInt();\n' };
                const stream = testLint({ src, parserOptions: { ecmaVersion: 2020 } });
                await endOfStream(stream);
            },
        );

        it
        (
            'infers es2021 environment from ecmaVersion explicitly ≥ 2021',
            async () =>
            {
                const filename = createFilename();
                const src = { [filename]: '\'use strict\';\n\nWeakRef();\n' };
                const stream = testLint({ src, parserOptions: { ecmaVersion: 2021 } });
                await endOfStream(stream);
            },
        );

        it
        (
            'infers ecmaVersion ≥ 2015 from sourceType "module"',
            async () =>
            {
                const filename = createFilename();
                const src = { [filename]: 'void (() => null);\n' };
                const stream = testLint({ src, parserOptions: { sourceType: 'module' } });
                await endOfStream(stream);
            },
        );

        it
        (
            'handles ecmaVersion ≥ 2015',
            async () =>
            {
                const filename = createFilename();
                const src = { [filename]: '\'use strict\';\n\nObject.assign({ }, { });\n' };
                const stream = testLint({ src, parserOptions: { ecmaVersion: 2018 } });
                await assertPluginError(stream, 'Failed with 1 error');
            },
        );

        it
        (
            'fixes a file',
            async () =>
            {
                const filename = createFilename();
                const src = { [filename]: '\'use strict\';' };
                const stream = testLint({ src, fix: true });
                await endOfStream(stream);
            },
        );

        it
        (
            'handles a legacy envs array parameter',
            async () =>
            {
                const filename = createFilename();
                const src = { [filename]: '\'use strict\';\n\nprocess.exitCode = 0;\n' };
                const stream = testLint({ src, envs: ['es2015', 'node'] });
                await endOfStream(stream);
            },
        );

        it
        (
            'handles a legacy envs string parameter',
            async () =>
            {
                const filename = createFilename();
                const src = { [filename]: '\'use strict\';\n\nprocess.exitCode = 0;\n' };
                const stream = testLint({ src, envs: 'node' });
                await endOfStream(stream);
            },
        );

        it
        (
            'finds no errors in a TypeScript file',
            async () =>
            {
                const setPrepareWatchProgram = require('./set-prepare-watch-program');

                const sourceText = 'void 0;\n';
                setPrepareWatchProgram(() => sourceText);
                const filename = createFilename('.ts');
                const src = { [filename]: sourceText };
                const stream =
                testLint({ src, parserOptions: { project: 'test/tsconfig-test.json' } });
                await endOfStream(stream);
            },
        )
        .timeout(LONG_TIMEOUT);

        it
        (
            'finds errors in a TypeScript file',
            async () =>
            {
                const setPrepareWatchProgram = require('./set-prepare-watch-program');

                const tsSourceText = '///\t<reference path="doo"/>\n{}';
                setPrepareWatchProgram(() => tsSourceText);
                const filename = createFilename('.ts');
                const src = { [filename]: tsSourceText };
                const stream =
                testLint({ src, parserOptions: { project: 'test/tsconfig-test.json' } });
                await assertPluginError(stream, 'Failed with 6 errors');
            },
        )
        .timeout(LONG_TIMEOUT);

        it
        (
            'finds no errors in a Gherkin file',
            async () =>
            {
                const filename = createFilename('.feature');
                const src = { [filename]: 'Feature:' };
                const stream = testLint({ src });
                await endOfStream(stream);
            },
        );

        it
        (
            'finds one error in a Gherkin file',
            async () =>
            {
                const filename = createFilename('.feature');
                const src = { [filename]: 'Feature:\nScenario:\nWhen Foo\nBar\n' };
                const stream = testLint({ src });
                await assertPluginError(stream, 'Failed with 1 error');
            },
        );

        it
        (
            'finds errors in a Gherkin file',
            async () =>
            {
                const filename = createFilename('.feature');
                const src =
                {
                    [filename]:
                    'A\n\nB\nC\n',
                };
                const stream = testLint({ src });
                await assertPluginError(stream, 'Failed with 3 errors');
            },
        );

        it
        (
            'raises a warning for an unsupported file type',
            async () =>
            {
                function writable(message)
                {
                    [,,,, actualLine] = message.replace(/\u001b\[\d+m/g, '').split('\n');
                }

                const filename = createFilename('.txt');
                const src = { [filename]: '' };
                let actualLine;
                const stream = mockLint(writable)({ src });
                await endOfStream(stream);
                const expectedLine = '✖ 1 problem (0 errors, 1 warning)';
                assert.strictEqual(actualLine, expectedLine);
            },
        );
    },
);

describe
(
    'gulp-lint in an unsupported environment',
    () =>
    {
        const postrequire = require('postrequire');

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
            'does nothing',
            () =>
            {
                const lint =
                postrequire
                (
                    '..',
                    stubs =>
                    {
                        const { require } = stubs;
                        stubs.require =
                        id =>
                        {
                            const exports =
                            id !== 'semver' ? require(id) : { satisfies: () => false };
                            return exports;
                        };
                    },
                );
                lint();
                lint.with()();
            },
        );
    },
);
