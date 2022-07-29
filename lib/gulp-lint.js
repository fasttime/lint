'use strict';

const pkg                                       = require('../package.json');
const { createLinterProvider, createReport }    = require('./common');
const fancyLog                                  = require('fancy-log');
const gulpTap                                   = require('gulp-tap');
const mergeStream                               = require('merge-stream');
const PluginError                               = require('plugin-error');
const { Transform }                             = require('stream');
const { dest: vinylDest, src: vinylSrc }        = require('vinyl-fs');

function createReportStream()
{
    const results = [];
    let fail = false;
    const stream =
    Transform
    (
        {
            objectMode: true,
            transform(file, enc, done)
            {
                const { result } = file;
                if (result)
                {
                    results.push(result);
                    if (result.errorCount)
                        fail = true;
                }
                done(null, file);
            },
            final(done)
            {
                const report = createReport(results);
                if (report != null)
                    fancyLog(report);
                const error = fail ? PluginError(pkgName, 'Lint failed') : undefined;
                done(error);
            },
        },
    );
    return stream;
}

const fixWith =
vinylDest =>
({ base, result }, { through }) =>
{
    if (result?.output != null)
    {
        const stream = through(vinylDest, [base]);
        return stream;
    }
};

function lint(...configList)
{
    const vinylStreams =
    configList.map
    (
        config =>
        {
            const linterProvider = createLinterProvider(config);
            const linterStream =
            Transform
            (
                {
                    objectMode: true,
                    transform(file, enc, done)
                    {
                        // eslint-disable-next-line require-await
                        const callLinter = async () => linter(filePath, source);
                        const filePath = file.path;
                        const linter = linterProvider(filePath);
                        const source = linter.static ? null : file.contents.toString();
                        callLinter()
                        .then
                        (
                            result =>
                            {
                                if (result)
                                {
                                    file.result = result;
                                    const { output } = result;
                                    if (output != null)
                                        file.contents = Buffer.from(output);
                                }
                                done(null, file);
                            },
                        )
                        .catch(done);
                    },
                },
            );
            const vinylStream = vinylSrc(config.src).pipe(linterStream);
            return vinylStream;
        },
    );
    const fixStream = gulpTap(fixWith(vinylDest));
    const reportStream = createReportStream();
    const mergedStream = mergeStream(...vinylStreams).pipe(fixStream).pipe(reportStream);
    return mergedStream;
}

const pkgName = pkg.name;

module.exports = lint;
