var crypto = require('crypto')
var assert = require('assert')
var yoyoify = require('yo-yoify')
var babelify = require('babelify')
var browserify = require('browserify')
var localenvify = require('localenvify')

var watchify = require('watchify-middleware')

module.exports = scripts

function scripts (entry) {
  assert(typeof entry === 'string', 'stack: script entry path must be a string')

  var bundle = browserify(entry, {
    debug: process.env.NODE_ENV === 'development'
  })

  bundle.transform(localenvify)

  if (process.env.NODE_ENV === 'development') {
    bundle.require('source-map-support/register')
  } else {
    bundle.transform(yoyoify)
    bundle.transform(babelify, {
      presets: [
        ['@babel/preset-env', {
          targets: {
            browsers: [
              'last 2 Chrome versions',
              'last 2 Firefox versions',
              'last 2 Safari versions',
              'last 2 Edge versions',
              '> 1%'
            ]
          }
        }]
      ]
    })
  }

  var bundler = watchify.emitter(bundle)
  bundler.on('update', function (buff) {
    bundler.hash = crypto.createHash('sha256').update(buff).digest('hex')
  })

  return bundler
}
