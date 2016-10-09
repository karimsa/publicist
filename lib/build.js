/**
 * lib/build.js - publicist
 * Copyright (C) 2016 Karim Alibhai.
 */

'use strict';

const dir = require('./directory')
    , fs = require('fs')
    , path = require('path')
    , marked = require('marked')
    , cheerio = require('cheerio')
    , rf = require('rimraf')
    , ejs = require('ejs')

module.exports = (directory, options) => {
    directory = dir( directory )
    module.exports.go(directory, options, () => {
        console.log('* Building outputs ...')
        Promise.all(options.format.split(',').map(type =>
            require('./build/' + type)(directory)
                .then(() => console.log('* Built output: %s', type))
        )).then(() => {
            console.log('* Completed build.')
        }).catch(berr => {
            console.log('! Error: ' + JSON.stringify(berr))
        })
    })
}

module.exports.go = (directory, options, done) => {
    directory = dir( directory )
    const buildDir = directory + '/.pub'
    const template = path.resolve(process.cwd(), options.template)

    // clean and create the build directory
    console.log('* Removing old files ...')
    if (fs.existsSync(buildDir)) rf.sync(buildDir)
    fs.mkdirSync(buildDir)

    if (fs.existsSync(directory + '/build')) rf.sync(directory + '/build')
    fs.mkdirSync(directory + '/build')

    // grab the readme first
    console.log('* Reading information ...')
    fs.readFile(directory + '/README.md', 'utf8', (err, data) => {
        if (err) {
            console.error('! Error: ' + err)
            process.exit(-1)
        } else {
            data = data.trim().split(/\r?\n/g).filter(a => a)
            const title = data[0].substr(1).trim(),
                  abstract = data.slice(1).join('\n')

            // print info
            console.log('  Title: %s', title)
            console.log('  Abstract length: %s words, %s characters', abstract.split(/\s+/g).length, abstract.length)

            // and now the table of contents
            fs.readFile(directory + '/SUMMARY.md', 'utf8', (serr, summary) => {
                if (serr) {
                    console.error('! Error: ' + serr)
                    process.exit(-1)
                } else {
                    const nSections = summary.split(/\r?\n/g).filter(line => {
                        line = line.trim()
                        return line && line[0] === '-'
                    }).length

                    let renderer = new marked.Renderer()
                      , heading = ''
                      , list = {}
                      , map = {}
                      , order = []
                      , author = ''

                    renderer.paragraph = text => {
                        author = text.split(':')[1]
                        console.log('* Author: %s', author)
                    }

                    renderer.list = text => {
                        const $ = cheerio.load(text)

                        // we have now compiled the entire table of
                        // contents, and so we can begin extracting info
                        if ($('li').length === nSections) {
                            $('li').each(function (i, elm) {
                                elm = $(elm)
                                if (elm.is('ul>li')) {
                                    list[heading].push(elm.text())
                                    map[heading + '/' + elm.text()] = path.resolve(directory, elm.find('a').attr('href'))
                                } else {
                                    let a = elm.find('a:not(ul a)')
                                    list[heading = a.text()] = []
                                    map[a.text()] = path.resolve(directory, a.attr('href'))
                                    order.push(heading)
                                }
                            })

                            //console.log(list)
                            //console.log(map)
                            //console.log(order)
                            console.log('* Sections:\n%s', order.map(line=>' - '+line).join('\n'))
                        }

                        return '<ul>' + text + '</ul>'
                    }

                    marked(summary, {
                        renderer: renderer
                    })

                    // convert map by replacing file names with
                    // compiled html
                    Promise.all(Object.keys(map).map(title => new Promise((resolve, reject) => {
                        fs.readFile(map[title], 'utf8', (ferr, md) => {
                            if (ferr) reject(ferr)
                            else {
                                console.log('* Compiled section: %s ...', title)
                                resolve(map[title] = marked(md, {
                                    renderer: (function () {
                                        let R = new marked.Renderer()
                                        R.heading = function (text, level) {
                                            return level > 1 ? text : ''
                                        }
                                        return R
                                    }())
                                }))
                            }
                        })
                    }))).then(() => {
                        fs.writeFileSync(buildDir + '/style.css', fs.readFileSync(path.resolve(__dirname, '../res/style.css')))
                        fs.readFile(template, 'utf8', function (terr, tpldata) {
                            if (terr) {
                                console.error('! Error: ' + terr)
                                process.exit(-1)
                            } else {
                                fs.writeFile(buildDir + '/index.html', ejs.render(tpldata, {
                                    head: `
                                    <head>
                                        <meta charset="utf-8">
                                        <link rel="stylesheet" href="style.css">
                                        <script type="text/x-mathjax-config">
                                        MathJax.Hub.Config({
                                          tex2jax: {inlineMath: [['$','$']]}
                                        });
                                        </script>
                                        <script type="text/javascript" src="http://cdn.mathjax.org/mathjax/latest/MathJax.js?config=TeX-MML-AM_CHTML"></script>
                                    </head>
                                    `,
                                    title: title,
                                    author: author,
                                    year: new Date().getFullYear(),
                                    abstract: abstract,
                                    style: options.style ? '<link rel="stylesheet" href="' + (options.style[0] === '/' ? options.style : path.resolve(process.cwd(), options.style)) + '">' : '',
                                    compiled: order.map((section, index) => {
                                        return `
                                        <section>
                                            <h2 class="title">${index+1}. ${section}</h2>
                                            ${map[section]}
                                            ${list[section].map((subtitle, subindex) => {
                                                return '<section><h2>' + (index+1) + '.' + (subindex+1) + ' ' + subtitle + '</h2>\n' + map[section + '/' + subtitle] + '</section>'
                                            }).join('')}
                                        </section>
                                        `
                                    }).join('')
                                }), function (werr) {
                                    if (werr) {
                                        console.error('error: ' + werr)
                                        process.exit(-1)
                                    } else done()
                                })
                            }
                        })
                    }).catch(perr => {
                        console.error('! Error: ' + perr)
                        process.exit(-1)
                    })
                }
            })
        }
    })
}