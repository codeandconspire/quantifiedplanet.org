const assert = require('assert')
const Prismic = require('prismic-javascript')
const { asText } = require('prismic-richtext')
const { friendlyUrl } = require('../components/base')

const PRISMIC_ENDPOINT = 'https://quantifiedplanet.cdn.prismic.io/api/v2'

module.exports = meta

function meta (root) {
  assert(typeof root === 'string', 'meta root should be a string')
  root = root.replace(/\/?$/, '')

  return function (state, emitter) {
    state.meta = state.prefetch ? {'og:url': root} : state.meta

    if (state.prefetch) {
      state.prefetch.push(
        Prismic.api(PRISMIC_ENDPOINT, {req: state.req}).then(function (api) {
          return api.getSingle('website').then(function (website) {
            const ids = website.data.menu.map(item => item.link.id)

            // fetch linked pages in menu
            return api.getByIDs(ids).then(function (response) {
              Object.assign(state.meta, {
                contact: website.data.contact,
                partners: website.data.partners,

                // expose social links -> [{link, type}]
                social: [
                  'medium', 'facebook', 'twitter', 'instagram', 'linkedin'
                ].map(type => ({ link: website.data[type], type: type })),

                // build menu tree -> [{label, params, sections: [{label, params}]}]
                menu: response.results.map(doc => ({
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
          })
        })
      )
    }

    emitter.on('meta', function (next) {
      if (next.title !== state.title) emitter.emit('DOMTitleChange', next.title)
      Object.assign(state.meta, next)

      if (typeof window === 'undefined') return

      var url = root + state.href
      var tags = Object.assign({'og:url': url}, next)
      if (next.title && !next['og:title']) tags['og:title'] = next.title

      Object.keys(tags).forEach(key => {
        var el = document.head.querySelector(`meta[property="${key}"]`)
        if (el) el.setAttribute('content', tags[key].replace(/^\//, root + '/'))
      })
    })
  }
}
