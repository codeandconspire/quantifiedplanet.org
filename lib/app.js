const Choo = require('choo')
const nanotiming = require('nanotiming')
const Nanocache = require('@choojs/nanocache')

module.exports = class Core extends Choo {
  constructor (opts) {
    super(opts)

    /**
     * Preemptive implementation of Choo component
     * @see https://github.com/choojs/choo/pull/606
     */

    this.cache = new Nanocache(this.state, this.emit)
    this.render = this.cache.render.bind(this.cache)

    const toString = this.toString
    this.toString = (href, state) => {
      this.cache.prune()
      return toString.call(this, href, state)
    }

    const prune = this.cache.prune.bind(this.cache)
    this.emitter.on(this.state.events.RENDER, function () {
      window.requestAnimationFrame(prune)
    })
  }

  _prerender (state) {
    const routeTiming = nanotiming("choo.prerender('" + state.route + "')")
    let res
    if (state._handler.id) {
      res = this.cache.render(state._handler, state, this.emit, this.render)
    } else {
      res = state._handler(state, this.emit, this.render)
    }
    routeTiming()
    return res
  }
}
