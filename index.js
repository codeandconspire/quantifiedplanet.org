const path = require('path')
const Prismic = require('prismic-javascript')
const { asText } = require('prismic-richtext')
const { friendlyUrl } = require('./lib/components/base')
const Stack = require('./bin')

const ENDPOINT = 'https://quantifiedplanet.cdn.prismic.io/api/v2'

const stack = new Stack(path.resolve(__dirname, 'lib/index.js'), {
  css: path.resolve(__dirname, 'lib/index.css')
})

stack.resolve('/:page', function (callback) {
  Prismic.api(ENDPOINT).then(function (api) {
    api.query(
      Prismic.Predicates.at('document.type', 'page')
    ).then(function (response) {
      callback(null, response.results.map(doc => `/${doc.uid}`))
    }).catch(callback)
  })
})

stack.resolve('/:page/:section', function (callback) {
  Prismic.api(ENDPOINT).then(function (api) {
    api.query(
      Prismic.Predicates.at('document.type', 'page')
    ).then(function (response) {
      callback(null, response.results.reduce(function (routes, doc) {
        const headings = doc.data.body.filter(slice => slice.slice_type === 'heading')
        return routes.concat(headings.map(slice => {
          const text = asText(slice.primary.heading).trim()
          return `/${doc.uid}/${friendlyUrl(text)}`
        }))
      }, []))
    }).catch(callback)
  })
})

module.exports = stack
