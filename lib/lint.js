'use strict';

const { createLinterProvider, createReport }    = require('./common');
const LintError                                 = require('./lint-error');
const log                                       = require('./log');
const fastGlob                                  = require('fast-glob');
const { promises: { readFile, writeFile } }     = require('fs');

async function lint(...configList)
{
    const configWrapperPromises =
    configList.map
    (
        async config =>
        {
            const { src } = config;
            const filePaths = await fastGlob(src);
            return { config, filePaths };
        },
    );
    const configWrappers = await Promise.all(configWrapperPromises);
    const resultPromises = [];
    for (const { config, filePaths } of configWrappers)
    {
        const linterProvider = createLinterProvider(config);
        for (const filePath of filePaths)
        {
            const promise = lintFile(filePath, linterProvider);
            resultPromises.push(promise);
        }
    }
    let results = await Promise.all(resultPromises);
    results = results.filter(result => result);
    {
        const promises = [];
        for (const { filePath, output } of results)
        {
            if (output !== undefined)
            {
                const promise = writeFile(filePath, output);
                promises.push(promise);
            }
        }
        await Promise.all(promises);
    }
    const report = createReport(results);
    if (report != null)
        log(report);
    if (results.some(result => result.errorCount))
        throw new LintError();
}

async function lintFile(filePath, linterProvider)
{
    const linter = linterProvider(filePath);
    const source = linter.static ? null : await readFile(filePath, 'utf-8');
    const result = await linter(filePath, source);
    return result;
}

module.exports = lint;
