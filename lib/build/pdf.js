/**
 * lib/build/pdf.js - publicist
 * Copyright (C) 2016 Karim Alibhai.
 */

'use strict';

const fs = require('fs')
    , path = require('path')
    , Nightmare = require('nightmare')

module.exports = directory =>
    Nightmare({show:true})
        .goto('file://' + directory + '/.pub/index.html')
        .wait('#MathJax_Message')
        .evaluate(function () {
            var msg = document.querySelector('#MathJax_Message'),
                next = function () {
                    if (msg.style.display === 'none') {
                        var elm = document.createElement('div')
                        elm.id = 'math_done'
                        document.body.appendChild(elm)
                    } else setTimeout(next, 250)
                }
            next()
        })
        .wait('#math_done')
        .pdf(path.resolve(directory + '/build/output.pdf'))
        .end()