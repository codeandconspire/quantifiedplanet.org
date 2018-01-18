module.exports = error

function error (state, emitter) {
  state.error = null

  emitter.on('error', function (err) {
    state.error = {
      status: err.status || 500,
      message: err.message,
      stack: err.stack
    }
    emitter.emit('render')
  })

  emitter.on('navigate', function () {
    state.error = null
  })
}
