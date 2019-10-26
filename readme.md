# gulp-fasttime-lint · [![npm version][npm badge]][npm url]

[Gulp](https://gulpjs.com/) plugin for [ESLint](https://eslint.org/) validation with
[fasttime](https://github.com/fasttime?tab=repositories) presets.

Validates JavaScript, TypeScript and Gherkin files.

## Usage

```js
exports.lint =
() =>
{
    const lint = require('gulp-fasttime-lint');

    const stream = lint({ src, envs, fix, globals, parserOptions, plugins, rules });
    return stream;
};
```

You can also specify more than one configuration.

```js
const stream = lint([{ src: src1, ...config1 }, { src: src2, ...config2 }]);
```

The setting `src` is used to specify the files to be linted; all the other settings are only
relevant to JavaScript and TypeScript files, and are ignored for Gherkin files.

It is fine to specify different kinds of source files in the same `src` glob pattern(s), as long as
other configuration settings don't interfere.

[npm badge]: https://badge.fury.io/js/gulp-fasttime-lint.svg
[npm url]: https://www.npmjs.com/package/gulp-fasttime-lint
