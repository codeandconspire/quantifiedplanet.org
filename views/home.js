const html = require('choo/html')
const { asText } = require('prismic-richtext')
const View = require('../components/view')
const Story = require('../components/story')
const { text } = require('../components/base')

module.exports = class Home extends View {
  constructor (id) {
    super(id, 'homepage')
    this.isLoading = false
  }

  static id () {
    return 'homepage'
  }

  meta (state) {
    const doc = state.pages.find(page => page.type === 'homepage')
    if (!doc) return {title: text`LOADING_SHORT`}
    return {
      title: 'Quantified Planet',
      description: asText(doc.data.description).trim(),
      'og:image': '/share.png'
    }
  }

  update (state) {
    const doc = state.pages.find(page => page.type === 'homepage')
    this.isLoading = !doc
    return !this.isLoading
  }

  createElement (state, emit) {
    const doc = state.pages.find(page => page.type === 'homepage')

    if (!doc) {
      if (!this.isLoading) emit('pages:fetch', { type: 'homepage' })
      this.isLoading = true
      return html`
        <main class="View-main" id="main-view">
          <div class="View-loading">${text`LOADING_SHORT`}</div>
        </main>
      `
    }

    return html`
      <main class="View-main" id="main-view">
        ${state.cache(Story, Story.id(doc)).render(doc)}
      </main>
    `
  }
}
