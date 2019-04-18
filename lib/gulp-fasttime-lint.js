'use strict';

const PluginError                   = require('plugin-error');
const { INHERIT, ruleDefinitions }  = require('./eslint-rules');
const gulpEslint                    = require('gulp-eslint');
const gulpIf                        = require('gulp-if');
const gulpTap                       = require('gulp-tap');
const mergeStream                   = require('merge-stream');
const path                          = require('path');
const pkg                           = require('../package.json');
const vfs                           = require('vinyl-fs');

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
    const isTypeScript =
    file =>
    {
        const extension = path.extname(file.path);
        const returnValue = extension === '.ts';
        return returnValue;
    };

    const streams =
    configList.map
    (
        config =>
        {
            const { jsOpts, src, tsOpts } = parseConfig(config);

            const stream =
            vfs.src(src).pipe(gulpIf(isTypeScript, gulpEslint(tsOpts), gulpEslint(jsOpts)));
            return stream;
        },
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
    const result = { jsOpts, src, tsOpts };
    return result;
}

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

const pkgName = pkg.name;

module.exports = lint;