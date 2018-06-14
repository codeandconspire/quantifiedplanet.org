const html = require('choo/html')
const Component = require('choo/component')
const error = require('../error')
const Footer = require('../footer')
const Header = require('../header')

const DEFAULT_TITLE = 'Quantified Planet'

if (typeof window !== 'undefined') {
  require('smoothscroll-polyfill').polyfill()
}

module.exports = class View extends Component {
  // create view wrapper
  // (str, fn, fn) -> fn
  static create (route) {
    var Self = this
    return function (state, emit) {
      const view = state.cache(Self, Self.id(state))

      let children
      try {
        if (state.error) throw state.error
        children = view.render(state, emit)
        const next = view.meta(state)
        next['og:title'] = next.title
        if (next.title !== DEFAULT_TITLE) {
          next.title = `${next.title} | ${DEFAULT_TITLE}`
        }
        emit('meta', next)
      } catch (err) {
        err.status = err.status || 500
        children = error(err)
        emit('DOMTitleChange', error.title(err))
      }

      if (route !== state.routeName) emit('routeNameChange', route)

      return html`
        <body class="View">
          <div class="View-full">
            ${state.cache(Header, Header.id()).render()}
          </div>
          ${children}
          <div class="View-full">
            ${state.cache(Footer, Footer.id()).render(state.meta)}
          </div>
        </body>
      `
    }
  }
}
