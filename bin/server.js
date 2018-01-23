const path = require('path')
const http = require('http')
const seveStatic = require('serve-static')
const Prismic = require('prismic-javascript')
const { asText } = require('prismic-richtext')
const { friendlyUrl } = require('../lib/components/base')
const Stack = require('./http')

const ENDPOINT = 'https://quantifiedplanet.cdn.prismic.io/api/v2'

var stack = new Stack(path.resolve('index.js'), {
  css: path.resolve('lib/index.css')
})

stack.use('/manifest.json', prismic, async function (req, res, state) {
  state.pages.push(await req.prismic.getSingle('website'))
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
  const website = await req.prismic.getSingle('website')
  const ids = website.data.menu.map(item => item.link.id)
  const docs = await req.prismic.getByIDs(ids).then(response => response.results)

  state.meta = Object.assign(state.meta, {
    contact: website.data.contact,
    partners: website.data.partners,
    social: [
      'medium',
      'facebook',
      'twitter',
      'instagram',
      'linkedin'
    ].map(type => ({ link: website.data[type], type: type })),
    menu: docs.map(doc => ({
      label: website.data.menu.find(item => item.link.id === doc.id).label,
      params: { page: doc.uid },
      sections: doc.data.body
        .filter(slice => slice.slice_type === 'heading')
        .map(slice => {
          const label = asText(slice.primary.heading).trim()
          return {
            label: label,
            params: {
              page: doc.uid,
              section: friendlyUrl(label)
            }
          }
        })
    }))
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
