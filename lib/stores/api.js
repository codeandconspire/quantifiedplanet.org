const Prismic = require('prismic-javascript')

const ENDPOINT = 'https://quantifiedplanet.cdn.prismic.io/api/v2'

module.exports = api

function api (state, emitter) {
  emitter.on('DOMContentLoaded', function () {
    Prismic.api(ENDPOINT).then(function (api) {
      emitter.emit('api:ready', api)
    })
  })
}
