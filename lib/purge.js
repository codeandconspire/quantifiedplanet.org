var cccpurge = require('cccpurge')
var {asText} = require('prismic-richtext')
var Prismic = require('prismic-javascript')
var {friendlyUrl} = require('../components/base')

var PRISMIC_ENDPOINT = 'https://quantifiedplanet.cdn.prismic.io/api/v2'

module.exports = purge

function purge (urls, callback) {
  callback = typeof urls === 'function' ? urls : callback
  urls = Array.isArray(urls) ? urls : []

  cccpurge(require('../index'), {
    urls: urls,
    resolve: resolve,
    root: 'https://www.quantifiedplanet.org',
    zone: process.env.CLOUDFLARE_QUANTIFIEDPLANET_ZONE,
    email: process.env.CLOUDFLARE_CODEANDCONSPIRE_EMAIL,
    key: process.env.CLOUDFLARE_CODEANDCONSPIRE_KEY
  }, callback)
}

function resolve (route, done) {
  if (!/^\/:page/.test(route)) return done(null)
  Prismic.api(PRISMIC_ENDPOINT).then(function (api) {
    return api.query(
      Prismic.Predicates.at('document.type', 'page')
    ).then(function (response) {
      if (route === '/:page') {
        // resolve page "root" url
        done(null, response.results.map((doc) => `/${doc.uid}`))
      } else if (route === '/:page/:section') {
        // resolve page sub-routes for headings
        var pages = response.results.map(function (doc) {
          return doc.data.body.reduce(function (routes, slice) {
            if (slice.slice_type !== 'heading') return routes
            var id = friendlyUrl(asText(slice.primary.heading))
            return routes.concat(`/${doc.uid}/${id}`)
          }, [])
        })
        done(null, pages.reduce(function (flat, sections) {
          return flat.concat(sections)
        }, []))
      } else {
        done(new Error('route not recognized'))
      }
    })
  }).catch(done)
}
