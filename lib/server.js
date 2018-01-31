const http = require('http')
const nanoquery = require('nanoquery')
const serveStatic = require('serve-static')
const Prismic = require('prismic-javascript')
const { resolveLink } = require('./components/base')
const app = require('../')

const ENDPOINT = 'https://quantifiedplanet.cdn.prismic.io/api/v2'

const serve = serveStatic('lib/assets')
const server = http.createServer(function (req, res) {
  const query = nanoquery(req.url)

  if (query.token) {
    Prismic.api(ENDPOINT).then(function (api) {
      api.previewSession(query.token, resolveLink, '/', function (err, redirectUrl) {
        if (err) {
          res.statusCode = 500
        } else {
          res.writeHead(302, {
            'Location': redirectUrl,
            'Set-Cookie': [
              `${Prismic.PreviewCookie}=${query.token}`,
              `Max-Age=${60 * 30 * 1000}`,
              'Path=/'
            ].join('; ')
          })
        }

        res.end()
      })
    })
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
