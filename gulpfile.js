'use strict';

const gulp = require('gulp');

// Destructuring, rest parameters and the spread operator are not supported in Node.js 4.
const eslintRules =
{ 'prefer-destructuring': 'off', 'prefer-rest-params': 'off', 'prefer-spread': 'off' };

gulp.task(
    'lint:index',
    () =>
    {
        const lint = require('.');
        
        const stream = gulp.src('lib/index.js').pipe(lint({ envs: ['node'], rules: eslintRules }));
        return stream;
    }
);

gulp.task(
    'lint:other',
    () =>
    {
        const lint = require('.');
        
        const stream =
            gulp.src(['**/*.js', '!lib/index.js']).pipe(
                lint({ envs: ['node'], parserOptions: { ecmaVersion: 6 }, rules: eslintRules })
            );
        return stream;
    }
);

gulp.task('default', ['lint:index', 'lint:other']);
