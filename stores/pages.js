const Prismic = require('prismic-javascript')
const { error } = require('../components/base')

const PRISMIC_ENDPOINT = 'https://quantifiedplanet.cdn.prismic.io/api/v2'

module.exports = pages

function pages (state, emitter) {
  state.pages = state.prefetch ? [] : [...state.pages]

  let endpoint
  let queries = 0
  const queue = []
  emitter.on('DOMContentLoaded', function () {
    Prismic.api(PRISMIC_ENDPOINT).then(function (api) {
      endpoint = api
      if (queue.length) {
        Promise.all(queue.map(args => query(...args))).then(
          () => emitter.emit('render'),
          err => emitter.emit('error', err)
        )
      }
    })
  })

  emitter.on('pages:fetch', function (data, opts) {
    if (state.prefetch) {
      state.prefetch.push(
        Prismic.api(PRISMIC_ENDPOINT, {req: state.req}).then(function (endpoint) {
          return query(data, opts, endpoint).catch(function (err) {
            emitter.emit('error', err)
            throw err
          })
        })
      )
      return
    }

    if (!endpoint) return queue.push([data, opts])

    query(data, opts).then(
      () => emitter.emit('render'),
      err => emitter.emit('error', err)
    )
  })

  function query (data, opts = {}, api = endpoint) {
    const predicates = []
    if (state.ref) opts.ref = state.ref

    if (data.type) {
      predicates.push(Prismic.Predicates.at('document.type', data.type))
    } else if (data.uid) {
      const method = Array.isArray(data.uid) ? 'in' : 'at'
      predicates.push(Prismic.Predicates[method]('my.page.uid', data.uid))
    } else if (data.id) {
      const method = Array.isArray(data.id) ? 'in' : 'at'
      predicates.push(Prismic.Predicates[method]('document.id', data.id))
    } else {
      predicates.push(Prismic.Predicates.at('document.type', 'page'))
    }

    queries += 1
    state.isLoading = true
    return api.query(predicates, opts).then(function (response) {
      queries -= 1
      if (queries === 0) state.isLoading = false
      if (!response.results_size) throw error(404, 'Not found')
      state.pages.push(...response.results)
    }).catch(function (err) {
      state.isLoading = false
      throw err
    })
  }
}
