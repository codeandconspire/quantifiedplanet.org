const html = require('choo/html')
const Prismic = require('prismic-javascript')
const { asText } = require('prismic-richtext')
const View = require('../components/view')
const Story = require('../components/story')
const { text } = require('../components/base')

const PRISMIC_ENDPOINT = 'https://quantifiedplanet.cdn.prismic.io/api/v2'

module.exports = class Home extends View {
  constructor (id) {
    super(id, 'homepage')
    this.isLoading = false
  }

  static id () {
    return 'homepage'
  }

  static create (route) {
    class Instance extends Home {}
    Object.defineProperty(Instance, 'route', {
      get () { return route }
    })
    return Instance
  }

  static getInitialState (ctx, done) {
    super.getInitialState(ctx, function (err, state) {
      if (err) return done(err)
      state.routeName = 'homepage'
      Prismic.api(PRISMIC_ENDPOINT).then(function (api) {
        return api.getSingle('homepage', {ref: state.ref}).then(function (doc) {
          done(null, Object.assign({}, state, {
            pages: [doc],
            meta: Object.assign({}, state.meta, {
              url: process.env.WEBSITE_URL.replace(/\/$/, ''),
              description: asText(doc.data.description).trim()
            })
          }))
        })
      }).catch(done)
    })
  }

  getTitle () {
    return 'Quantified Planet'
  }

  update (state) {
    const doc = state.pages.find(page => page.type === 'homepage')
    this.isLoading = !doc
    return !this.isLoading
  }

  createElement (state, emit, render) {
    const doc = state.pages.find(page => page.type === 'homepage')

    if (!doc) {
      if (!this.isLoading) emit('pages:fetch', { type: 'homepage' })
      this.isLoading = true
      return html`
        <main class="View-main">
          <div class="View-loading">${text`LOADING_SHORT`}</div>
        </main>
      `
    }

    return html`
      <main class="View-main">
        <article>
          ${render(Story, doc)}
        </article>
      </main>
    `
  }
}
