'use strict';

const { INHERIT, ruleDefinitions }  = require('./eslint-rules');
const { ESLint }                    = require('eslint');

function combine(...objs)
{
    const obj = Object.assign({ }, ...objs);
    return obj;
}

function createBaseEnv(envs, ecmaVersion)
{
    const env = { __proto__: null };
    if (ecmaVersion >= 12)
        env.es2021 = true;
    else if (ecmaVersion >= 11)
        env.es2020 = true;
    else if (ecmaVersion >= 8)
        env.es2017 = true;
    else if (ecmaVersion >= 6)
        env.es6 = true;
    if (envs !== undefined)
    {
        if (Array.isArray(envs))
        {
            for (const envName of envs)
                env[envName] = true;
        }
        else
            env[envs] = true;
    }
    return env;
}

function createBaseRules(language, ecmaVersion)
{
    const ruleConfigs = [];
    const minEcmaVersionKey = `${language}MinEcmaVersion`;
    for (const { ruleConfig, [minEcmaVersionKey]: minEcmaVersion } of ruleDefinitions)
    {
        if (ecmaVersion >= minEcmaVersion)
            ruleConfigs.push(ruleConfig);
    }
    const rules = combine(...ruleConfigs);
    if (language === 'ts')
    {
        for (const [key, value] of Object.entries(rules))
        {
            if (value === INHERIT)
            {
                const parentKey = key.replace(/^.*\//, '');
                rules[key] = rules.hasOwnProperty(parentKey) ? rules[parentKey] : 'off';
                rules[parentKey] = 'off';
            }
        }
    }
    return rules;
}

function createESLint(config, language)
{
    let inputParserOptions = config.parserOptions;
    if (inputParserOptions === undefined)
        inputParserOptions = { };
    let { ecmaVersion } = inputParserOptions;
    let parser;
    let parserOptions;
    if (ecmaVersion === undefined)
    {
        ecmaVersion = 5;
        parserOptions = { ecmaVersion: inputParserOptions.sourceType === 'module' ? 6 : 5 };
    }
    else if (ecmaVersion >= 2015)
        ecmaVersion -= 2009;
    const { defaultDialectName, envs, fix, src, ...overrideConfig } = config;
    const env = createBaseEnv(envs, ecmaVersion);
    const plugins = ['@fasttime', 'node'];
    const rules = createBaseRules(language, ecmaVersion);
    if (language === 'ts')
    {
        parser = '@fasttime/eslint-plugin/ts-parser';
        plugins.push('@typescript-eslint');
    }
    const baseConfig = { env, parser, parserOptions, plugins, rules };
    const options = { baseConfig, fix, overrideConfig, useEslintrc: false };
    const esLint = new ESLint(options);
    return esLint;
}

function createJSTSLinter(config, language)
{
    const esLint = createESLint(config, language);
    const linter =
    async (filePath, source) =>
    {
        const results = await esLint.lintText(source, { filePath });
        const [result] = results;
        if (result && (result.messages.length || result.output !== undefined))
            return result;
    };
    return linter;
}

module.exports = createJSTSLinter;
