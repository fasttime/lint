#!/usr/bin/env node

'use strict';

const colors    = require('ansi-colors');
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

const ruleDir = getPackageFolder('eslint', 'lib/rules');
{
    const ruleMap = new Map();
    const deprecatedRuleListMap = new Map();
    const unconfiguredRuleListMap = new Map();
    const miscategorizedRuleListMap = new Map();
    {
        function registerPluginRules(plugin, category, rulePrefix)
        {
            const { rules } = require(plugin);

            for (const [basename, { meta: { deprecated } }] of Object.entries(rules))
            {
                const ruleName = `${rulePrefix}/${basename}`;
                registerRule(ruleName, category, deprecated);
            }
        }

        function registerRule(ruleName, category, deprecated)
        {
            const ruleInfo = { category, deprecated };
            ruleMap.set(ruleName, ruleInfo);
            unconfiguredRuleSet.add(ruleName);
        }

        const unconfiguredRuleSet = new Set();
        {
            const ruleInputMap = require(ruleDir);

            for (const [ruleName, { meta: { deprecated, docs: { category } } }] of ruleInputMap)
                registerRule(ruleName, category, deprecated);
        }
        registerPluginRules
        ('@typescript-eslint/eslint-plugin', 'plugin:@typescript-eslint', '@typescript-eslint');
        registerPluginRules
        ('eslint-plugin-fasttime-rules', 'plugin:fasttime-rules', 'fasttime-rules');
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
    if
    (unconfiguredRuleListMap.size || deprecatedRuleListMap.size || miscategorizedRuleListMap.size)
    {
        console.log(colors.red('Found problems in ESLint rule configuration file eslint-rules.js'));
        listRules('Rules not configured', unconfiguredRuleListMap);
        listRules('Deprecated rules configured', deprecatedRuleListMap);
        listRules('Rules in a wrong category', miscategorizedRuleListMap);
    }
    else
    {
        console.log
        (colors.green('No problems found in ESLint rule configuration file eslint-rules.js'));
    }
}
