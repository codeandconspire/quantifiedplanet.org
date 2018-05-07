const html = require('choo/html')
const Prismic = require('prismic-javascript')
const { asText } = require('prismic-richtext')
const View = require('../components/view')
const Intro = require('../components/intro')
const Gallery = require('../components/gallery')
const { text } = require('../components/base')

const PRISMIC_ENDPOINT = 'https://quantifiedplanet.cdn.prismic.io/api/v2'

module.exports = class Explorer extends View {
  constructor (id, state, emit) {
    super(id, 'explorer')
    this.isLoading = false

    if (typeof window !== 'undefined') {
      emit('cities:fetch')
      emit('location:fetch')
    }

    if (this._hasWindow) {
      window.scrollTo(0, 0)
    }

    this.gallery = new Gallery(null, state, true)
  }

  static id () {
    return 'explorer'
  }

  static create (route) {
    class Instance extends Explorer {}
    Object.defineProperty(Instance, 'route', {
      get () { return route }
    })
    return Instance
  }

  static getInitialState (ctx, done) {
    super.getInitialState(ctx, function (err, state) {
      if (err) return done(err)
      state.routeName = 'explorer'
      Prismic.api(PRISMIC_ENDPOINT).then(function (api) {
        return api.getSingle('explorer', {ref: state.ref}).then(function (doc) {
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

  getTitle (state) {
    const doc = state.pages.find(page => page.type === 'explorer')
    if (!doc) return text`LOADING_SHORT`
    return asText(doc.data.title).trim()
  }

  update (state) {
    const doc = state.pages.find(page => page.type === 'explorer')
    this.isLoading = !doc
    return !this.isLoading
  }

  createElement (state, emit, render) {
    const doc = state.pages.find(page => page.type === 'explorer')

    if (!doc) {
      if (!this.isLoading) emit('pages:fetch', { type: 'explorer' })
      this.isLoading = true
      return html`
        <main class="View-main" id="main-view">
          <div class="View-loading">${text`LOADING_SHORT`}</div>
        </main>
      `
    }

    return html`
      <main class="View-main" id="main-view">
        <div class="View-container">
          <div class="View-switcheroo">
            <div class="View-intro">${render(Intro, doc)}</div>
          </div>
        </div>
        ${this.gallery.render(null, state, true)}
      </main>
    `
  }
}
