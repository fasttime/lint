'use strict';

const PluginError           = require('plugin-error');
const eslintRuleDefinitions = require('./eslint-rules');
const gulpEslint            = require('gulp-eslint');
const gulpTap               = require('gulp-tap');
const mergeStream           = require('merge-stream');
const path                  = require('path');
const pkg                   = require('../package.json');
const vfs                   = require('vinyl-fs');

function combine(...objs)
{
    const obj = Object.assign({ }, ...objs);
    return obj;
}

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
                    { name: 'ESLintError' }
                );
                throw error;
            }
        }
    );
    return stream;
}

function fix({ eslint, path: filePath }, through)
{
    if (eslint != null && eslint.fixed)
    {
        const dirname = path.dirname(filePath);
        const stream = through.through(vfs.dest, [dirname]);
        return stream;
    }
}

function lint(...configList)
{
    const streams =
    configList.map
    (
        config =>
        {
            const { opts, src } = parseConfig(config);
            const stream = vfs.src(src).pipe(gulpEslint(opts));
            return stream;
        }
    );
    const stream =
    mergeStream(...streams).pipe(gulpTap(fix)).pipe(gulpEslint.format()).pipe(failValidation());
    return stream;
}

function merge(...args)
{
    const array = [...new Set([].concat(...args))];
    return array;
}

function parseConfig({ src, envs, fix, globals, parserOptions = { }, rules })
{
    let presetESLintEnvs;
    const ruleConfigs =
    [
        {
            'fasttime-rules/nice-space-before-function-paren': 'error',
            'fasttime-rules/no-spaces-in-call-expression': 'error',
        },
    ];
    {
        const ecmaVersion = parserOptions.ecmaVersion || 5;
        if (ecmaVersion >= 6)
            presetESLintEnvs = ['es6'];
        else
            presetESLintEnvs = [];
        for (const { minEcmaVersion, ruleConfig } of eslintRuleDefinitions)
        {
            if (ecmaVersion >= minEcmaVersion)
                ruleConfigs.push(ruleConfig);
        }
    }
    const opts =
    {
        envs:           merge(presetESLintEnvs, envs),
        fix,
        globals,
        parserOptions,
        plugins:        ['fasttime-rules'],
        rules:          combine(...ruleConfigs, rules),
    };
    const result = { opts, src };
    return result;
}

const pkgName = pkg.name;

module.exports = lint;
