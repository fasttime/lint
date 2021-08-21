/* eslint-env mocha */

'use strict';

const assert    = require('assert');
const { join }  = require('path');

const LONG_TIMEOUT = 15000;

function findMatch(str, regExp)
{
    const match = str.match(regExp);
    if (match)
        return match[0];
}

exports.assertProblemCount =
(lintData, expectedTotalErrorCount, expectedTotalWarningCount, stackStartFn) =>
{
    const actualTotalErrorCount = lintData.totalErrorCount;
    if (actualTotalErrorCount !== expectedTotalErrorCount)
    {
        const options =
        {
            message: 'Unexpected total error count',
            actual: actualTotalErrorCount,
            expected: expectedTotalErrorCount,
            stackStartFn,
        };
        const assertionError = new assert.AssertionError(options);
        throw assertionError;
    }
    const actualTotalWarningCount = lintData.totalWarningCount;
    if (actualTotalWarningCount !== expectedTotalWarningCount)
    {
        const options =
        {
            message: 'Unexpected total warning count',
            actual: actualTotalWarningCount,
            expected: expectedTotalWarningCount,
            stackStartFn,
        };
        const assertionError = new assert.AssertionError(options);
        throw assertionError;
    }
};

exports.attachLogger =
lintData =>
{
    lintData.totalErrorCount    = 0;
    lintData.totalWarningCount  = 0;
    const logger =
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
        lintData.totalErrorCount    = totalErrorCount;
        lintData.totalWarningCount  = totalWarningCount;
    };
    return logger;
};

exports.test =
(mockFile, testLint, assertLintSuccess, assertLintFailure, getWrittenFileContents) =>
{
    it
    (
        'finds no errors in a JavaScript file',
        async () =>
        {
            const fileName = mockFile('.js', '\'use strict\';\n');
            const src = fileName;
            const lintData = testLint({ src });
            await assertLintSuccess(lintData);
        },
    );

    it
    (
        'finds one error in a JavaScript file',
        async () =>
        {
            const fileName = mockFile('.js', '\'use strict\';');
            const src = fileName;
            const lintData = testLint({ src });
            await assertLintFailure(lintData, 1);
        },
    );

    it
    (
        'finds multiple errors in a JavaScript file',
        async () =>
        {
            const fileName = mockFile('.js', '"use strict";');
            const src = fileName;
            const lintData = testLint({ src });
            await assertLintFailure(lintData, 2);
        },
    );

    it
    (
        'finds no errors in a TypeScript file',
        async () =>
        {
            const setPrepareWatchProgram = require('./set-prepare-watch-program');

            const tsSource = 'void 0;\n';
            setPrepareWatchProgram(() => tsSource);
            const fileName = mockFile('.ts', tsSource);
            const src = fileName;
            const lintData =
            testLint({ src, parserOptions: { project: 'test/tsconfig-test.json' } });
            await assertLintSuccess(lintData);
        },
    )
    .timeout(LONG_TIMEOUT);

    it
    (
        'finds one error in a TypeScript file',
        async () =>
        {
            const setPrepareWatchProgram = require('./set-prepare-watch-program');

            const tsSource = '💩';
            setPrepareWatchProgram(() => tsSource);
            const fileName = mockFile('.ts', tsSource);
            const src = fileName;
            const lintData =
            testLint({ src, parserOptions: { project: 'test/tsconfig-test.json' } });
            await assertLintFailure(lintData, 1);
        },
    )
    .timeout(LONG_TIMEOUT);

    it
    (
        'finds multiple errors in a TypeScript file',
        async () =>
        {
            const setPrepareWatchProgram = require('./set-prepare-watch-program');

            const tsSource = '///\t<reference path="doo"/>\n{}';
            setPrepareWatchProgram(() => tsSource);
            const fileName = mockFile('.ts', tsSource);
            const src = fileName;
            const lintData =
            testLint({ src, parserOptions: { project: 'test/tsconfig-test.json' } });
            await assertLintFailure(lintData, 6);
        },
    )
    .timeout(LONG_TIMEOUT);

    it
    (
        'mirrors only an unprefixed rule into a @typescript-eslint rule',
        async () =>
        {
            const setPrepareWatchProgram = require('./set-prepare-watch-program');

            const tsSource = 'const\tx = 0X2_000000000_0001;\n';
            setPrepareWatchProgram(() => tsSource);
            const fileName = mockFile('.ts', tsSource);
            const src = fileName;
            const lintData =
            testLint
            (
                {
                    src,
                    parserOptions: { project: 'test/tsconfig-test.json' },
                    rules:
                    {
                        'no-loss-of-precision': 'error',
                        'no-tabs':              'error',
                    },
                },
            );
            await assertLintFailure(lintData, 2);
        },
    )
    .timeout(LONG_TIMEOUT);

    it
    (
        'finds no errors in a Gherkin file',
        async () =>
        {
            const fileName = mockFile('.feature', 'Feature:');
            const src = fileName;
            const lintData = testLint({ src });
            await assertLintSuccess(lintData);
        },
    );

    it
    (
        'finds one error in a Gherkin file',
        async () =>
        {
            const fileName = mockFile('.feature', 'Feature:\nScenario:\nWhen Foo\nBar\n');
            const src = fileName;
            const lintData = testLint({ src });
            await assertLintFailure(lintData, 1);
        },
    );

    it
    (
        'finds multiple errors in a Gherkin file',
        async () =>
        {
            const fileName = mockFile('.feature', 'A\n\nB\nC\n');
            const src = fileName;
            const lintData = testLint({ src });
            await assertLintFailure(lintData, 3);
        },
    );

    it
    (
        'finds multiple errors in files with the same configuration',
        async () =>
        {
            const setPrepareWatchProgram = require('./set-prepare-watch-program');

            const tsSource = 'Object();';
            setPrepareWatchProgram(() => tsSource);
            const fileName_cjs      = mockFile('.cjs', '\'use strict\'; \n');
            const fileName_js       = mockFile('.js', '\'use strict\';');
            const fileName_mjs      = mockFile('.mjs', '"use strict";\n');
            const fileName_ts       = mockFile('.ts', tsSource);
            const fileName_feature  = mockFile('.feature', '!\n');
            const src = [fileName_cjs, fileName_js, fileName_mjs, fileName_ts, fileName_feature];
            const lintData =
            testLint({ src, parserOptions: { project: 'test/tsconfig-test.json' } });
            await assertLintFailure(lintData, 5);
        },
    )
    .timeout(LONG_TIMEOUT);

    it
    (
        'finds multiple errors in files with different configurations',
        async () =>
        {
            const fileName1 = mockFile('.js', '\'use strict\';');
            const fileName2 = mockFile('.js', 'Object();\n');
            const src1 = fileName1;
            const src2 = fileName2;
            const lintData = testLint({ src: src1 }, { src: src2 });
            await assertLintFailure(lintData, 2);
        },
    );

    it
    (
        'infers es6 environment from ecmaVersion explicitly ≥ 2015',
        async () =>
        {
            const fileName = mockFile('.js',  '\'use strict\';\n\nSymbol();\n');
            const src = fileName;
            const lintData = testLint({ src, parserOptions: { ecmaVersion: 6 } });
            await assertLintSuccess(lintData);
        },
    );

    it
    (
        'infers es2017 environment from ecmaVersion explicitly ≥ 2017',
        async () =>
        {
            const fileName = mockFile('.js', '\'use strict\';\n\nSharedArrayBuffer();\n');
            const src = fileName;
            const lintData = testLint({ src, parserOptions: { ecmaVersion: 2017 } });
            await assertLintSuccess(lintData);
        },
    );

    it
    (
        'infers es2020 environment from ecmaVersion explicitly ≥ 2020',
        async () =>
        {
            const fileName = mockFile('.js', '\'use strict\';\n\nBigInt();\n');
            const src = fileName;
            const lintData = testLint({ src, parserOptions: { ecmaVersion: 2020 } });
            await assertLintSuccess(lintData);
        },
    );

    it
    (
        'infers es2021 environment from ecmaVersion explicitly ≥ 2021',
        async () =>
        {
            const fileName = mockFile('.js', '\'use strict\';\n\nWeakRef();\n');
            const src = fileName;
            const lintData = testLint({ src, parserOptions: { ecmaVersion: 2021 } });
            await assertLintSuccess(lintData);
        },
    );

    it
    (
        'infers ecmaVersion ≥ 2015 from sourceType "module"',
        async () =>
        {
            const fileName = mockFile('.js', 'void (() => null);\n');
            const src = fileName;
            const lintData = testLint({ src, parserOptions: { sourceType: 'module' } });
            await assertLintSuccess(lintData);
        },
    );

    it
    (
        'fixes a file',
        async () =>
        {
            const fileName = mockFile('.js', '\'use strict\';');
            const src = fileName;
            const lintData = testLint({ src, fix: true });
            await assertLintSuccess(lintData);
            const filePath = join(process.cwd(), fileName);
            assert.strictEqual(getWrittenFileContents(filePath), '\'use strict\';\n');
        },
    );

    it
    (
        'handles a legacy envs array parameter',
        async () =>
        {
            const fileName = mockFile('.js', '\'use strict\';\n\nprocess.exitCode = 0;\n');
            const src = fileName;
            const lintData = testLint({ src, envs: ['es2015', 'node'] });
            await assertLintSuccess(lintData);
        },
    );

    it
    (
        'handles a legacy envs string parameter',
        async () =>
        {
            const fileName = mockFile('.js', '\'use strict\';\n\nprocess.exitCode = 0;\n');
            const src = fileName;
            const lintData = testLint({ src, envs: 'node' });
            await assertLintSuccess(lintData);
        },
    );

    it
    (
        'raises a warning for an unsupported file type',
        async () =>
        {
            const fileName = mockFile('.txt', '');
            const src = fileName;
            const lintData = testLint({ src });
            await assertLintSuccess(lintData, 0, 1);
        },
    );
};
