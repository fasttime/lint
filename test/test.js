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
(lintData, expectedTotalErrorCount, expectedTotalWarningCount, expectedRuleIds, stackStartFn) =>
{
    const actualTotalErrorCount = lintData.totalErrorCount;
    if (actualTotalErrorCount !== expectedTotalErrorCount)
    {
        const options =
        {
            message:    'Unexpected total error count',
            actual:     actualTotalErrorCount,
            expected:   expectedTotalErrorCount,
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
            message:    'Unexpected total warning count',
            actual:     actualTotalWarningCount,
            expected:   expectedTotalWarningCount,
            stackStartFn,
        };
        const assertionError = new assert.AssertionError(options);
        throw assertionError;
    }
    if (expectedRuleIds)
        assert.deepStrictEqual(lintData.ruleIds, expectedRuleIds);
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
        let ruleIds             = null;
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
            ruleIds = plainReport.match(/(?<=^  \d+:\d+  .*)\S+$/gm);
        }
        lintData.totalErrorCount    = totalErrorCount;
        lintData.totalWarningCount  = totalWarningCount;
        lintData.ruleIds            = ruleIds;
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

            const tsSource = '///\t<reference path="doo"/>\n;;';
            setPrepareWatchProgram(() => tsSource);
            const fileName = mockFile('.ts', tsSource);
            const src = fileName;
            const lintData =
            testLint({ src, parserOptions: { project: 'test/tsconfig-test.json' } });
            await assertLintFailure
            (
                lintData,
                5,
                [
                    '@typescript-eslint/triple-slash-reference',
                    'no-tabs',
                    '@typescript-eslint/no-extra-semi',
                    '@typescript-eslint/no-extra-semi',
                    'eol-last',
                ],
            );
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

            const tsSource = '*';
            setPrepareWatchProgram(() => tsSource);
            const fileName_cjs      = mockFile('.cjs', '-');
            const fileName_cts      = mockFile('.cts', tsSource);
            const fileName_js       = mockFile('.js', '-');
            const fileName_mjs      = mockFile('.mjs', '-');
            const fileName_mts      = mockFile('.mts', tsSource);
            const fileName_ts       = mockFile('.ts', tsSource);
            const fileName_feature  = mockFile('.feature', '!\n');
            const src =
            [
                fileName_cjs,
                fileName_cts,
                fileName_js,
                fileName_mjs,
                fileName_mts,
                fileName_ts,
                fileName_feature,
            ];
            const lintData =
            testLint({ src, parserOptions: { project: 'test/tsconfig-test.json' } });
            await assertLintFailure(lintData, 7);
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
            const lintData = testLint({ src, jsVersion: 2015 });
            await assertLintSuccess(lintData);
        },
    );

    it
    (
        'infers es2017 environment from jsVersion explicitly ≥ 2017',
        async () =>
        {
            const fileName = mockFile('.js', '\'use strict\';\n\nSharedArrayBuffer();\n');
            const src = fileName;
            const lintData = testLint({ src, jsVersion: 2017 });
            await assertLintSuccess(lintData);
        },
    );

    it
    (
        'infers es2020 environment from jsVersion explicitly ≥ 2020',
        async () =>
        {
            const fileName = mockFile('.js', '\'use strict\';\n\nBigInt();\n');
            const src = fileName;
            const lintData = testLint({ src, jsVersion: 2020 });
            await assertLintSuccess(lintData);
        },
    );

    it
    (
        'infers es2021 environment from jsVersion explicitly ≥ 2021',
        async () =>
        {
            const fileName = mockFile('.js', '\'use strict\';\n\nWeakRef();\n');
            const src = fileName;
            const lintData = testLint({ src, jsVersion: 2021 });
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

require('tslib');
