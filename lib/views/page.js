const { asText, Elements } = require('prismic-richtext')
const scrollToAnchor = require('scroll-to-anchor')
const asElement = require('prismic-element')
const Component = require('nanocomponent')
const html = require('choo/html')
const view = require('../components/view')
const intro = require('../components/intro')
const { text, resolveLink, resolveRoute } = require('../components/base')

module.exports = class Page extends Component {
  constructor (id, state) {
    super(id)
    this.state = state
    this.isLoading = false
    this.createElement = view('page', page.bind(this), title.bind(this))
  }

  static id (state) {
    return `page-${state.params.page}`
  }

  update (state) {
    const doc = state.pages.find(page => page.uid === state.params.page)
    const shouldUpdate = this.isLoading && typeof doc !== 'undefined'
    this.isLoading = !doc
    return shouldUpdate
  }

  load () {
    const el = document.getElementById(this.state.params.section)
    if (el) window.scrollTo(0, el.offsetTop)
  }

  afterupdate () {
    const el = document.getElementById(this.state.params.section)
    if (el) window.scrollTo(0, el.offsetTop)
  }
}

function page (state, emit, render) {
  const doc = state.pages.find(page => page.uid === state.params.page)

  if (!doc) {
    if (!this.isLoading) emit('pages:fetch', { uid: state.params.page })
    this.isLoading = true
    return html`
      <main>
        ${intro.loading()}
      </main>
    `
  }

  return html`
    <main>
      ${intro(doc)}
      <nav>
        <ol>
          ${doc.data.body.filter(slice => slice.slice_type === 'heading').map(slice => {
            const text = asText(slice.primary.heading)
            const section = id(text)
            const href = resolveRoute(state.routes.section, Object.assign({section: section}, doc))
            return html`
              <li>
                <a href="${href}" onclick=${() => scrollToAnchor(`#${section}`, { block: 'start', behavior: 'smooth' })}>
                  ${text.trim()}
                </a>
              </li>
            `
          })}
        </ol>
      </nav>
      <div class="Text">
        ${doc.data.body.map(slice => {
          switch (slice.slice_type) {
            case 'heading': {
              const text = asText(slice.primary.heading)
              return html`<h2 id="${id(text)}">${text.trim()}</h2>`
            }
            case 'preamble': return asElement(slice.primary.text, resolveLink(state.routes), (element, content, children) => {
              return (element.type === Elements.paragraph) ? html`
                <p class="Text-preamble">${children}</p>
              ` : null
            })
            case 'text': return asElement(slice.primary.body, resolveLink(state.routes))
            case 'blockquote': return html`
              <blockquote>
                ${asElement(slice.primary.text, resolveLink(state.routes))}
                ${slice.primary.cite ? html`<cite>${slice.primary.cite}</cite>` : null}
              </blockquote>
            `
            case 'image': return html`
              <figure>
                <img src="${slice.primary.image.url}" width="${slice.primary.image.dimensions.width}" height="${slice.primary.image.dimensions.height}" alt="${slice.primary.image.alt || ''}" />
                ${slice.primary.caption ? html`<figcaption>${slice.primary.caption}</figcaption>` : null}
              </figure>
            `
            case 'vcards': return html`
              <div class="Grid">
                ${slice.items.map(item => html`
                  <address class="Grid-cell">
                    <strong>${item.name}</strong><br />
                    ${item.role}<br />
                    <a href="mailto:${item.email}">${item.email}</a>
                  </address>
                `)}
              </div>
            `
            default: return null
          }
        })}
      </div>
    </main>
  `
}

function title (state) {
  if (this.isLoading) return text`Loading`
  const doc = state.pages.find(page => page.uid === state.params.page)
  return asText(doc.data.title)
}

// format string as url-friendly id
// str -> str
function id (str) {
  return str
    .replace(/[^\w]/g, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^-?(.+?)-?$/, '$1')
    .toLowerCase()
}
