if (!process.env.NOW) require('dotenv/config')

const jalla = require('jalla')
const dedent = require('dedent')
const route = require('koa-route')
const Prismic = require('prismic-javascript')
const { resolveLink } = require('./components/base')

const PRISMIC_ENDPOINT = 'https://quantifiedplanet.cdn.prismic.io/api/v2'

const app = jalla('index.js', {sw: 'service-worker.js'})

app.use(route.get('/robots.txt', function (ctx, next) {
  if (ctx.host === 'www.globalgoalslab.org') return next()
  ctx.type = 'text/plain'
  ctx.body = dedent`
    User-agent: *
    Disallow: /
  `
}))

app.use(function (ctx, next) {
  if (ctx.cookies.get(Prismic.previewCookie)) {
    ctx.set('Cache-Control', 'max-age=0')
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

app.listen(process.env.PORT || 8080)
