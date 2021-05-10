import type { Linter } from 'eslint';

export interface Config extends Linter.BaseConfig
{
    src:                    string | string[];
    defaultDialectName?:    string;
    envs?:                  string | string[];
    fix?:                   boolean;
}

export class LintError extends Error
{
    public get showStack(): false;
}

export function gulpLint(...configList: Config[]): NodeJS.ReadWriteStream;

export function lint(...configList: Config[]): Promise<void>;
