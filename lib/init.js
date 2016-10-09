/**
 * lib/init.js - publicist
 * Copyright (C) 2016 Karim Alibhai.
 */

'use strict';

const fs = require('fs')
    , path = require('path')
    , dir = require('./directory')

module.exports = directory => {
    directory = dir(directory)

    // if it exists, ensure that it is empty
    if ( fs.existsSync(directory) ) {
        if (fs.readdirSync(directory).length !== 0) {
            console.error('error: directory is not empty')
            process.exit(-1)
        }
    }

    // if not, then create it
    else {
        fs.mkdirSync(directory)
    }

    // create important files
    try {
        fs.writeFileSync(path.resolve(directory, 'README.md'), '# (title goes here)\n\n(abstract goes here)')
        fs.writeFileSync(path.resolve(directory, 'SUMMARY.md'), '# Table of Contents\n\n - [Item #1]()')

        console.log('Initialized project directory: %s', directory.replace(process.cwd(), '.'))
    } catch (err) {
        console.error(err)
        process.exit(-1)
    }
}