#!/usr/bin/env node

'use strict';

const colors    = require('ansi-colors');
const path      = require('path');

const addToRuleListMap =
(ruleListMap, category, rule) =>
{
    let ruleList = ruleListMap.get(category);
    if (!ruleList)
        ruleListMap.set(category, ruleList = []);
    ruleList.push(rule);
};

const getPackageFolder =
(pkg, subDir) =>
{
    const pkgMainDir = path.dirname(require.resolve(`${pkg}/package.json`));
    const pkgSubDir = path.join(pkgMainDir, subDir);
    return pkgSubDir;
};

const getRuleInfo =
(ruleName, ruleMap) =>
{
    const meta = ruleMap.get(ruleName);
    let ruleInfo;
    const match = /^(?<plugin>.*)\/(?<rule>.*)/.exec(ruleName);
    if (match)
        ruleInfo = { deprecated: meta.deprecated, category: `plugin:${match.groups.plugin}` };
    else
        ruleInfo = { deprecated: meta.deprecated, category: meta.docs.category };
    return ruleInfo;
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
            for (const rule of ruleList)
                console.log('• %s', rule);
        }
    }
    console.log(horizontalRule);
};

const ruleDir = getPackageFolder('eslint', 'lib/rules');
{
    const deprecatedRuleListMap = new Map();
    const unconfiguredRuleListMap = new Map();
    const ruleMap = new Map();
    const miscategorizedRuleListMap = new Map();
    {
        const unconfiguredRuleSet = new Set();
        {
            const ruleInputMap = require(ruleDir);

            for (const [ruleName, { meta }] of ruleInputMap)
            {
                ruleMap.set(ruleName, meta);
                unconfiguredRuleSet.add(ruleName);
            }
        }
        {
            const { default: rules } = require('@typescript-eslint/eslint-plugin/dist/rules');

            for (const [basename, { meta }] of Object.entries(rules))
            {
                const ruleName = `@typescript-eslint/${basename}`;
                ruleMap.set(ruleName, meta);
                unconfiguredRuleSet.add(ruleName);
            }
        }
        {
            const { rules } = require('eslint-plugin-fasttime-rules/lib');

            for (const [basename, { meta }] of Object.entries(rules))
            {
                const ruleName = `fasttime-rules/${basename}`;
                ruleMap.set(ruleName, meta);
                unconfiguredRuleSet.add(ruleName);
            }
        }
        {
            const { ruleDefinitions } = require('./lib/eslint-rules');
            for (const { category: actualCategory, ruleConfig } of ruleDefinitions)
            {
                const ruleList = Object.keys(ruleConfig);
                for (const rule of ruleList)
                {
                    unconfiguredRuleSet.delete(rule);
                    const ruleInfo = getRuleInfo(rule, ruleMap);
                    const { category: expectedCategory, deprecated } = ruleInfo;
                    if (deprecated)
                        addToRuleListMap(deprecatedRuleListMap, expectedCategory, rule);
                    if (actualCategory !== expectedCategory)
                        addToRuleListMap(miscategorizedRuleListMap, expectedCategory, rule);
                }
            }
        }
        for (const rule of unconfiguredRuleSet)
        {
            const { category, deprecated } = getRuleInfo(rule, ruleMap);
            if (!deprecated)
                addToRuleListMap(unconfiguredRuleListMap, category, rule);
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
