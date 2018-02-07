module.exports = core

function core (state, emitter, app) {
  state.meta = Object.assign({
    menu: [],
    social: [],
    partners: [],
    contact: null
  }, state.meta)

  emitter.on('pushState', function (name) {
    if (typeof window !== 'undefined') {
      window.scrollTo(0, 0)
    }
  })

  emitter.on('routeNameChange', function (name) {
    app.state.routeName = name

    if (typeof window !== 'undefined') {
      if (name === 'homepage') {
        document.documentElement.classList.remove('u-colorSpaceBlue')
      } else {
        document.documentElement.classList.add('u-colorSpaceBlue')
      }
    }
  })
}
