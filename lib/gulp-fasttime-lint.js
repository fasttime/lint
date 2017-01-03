'use strict';

const JscsChecker     = require('jscs');
const eslint          = require('gulp-eslint');
const eslintRules     = require('./eslint-rules');
const gutil           = require('gulp-util');
const jscsCliConfig   = require('jscs/lib/cli-config');
const lazypipe        = require('lazypipe');
const pkg             = require('../package.json');
const through         = require('through2');
const util            = require('util');

function combine(...args)
{
    const obj = { };
    const callback = extend.bind(null, obj);
    forEach.call(args, callback);
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
                `Validation failed with ${errorCount} ${errorCount === 1 ? 'error' : ' errors'}`;
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
        const jscsData = chunk.jscs;
        if (jscsData)
            errorCount += jscsData.errorCount;
        callback(null, chunk);
    }
    
    let errorCount = 0;
    const stream = through.obj(write, end);
    return stream;
}

function jscs(config)
{
    function write(chunk, enc, callback)
    {
        if (chunk.isStream())
        {
            const error = createError('Streaming not supported');
            callback(error);
            return;
        }
        if (!chunk.isNull() && !jscsChecker.getConfiguration().isFileExcluded(chunk.path))
        {
            const contents = chunk.contents.toString();
            const errors = jscsChecker.checkString(contents, chunk.path);
            const errorList = errors.getErrorList();
            const errorCount = errorList.length;
            chunk.jscs = { errorCount, errors };
        }
        callback(null, chunk);
    }
    
    const jscsChecker = new JscsChecker();
    jscsChecker.registerDefaultRules();
    jscsChecker.configure(config);
    const stream = through.obj(write);
    return stream;
}

function jscsReportErrors()
{
    function write(chunk, enc, callback)
    {
        const jscsData = chunk.jscs;
        if (jscsData && jscsData.errorCount)
            jscsReporter([jscsData.errors]);
        callback(null, chunk);
    }
    
    const stream = through.obj(write);
    return stream;
}

function lint(opts)
{
    opts = opts || { };
    const parserOptions = opts.parserOptions;
    let presetESLintEnvs;
    let ruleConfigs;
    if ((parserOptions || { }).ecmaVersion >= 6)
    {
        presetESLintEnvs = ['es6'];
        ruleConfigs = Object.values(eslintRules);
    }
    else
    {
        presetESLintEnvs = [];
        ruleConfigs = [];
        const categories = Object.keys(eslintRules);
        categories.forEach(
            category =>
            {
                if (category !== 'ECMAScript 6')
                {
                    const ruleConfig = eslintRules[category];
                    ruleConfigs.push(ruleConfig);
                }
            }
        );
    }
    const presetESLintRules = combine(...ruleConfigs);
    const eslintOptions =
    {
        envs:           merge(presetESLintEnvs, opts.envs),
        globals:        opts.globals,
        parserOptions,
        rules:          combine(presetESLintRules, opts.eslintRules)
    };
    const presetJSCSRules = { disallowSpacesInCallExpression: true };
    const jscsConfig = combine(presetJSCSRules, opts.jscsRules);
    const createStream =
        lazypipe()
        .pipe(eslint, eslintOptions)
        .pipe(eslint.format)
        .pipe(jscs, jscsConfig)
        .pipe(jscsReportErrors)
        .pipe(failValidation);
    const stream = createStream();
    return stream;
}

function merge(...args)
{
    const set = new Set([].concat(...args));
    const array = Array.from(set.keys());
    return array;
}

const PluginError = gutil.PluginError;
const extend = util._extend;
const forEach = Array.prototype.forEach;
const jscsReporter = jscsCliConfig.getReporter().writer;
const pkgName = pkg.name;

module.exports = lint;
