'use strict';

const stylishFormatter  = require('eslint/lib/cli-engine/formatters/stylish');
const { extname }       = require('path');

const EXTENSION_TO_LANGUAGE_MAP =
{
    __proto__:  null,
    '.cjs':     'js',
    '.feature': 'gherkin',
    '.js':      'js',
    '.mjs':     'js',
    '.ts':      'ts',
};

async function defaultLinter(filePath) // eslint-disable-line require-await
{
    const messages =
    [{ message: 'Unrecognized file extension', severity: 1 }];
    const result =
    {
        errorCount: 0,
        filePath,
        fixableErrorCount: 0,
        fixableWarningCount: 0,
        messages,
        warningCount: 1,
    };
    return result;
}

defaultLinter.static = true;

exports.createLinterProvider =
config =>
{
    const languageToLinterMap = { __proto__: null };
    const linterProvider =
    filePath =>
    {
        const extension = extname(filePath);
        const language = EXTENSION_TO_LANGUAGE_MAP[extension];
        let linter = languageToLinterMap[language];
        if (!linter)
        {
            switch (language)
            {
            case 'js':
            case 'ts':
                {
                    const createJSTSLinter = require('./jsts-linter');

                    linter = createJSTSLinter(config, language);
                }
                break;
            case 'gherkin':
                {
                    const createGherkinLinter = require('./gherkin-linter');

                    linter = createGherkinLinter(config);
                }
                break;
            default:
                return defaultLinter;
            }
            languageToLinterMap[language] = linter;
        }
        return linter;
    };
    return linterProvider;
};

exports.createReport =
results =>
{
    const report =
    stylishFormatter(results)
    .replace(/`--fix` option\.(?=(?:\s|\u001b\[\d+m)*$)/u, '`fix` option.');
    if (/\S/.test(report))
        return report;
};
