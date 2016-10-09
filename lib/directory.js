/**
 * lib/directory.js - publicist
 * Copyright (C) 2016 Karim Alibhai.
 */

'use strict';

const fs = require('fs')
    , path = require('path')

module.exports = directory => directory[0] === '/' ? directory : path.resolve(process.cwd(), directory)