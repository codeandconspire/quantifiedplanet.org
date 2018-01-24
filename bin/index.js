var assert = require('assert')
var dotenv = require('dotenv')
var fresh = require('fresh-require')
var styles = require('./lib/styles')
var nanoquery = require('nanoquery')
var EventEmitter = require('events')
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

Stack.prototype.document = function (href, state, done) {
  assert(typeof href === 'string', 'stack: href must be a string')
  assert(typeof state === 'object', 'stack: state must be an object')
  assert(typeof done === 'function', 'stack: done must be a function')

  try {
    var body = this.app.toString(href, state)
    state = Object.assign({}, state, this.app.state)
    done(null, document(state, body, this))
  } catch (err) {
    done(err)
  }
}

Stack.prototype.manifest = function (state, done) {
  try {
    done(null, Buffer.from(JSON.stringify({
      name: state.meta.site_name,
      short_name: state.meta.short_name || state.meta.site_name,
      start_url: '/',
      display: 'minimal-ui',
      background_color: state.meta.color || '#fff',
      theme_color: state.meta.color || '#fff'
    })))
  } catch (err) {
    done(err)
  }
}
