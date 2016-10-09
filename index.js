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
       .action($( require('./lib/build') ))

program.parse(process.argv)
if (!caught) program.help()