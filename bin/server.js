const path = require('path')
const http = require('http')
const seveStatic = require('serve-static')
const Prismic = require('prismic-javascript')
const Stack = require('./http')

const ENDPOINT = 'https://quantifiedplanet.cdn.prismic.io/api/v2'

var stack = new Stack(path.resolve('index.js'), {
  css: path.resolve('lib/index.css')
})

stack.use('/manifest.json', prismic, async function (req, res, state) {
  state.pages.push(await req.prismic.getSingle('homepage'))
})

stack.use('/', prismic, async function (req, res, state) {
  state.pages.push(await req.prismic.getSingle('homepage'))
})

stack.use('/:page', prismic, async function (req, res, state) {
  state.pages.push(await req.prismic.getByUID('page', state.params.page))
})

stack.use('/:page/:section', prismic, async function (req, res, state) {
  state.pages.push(await req.prismic.getByUID('page', state.params.page))
})

stack.use(async function (req, res, state) {
  await req.prismic.query(
    Prismic.Predicates.at('document.type', 'page')
  ).then(function (response) {
    state.pages.push(...response.results)
  })
})

async function prismic (req, res, next) {
  req.prismic = await Prismic.api(ENDPOINT)
}

const serve = seveStatic(path.resolve('lib/assets'))
const server = http.createServer(function (req, res) {
  serve(req, res, function () {
    stack.middleware(req, res, function () {
      res.statusCode = 404
      res.end()
    })
  })
})

server.listen(process.env.PORT, function () {
  console.info(`> Server listening @ http://localhost:${process.env.PORT}`)
})
