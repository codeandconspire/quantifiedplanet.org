const path = require('path')
const Prismic = require('prismic-javascript')
const { asText } = require('prismic-richtext')
const { friendlyUrl } = require('../lib/components/base')
const Server = require('./http')

const ENDPOINT = 'https://quantifiedplanet.cdn.prismic.io/api/v2'

const server = new Server(path.resolve('index.js'), {
  css: path.resolve('lib/index.css')
})

server.use('/manifest.json', prismic, async function (state, req, res) {
  state.pages.push(await req.prismic.getSingle('website'))
})

server.use('/', prismic, async function (state, req, res) {
  state.routeName = 'homepage'
  state.pages.push(await req.prismic.getSingle('homepage'))
})

server.use('/:page', prismic, async function (state, req, res) {
  state.routeName = 'page'
  state.pages.push(await req.prismic.getByUID('page', state.params.page))
})

server.use('/:page/:section', prismic, async function (state, req, res) {
  state.routeName = 'page'
  state.pages.push(await req.prismic.getByUID('page', state.params.page))
})

server.use(async function (state, req, res) {
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

async function prismic (state, req, res) {
  req.prismic = await Prismic.api(ENDPOINT)
}

server.start()
