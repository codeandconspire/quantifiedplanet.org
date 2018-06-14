module.exports = core

function core (state, emitter, app) {
  state.meta = Object.assign({
    menu: [],
    social: [],
    partners: [],
    contact: null
  }, state.meta)

  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
    window.choo = app
  }

  emitter.on('routeNameChange', function (name) {
    app.state.routeName = name

    if (typeof window !== 'undefined') {
      if (name !== 'page') {
        document.documentElement.classList.remove('u-colorSpaceBlue')
      } else {
        document.documentElement.classList.add('u-colorSpaceBlue')
      }
    }
  })
}
