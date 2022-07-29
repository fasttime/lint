import type { ConfigData } from '@origin-1/eslint-config';
import                          'node';

export interface Config extends ConfigData
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
