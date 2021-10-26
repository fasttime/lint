#!/usr/bin/env node

'use strict';

const colors    = require('ansi-colors');
const fancyLog  = require('fancy-log');
const path      = require('path');

const addToRuleListMap =
(ruleListMap, type, ruleName) =>
{
    let ruleList = ruleListMap.get(type);
    if (!ruleList)
        ruleListMap.set(type, ruleList = []);
    ruleList.push(ruleName);
};

const getPackageFolder =
(pkg, subDir) =>
{
    const pkgMainDir = path.dirname(require.resolve(`${pkg}/package.json`));
    const pkgSubDir = path.join(pkgMainDir, subDir);
    return pkgSubDir;
};

const printRuleListMap =
(description, ruleListMap) =>
{
    if (ruleListMap.size === 0)
        return;
    const horizontalRule = colors.gray('⏤'.repeat(52));
    console.log('\n%s', colors.bold(description));
    console.log(horizontalRule);
    {
        const categories = [...ruleListMap.keys()].sort();
        for (const type of categories)
        {
            console.log('%s', colors.blue(type));
            const ruleList = ruleListMap.get(type).sort();
            for (const ruleName of ruleList)
                console.log('• %s', ruleName);
        }
    }
    console.log(horizontalRule);
};

const printRuleSet =
(description, ruleSet) =>
{
    if (ruleSet.size === 0)
        return;
    const horizontalRule = colors.gray('⏤'.repeat(52));
    console.log('\n%s', colors.bold(description));
    console.log(horizontalRule);
    {
        const ruleList = [...ruleSet].sort();
        for (const ruleName of ruleList)
            console.log('• %s', ruleName);
    }
    console.log(horizontalRule);
};

const deprecatedRuleListMap     = new Map();
const unconfiguredRuleListMap   = new Map();
const unsortedRuleSet           = new Set();
const wronglyTypedRuleListMap   = new Map();
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
        const ruleInfo = { type, deprecated };
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
        for (const { type: actualType, ruleConfig } of ruleDefinitions)
        {
            const ruleList = Object.keys(ruleConfig);
            let lastRuleName = null;
            for (const ruleName of ruleList)
            {
                unconfiguredRuleSet.delete(ruleName);
                const ruleInfo = ruleMap.get(ruleName);
                const { type: expectedType, deprecated } = ruleInfo;
                if (deprecated)
                {
                    addToRuleListMap(deprecatedRuleListMap, expectedType, ruleName);
                    lastRuleName = null;
                }
                else if (actualType !== expectedType)
                {
                    addToRuleListMap(wronglyTypedRuleListMap, expectedType, ruleName);
                    lastRuleName = null;
                }
                else if (lastRuleName != null && ruleName < lastRuleName)
                {
                    unsortedRuleSet.add(lastRuleName);
                    unsortedRuleSet.add(ruleName);
                    lastRuleName = ruleName;
                }
                else
                    lastRuleName = ruleName;
            }
        }
    }
    for (const ruleName of unconfiguredRuleSet)
    {
        const { type, deprecated } = ruleMap.get(ruleName);
        if (!deprecated)
            addToRuleListMap(unconfiguredRuleListMap, type, ruleName);
    }
}
const ok =
!(
    unconfiguredRuleListMap.size ||
    deprecatedRuleListMap.size ||
    wronglyTypedRuleListMap.size ||
    unsortedRuleSet.size
);
if (ok)
{
    fancyLog
    (colors.green('No problems found in ESLint rule configuration file eslint-rules.js'));
}
else
{
    fancyLog(colors.red('Found problems in ESLint rule configuration file eslint-rules.js'));
    printRuleListMap('Rules not configured', unconfiguredRuleListMap);
    printRuleListMap('Deprecated rules configured', deprecatedRuleListMap);
    printRuleListMap('Rules under a wrong type in at least one list', wronglyTypedRuleListMap);
    printRuleSet('Rules unsorted in at least one list', unsortedRuleSet);
}
if (require.main === module)
    process.exitCode = ok ? 0 : 1;
module.exports = ok;
