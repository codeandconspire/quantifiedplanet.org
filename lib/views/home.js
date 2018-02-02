const html = require('choo/html')
const Story = require('../components/story')
const Prismic = require('prismic-javascript')
const View = require('../components/view')
const { text } = require('../components/base')

const ENDPOINT = 'https://quantifiedplanet.cdn.prismic.io/api/v2'

module.exports = class Home extends View {
  constructor (id) {
    super(id, 'homepage')
    this.isLoading = false
  }

  static id () {
    return 'homepage'
  }

  static getInitialState (ctx, done) {
    super.getInitialState(ctx, function (err, state) {
      if (err) return done(err)
      state.routeName = 'homepage'
      Prismic.api(ENDPOINT).then(function (api) {
        return api.getSingle('homepage', {ref: state.ref}).then(function (doc) {
          done(null, Object.assign({ pages: [doc] }, state))
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
          ${text`LOADING_SHORT`}
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
