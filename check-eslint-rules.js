#!/usr/bin/env node

'use strict';

const colors    = require('ansi-colors');
const fancyLog  = require('fancy-log');
const path      = require('path');

const addToRuleListMap =
(ruleListMap, category, ruleName) =>
{
    let ruleList = ruleListMap.get(category);
    if (!ruleList)
        ruleListMap.set(category, ruleList = []);
    ruleList.push(ruleName);
};

const getPackageFolder =
(pkg, subDir) =>
{
    const pkgMainDir = path.dirname(require.resolve(`${pkg}/package.json`));
    const pkgSubDir = path.join(pkgMainDir, subDir);
    return pkgSubDir;
};

const listRules =
(description, ruleListMap) =>
{
    if (ruleListMap.size === 0)
        return;
    const horizontalRule = colors.gray('⏤'.repeat(52));
    console.log('\n%s', colors.bold(description));
    console.log(horizontalRule);
    {
        const categories = Array.from(ruleListMap.keys()).sort();
        for (const category of categories)
        {
            const ruleList = ruleListMap.get(category).sort();
            console.log('%s', colors.blue(category));
            for (const ruleName of ruleList)
                console.log('• %s', ruleName);
        }
    }
    console.log(horizontalRule);
};

const deprecatedRuleListMap = new Map();
const unconfiguredRuleListMap = new Map();
const miscategorizedRuleListMap = new Map();
{
    function registerPluginRules(plugin, rulePrefix)
    {
        const { rules } = require(plugin);

        for (const [basename, rule] of Object.entries(rules))
        {
            const ruleName = `${rulePrefix}/${basename}`;
            registerRule(ruleName, rule);
        }
    }

    function registerRule(ruleName, { meta: { deprecated, type } })
    {
        const ruleInfo = { category: type, deprecated };
        ruleMap.set(ruleName, ruleInfo);
        unconfiguredRuleSet.add(ruleName);
    }

    const ruleDir = getPackageFolder('eslint', 'lib/rules');
    const ruleMap = new Map();
    const unconfiguredRuleSet = new Set();
    {
        const ruleInputMap = require(ruleDir);

        for (const [ruleName, rule] of ruleInputMap)
            registerRule(ruleName, rule);
    }
    registerPluginRules('@typescript-eslint/eslint-plugin', '@typescript-eslint');
    registerPluginRules('@fasttime/eslint-plugin', '@fasttime');
    registerPluginRules('eslint-plugin-node', 'node');
    {
        const { ruleDefinitions } = require('./lib/eslint-rules');
        for (const { category: actualCategory, ruleConfig } of ruleDefinitions)
        {
            const ruleList = Object.keys(ruleConfig);
            for (const ruleName of ruleList)
            {
                unconfiguredRuleSet.delete(ruleName);
                const ruleInfo = ruleMap.get(ruleName);
                const { category: expectedCategory, deprecated } = ruleInfo;
                if (deprecated)
                    addToRuleListMap(deprecatedRuleListMap, expectedCategory, ruleName);
                if (actualCategory !== expectedCategory)
                    addToRuleListMap(miscategorizedRuleListMap, expectedCategory, ruleName);
            }
        }
    }
    for (const ruleName of unconfiguredRuleSet)
    {
        const { category, deprecated } = ruleMap.get(ruleName);
        if (!deprecated)
            addToRuleListMap(unconfiguredRuleListMap, category, ruleName);
    }
}
const ok =
!(unconfiguredRuleListMap.size || deprecatedRuleListMap.size || miscategorizedRuleListMap.size);
if (ok)
{
    fancyLog
    (colors.green('No problems found in ESLint rule configuration file eslint-rules.js'));
}
else
{
    fancyLog(colors.red('Found problems in ESLint rule configuration file eslint-rules.js'));
    listRules('Rules not configured', unconfiguredRuleListMap);
    listRules('Deprecated rules configured', deprecatedRuleListMap);
    listRules('Rules in a wrong category', miscategorizedRuleListMap);
}
if (require.main === module)
    process.exitCode = ok ? 0 : 1;
module.exports = ok;
