var assert = require('assert')
var dotenv = require('dotenv')
var fresh = require('fresh-require')
var styles = require('./lib/styles')
var scripts = require('./lib/scripts')
var document = require('./lib/document')

module.exports = Stack

function Stack (entry, opts) {
  if (!(this instanceof Stack)) return new Stack(entry, opts)
  opts = this.opts = opts || {}

  if (opts.env !== false) dotenv.config({ env: opts.env })

  var self = this
  this.app = fresh(entry, require)

  var initialState = JSON.stringify(this.app.state)
  this.getInitialState = function () {
    return Object.assign({meta: {}}, JSON.parse(initialState))
  }

  this._isBuilding = false
  this.main = scripts(entry)
  this.main.on('pending', function () {
    self._isBuilding = true
    self.app = fresh(entry, require)
    initialState = JSON.stringify(self.app.state)
  })
  this.main.on('update', function () {
    self._isBuilding = false
  })

  if (opts.sw) this.sw = scripts(opts.sw)
  if (opts.css) this.styles = styles(opts.css)
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
