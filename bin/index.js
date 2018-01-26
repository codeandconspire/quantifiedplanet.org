var fs = require('fs')
var path = require('path')
var assert = require('assert')
var dotenv = require('dotenv')
var mkdirp = require('mkdirp')
var fresh = require('fresh-require')
var styles = require('./lib/styles')
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
  this.app = fresh(entry, require)

  this._isBuilding = false
  this.main = scripts(entry)
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

    function next (file, data) {
      queue -= 1
      if (queue === 0) done(null)
    }
  }

  function write (file, buff, callback) {
    file = path.resolve(dir, file.replace(/^\//, ''))
    mkdirp(path.dirname(file), function (err) {
      if (err) return self.emit('error', err)
      fs.writeFile(file, buff, function (err) {
        if (err) return self.emit('error', err)
        self.emit('log', `write file: ${file}`)
        if (callback) callback()
      })
    })
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
