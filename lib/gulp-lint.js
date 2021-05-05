'use strict';

const pkg                                   = require('../package.json');
const createGherkinLinter                   = require('./gherkin-linter');
const createJSTSLinter                      = require('./jsts-linter');
const gulpEslint                            = require('gulp-eslint7');
const gulpTap                               = require('gulp-tap');
const mergeStream                           = require('merge-stream');
const { extname, relative }                 = require('path');
const PluginError                           = require('plugin-error');
const { Transform }                         = require('stream');
const { dest: vinylDest, src: vinylSrc }    = require('vinyl-fs');

function failValidation()
{
    const stream =
    gulpEslint.results
    (
        ({ errorCount }) =>
        {
            if (errorCount)
            {
                const error =
                new PluginError
                (
                    pkgName,
                    `Failed with ${errorCount} ${errorCount === 1 ? 'error' : 'errors'}`,
                    { name: 'ESLintError' },
                );
                throw error;
            }
        },
    );
    return stream;
}

const fixWith =
vinylDest =>
({ base, eslint }, { through }) =>
{
    if (eslint && eslint.fixed)
    {
        const stream = through(vinylDest, [base]);
        return stream;
    }
};

function gherkinLint(config)
{
    const linter = createGherkinLinter(config);
    const parse =
    file =>
    {
        const code = file.contents.toString();
        file.eslint = linter(code, file.path);
    };
    const stream = gulpTap(parse);
    return stream;
}

function jstsLint(config, language)
{
    const linter = createJSTSLinter(config, language);
    const stream =
    new Transform
    (
        {
            objectMode: true,
            transform:
            (file, enc, cb) =>
            {
                const filePath = relative(process.cwd(), file.path);
                const code = file.contents.toString();
                linter(code, filePath).then
                (
                    result =>
                    {
                        if (result)
                        {
                            file.eslint = result;
                            const { output } = result;
                            if (output != null)
                            {
                                file.contents = Buffer.from(output);
                                result.fixed = true;
                            }
                        }
                        cb(null, file);
                    },
                );
            },
        },
    );
    return stream;
}

const lintWith =
({ vinylDest, vinylSrc, writable }) =>
(...configList) =>
{
    const streams =
    configList.map
    (
        config =>
        {
            const jsThroughArgs = [jstsLint, [config, 'js']];
            const tsThroughArgs = [jstsLint, [config, 'ts']];
            const gherkinThroughArgs = [gherkinLint, [config]];
            const throughArgsMap =
            {
                __proto__:  null,
                '.cjs':     jsThroughArgs,
                '.feature': gherkinThroughArgs,
                '.js':      jsThroughArgs,
                '.mjs':     jsThroughArgs,
                '.ts':      tsThroughArgs,
            };
            const stream =
            vinylSrc(config.src)
            .pipe
            (
                gulpTap
                (
                    (file, { through }) =>
                    {
                        const filePath = file.path;
                        const extension = extname(filePath);
                        const throughArgs = throughArgsMap[extension];
                        if (throughArgs)
                        {
                            const stream = through(...throughArgs);
                            return stream;
                        }
                        {
                            const messages =
                            [{ message: 'Unrecognized file extension', severity: 1 }];
                            file.eslint =
                            {
                                errorCount: 0,
                                filePath,
                                fixableErrorCount: 0,
                                messages,
                                warningCount: 1,
                            };
                        }
                    },
                ),
            );
            return stream;
        },
    );
    const stream =
    mergeStream(...streams)
    .pipe(gulpTap(fixWith(vinylDest)))
    .pipe(gulpEslint.format(undefined, writable))
    .pipe(failValidation());
    return stream;
};

const lint = lintWith({ vinylDest, vinylSrc });
lint.with = lintWith;

const pkgName = pkg.name;

module.exports = lint;
