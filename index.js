#!/usr/bin/env node

/**
 * index.js - publicist
 * Copyright (C) 2016 Karim Alibhai.
 */

'use strict';

let caught = false
const $ = fn => function () {
    caught = true
    fn.apply(this, arguments)
}, program =
    require('commander')
        .version(require('./package').version)
        .description(require('./package').description)
        .usage('<command> [OPTIONS]')

program.command('init [directory]').alias('i')
       .description('initializes a new project')
       .action($( require('./lib/init') ))

program.command('build [directory]').alias('b')
       .description('compiles publication into output forms')
       .option('-f, --format [types]', 'set the formats to build', list => list.split(',').reduce((a, b) => a && /^(pdf)$/i.test(b)), 'pdf')
       .option('-t, --template [file]', 'use a custom ejs template file', __dirname + '/res/index.ejs')
       .option('-s, --style [stylesheet]', 'use a custom stylesheet file')
       .action($( require('./lib/build') ))

program.command('watch [directory]').alias('w')
       .description('watches publication and compiles for web browser')
       .option('-f, --format [types]', 'set the formats to build', list => list.split(',').reduce((a, b) => a && /^(pdf)$/i.test(b)), 'pdf')
       .option('-t, --template [file]', 'use a custom ejs template file', __dirname + '/res/index.ejs')
       .option('-s, --style [stylesheet]', 'use a custom stylesheet file')
       .action($( require('./lib/watch') ))

program.parse(process.argv)
if (!caught) program.help()