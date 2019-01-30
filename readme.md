# gulp-fasttime-lint · [![npm version][npm badge]][npm url]

[Gulp](https://gulpjs.com/) plugin for [ESLint](https://eslint.org/) validation with
[fasttime](https://github.com/fasttime?tab=repositories) presets.

## Usage

```js
exports.lint =
() =>
{
    const lint = require('gulp-fasttime-lint');

    const stream = lint({ src, envs, fix, globals, parserOptions, rules });
    return stream;
};
```

[npm badge]: https://badge.fury.io/js/gulp-fasttime-lint.svg
[npm url]: https://www.npmjs.com/package/gulp-fasttime-lint
