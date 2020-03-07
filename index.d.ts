/// <reference types="node" />

declare namespace lint
{
    interface Config
    {
        src:            string | string[];
        envs?:          string | string[];
        fix?:           boolean;
        globals?:       string[];
        parserOptions?: object;
        plugins?:       string | string[];
        rules?:         object;
    }
}

declare function lint(...configs: lint.Config[]): NodeJS.ReadWriteStream;

export = lint;
