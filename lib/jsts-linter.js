'use strict';

const { createBaseConfig }  = require('@origin-1/eslint-config');
const { ESLint }            = require('eslint');

function createBaseEnv(envs)
{
    if (envs !== undefined)
    {
        const env = { __proto__: null };
        if (Array.isArray(envs))
        {
            for (const envName of envs)
                env[envName] = true;
        }
        else
            env[envs] = true;
        return env;
    }
}

function createESLint(config, language)
{
    const configData = { __proto__: null, ...config };
    if (language === 'ts')
        configData.tsVersion ??= 'latest';
    const env = createBaseEnv(configData.envs);
    if (env != null)
        configData.env = env;
    const baseConfig = createBaseConfig(configData);
    const { fix } = config;
    const options = { baseConfig, fix, useEslintrc: false };
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
