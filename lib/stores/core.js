module.exports = core

function core (state, emitter) {
  emitter.on('routeNameChange', function (name) {
    state.routeName = name
    if (typeof document !== 'undefined') {
      if (name === 'homepage') {
        document.documentElement.classList.add('u-colorSpaceBlue')
      } else {
        document.documentElement.classList.remove('u-colorSpaceBlue')
      }
    }
  })
}
