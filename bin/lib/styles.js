var fs = require('fs')
var util = require('util')
var path = require('path')
var crypto = require('crypto')
var assert = require('assert')
var postcss = require('postcss')
var Watcher = require('postcss-watcher')
var postcssrc = require('postcss-load-config')
var inlineSourceMapComment = require('inline-source-map-comment')

var readFile = util.promisify(fs.readFile)

module.exports = styles

function styles (entry, opts) {
  assert(typeof entry === 'string', 'stack: css entry path should be a string')

  var build
  var watcher = new Watcher()
  var from = path.resolve(entry)

  watcher.bundle = bundle
  watcher.on('change', bundle)
  watcher.on('update', function (buff) {
    watcher.hash = crypto.createHash('sha512').update(buff).digest('buffer')
  })
  watcher.middleware = function (req, res) {
    build.then(function (buff) {
      res.setHeader('Content-Type', 'text/css')
      res.setHeader('Content-Length', buff.length)
      res.end(buff)
    }, function (err) {
      res.statusCode = 500
      res.statusMessage = err.message
      res.end()
    })
  }

  bundle()

  return watcher

  function bundle (to) {
    build = postcssrc({
      from: from,
      map: process.env.NODE_ENV === 'development' ? 'inline' : false
    }).then(function (config) {
      var processor = postcss(config.plugins.concat(watcher.plugin()))
      var opts = Object.assign({ from: from, to: to }, config.options)

      return readFile(from, 'utf8').then(function (src) {
        return processor.process(src, opts).then(function (result) {
          var css = result.css

          if (process.env.NODE_ENV === 'development') {
            css += '\n' + inlineSourceMapComment(result.map)
          } else {
            css = ':root { visibility: visible; }\n' + css
          }

          var buff = Buffer.from(css)
          watcher.emit('update', buff)
          return buff
        })
      })
    }).catch(function (err) {
      watcher.emit('error', err)
    })
  }
}
