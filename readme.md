# @fasttime/lint · [![npm version][npm badge]][npm url]

Universal linter with [fasttime](https://github.com/fasttime?tab=repositories) presets.

## Usage

Plain usage:

```js
exports.lint =
async () =>
{
    const { lint } = require('@fasttime/lint');

    await lint({ src, env, fix, globals, parserOptions, rules });
};
```

Usage with [Gulp](https://gulpjs.com/):

```js
exports.lint =
() =>
{
    const { gulpLint } = require('@fasttime/lint');

    const stream = gulpLint({ src, env, fix, globals, parserOptions, rules });
    return stream;
};
```

It is also possible to specify a list of configurations, each targeting a different set of files.

```js
await lint({ src: src1, ...config1 }, { src: src2, ...config2 });
```

or

```js
const stream = gulpLint({ src: src1, ...config1 }, { src: src2, ...config2 });
```

## Settings

### `src`

The setting `src` is used to specify a glob pattern or a list of glob patterns that match the files
to be linted.
JavaScript, TypeScript and Gehrkin files are supported.
The file type is inferred from the extension according to the following mapping.

| Extension | Type       |
| --------- | ---------- |
| .cjs      | JavaScript |
| .cts      | TypeScript |
| .feature  | Gherkin    |
| .js       | JavaScript |
| .mjs      | JavaScript |
| .mts      | TypeScript |
| .ts       | TypeScript |

### `fix`

When set to `true`, linting problems are fixed automatically if possible.

### JavaScript and TypeScript options

JavaScript and TypeScript are linted with [ESLint](https://eslint.org/).
The following ESLint options are supported.

* [`env`][about env]
* [`extends`][about extends]
* [`globals`][about globals]
* [`parserOptions`][about parserOptions]
* [`plugins`][about plugins]
* [`rules`][about rules]

Additionally, the legacy option `envs` can be used instead of `env` to specify environments as a
string or array of strings rather than with an object.

### Gherkin options

Currently, the only specific option for Gherkin files is `defaultDialectName`, which can be a string
specifing the keyword of a [supported language](https://cucumber.io/docs/gherkin/languages/).
The default is English.

[about env]:
https://eslint.org/docs/user-guide/configuring/language-options#using-configuration-files

[about extends]:
https://eslint.org/docs/user-guide/configuring/configuration-files#extending-configuration-files

[about globals]:
https://eslint.org/docs/user-guide/configuring/language-options#using-configuration-files-1

[about parserOptions]:
https://eslint.org/docs/user-guide/configuring/language-options#specifying-parser-options

[about plugins]:
https://eslint.org/docs/user-guide/configuring/plugins#configuring-plugins

[about rules]:
https://eslint.org/docs/user-guide/configuring/rules#using-configuration-files

[npm badge]:
https://badge.fury.io/js/@fasttime%2Flint.svg

[npm url]:
https://www.npmjs.com/package/@fasttime/lint
