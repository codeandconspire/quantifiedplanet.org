const Prismic = require('prismic-javascript')
const { text } = require('../components/base')

const DATA_ENDPOINT = 'https://foobar.quantifiedplanet.org/api'
const DATA_PUBLIC_KEY = '59dfa2d0-7e84-4158-801f-6bc4c72ce77e'
const PRISMIC_ENDPOINT = 'https://quantifiedplanet.cdn.prismic.io/api/v2'

module.exports = api

function api (state, emitter) {
  state.data = {
    error: null,
    cities: null,
    location: null,
    isLoading: false
  }

  emitter.on('DOMContentLoaded', function () {
    Prismic.api(PRISMIC_ENDPOINT).then(function (api) {
      emitter.emit('api:ready', api)
    })
  })

  emitter.on('cities:fetch', function () {
    const url = `${DATA_ENDPOINT}?target=getCities&apitoken=${DATA_PUBLIC_KEY}`

    state.data.isLoading = true
    window.fetch(url).then(function (response) {
      return response.json().then(function (data) {
        if (response.status !== 200 || data.status !== 'SUCCESS') {
          throw new Error((data && data.error) || text`Could not reach the API`)
        }
        state.data.isLoading = false
        state.data.cities = data.payload
        emitter.emit('render')
      })
    }).catch(function (err) {
      state.data.isLoading = false
      state.data.error = err.message
      emitter.emit('render')
    })
  })

  emitter.on('location:fetch', function () {
    state.data.isLoading = true
    window.fetch('https://freegeoip.net/json').catch(function () {
      return window.fetch('//api.ipify.org?format=json')
        .then(body => body.json())
        .then(resp => window.fetch(`//freegeoip.net/json/${resp.ip}`))
    }).then(function (response) {
      return response.json().then(data => {
        state.data.isLoading = false
        state.data.location = data
        emitter.emit('render')
      })
    }).catch(err => {
      state.data.error = err.message
      state.data.isLoading = false
      state.data.location = null
      emitter.emit('render')
    })
  })
}
