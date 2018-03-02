const { asText } = require('prismic-richtext')
const Prismic = require('prismic-javascript')
const Nanostate = require('nanostate')
const nanoraf = require('nanoraf')
const html = require('choo/html')
const menu = require('../components/menu')
const View = require('../components/view')
const icons = require('../components/icon')
const intro = require('../components/intro')
const fromSlice = require('../components/text/from-slice')
const { ROUTES, resolveRoute, text, friendlyUrl } = require('../components/base')

const URL = process.env.WEBSITE_URL.replace(/\/$/, '')
const SOCIAL_LINKS = ['facebook', 'twitter', 'instagram']
const PRISMIC_ENDPOINT = 'https://quantifiedplanet.cdn.prismic.io/api/v2'

module.exports = class Page extends View {
  constructor (id, state, emit) {
    super(id, 'page')
    this.emit = emit
    this.state = state
    this.machine = new Nanostate('uninitialized', {
      uninitialized: { initialized: 'idle', fetch: 'loading' },
      idle: { scroll: 'scrolling', disable: 'disabled' },
      loading: { initialized: 'idle' },
      disabled: { enable: 'idle' },
      scrolling: { done: 'idle' }
    })
  }

  static id (state) {
    return `page-${state.params.page}`
  }

  static create (route) {
    class Instance extends Page {}
    Object.defineProperty(Instance, 'route', {
      get () { return route }
    })
    return Instance
  }

  static getInitialState (ctx, done) {
    super.getInitialState(ctx, function (err, state) {
      if (err) return done(err)
      state.routeName = 'page'
      Prismic.api(PRISMIC_ENDPOINT).then(function (api) {
        return api.getByUID('page', ctx.params.page, {ref: state.ref}).then(function (doc) {
          if (!doc) {
            return done(new Error(`Could not find page "${ctx.params.page}"`))
          }

          done(null, Object.assign({}, state, {
            pages: [doc],
            meta: Object.assign({}, state.meta, {
              url: URL + resolveRoute(ROUTES.page, {page: doc.uid}),
              description: asText(doc.data.description).trim(),
              image: doc.data.image
            })
          }))
        })
      }).catch(done)
    })
  }

  getTitle (state) {
    if (this.machine.state === 'loading') return text`LOADING_SHORT`
    const doc = state.pages.find(page => page.uid === state.params.page)
    return asText(doc.data.title).trim()
  }

  update (state) {
    const doc = state.pages.find(page => page.uid === state.params.page)
    const isLoading = this.machine.state === 'loading'
    const newContent = isLoading && typeof doc !== 'undefined'
    return newContent || state.params.section !== this.section
  }

  load () {
    const state = this.state
    const doc = state.pages.find(page => page.uid === state.params.page)
    if (doc && this.machine.state === 'uninitialized') {
      this.init(doc, state.params.section)
    }
  }

  afterupdate () {
    if (this.machine.state === 'loading') {
      const state = this.state
      const doc = state.pages.find(page => page.uid === state.params.page)
      if (doc) this.init(doc, state.params.section)
    }
    if (this.section !== this.state.params.section) {
      this.section = this.state.params.section
      if (this.machine.state === 'disabled') {
        this.machine.emit('enable')
      } else if (this.machine.state === 'idle') {
        this.machine.emit('scroll')
        const el = this.section && document.getElementById(this.section)
        if (el) {
          el.scrollIntoView({ block: 'start', behavior: 'smooth' })
        } else {
          window.scrollTo(0, 0)
        }
      }
    }
  }

  init (doc, section) {
    this.machine.emit('initialized')

    if (section) {
      this.machine.emit('scroll')
      const el = document.getElementById(section)
      if (el) window.scrollTo(0, el.offsetTop)
    } else {
      window.scrollTo(0, 0)
    }

    const headers = doc.data.body
      .filter(slice => slice.slice_type === 'heading')
      .map(slice => {
        const id = friendlyUrl(asText(slice.primary.heading))
        const el = document.getElementById(id)
        if (!el) return null
        return { top: el.offsetTop, height: el.offsetHeight, id: id }
      })
      .filter(Boolean)

    if (!headers.length) return

    let timeout
    this.onscroll = nanoraf(event => {
      if (this.machine.state === 'scrolling') {
        window.clearTimeout(timeout)
        timeout = window.setTimeout(() => this.machine.emit('done'), 200)
        return
      }

      const viewport = document.documentElement.clientHeight
      const first = headers[0]
      const last = headers[headers.length - 1]
      const scrollY = window.scrollY
      const center = scrollY + (viewport / 2)

      if (center < first.top || scrollY > last.top) {
        if (this.section) {
          this.machine.emit('disable')
          this.emit('replaceState', resolveRoute(ROUTES.page, {
            page: doc.uid
          }))
        }
      } else {
        for (let i = 0, len = headers.length, header; i < len; i += 1) {
          header = headers[i]
          if (header.id === this.section) continue
          if ((scrollY + viewport) < header.top) break
          if ((header.top + header.height) < scrollY) continue
          if ((header.top + header.height) > center && header.top < center) {
            this.machine.emit('disable')
            this.emit('replaceState', resolveRoute(ROUTES.section, {
              page: doc.uid,
              section: header.id
            }))
            break
          }
        }
      }
    })

    window.addEventListener('scroll', this.onscroll, {passive: true})
  }

  unload () {
    window.removeEventListener('scroll', this.onscroll)
  }

  createElement (state, emit, render) {
    const doc = state.pages.find(page => page.uid === state.params.page)

    if (!doc) {
      if (this.machine.state === 'uninitialized') {
        emit('pages:fetch', { uid: state.params.page })
        this.machine.emit('fetch')
      }
      return html`
        <main class="View-main View-main--light">
          <div class="View-container">
            <div class="View-switcheroo">
            <div class="View-intro">${intro.loading()}</div>
            </div>
          </div>
        </main>
      `
    }

    return html`
      <main class="View-main View-main--light">
        <div class="View-container">
          <div class="View-switcheroo">
            <div class="View-intro">${intro(doc)}</div>
            <nav class="View-menu">
              ${menu(doc.data.body.filter(slice => slice.slice_type === 'heading').map(slice => {
                const text = asText(slice.primary.heading)
                const id = friendlyUrl(text)
                const href = resolveRoute(ROUTES.section, { page: doc.uid, section: id })
                const isActive = state.href === href
                return { text, href, isActive }
              }))}
            </nav>
            <div class="View-body">
              <div class="Text">
                ${doc.data.body.reduce((sections, slice) => {
                  if (slice.slice_type === 'heading') {
                    sections.push({
                      id: friendlyUrl(asText(slice.primary.heading)),
                      children: [fromSlice(slice)]
                    })
                  } else {
                    if (!sections.length) sections.push({ children: [] })
                    const section = sections[sections.length - 1]
                    section.children.push(fromSlice(slice))
                  }

                  return sections
                }, []).map((section, index) => html`
                  <section id="${section.id || `${this._name}-${index}`}">
                    ${section.children}
                  </section>
                `)}
              </div>
            </div>
            <div class="View-social">
              ${state.meta.social.filter(item => SOCIAL_LINKS.includes(item.type)).map(item => html`
                <a class="View-socialIcon" href="${item.link.url}" target="_blank" rel="noopener noreferrer" title="${item.type}">
                  ${icons[item.type]({ theme: 'gray' })}
                </a>
              `)}
            </div>
          </div>
        </div>
      </main>
    `
  }
}
