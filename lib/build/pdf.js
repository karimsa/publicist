/**
 * lib/build/pdf.js - publicist
 * Copyright (C) 2016 Karim Alibhai.
 */

'use strict';

const fs = require('fs')
    , path = require('path')
    , Nightmare = require('nightmare')

module.exports = directory =>
    Nightmare()
        .goto('file://' + directory + '/.pub/index.html')
        .wait('.MJXc-display')
        .pdf(path.resolve(directory + '/build/output.pdf'))
        .end()