const html = require('choo/html')
const { text } = require('../base')
require('../base')
require('../text')

module.exports = error
module.exports.title = title

function error (err) {
  return html`
    <main>
      <div class="Text">
        <h1>Ooops!</h1>
        <p>Something went wrong, <a href="." onclick=${reload}>try again?</a></p>
        ${process.env.NODE_ENV === 'development' ? html`<code><pre>${err.stack}</pre></code>` : null}
      </div>
    </main>
  `
}

function title (err) {
  return err.status === 404 ? text`Page not found` : text`Something went wrong`
}

function reload () {
  window.location.reload()
}
