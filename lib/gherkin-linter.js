'use strict';

const { AstBuilder: GherkinAstBuilder, Parser: GherkinParser, TokenMatcher: GherkinTokenMatcher } =
require('@cucumber/gherkin');

const { resolve } = require('path');

function createGherkinLinter(config)
{
    const parser = createGherkinParser(config);
    const linter =
    async (filePath, source) => // eslint-disable-line require-await
    {
        let parserErrors;
        try
        {
            parser.parse(source);
        }
        catch ({ errors })
        {
            parserErrors = errors;
        }
        const messages =
        parserErrors ?
        parserErrors.map
        (
            ({ location: { column, line }, message }) =>
            ({ column, line, message: message.replace(/^\(.*?\): /, ''), severity: 2 }),
        ) :
        [];
        const errorCount = messages.length;
        if (errorCount)
        {
            filePath = resolve(filePath);
            const result =
            {
                errorCount,
                filePath,
                fixableErrorCount: 0,
                fixableWarningCount: 0,
                messages,
                warningCount: 0,
            };
            return result;
        }
    };
    return linter;
}

function createGherkinParser(config)
{
    const builder = new GherkinAstBuilder(String);
    const tokenMatcher = new GherkinTokenMatcher(config.defaultDialectName);
    const parser = new GherkinParser(builder, tokenMatcher);
    return parser;
}

module.exports = createGherkinLinter;
