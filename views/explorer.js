const html = require('choo/html')
const { asText } = require('prismic-richtext')
const View = require('../components/view')
const Intro = require('../components/intro')
const Gallery = require('../components/gallery')
const { text } = require('../components/base')

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

  meta (state) {
    const doc = state.pages.find(page => page.type === 'explorer')
    if (!doc) return {title: text`LOADING_SHORT`}
    return {
      title: asText(doc.data.title).trim(),
      description: asText(doc.data.description).trim(),
      'og:image': '/share.png'
    }
  }

  update (state) {
    const doc = state.pages.find(page => page.type === 'explorer')
    this.isLoading = !doc
    return !this.isLoading
  }

  createElement (state, emit) {
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
            <div class="View-intro">
              ${state.cache(Intro, Intro.id(doc)).render(doc)}
            </div>
          </div>
        </div>
        ${this.gallery.render(null, state, true)}
      </main>
    `
  }
}
