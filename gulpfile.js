'use strict';

var gulp = require('gulp');

gulp.task(
    'lint',
    function ()
    {
        var lint = require('.');
        
        var stream = gulp.src('./*.js').pipe(lint({ envs: ['node'] }));
        return stream;
    }
);

gulp.task('default', ['lint']);
