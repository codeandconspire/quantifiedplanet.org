const Choo = require('choo')
const Nanocache = require('nanocache')

module.exports = class Core extends Choo {
  constructor (opts) {
    super(opts)

    /**
     * Preemptive implementaion of Choo component
     * @see https://github.com/choojs/choo/pull/606
     */

    const cache = new Nanocache(this.state, this.emitter.emit.bind(this.emitter))

    const prune = cache.prune.bind(cache)
    const render = cache.render.bind(cache)
    const setRoute = this.route.bind(this)

    this.route = function (route, handler) {
      setRoute(route, function (state, emit) {
        let res
        if (handler.id) {
          res = cache.render(handler, state, emit, render)
        } else {
          res = handler(state, emit, render)
        }
        return res
      })
    }

    this.emitter.on(this.state.events.RENDER, function () {
      window.requestAnimationFrame(prune)
    })
  }
}
