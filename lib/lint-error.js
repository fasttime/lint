'use strict';

module.exports =
class LintError extends Error
{
    constructor()
    {
        super('Lint failed');
        delete this.stack;
    }

    get showStack()
    {
        return false;
    }
};
