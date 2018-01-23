module.exports = core

function core (state, emitter, app) {
  emitter.on('routeNameChange', function (name) {
    app.state.routeName = name
    if (typeof window !== 'undefined') {
      if (name === 'homepage') {
        document.documentElement.classList.add('u-colorSpaceBlue')
      } else {
        document.documentElement.classList.remove('u-colorSpaceBlue')
      }
    }
  })
}
