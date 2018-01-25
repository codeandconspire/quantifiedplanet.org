var fs = require('fs')
var path = require('path')
var assert = require('assert')
var dotenv = require('dotenv')
var mkdirp = require('mkdirp')
var fresh = require('fresh-require')
var styles = require('./lib/styles')
var nanoquery = require('nanoquery')
var EventEmitter = require('events')
var getAllRoutes = require('wayfarer/get-all-routes')
var scripts = require('./lib/scripts')
var document = require('./lib/document')

module.exports = Stack

function Stack (entry, opts) {
  EventEmitter.call(this)

  opts = this.opts = Object.assign({ entry: entry }, opts)

  if (opts.env !== false) dotenv.config({ env: opts.env })

  var self = this
  this.catchall = []
  this.app = fresh(entry, require)

  var initialState = JSON.stringify(this.app.state)
  this.getInitialState = function () {
    return Object.assign({meta: {}}, JSON.parse(initialState))
  }

  this._isBuilding = false
  this.main = scripts(entry)
  this.main.on('pending', function () {
    self._isBuilding = true
    try {
      self.app = fresh(entry, require)
      initialState = JSON.stringify(self.app.state)
    } catch (err) {
      self.emit('error', err)
    }
  })
  this.main.on('update', function () {
    self._isBuilding = false
  })

  if (opts.sw) this.sw = scripts(opts.sw)
  if (opts.css) this.styles = styles(opts.css)

  this.on('log', function (data) {
    console.log(data)
  })
  this.on('error', function (data) {
    console.error(data)
  })
}

Stack.prototype = Object.create(EventEmitter.prototype)
Stack.prototype.constructor = Stack

Stack.prototype.use = function (route) {
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
    this.router.on(route, function (params, state, req, res) {
      state.route = route
      state.params = params
      return middlewares.reduce(function (prev, next) {
        return prev.then(function () {
          return next(state, req, res)
        })
      }, Promise.resolve())
    })
  }
}

Stack.prototype.resolve = function (url) {
  var self = this
  var state = this.getInitialState()

  var args = [state]
  for (var i = 1, len = arguments.length; i < len; i++) {
    args.push(arguments[i])
  }

  state.href = url.replace(/\?.+$/, '')
  state.query = nanoquery(url)

  return this.router.emit.apply(this.router, [url].concat(args)).catch().then(function () {
    return self.catchall.reduce(function (prev, next) {
      return prev.then(function () {
        return next.apply(this, args)
      })
    }, Promise.resolve())
  }).then(function () {
    return state
  })
}

Stack.prototype.build = function (dir, done) {
  var self = this

  this.main.once('update', function (buff) {
    write(path.join(self.main.hash.substr(0, 16), 'bundle.js'), buff, build)
  })
  self.main.bundle()

  function build () {
    var routes = Object.keys(getAllRoutes(self.app.router.router))
    var queue = routes.length

    if (self.styles) queue += 1
    if (self.sw) queue += 1

    routes.forEach(function (route, index) {
      var href = route.split(/:$/)[0] // remove wayfarer trailing wildcard

      self.emit('build', href, function (err, paths) {
        if (err) return self.emit('error', err)
        if (!paths) return
        assert(Array.isArray(paths), 'stack: paths must be an array')
        queue += paths.length
        paths.forEach(function (path) {
          self.resolve(path).then(function (state) {
            self.document(path, state, function (err, buff) {
              if (err) return self.emit('error', err)
              write(path.join(path, 'index.html'), buff, next)
            })
          })
        })
      })

      if (/\/:/.test(href)) {
        queue -= 1 // can't render unresolved routes
      } else {
        self.resolve(href).then(function (state) {
          self.document(href, state, function (err, buff) {
            if (err) return self.emit('error', err)
            write(path.join(href, 'index.html'), buff, next)
          })
        })
      }
    })

    if (self.styles) {
      self.styles.once('update', function (buff) {
        write(path.join(self.main.hash.substr(0, 16), 'bundle.css'), buff, next)
      })
      self.styles.bundle()
    }

    if (self.sw) {
      self.sw.once('update', function (buff) {
        write('service-worker.js', buff, next)
      })
      self.sw.bundle()
    }

    function next (file, data) {
      queue -= 1
      if (queue === 0) done(null)
    }
  }

  function write (file, buff, callback) {
    file = path.resolve(dir, file)
    mkdirp(path.dirname(file), function (err) {
      if (err) return self.emit('error', err)
      fs.writeFile(file, buff, function (err) {
        if (err) return self.emit('error', err)
        if (callback) callback()
      })
    })
  }
}

Stack.prototype.document = function (href, state, done) {
  assert(typeof href === 'string', 'stack: href must be a string')
  assert(typeof state === 'object', 'stack: state must be an object')
  assert(typeof done === 'function', 'stack: done must be a function')

  try {
    var body = this.app.toString(href, state)
    state = Object.assign({}, state, this.app.state)
    done(null, Buffer.from(document(state, body, this)))
  } catch (err) {
    done(err)
  }
}
