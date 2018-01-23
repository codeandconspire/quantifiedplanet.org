var http = require('http')
var assert = require('assert')
var wayfarer = require('wayfarer')
var nanoquery = require('nanoquery')
var Stack = require('./')

var ASSET_REGEX = /^\/(\w+\/)?(bundle|sw)\.(js|css)$/

module.exports = Server

function Server (entry, opts) {
  if (!(this instanceof Server)) return new Server(entry, opts)

  this.stack = new Stack(entry, opts)
  this.router = wayfarer()
  this.catchall = []
}

Server.prototype.listen = function (port) {
  var self = this
  var server = http.createServer(function (req, res) {
    self.middleware(req, res, function () {
      res.statusCode = 404
      res.end()
    })
  })

  server.listen = function (port) {
    server.listen(port, function () {
      console.info(`> Server listening @ http://localhost:${port}`)
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
      if (asset[3] === 'js') return this.stack.main.middleware(req, res)
      if (asset[3] === 'css') {
        if (!this.stack.styles) return end(400, 'stack: no css registered with stack')
        return this.stack.styles.middleware(req, res)
      }
    } else if (asset[2] === 'sw') {
      if (!this.stack.sw) return end(400, 'stack: no service worker registered with stack')
      return this.stack.sw.middleware(req, res)
    }

    return end(400, 'stack: asset not recognized')
  }

  var state = this.stack.getInitialState()
  this.route(req, res, state).catch().then(function () {
    switch (req.url) {
      case '/manifest.json': {
        self.stack.manifest(state, function (err, data) {
          if (err) {
            self.stack.emit('error', err)
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
        self.stack.document(req.url, state, function (err, data) {
          if (err) {
            self.stack.emit('error', err)
            res.statusCode = 500
            return res.end()
          }
          if (process.env.NODE_ENV !== 'development') {
            var hex = this.stack.main.hash.slice(0, 16)
            res.setHeader('Link', [
              `</${hex}/bundle.js>; rel=preload; as=script`,
              this.stack.css ? `</${hex}/bundle.css>; rel=preload; as=style` : null
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

Server.prototype.use = function (route) {
  var middlewares = []
  for (var i = 1, len = arguments.length; i < len; i++) {
    assert(typeof arguments[i] === 'function', 'stack: middleware must be a function')
    middlewares.push(arguments[i])
  }

  if (typeof route === 'function') {
    middlewares.unshift(route)
    this.catchall.push.apply(this.catchall, middlewares)
  } else {
    assert(typeof route === 'string', 'stack: route must be a string')
    this.router.on(route, function (params, req, res, state) {
      state.route = route
      state.params = params
      return middlewares.reduce(function (prev, next) {
        return prev.then(function () {
          return next(req, res, state)
        })
      }, Promise.resolve())
    })
  }
}

Server.prototype.route = function (req, res, state) {
  var self = this
  state.href = req.url.replace(/\?.+$/, '')
  state.query = nanoquery(req.url)
  return this.router.emit(req.url, req, res, state).catch().then(function () {
    return self.catchall.reduce(function (prev, next) {
      return prev.then(function () {
        return next(req, res, state)
      })
    }, Promise.resolve())
  })
}
