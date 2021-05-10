/* eslint-env mocha */

'use strict';

describe
(
    'lint',
    () =>
    {
        const { assertProblemCount, attachLogger, test }    = require('./test');
        const assert                                        = require('assert');
        const postrequire                                   = require('postrequire');

        async function assertLintFailure
        (promise, expectedTotalErrorCount = 0, expectedTotalWarningCount = 0)
        {
            try
            {
                await promise;
            }
            catch ({ message, showStack, stack })
            {
                if (message !== 'Lint failed')
                {
                    const options =
                    {
                        actual: message,
                        expected: 'Lint failed',
                        stackStartFn: assertLintFailure,
                    };
                    const assertionError = new assert.AssertionError(options);
                    throw assertionError;
                }
                if (showStack !== false)
                {
                    const options =
                    {
                        actual: showStack,
                        expected: false,
                        stackStartFn: assertLintFailure,
                    };
                    const assertionError = new assert.AssertionError(options);
                    throw assertionError;
                }
                if (stack !== undefined)
                {
                    const options =
                    {
                        actual: stack,
                        expected: undefined,
                        stackStartFn: assertLintFailure,
                    };
                    const assertionError = new assert.AssertionError(options);
                    throw assertionError;
                }
                assertProblemCount
                (promise, expectedTotalErrorCount, expectedTotalWarningCount, assertLintFailure);
                return;
            }
            {
                const options =
                {
                    message: 'Error expected but not thrown',
                    stackStartFn: assertLintFailure,
                };
                const assertionError = new assert.AssertionError(options);
                throw assertionError;
            }
        }

        async function assertLintSuccess
        (promise, expectedTotalErrorCount = 0, expectedTotalWarningCount = 0)
        {
            await promise;
            assertProblemCount
            (promise, expectedTotalErrorCount, expectedTotalWarningCount, assertLintSuccess);
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
                '../lib/lint',
                stubs =>
                {
                    const { require } = stubs;
                    stubs.require =
                    moduleId =>
                    {
                        let exports;
                        switch (moduleId)
                        {
                        case './log':
                            exports = report => logger(report);
                            break;
                        case 'fast-glob':
                            exports = pattern => [].concat(pattern);
                            break;
                        case 'fs':
                            exports =
                            {
                                promises:
                                {
                                    // eslint-disable-next-line require-await
                                    async readFile(filePath)
                                    {
                                        const data = readFileMap[filePath];
                                        return data;
                                    },
                                    // eslint-disable-next-line require-await
                                    async writeFile(filePath, data)
                                    {
                                        writeFileMap[filePath] = data;
                                    },
                                },
                            };
                            break;
                        default:
                            exports = require(moduleId);
                            break;
                        }
                        return exports;
                    };
                },
            );
            const promise = lint(...configList);
            const logger = attachLogger(promise);
            return promise;
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
