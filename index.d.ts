import type { Linter } from 'eslint';

export interface Config
{
    src:            string | string[];
    envs?:          string | string[];
    fix?:           boolean;
    globals?:       string[];
    parserOptions?: Linter.ParserOptions;
    plugins?:       string | string[];
    rules?:         { [name: string]: Linter.RuleLevel | Linter.RuleLevelAndOptions; };
}

export default function lint(...configs: Config[]): NodeJS.ReadWriteStream;
