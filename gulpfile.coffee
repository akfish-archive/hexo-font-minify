#< deps
GLOBAL.gulp = require('gulp')
GLOBAL.heap = require('gulp-heap')
GLOBAL.config = require('./gulpconfig.json')
#>
#< tasks
require('./gulp-task/es6')('default')
require('./gulp-task/mocha')('default')
require('./gulp-task/clean')('default')
#>
#< contents
#>