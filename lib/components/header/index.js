const css = require('sheetify')
const html = require('choo/html')
const Component = require('nanocomponent')
const { asText } = require('prismic-richtext')
const { text } = require('../base')
css('./index.css')

const LINKS = [
  'Wl9yoikAAEwiz1fh'
]

module.exports = class Header extends Component {
  constructor (id, state, emit) {
    super(id)
    this.state = state
    this.emit = emit
  }

  static id () {
    return 'header'
  }

  update () {
    const docs = LINKS.map(id => this.state.pages.find(page => page.id === id))
    if (this.isLoading && docs.filter(Boolean).length === LINKS.length) {
      this.isLoading = false
      return true
    }
    return false
  }

  createElement () {
    const pages = this.state.pages
    const docs = LINKS.map(id => pages.find(page => page.id === id))

    if (docs.filter(Boolean).length !== LINKS.length) {
      const missing = LINKS.filter(id => !pages.find(page => page.id === id))
      if (!this.isLoading) this.emit('pages:fetch', { id: missing })
      this.isLoading = true
      return html`
        <header class="Header">
          <nav>
            ${text`Loading`}
          </nav>
        </header>
      `
    }

    return html`
      <header class="Header">
        <nav>
          <a href="/">Quantified Planet</a>
          <ul class="Header-nav">
            ${docs.map(doc => html`
              <li class="Header-page">
                <a href="/${doc.uid}">${asText(doc.data.title)}</a>
              </li>
            `)}
          </ul>
        </nav>
      </header>
    `
  }
}
