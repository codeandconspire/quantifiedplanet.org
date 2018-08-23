const { text } = require('../components/base')

const DATA_ENDPOINT = 'https://foobar.quantifiedplanet.org/api'
const DATA_PUBLIC_KEY = '59dfa2d0-7e84-4158-801f-6bc4c72ce77e'

module.exports = api

function api (state, emitter) {
  state.data = {
    error: null,
    cities: null,
    location: null,
    isLoading: false
  }

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
    window.fetch('/geoip').then(function (response) {
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
