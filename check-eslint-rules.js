#!/usr/bin/env node

'use strict';

const colors = require('ansi-colors');
const fs = require('fs');
const path = require('path');

const addToRuleListMap =
(ruleListMap, category, rule) =>
{
    let ruleList = ruleListMap.get(category);
    if (!ruleList)
        ruleListMap.set(category, ruleList = []);
    ruleList.push(rule);
};

function * getJSFileBasenames(dirPath)
{
    const fileNames = fs.readdirSync(dirPath);
    for (const fileName of fileNames)
    {
        const extname = path.extname(fileName);
        if (extname === '.js')
        {
            const basename = path.basename(fileName, extname);
            yield basename;
        }
    }
}

const getPackageFolder =
(pkg, subDir) =>
{
    const pkgMainDir = path.dirname(require.resolve(`${pkg}/package.json`));
    const pkgSubDir = path.join(pkgMainDir, subDir);
    return pkgSubDir;
};

const getRuleInfo =
rule =>
{
    let ruleInfo;
    const match = /^(?<plugin>.*)\/(?<rule>.*)/.exec(rule);
    if (match)
    {
        const { groups } = match;
        const { plugin } = groups;
        if (plugin === '@typescript-eslint')
        {
            const rulePath = path.join(tsRuleDir, groups.rule);
            require(rulePath);
        }
        ruleInfo = { category: `plugin:${plugin}` };
    }
    else
    {
        const rulePath = path.join(ruleDir, rule);
        const ruleDef = require(rulePath);
        const { meta } = ruleDef;
        ruleInfo = { deprecated: meta.deprecated, category: meta.docs.category };
    }
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
const tsRuleDir = getPackageFolder('@typescript-eslint/eslint-plugin', 'dist/rules');

{
    const deprecatedRuleListMap = new Map();
    const unconfiguredRuleListMap = new Map();
    const miscategorizedRuleListMap = new Map();
    {
        const unconfiguredRuleSet = new Set();
        {
            const basenames = getJSFileBasenames(ruleDir);
            for (const basename of basenames)
                unconfiguredRuleSet.add(basename);
        }
        {
            const basenames = getJSFileBasenames(tsRuleDir);
            for (const basename of basenames)
                unconfiguredRuleSet.add(`@typescript-eslint/${basename}`);
        }
        {
            const eslintRuleDefinitions = require('./lib/eslint-rules');
            for (const { category: actualCategory, ruleConfig } of eslintRuleDefinitions)
            {
                const ruleList = Object.keys(ruleConfig);
                for (const rule of ruleList)
                {
                    unconfiguredRuleSet.delete(rule);
                    const ruleInfo = getRuleInfo(rule);
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
            const { category, deprecated } = getRuleInfo(rule);
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
