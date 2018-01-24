var fs = require('fs')
var path = require('path')
var http = require('http')
var assert = require('assert')
var wayfarer = require('wayfarer')
var serveStatic = require('serve-static')
var Stack = require('./')

var STATIC = ['assets', 'public', 'content']
var ASSET_REGEX = /^\/(\w+\/)?(bundle|sw|service-worker)\.(js|css)$/

module.exports = Server

function Server (entry, opts) {
  Stack.call(this, entry, opts)
  this.router = wayfarer()
}

Server.prototype = Object.create(Stack.prototype)
Server.prototype.constructor = Server

Server.prototype.start = function (port, callback) {
  callback = callback || function () {}
  port = port || process.env.PORT || 8080

  assert(!isNaN(+port), 'stack: port cannot be not a number 🤪')
  assert(typeof callback === 'function', 'stack: callback must be a function')

  var self = this
  var dirs = []
  var queue = STATIC.length - 1
  for (var i = 0, len = STATIC.length; i < len; i++) {
    lookup(path.resolve(path.dirname(this.opts.entry), STATIC[i]))
  }

  function lookup (dir) {
    fs.lstat(dir, function (err, stats) {
      if (!err && stats.isDirectory()) dirs.push(dir)
      if (queue-- === 0) start()
    })
  }

  function start () {
    var serve = dirs.reduceRight(function (prev, dir) {
      var middleware = serveStatic(dir)
      return function (req, res, next) {
        prev(req, res, function () {
          middleware(req, res, next)
        })
      }
    }, function (req, res, next) {
      next(req, res)
    })

    var server = http.createServer(function (req, res) {
      serve(req, res, function () {
        self.middleware(req, res, function () {
          res.statusCode = 404
          res.end()
        })
      })
    })

    server.listen(port, function () {
      console.info(`> Server listening @ http://localhost:${port}`)
      callback()
    })
  }
}

Server.prototype.middleware = function (req, res) {
  var self = this
  var asset = req.url.match(ASSET_REGEX)

  if (asset) {
    if (asset[1] && process.env.NODE_ENV === 'development') {
      return end(400, 'stack: hashed assets not available during development')
    }

    if (asset[2] === 'bundle') {
      if (asset[3] === 'js') return this.main.middleware(req, res)
      if (asset[3] === 'css') {
        if (!this.styles) return end(400, 'stack: no css registered with stack')
        return this.styles.middleware(req, res)
      }
    } else if (asset[2] === 'sw' || asset[2] === 'service-worker') {
      if (!this.sw) return end(400, 'stack: no service worker registered with stack')
      return this.sw.middleware(req, res)
    }

    return end(400, 'stack: asset not recognized')
  }

  this.resolve(req.url, req, res).then(function (state) {
    switch (req.url) {
      case '/manifest.json': {
        self.manifest(state, function (err, data) {
          if (err) {
            self.emit('error', err)
            res.statusCode = 500
            return res.end()
          }
          res.setHeader('Content-Type', 'application/json')
          res.setHeader('Content-Length', data.length)
          res.end(data)
        })
        break
      }
      default: {
        self.document(req.url, state, function (err, data) {
          if (err) {
            self.emit('error', err)
            res.statusCode = 500
            return res.end()
          }
          if (process.env.NODE_ENV !== 'development') {
            var hex = this.main.hash.slice(0, 16)
            res.setHeader('Link', [
              `</${hex}/bundle.js>; rel=preload; as=script`,
              this.css ? `</${hex}/bundle.css>; rel=preload; as=style` : null
            ].filter(Boolean).join(', '))
          }
          res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate')
          res.setHeader('Content-Type', 'text/html')
          res.setHeader('Content-Length', data.length)
          res.end(data)
        })
      }
    }
  })

  function end (status, message) {
    res.statusCode = status
    res.statusMessage = message
    res.end()
  }
}
