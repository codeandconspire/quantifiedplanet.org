const assert = require('assert')
const html = require('choo/html')
const Component = require('nanocomponent')
const Prismic = require('prismic-javascript')
const { asText } = require('prismic-richtext')
const error = require('../error')
const Footer = require('../footer')
const Header = require('../header')
const { friendlyUrl } = require('../base')

const ENDPOINT = 'https://quantifiedplanet.cdn.prismic.io/api/v2'

module.exports = class View extends Component {
  constructor (id, name) {
    super(id)
    assert(typeof this.getTitle === 'function', 'View: getTitle is required')
    const title = this.getTitle.bind(this)
    const createElement = this.createElement.bind(this)
    this.createElement = View.createView(name, createElement, title)
  }

  static getInitialState (ctx, done) {
    Prismic.api(ENDPOINT).then(function (api) {
      // fetch website meta info
      return api.getSingle('website').then(function (website) {
        const ids = website.data.menu.map(item => item.link.id)

        // fetch linked pages in menu
        return api.getByIDs(ids).then(function (response) {
          done(null, {
            meta: {
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
            }
          })
        })
      })
    }).catch(done)
  }

  // create view wrapper
  // (str, fn, fn) -> fn
  static createView (name, view, title) {
    return (state, emit, render) => {
      if (state.error) view = state => error(state.error)

      let children
      try {
        children = view(state, emit, render)
        if (typeof title === 'function') title = title(state)
      } catch (err) {
        err.status = err.status || 500
        children = error(err)
        title = error.title(err)
      }

      if (title !== state.title) emit('DOMTitleChange', title)
      if (name !== state.routeName) emit('routeNameChange', name)

      return html`
        <body class="View">
          <div class="View-full">
            ${render(Header)}
          </div>
          ${children}
          <div class="View-full">
            ${render(Footer, state.meta)}
          </div>
        </body>
      `
    }
  }
}
