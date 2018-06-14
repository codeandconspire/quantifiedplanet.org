/* global gtag */

module.exports = tracking

function tracking (state, emitter) {
  emitter.on('navigate', function () {
    // gtag('config', 'UA-114059493-1', {
    //   'page_path': window.location.pathname,
    //   'page_location': window.location.href
    // })
  })
}
