var crypto = require('crypto')
var assert = require('assert')
var envify = require('envify')
var tinyify = require('tinyify')
var yoyoify = require('yo-yoify')
var babelify = require('babelify')
var browserify = require('browserify')

var watchify = require('watchify-middleware')

module.exports = scripts

function scripts (entry) {
  assert(typeof entry === 'string', 'stack: script entry path should be a string')

  var bundle = browserify(entry, {
    fullPaths: true,
    debug: process.env.NODE_ENV === 'development'
  })

  if (process.env.NODE_ENV === 'development') {
    bundle.require('source-map-support/register')
    bundle.transform(envify)
  } else {
    bundle.transform(yoyoify)
    bundle.transform(babelify, { presets: ['env'] })
    bundle.plugin(tinyify)
  }

  var bundler = watchify.emitter(bundle)
  bundler.on('update', function (buff) {
    bundler.hash = crypto.createHash('sha512').update(buff).digest('buffer')
  })

  return bundler
}
