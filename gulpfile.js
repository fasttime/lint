'use strict';

const gulp = require('gulp');

gulp.task(
    'lint:index',
    () =>
    {
        const lint = require('.');
        
        const stream = gulp.src('lib/index.js').pipe(lint({ envs: ['node'] }));
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
                lint({ envs: ['es6', 'node'], parserOptions: { ecmaVersion: 6 } })
            );
        return stream;
    }
);

gulp.task(
    'default',
    callback =>
    {
        const runSequence = require('run-sequence');
        
        runSequence('lint:index', 'lint:other', callback);
    }
);
