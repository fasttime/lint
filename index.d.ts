import type { Linter } from 'eslint';

export interface Config extends Linter.BaseConfig
{
    src:                    string | readonly string[];
    defaultDialectName?:    string | undefined;
    envs?:                  string | readonly string[] | undefined;
    fix?:                   boolean | undefined;
}

export class LintError extends Error
{
    public get showStack(): false;
}

export function gulpLint(...configList: Config[]): NodeJS.ReadWriteStream;

export function lint(...configList: Config[]): Promise<void>;
