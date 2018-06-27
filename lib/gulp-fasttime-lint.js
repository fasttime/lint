'use strict';

const eslint        = require('gulp-eslint');
const eslintRules   = require('./eslint-rules');
const gutil         = require('gulp-util');
const lazypipe      = require('lazypipe');
const pkg           = require('../package.json');
const through       = require('through2');
const util          = require('util');

function combine()
{
    const obj = { };
    const callback = extend.bind(null, obj);
    forEach.call(arguments, callback);
    return obj;
}

function createError(message)
{
    const error = new PluginError(pkgName, message);
    return error;
}

function failValidation()
{
    function end(callback)
    {
        if (errorCount)
        {
            const message =
                `Validation failed with ${errorCount} ${errorCount === 1 ? 'error' : 'errors'}`;
            const error = createError(message);
            this.emit('error', error);
        }
        callback();
    }

    function write(chunk, enc, callback)
    {
        const eslintData = chunk.eslint;
        if (eslintData)
            errorCount += eslintData.errorCount;
        callback(null, chunk);
    }

    let errorCount = 0;
    const stream = through.obj(write, end);
    return stream;
}

function lint(opts)
{
    function addRuleConfig(category)
    {
        const ruleConfig = eslintRules[category];
        ruleConfigs.push(ruleConfig);
    }

    opts = opts || { };
    const parserOptions = opts.parserOptions;
    let presetESLintEnvs;
    let categoryCallback;
    if ((parserOptions || { }).ecmaVersion >= 6)
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
    const ruleConfigs = [{ 'no-spaces-in-call-expression/no-spaces-in-call-expression': 'error' }];
    const categories = Object.keys(eslintRules);
    categories.forEach(categoryCallback);
    const presetESLintRules = combine.apply(null, ruleConfigs);
    const eslintOptions =
    {
        envs:           merge(presetESLintEnvs, opts.envs),
        globals:        opts.globals,
        parserOptions,
        plugins:        ['no-spaces-in-call-expression'],
        rules:          combine(presetESLintRules, opts.rules)
    };
    const createStream =
        lazypipe()
        .pipe(eslint, eslintOptions)
        .pipe(eslint.format)
        .pipe(failValidation);
    const stream = createStream();
    return stream;
}

function merge()
{
    const set = new Set(concat.apply([], arguments));
    const array = Array.from(set.keys());
    return array;
}

const PluginError = gutil.PluginError;
const concat = Array.prototype.concat;
const extend = util._extend;
const forEach = Array.prototype.forEach;
const pkgName = pkg.name;

module.exports = lint;
