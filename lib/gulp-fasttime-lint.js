'use strict';

const pkg                                   = require('../package.json');
const { INHERIT, ruleDefinitions }          = require('./eslint-rules');
const gulpEslint                            = require('gulp-eslint');
const gulpTap                               = require('gulp-tap');
const mergeStream                           = require('merge-stream');
const multipipe                             = require('multipipe');
const { dirname, extname }                  = require('path');
const PluginError                           = require('plugin-error');
const ternaryStream                         = require('ternary-stream');
const { dest: vinylDest, src: vinylSrc }    = require('vinyl-fs');

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
({ eslint, path: filePath }, through) =>
{
    if (eslint != null && eslint.fixed)
    {
        const dirnameStr = dirname(filePath);
        const stream = through.through(vinylDest, [dirnameStr]);
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
            const { jsOpts, tsOpts } = parseConfig(config);
            const stream = vinylSrc(config.src).pipe(selectLinter(jsOpts, tsOpts));
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

function merge(...args)
{
    const array = [...new Set([].concat(...args))];
    return array;
}

function parseConfig({ envs, fix, globals, parserOptions = { }, rules })
{
    let presetESLintEnvs;
    const jsRuleConfigs = [];
    const tsRuleConfigs = [];
    {
        const ecmaVersion = parserOptions.ecmaVersion || 5;
        if (ecmaVersion >= 6)
            presetESLintEnvs = ['es6'];
        else
            presetESLintEnvs = [];
        for (const { minEcmaVersion, ruleConfig } of ruleDefinitions)
        {
            if (minEcmaVersion === 'ts')
                tsRuleConfigs.push(ruleConfig);
            else if (ecmaVersion >= minEcmaVersion)
            {
                jsRuleConfigs.push(ruleConfig);
                tsRuleConfigs.push(ruleConfig);
            }
        }
    }
    const mergedEnvs = merge(presetESLintEnvs, envs);
    const jsOpts =
    {
        envs:           mergedEnvs,
        fix,
        globals,
        parserOptions,
        plugins:        ['fasttime-rules'],
        rules:          combine(...jsRuleConfigs, rules),
    };
    const tsOpts =
    {
        baseConfig:     { },
        envs:           mergedEnvs,
        fix,
        globals,
        parser:         '@typescript-eslint/parser',
        parserOptions,
        plugins:        ['@typescript-eslint', 'fasttime-rules'],
        rules:          resolveInherits(combine(...tsRuleConfigs, rules)),
    };
    const result = { jsOpts, tsOpts };
    return result;
}

const pkgName = pkg.name;

function resolveInherits(rules)
{
    for (const [key, value] of Object.entries(rules))
    {
        if (value === INHERIT)
        {
            const parentKey = key.replace(/^.*\//, '');
            rules[key] = rules[parentKey];
            rules[parentKey] = 'off';
        }
    }
    return rules;
}

function selectLinter(jsOpts, tsOpts)
{
    const hasExtension = extension => ({ path }) => extname(path) === extension;
    const streamJs = ternaryStream(hasExtension('.js'), gulpEslint(jsOpts));
    const streamTs = ternaryStream(hasExtension('.ts'), gulpEslint(tsOpts));
    const stream = multipipe(streamJs, streamTs);
    return stream;
}

module.exports = lint;
