const css = require('sheetify')
const html = require('choo/html')
const Footer = require('../footer')
const Header = require('../header')
const error = require('../error')
require('../base')
css('./index.css')

module.exports = createView

// create view wrapper
// (str, fn, fn) -> fn
function createView (name, view, title) {
  return (state, emit, render) => {
    if (state.error) view = state => error(state.error)

    let children
    try {
      children = view(state, emit, render)
      if (typeof title === 'function') title = title(state)
    } catch (err) {
      err.status = err.status || 500
      children = error(err)
      title = error.title(err)
    }

    if (title !== state.title) emit('DOMTitleChange', title)
    if (name !== state.routeName) emit('routeNameChange', name)

    return html`
      <body class="View">
        <div class="View-full">
          ${render(Header)}
        </div>
        ${children}
        <div class="View-full">
          ${render(Footer)}
        </div>
      </body>
    `
  }
}
