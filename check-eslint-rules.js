#!/usr/bin/env node

// Run with Node.js 7 or later.

'use strict';

const fs = require('fs');
const path = require('path');
const gutil = require('gulp-util');

const addToRuleListMap =
    (ruleListMap, category, rule) =>
    {
        let ruleList = ruleListMap.get(category);
        if (!ruleList)
            ruleListMap.set(category, ruleList = []);
        ruleList.push(rule);
    };

const { colors } = gutil;

const getRuleInfo =
    rule =>
    {
        const rulePath = path.join(ruleFolder, rule);
        const ruleDef = require(rulePath);
        const { meta } = ruleDef;
        const ruleInfo = { deprecated: meta.deprecated, category: meta.docs.category };
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
            const categories = [...ruleListMap.keys()].sort();
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

const ruleFolder = 'eslint/lib/rules';

{
    const deprecatedRuleListMap = new Map();
    const unconfiguredRuleListMap = new Map();
    const miscategorizedRuleListMap = new Map();
    {
        const unconfiguredRuleSet = new Set();
        {
            const fileNames = fs.readdirSync(`./node_modules/${ruleFolder}`);
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
            const eslintRules = require('./lib/eslint-rules');
            const usedRuleEntries = Object.entries(eslintRules);
            for (const [actualCategory, ruleConfig] of usedRuleEntries)
            {
                const ruleList = Object.keys(ruleConfig);
                for (const rule of ruleList)
                {
                    unconfiguredRuleSet.delete(rule);
                    const { deprecated, category } = getRuleInfo(rule);
                    if (deprecated)
                        addToRuleListMap(deprecatedRuleListMap, category, rule);
                    if (actualCategory !== category)
                        addToRuleListMap(miscategorizedRuleListMap, category, rule);
                }
            }
        }
        for (const rule of unconfiguredRuleSet)
        {
            const { deprecated, category } = getRuleInfo(rule);
            if (!deprecated)
                addToRuleListMap(unconfiguredRuleListMap, category, rule);
        }
    }
    if (
        unconfiguredRuleListMap.size ||
        deprecatedRuleListMap.size ||
        miscategorizedRuleListMap.size)
    {
        console.log(colors.red('Found problems in ESLint rule configuration file eslint-rules.js'));
        listRules('Rules not configured', unconfiguredRuleListMap);
        listRules('Deprecated rules configured', deprecatedRuleListMap);
        listRules('Rules in a wrong category', miscategorizedRuleListMap);
    }
    else
    {
        console.log(
            colors.green('No problems found in ESLint rule configuration file eslint-rules.js')
        );
    }
}
