'use strict';

const ts = require('typescript'); // eslint-disable-line node/no-extraneous-require

const { bindSourceFile, createSourceFile, createWatchProgram } = ts;
let _getSourceText;
ts.createWatchProgram =
(...args) =>
{
    const watchProgram = createWatchProgram(...args);
    const getProgram1 = watchProgram.getProgram;
    watchProgram.getProgram =
    () =>
    {
        const program = getProgram1();
        const getProgram2 = program.getProgram;
        program.getProgram =
        () =>
        {
            const program = getProgram2();
            program.getSourceFile =
            fileName =>
            {
                const sourceText = _getSourceText(fileName);
                const sourceFile = createSourceFile(fileName, sourceText);
                bindSourceFile(sourceFile, { });
                return sourceFile;
            };
            return program;
        };
        return program;
    };
    return watchProgram;
};
module.exports =
function (getSourceText)
{
    _getSourceText = getSourceText;
};
