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
            const rulePath = path.join(TS_RULE_DIR, groups.rule);
            require(rulePath);
        }
        ruleInfo = { category: `plugin:${plugin}` };
    }
    else
    {
        const rulePath = path.join(RULE_DIR, rule);
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

const RULE_DIR = 'eslint/lib/rules';
const TS_RULE_DIR = '@typescript-eslint/eslint-plugin/dist/rules';

{
    const deprecatedRuleListMap = new Map();
    const unconfiguredRuleListMap = new Map();
    const miscategorizedRuleListMap = new Map();
    {
        const unconfiguredRuleSet = new Set();
        {
            const fileNames = fs.readdirSync(`${__dirname}/node_modules/${RULE_DIR}`);
            for (const fileName of fileNames)
            {
                const extname = path.extname(fileName);
                if (extname === '.js')
                {
                    const basename = path.basename(fileName, extname);
                    unconfiguredRuleSet.add(basename);
                }
            }
        }
        {
            const fileNames = fs.readdirSync(`${__dirname}/node_modules/${TS_RULE_DIR}`);
            for (const fileName of fileNames)
            {
                const extname = path.extname(fileName);
                if (extname === '.js')
                {
                    const basename = path.basename(fileName, extname);
                    unconfiguredRuleSet.add(`@typescript-eslint/${basename}`);
                }
            }
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
