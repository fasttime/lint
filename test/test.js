/* eslint-env mocha */

'use strict';

describe
(
    'In a supported environemnt',
    () =>
    {
        const lint              = require('..');
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
                await endOfStream(stream);
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
                assert.equal(actualFiles.length, 1);
                const [file] = actualFiles;
                assert.strictEqual(file.basename, filename);
            },
        );

        it
        (
            'finds one error',
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
                    [filename_ts]:      'Object();',
                    [filename_feature]: '!\n',
                };
                const stream = testLint({ src, parserOptions: { project: 'tsconfig-test.json' } });
                await assertPluginError(stream, 'Failed with 5 errors');
            },
        )
        .timeout(10000);

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
                const src = { [filename]: '\'use strict\';\nObject(/(.)/);\n' };
                const stream = testLint({ src, parserOptions: { ecmaVersion: 2017 } });
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
            'finds errors in a Gherkin file',
            async () =>
            {
                const filename = createFilename('.feature');
                const src =
                {
                    [filename]:
                    '@Feature: Core: Scenarios, Steps, Mappings\n\nScenario: All steps passing ' +
                    'means the scenario passes\nGiven the step "I add 4 and 5" has a passing ' +
                    'mapping\n',
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
            'does nothing',
            () =>
            {
                const lint = proxyquire('..', { semver: { satisfies: () => false } });
                lint();
                lint.with()();
            },
        );
    },
);
