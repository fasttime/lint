'use strict';

const pkg                                   = require('../package.json');
const { INHERIT, ruleDefinitions }          = require('./eslint-rules');
const { default: GherkinAstBuilder }        = require('gherkin/dist/src/AstBuilder');
const { default: GherkinParser }            = require('gherkin/dist/src/Parser');
const gulpEslint                            = require('gulp-eslint');
const gulpTap                               = require('gulp-tap');
const mergeStream                           = require('merge-stream');
const { extname }                           = require('path');
const PluginError                           = require('plugin-error');
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
({ base, eslint }, { through }) =>
{
    if (eslint && eslint.fixed)
    {
        const stream = through(vinylDest, [base]);
        return stream;
    }
};

function gherkinLint()
{
    const parse =
    file =>
    {
        let parserErrors;
        const source = file.contents.toString();
        try
        {
            parser.parse(source);
        }
        catch ({ errors })
        {
            parserErrors = errors;
        }
        const messages =
        parserErrors ?
        parserErrors.map
        (
            ({ location: { column, line }, message }) =>
            ({ column, line, message: message.replace(/^\(.*?\): /, ''), severity: 2 }),
        ) :
        [];
        file.eslint =
        {
            errorCount: messages.length,
            filePath: file.path,
            fixableErrorCount: 0,
            messages,
            source,
            warningCount: 0,
        };
    };
    const parser = new GherkinParser(new GherkinAstBuilder(String));
    const stream = gulpTap(parse);
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
            const { jsOpts, tsOpts } = parseConfig(config);
            const jsThroughArgs = [gulpEslint, [jsOpts]];
            const tsThroughArgs = [gulpEslint, [tsOpts]];
            const gherkinThroughArgs = [gherkinLint];
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

function merge(...args)
{
    const array = [...new Set([].concat(...args.filter(arg => arg !== undefined)))];
    return array;
}

function parseConfig({ envs, fix, globals, parserOptions = { }, plugins, rules })
{
    let presetESLintEnvs;
    const jsRuleConfigs = [];
    const tsRuleConfigs = [];
    {
        let { ecmaVersion } = parserOptions;
        if (ecmaVersion === undefined)
        {
            ecmaVersion = 5;
            parserOptions.ecmaVersion = parserOptions.sourceType === 'module' ? 6 : 5;
        }
        else if (ecmaVersion >= 2015)
            ecmaVersion -= 2009;
        if (ecmaVersion >= 11)
            presetESLintEnvs = ['es2020'];
        else if (ecmaVersion >= 8)
            presetESLintEnvs = ['es2017'];
        else if (ecmaVersion >= 6)
            presetESLintEnvs = ['es6'];
        else
            presetESLintEnvs = [];
        for (const { jsMinEcmaVersion, ruleConfig, tsMinEcmaVersion } of ruleDefinitions)
        {
            if (ecmaVersion >= jsMinEcmaVersion)
                jsRuleConfigs.push(ruleConfig);
            if (ecmaVersion >= tsMinEcmaVersion)
                tsRuleConfigs.push(ruleConfig);
        }
    }
    const mergedEnvs = merge(presetESLintEnvs, envs);
    const jsOpts =
    {
        envs:           mergedEnvs,
        fix,
        globals,
        parserOptions,
        plugins:        merge(['@fasttime'], plugins),
        rules:          combine(...jsRuleConfigs, rules),
    };
    const tsOpts =
    {
        baseConfig:     { },
        envs:           mergedEnvs,
        fix,
        globals,
        parser:         '@fasttime/eslint-plugin/ts-parser',
        parserOptions,
        plugins:        merge(['@typescript-eslint', '@fasttime'], plugins),
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
            rules[key] =
            rules.hasOwnProperty(parentKey) ? rules[parentKey] : /* istanbul ignore next */ 'off';
            rules[parentKey] = 'off';
        }
    }
    return rules;
}

module.exports = lint;
