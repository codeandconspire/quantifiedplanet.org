if (!process.env.NOW) {
  require('dotenv-extended').load({
    errorOnMissing: process.env.NODE_ENV !== 'production'
  })
}

const jalla = require('jalla')
const dedent = require('dedent')
const body = require('koa-body')
const route = require('koa-route')
const compose = require('koa-compose')
const Prismic = require('prismic-javascript')
const purge = require('./lib/purge')
const { resolveLink } = require('./components/base')

const PRISMIC_ENDPOINT = 'https://quantifiedplanet.cdn.prismic.io/api/v2'

const app = jalla('index.js', {sw: 'service-worker.js'})

app.use(route.get('/robots.txt', function (ctx, next) {
  if (ctx.host === 'www.quantifiedplanet.org') return next()
  ctx.type = 'text/plain'
  ctx.body = dedent`
    User-agent: *
    Disallow: /
  `
}))

app.use(function (ctx, next) {
  if (!ctx.accepts('html')) return next()
  if (ctx.cookies.get(Prismic.previewCookie)) {
    ctx.set('Cache-Control', 'max-age=0')
  } else if (process.env.NODE_ENV !== 'development') {
    ctx.set('Cache-Control', `s-maxage=${60 * 60 * 24 * 7}, max-age=${60 * 10}`)
  }
  return next()
})

app.use(route.get('/prismic-preview', async function (ctx) {
  var token = ctx.query.token
  var api = await Prismic.api(PRISMIC_ENDPOINT, {req: ctx.req})
  var url = await api.previewSession(token, resolveLink, '/')
  ctx.cookies.set(Prismic.previewCookie, token, {
    expires: new Date(Date.now() + (1000 * 60 * 30)),
    path: '/'
  })
  ctx.redirect(url)
}))

app.use(route.post('/prismic-hook', compose([body(), async function (ctx) {
  var secret = ctx.request.body && ctx.request.body.secret
  ctx.assert(secret === process.env.PRISMIC_QUANTIFIEDPLANET_SECRET, 403, 'Secret mismatch')
  return new Promise(function (resolve, reject) {
    purge(function (err, response) {
      if (err) return reject(err)
      resolve()
    })
  })
}])))

if (process.env.NOW && process.env.NODE_ENV === 'production') {
  purge(function (err) {
    if (err) throw err
    start()
  })
} else {
  start()
}

function start () {
  app.listen(process.env.PORT || 8080)
}
