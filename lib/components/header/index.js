const css = require('sheetify')
const html = require('choo/html')
const Component = require('nanocomponent')
const { asText } = require('prismic-richtext')
const { text, resolveLink, resolveRoute, className } = require('../base')
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
        <nav class="Header-container">
          <a class="Header-home" href="${resolveRoute(this.state.routes.homepage)}">
            <svg class="Header-logo" width="31" height="54" viewBox="0 0 31 54" role="presentational">
              <path fill="#010119" d="M15.8 36.2v-5.4l3.8 3.7a9.6 9.6 0 0 1-3.8 1.7zM4.1 27c0-4.5 3.2-8.3 7.5-9.2v18.4A9.5 9.5 0 0 1 4.1 27zm19.2 0c0 1.5-.4 3-1 4.3l-6.5-6.4v-7c4.3.9 7.5 4.6 7.5 9.1zm4.1 15.2l3-3-5.1-5a13 13 0 0 0 2.1-7.2c0-6.7-5-12.3-11.6-13.3V0h-4.2v13.7C5 14.7 0 20.3 0 27c0 6.8 5 12.4 11.6 13.4V54h4.2V40.4c2.5-.4 4.8-1.4 6.7-3l4.9 4.8z"/>
            </svg>
            <svg class="Header-text" width="144" height="10" viewBox="0 0 144 10" role="presentational">
              <g fill="#010119" fill-rule="evenodd">
                <path d="M8.3 5c0-1.5-1.1-2.8-2.8-2.8A2.7 2.7 0 0 0 2.8 5c0 1.6 1.2 3 2.8 3l1.2-.3-1.5-1.3L6.6 5 8 6.3l.2-1.2zm1 4.9l-1-1a5 5 0 0 1-2.8.9A4.7 4.7 0 0 1 .7 5C.7 2.3 2.7.2 5.6.2c2.8 0 4.8 2.1 4.8 4.7 0 1-.3 2-.8 2.7l1 .8-1.3 1.4z"/>
                <path d="M16.4 9.8c-2.5 0-4-1.4-4-4.1V.4h2v5.2c0 1.5.8 2.3 2 2.3s2-.7 2-2.2V.4h2v5.2c0 2.8-1.6 4.2-4 4.2"/>
                <path d="M26 2.8l-1.2 3h2.4l-1.2-3zm2.8 6.8l-.9-2h-3.8l-.8 2h-2L25 .4h2l3.9 9.2h-2.1z"/>
                <path d="M38.6 9.6l-4.4-5.8v5.8h-1.9V.4h1.8l4.3 5.7V.4h2v9.2z"/>
                <path d="M46.6 2.3v7.3h-2V2.3H42V.4h7.5v2z"/>
                <path d="M51 9.6h2V.4h-2z"/>
                <path d="M57.3 2.3v2h4.4V6h-4.4v3.5h-2V.4h7v2z"/>
                <path d="M64 9.6h2V.4h-2z"/>
                <path d="M68.2 9.6V.4h7v1.8h-5v2h4.3v1.7h-4.3v2h5v1.7z"/>
                <path d="M83.2 5c0-1.6-1-2.7-2.7-2.7h-1.6v5.5h1.6c1.6 0 2.7-1.1 2.7-2.7zm-2.7 4.6h-3.6V.4h3.6c2.9 0 4.8 2 4.8 4.6 0 2.6-2 4.6-4.8 4.6z"/>
                <path d="M96.2 3.7c0-1-.6-1.4-1.6-1.4H93V5h1.6c1 0 1.6-.6 1.6-1.4zm-1.7 3.2H93v2.7h-2V.4h3.7c2.2 0 3.5 1.3 3.5 3.2 0 2.2-1.6 3.3-3.7 3.3z"/>
                <path d="M99.7 9.6V.4h2v7.4h4.5v1.8z"/>
                <path d="M111.8 2.8l-1.3 3h2.5l-1.2-3zm2.7 6.8l-.8-2h-3.9l-.8 2h-2l3.9-9.2h1.8l4 9.2h-2.2z"/>
                <path d="M124.4 9.6L120 3.8v5.8h-2V.4h1.8l4.3 5.7V.4h2v9.2z"/>
                <path d="M128.3 9.6V.4h6.8v1.8h-4.9v2h4.3v1.7h-4.3v2h5v1.7z"/>
                <path d="M141.1 2.3v7.3h-2V2.3h-2.8V.4h7.6v2z"/>
              </g>
            </svg>
            <span class="u-hiddenVisually">Quantified Planet</a>
          </a>
          <ul class="Header-nav">
            ${docs.map(doc => {
              const href = resolveLink(this.state.routes, doc)
              return html`
                <li class="Header-page">
                  <a class="${className('Header-link', {'is-active': this.state.href === href})}" href="${href}">
                    ${asText(doc.data.title)}
                  </a>
                </li>
              `
            })}
          </ul>
          <a href="/data-explorer">
            Data explorer
          </a>
        </nav>
      </header>
    `
  }
}
