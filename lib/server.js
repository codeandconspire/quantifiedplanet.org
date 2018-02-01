const http = require('http')
const dedent = require('dedent')
const nanoquery = require('nanoquery')
const serveStatic = require('serve-static')
const Prismic = require('prismic-javascript')
const { resolveLink } = require('./components/base')
const app = require('../')

const IS_PRODUCTION = process.env.NODE_ENV !== 'production'
const ENDPOINT = 'https://quantifiedplanet.cdn.prismic.io/api/v2'

const serve = serveStatic('lib/assets')
const server = http.createServer(function (req, res) {
  const query = nanoquery(req.url)

  if (query.token) {
    Prismic.api(ENDPOINT).then(function (api) {
      api.previewSession(query.token, resolveLink, '/', function (err, href) {
        if (err) {
          res.statusCode = 500
        } else {
          res.writeHead(302, {
            'Location': href,
            'Set-Cookie': [
              `${Prismic.previewCookie}=${query.token}`,
              `Max-Age=${60 * 30 * 1000}`,
              'Path=/'
            ].join('; ')
          })
        }

        res.end()
      })
    })
  } else if (IS_PRODUCTION && req.url === '/robots.txt') {
    res.write(dedent`
      User-agent: *
      Disallow: /
    `)
    res.end()
  } else {
    serve(req, res, function () {
      app.middleware(req, res, function () {
        res.statusCode = 404
        res.end()
      })
    })
  }
})

server.listen(process.env.PORT, function () {
  console.log(`> Server listening at localhost:${process.env.PORT}`)
})
