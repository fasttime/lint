/* eslint-env mocha */

'use strict';

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

describe
(
    'gulp-lint',
    () =>
    {
        const { assertProblemCount, attachLogger, test }    = require('./test');
        const { AssertionError }                            = require('assert');
        const gulpTap                                       = require('gulp-tap');
        const mergeStream                                   = require('merge-stream');
        const postrequire                                   = require('postrequire');
        const vinylBuffer                                   = require('vinyl-buffer');
        const vinylSourceStream                             = require('vinyl-source-stream');

        async function assertLintFailure(stream, expectedTotalErrorCount = 0, expectedRuleIds)
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
                        message:    'Unexpected error message',
                        actual:     actualMessage,
                        expected:   expectedMessage,
                    };
                }
            }
            if (options)
            {
                options.stackStartFn = assertLintFailure;
                const assertionError = new AssertionError(options);
                throw assertionError;
            }
            assertProblemCount
            (stream, expectedTotalErrorCount, 0, expectedRuleIds, assertLintFailure);
        }

        async function assertLintSuccess
        (stream, expectedTotalErrorCount = 0, expectedTotalWarningCount = 0)
        {
            await endOfStream(stream);
            assertProblemCount
            (stream, expectedTotalErrorCount, expectedTotalWarningCount, null, assertLintSuccess);
        }

        const getWrittenFileContents = filePath => writeFileMap[filePath];

        function mockFile(extension, data)
        {
            const fileName = `\0${++fileNumber}${extension}`;
            readFileMap[fileName] = data;
            return fileName;
        }

        function testLint(...configList)
        {
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
                            exports = report => logger(report);
                            break;
                        case 'vinyl-fs':
                            exports = { dest: vinylDest, src: vinylSrc };
                            return exports;
                        default:
                            exports = require(moduleId);
                            break;
                        }
                        return exports;
                    };
                },
            );
            const stream = lint(...configList);
            const logger = attachLogger(stream);
            return stream;
        }

        function vinylDest()
        {
            const stream =
            gulpTap
            (
                file =>
                {
                    writeFileMap[file.path] = file.contents.toString();
                },
            );
            return stream;
        }

        function vinylSrc(src)
        {
            const streams =
            [].concat(src).map
            (
                pattern =>
                {
                    const stream = vinylSourceStream(pattern);
                    const contents = readFileMap[pattern];
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

        let readFileMap;
        let writeFileMap;

        beforeEach
        (
            () =>
            {
                readFileMap = { __proto__: null };
                writeFileMap = { __proto__: null };
            },
        );

        afterEach
        (
            () =>
            {
                readFileMap = undefined;
                writeFileMap = undefined;
            },
        );

        test(mockFile, testLint, assertLintSuccess, assertLintFailure, getWrittenFileContents);
    },
);
