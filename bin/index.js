var fs = require('fs')
var zlib = require('zlib')
var path = require('path')
var http = require('http')
var ncp = require('ncp')
var assert = require('assert')
var dotenv = require('dotenv')
var mkdirp = require('mkdirp')
var fresh = require('fresh-require')
var styles = require('./lib/styles')
var EventEmitter = require('events')
var serveStatic = require('serve-static')
var getAllRoutes = require('wayfarer/get-all-routes')
var scripts = require('./lib/scripts')
var document = require('./lib/document')

var STATIC = ['assets', 'public', 'content']
var ASSET_REGEX = /^\/(\w+\/)?(bundle|service-worker)\.(js|css)$/

module.exports = Stack

function Stack (entry, opts) {
  EventEmitter.call(this)

  opts = this.opts = Object.assign({ entry: entry }, opts)

  if (opts.env !== false) dotenv.config({ env: opts.env })

  var self = this
  this.app = fresh(entry, require)

  this._isBuilding = false
  this.main = scripts(entry, opts)
  this.main.on('pending', function () {
    self._isBuilding = true
    try {
      self.app = fresh(entry, require)
    } catch (err) {
      self.emit('error', err)
    }
  })
  this.main.on('update', function () {
    self._isBuilding = false
  })

  if (opts.sw) this.sw = scripts(opts.sw, opts)
  if (opts.css) this.styles = styles(opts.css, opts)

  this.on('log', function (data) {
    console.log(data)
  })
  this.on('error', function (data) {
    console.error(data)
  })
}

Stack.prototype = Object.create(EventEmitter.prototype)
Stack.prototype.constructor = Stack

Stack.prototype.getInitialState = function (href, ctx, done) {
  if (typeof ctx === 'function') {
    done = ctx
    ctx = {}
  }

  try {
    // try and get handler for route
    var handler = this.app.router.match(href).cb

    // populate state with route params and whatnot
    var props = this.app._matchRoute(href)

    // pluck out route specific props form app state
    ctx.href = props.href
    ctx.query = props.query
    ctx.route = props.route
    ctx.params = props.params

    if (typeof handler.getInitialState === 'function') {
      handler.getInitialState(ctx, function (err, state) {
        if (err) return done(err)
        done(null, state)
      })
    } else {
      done(null, {})
    }
  } catch (err) {
    done(err)
  }
}

Stack.prototype.close = function () {
  this.main.close()
  if (this.styles) this.styles.close()
  if (this.sw) this.sw.close()
}

Stack.prototype.build = function (dir, done) {
  var self = this
  var hash = ''

  this.main.once('update', function (buff) {
    if (process.env.NODE_ENV !== 'development') {
      hash = self.main.hash.toString('hex').substr(0, 16)
    }
    write(path.join(hash, 'bundle.js'), buff, build)
  })
  self.main.bundle()

  function build () {
    var routes = Object.keys(getAllRoutes(self.app.router.router))
    var queue = routes.length

    if (self.styles) queue += 1
    if (self.sw) queue += 1

    routes.forEach(function (route, index) {
      var href = route.split(/:$/)[0] // remove wayfarer trailing wildcard

      self.emit('build', href, function (err, urls) {
        if (err) return self.emit('error', err)
        if (!urls) return

        assert(Array.isArray(urls), 'stack: urls should be an array')

        queue += urls.length
        urls.forEach(function (url) {
          self.getInitialState(url, function (err, state) {
            if (err) return self.emit('error', err)
            self.toString(url, state, function (err, buff) {
              if (err) return self.emit('error', err)
              write(path.join(url, 'index.html'), buff, next)
            })
          })
        })
      })

      if (/\/:/.test(href)) {
        queue -= 1 // can't render partials
      } else {
        self.getInitialState(href, function (err, state) {
          if (err) return self.emit('error', err)
          self.toString(href, state, function (err, buff) {
            if (err) return self.emit('error', err)
            write(path.join(href, 'index.html'), buff, next)
          })
        })
      }
    })

    if (self.styles) {
      self.styles.once('update', function (buff) {
        write(path.join(hash, 'bundle.css'), buff, next)
      })
      self.styles.bundle()
    }

    if (self.sw) {
      self.sw.once('update', function (buff) {
        write('service-worker.js', buff, next)
      })
      self.sw.bundle()
    }

    queue += STATIC.length
    STATIC.forEach(function (name) {
      var from = path.resolve(path.dirname(self.opts.entry), name)
      var to = path.resolve(dir)
      ncp(from, to, next)
    })

    function next () {
      queue -= 1
      if (queue === 0) done(null)
    }
  }

  function write (filename, buff, callback) {
    filename = path.resolve(dir, filename.replace(/^\//, ''))

    mkdirp(path.dirname(filename), function (err) {
      if (err) return self.emit('error', err)

      var ops = 2

      fs.writeFile(filename, buff, onwrite(filename))
      zlib.gzip(buff, function (err, compressed) {
        if (err) return self.emit('error', err)
        var outfile = filename + '.gz'
        fs.writeFile(outfile, compressed, onwrite(outfile))
      })

      function onwrite (filename) {
        return function (err) {
          if (err) return self.emit('error', err)
          self.emit('log', `write file: ${filename}`)
          ops -= 1
          if (ops === 0) callback()
        }
      }
    })
  }
}

Stack.prototype.start = function (port, callback) {
  callback = callback || function () {}
  port = port || process.env.PORT || 8080

  assert(!isNaN(+port), 'stack: port cannot be not a number 🤪')
  assert(typeof callback === 'function', 'stack: callback should be a function')

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

Stack.prototype.middleware = function (req, res, next) {
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
    } else if (asset[2] === 'service-worker') {
      if (!this.sw) return end(400, 'stack: no service worker registered with stack')
      return this.sw.middleware(req, res)
    }

    return end(400, 'stack: asset not recognized')
  }

  var ctx = { req: req, res: res }
  this.getInitialState(req.url, ctx, function (err, state) {
    if (err) {
      self.emit('error', err)
      return end(500, err.message)
    }

    self.toString(req.url, state, function (err, buff) {
      if (err) {
        self.emit('error', err)
        return end(500, err.message)
      }

      if (process.env.NODE_ENV !== 'development') {
        var hex = this.main.hash.toString('hex').slice(0, 16)
        res.setHeader('Link', [
          `</${hex}/bundle.js>; rel=preload; as=script`,
          this.css ? `</${hex}/bundle.css>; rel=preload; as=style` : null
        ].filter(Boolean).join(', '))
      }

      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate')
      res.setHeader('Content-Type', 'text/html')
      res.setHeader('Content-Length', buff.length)
      res.end(buff)
    })
  })

  function end (status, message) {
    if (typeof next === 'function') return next()
    res.statusCode = status
    res.statusMessage = message
    res.end()
  }
}

Stack.prototype.toString = function (href, state, done) {
  assert(typeof href === 'string', 'stack: href should be a string')
  assert(typeof state === 'object', 'stack: state should be an object')
  assert(typeof done === 'function', 'stack: done should be a function')

  try {
    var body = this.app.toString(href, state)
    state = Object.assign({}, state, this.app.state)
    done(null, Buffer.from(document(state, body, this)))
  } catch (err) {
    done(err)
  }
}
