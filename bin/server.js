const path = require('path')
const Prismic = require('prismic-javascript')
const { asText } = require('prismic-richtext')
const { friendlyUrl } = require('../lib/components/base')
const Server = require('./http')

const ENDPOINT = 'https://quantifiedplanet.cdn.prismic.io/api/v2'

const server = new Server(path.resolve('index.js'), {
  css: path.resolve('lib/index.css')
})

server.on('build', function (route, callback) {
  switch (route) {
    case '/:page': {
      Prismic.api(ENDPOINT).then(function (api) {
        api.query(
          Prismic.Predicates.at('document.type', 'page')
        ).then(function (response) {
          callback(null, response.results.map(doc => `/${doc.uid}`))
        }).catch(callback)
      })
      break
    }
    case '/:page/:section': {
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
      break
    }
    default: callback(null)
  }
})

// server.start()
server.build('dist', function () {
  console.log('DONE!')
})
