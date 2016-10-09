/**
 * lib/watch.js - publicist
 * Copyright (C) 2016 Karim Alibhai.
 */

'use strict';

const fs = require('fs')
    , http = require('http')
    , nextPort = require('next-port')
    , dir = require('./directory')

module.exports = (directory, options) => {
    nextPort().then(port => {
        http.createServer((req, res) => {
            fs.readFile(dir(directory + '/.pub' + (req.url === '/' ? '/index.html' : req.url)), 'utf8', (err, data) => {
                if (err) {
                    console.log('! ' + err)
                    res.end('Error: ' + err)
                } else res.end(data)
            })
        }).listen(port, () => {
            console.log('* Listening at http://localhost:%s/', port)
        }).on('error', err => {
            console.log('! ' + err)
        })
    }).catch(err => {
        console.log('! ' + err)
    })
}