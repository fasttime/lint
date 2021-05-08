/* eslint-env mocha */

'use strict';

const LONG_TIMEOUT = 10000;

describe
(
    'gulp-lint',
    () =>
    {
        const assert            = require('assert');
        const gulpTap           = require('gulp-tap');
        const mergeStream       = require('merge-stream');
        const postrequire       = require('postrequire');
        const vinylBuffer       = require('vinyl-buffer');
        const vinylSourceStream = require('vinyl-source-stream');

        async function assertPluginError
        (stream, expectedTotalErrorCount, expectedTotalWarningCount = 0)
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
                const expectedMessage = 'Lint failed';
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
            const actualTotalErrorCount = stream.totalErrorCount;
            if (actualTotalErrorCount !== expectedTotalErrorCount)
            {
                options =
                {
                    message: 'Unexpected total error count',
                    actual: actualTotalErrorCount,
                    expected: expectedTotalErrorCount,
                    stackStartFn: assertPluginError,
                };
                const assertionError = new assert.AssertionError(options);
                throw assertionError;
            }
            const actualTotalWarningCount = stream.totalWarningCount;
            if (actualTotalWarningCount !== expectedTotalWarningCount)
            {
                options =
                {
                    message: 'Unexpected total warning count',
                    actual: actualTotalWarningCount,
                    expected: expectedTotalWarningCount,
                    stackStartFn: assertPluginError,
                };
                const assertionError = new assert.AssertionError(options);
                throw assertionError;
            }
        }

        const createFilename = extension => `\0${++fileNumber}${extension}`;

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

        function noop()
        { }

        function testLint(...configList)
        {
            const fancyLog =
            report =>
            {
                let totalErrorCount     = 0;
                let totalWarningCount   = 0;
                if (report != null)
                {
                    const plainReport = report.replace(/\u001b\[\d+m/g, '');
                    const line =
                    findMatch
                    (
                        plainReport,
                        /.*(?=\n(?:.* potentially fixable with the `fix` option\.\n)?$)/,
                    );
                    if (line != null)
                    {
                        totalErrorCount     = +findMatch(line, /\b\d+(?= error)/)   || 0;
                        totalWarningCount   = +findMatch(line, /\b\d+(?= warning)/) || 0;
                    }
                }
                stream.totalErrorCount      = totalErrorCount;
                stream.totalWarningCount    = totalWarningCount;
            };
            const findMatch =
            (str, regExp) =>
            {
                const match = str.match(regExp);
                if (match)
                    return match[0];
            };
            const lint =
            postrequire
            (
                '../lib/gulp-lint',
                stubs =>
                {
                    const { require } = stubs;
                    stubs.require =
                    moduleId =>
                    {
                        let exports;
                        switch (moduleId)
                        {
                        case 'fancy-log':
                            exports = fancyLog;
                            break;
                        default:
                            exports = require(moduleId);
                            break;
                        }
                        return exports;
                    };
                },
            );
            const stream = lint.with({ vinylDest, vinylSrc })(...configList);
            return stream;
        }

        const vinylDest = () => gulpTap(noop);

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

        let fileNumber = 0;

        it
        (
            'finds no errors in a JavaScript file',
            async () =>
            {
                const filename = createFilename('.js');
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
                const filename = createFilename('.js');
                const src = { [filename]: '\'use strict\';' };
                const stream = testLint({ src });
                await assertPluginError(stream, 1);
            },
        );

        it
        (
            'finds multiple errors in a JavaScript file',
            async () =>
            {
                const filename = createFilename('.js');
                const src = { [filename]: '"use strict";' };
                const stream = testLint({ src });
                await assertPluginError(stream, 2);
            },
        );

        it
        (
            'finds no errors in a TypeScript file',
            async () =>
            {
                const setPrepareWatchProgram = require('./set-prepare-watch-program');

                const tsSourceText = 'void 0;\n';
                setPrepareWatchProgram(() => tsSourceText);
                const filename = createFilename('.ts');
                const src = { [filename]: tsSourceText };
                const stream =
                testLint({ src, parserOptions: { project: 'test/tsconfig-test.json' } });
                await endOfStream(stream);
            },
        )
        .timeout(LONG_TIMEOUT);

        it
        (
            'finds one error in a TypeScript file',
            async () =>
            {
                const setPrepareWatchProgram = require('./set-prepare-watch-program');

                const tsSourceText = '💩';
                setPrepareWatchProgram(() => tsSourceText);
                const filename = createFilename('.ts');
                const src = { [filename]: tsSourceText };
                const stream =
                testLint({ src, parserOptions: { project: 'test/tsconfig-test.json' } });
                await assertPluginError(stream, 1);
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
                await assertPluginError(stream, 6);
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
                await assertPluginError(stream, 1);
            },
        );

        it
        (
            'finds multiple errors in a Gherkin file',
            async () =>
            {
                const filename = createFilename('.feature');
                const src =
                {
                    [filename]:
                    'A\n\nB\nC\n',
                };
                const stream = testLint({ src });
                await assertPluginError(stream, 3);
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
                await assertPluginError(stream, 5);
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
                await assertPluginError(stream, 2);
            },
        );

        it
        (
            'infers es6 environment from ecmaVersion explicitly ≥ 2015',
            async () =>
            {
                const filename = createFilename('.js');
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
                const filename = createFilename('.js');
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
                const filename = createFilename('.js');
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
                const filename = createFilename('.js');
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
                const filename = createFilename('.js');
                const src = { [filename]: 'void (() => null);\n' };
                const stream = testLint({ src, parserOptions: { sourceType: 'module' } });
                await endOfStream(stream);
            },
        );

        it
        (
            'fixes a file',
            async () =>
            {
                const filename = createFilename('.js');
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
                const filename = createFilename('.js');
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
                const filename = createFilename('.js');
                const src = { [filename]: '\'use strict\';\n\nprocess.exitCode = 0;\n' };
                const stream = testLint({ src, envs: 'node' });
                await endOfStream(stream);
            },
        );

        it
        (
            'raises a warning for an unsupported file type',
            async () =>
            {
                const filename = createFilename('.txt');
                const src = { [filename]: '' };
                const stream = testLint({ src });
                await endOfStream(stream);
                assert.strictEqual(stream.totalWarningCount, 1);
            },
        );
    },
);
