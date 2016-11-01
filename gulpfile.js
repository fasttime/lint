'use strict';

var gulp = require('gulp');

gulp.task(
    'lint',
    function ()
    {
        var lint = require('./'); // '.' doesn't work in older Node.js versions
        
        var stream = gulp.src('./*.js').pipe(lint({ envs: ['node'] }));
        return stream;
    }
);

gulp.task('default', ['lint']);
