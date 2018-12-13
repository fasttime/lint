'use strict';

const PluginError   = require('plugin-error');
const eslintRules   = require('./eslint-rules');
const gulp          = require('gulp');
const gulpEslint    = require('gulp-eslint');
const mergeStream   = require('merge-stream');
const pkg           = require('./package.json');

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

function lint(...configList)
{
    const streams =
    configList.map
    (
        config =>
        {
            const { opts, src } = parseConfig(config);
            const stream = gulp.src(src).pipe(gulpEslint(opts));
            return stream;
        }
    );
    const stream = mergeStream(...streams).pipe(gulpEslint.format()).pipe(failValidation());
    return stream;
}

function merge(...args)
{
    const array = [...new Set([].concat(...args))];
    return array;
}

function parseConfig({ src, envs, globals, parserOptions = { }, rules })
{
    function addRuleConfig(category)
    {
        const ruleConfig = eslintRules[category];
        ruleConfigs.push(ruleConfig);
    }

    let presetESLintEnvs;
    let categoryCallback;
    if (parserOptions.ecmaVersion >= 6)
    {
        presetESLintEnvs = ['es6'];
        categoryCallback = addRuleConfig;
    }
    else
    {
        presetESLintEnvs = [];
        categoryCallback =
        category =>
        {
            if (category !== 'ECMAScript 6')
                addRuleConfig(category);
        };
    }
    const ruleConfigs =
    [
        {
            'fasttime-rules/nice-space-before-function-paren': 'error',
            'fasttime-rules/no-spaces-in-call-expression': 'error',
        },
    ];
    const categories = Object.keys(eslintRules);
    categories.forEach(categoryCallback);
    const opts =
    {
        envs:           merge(presetESLintEnvs, envs),
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
