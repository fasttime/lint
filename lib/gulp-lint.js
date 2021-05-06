'use strict';

const pkg                                   = require('../package.json');
const createLinterProvider                  = require('./linter-provider');
const gulpEslint                            = require('gulp-eslint7');
const gulpTap                               = require('gulp-tap');
const mergeStream                           = require('merge-stream');
const { relative }                          = require('path');
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

const lintWith =
({ vinylDest, vinylSrc, writable }) =>
(...configList) =>
{
    const streams =
    configList.map
    (
        config =>
        {
            const linterProvider = createLinterProvider(config);
            const stream =
            vinylSrc(config.src)
            .pipe
            (
                gulpTap
                (
                    (file, { through }) =>
                    {
                        const filePath = file.path;
                        const linter = linterProvider(filePath);
                        const stream = through(subLint, [linter]);
                        return stream;
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

function subLint(linter)
{
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

module.exports = lint;
