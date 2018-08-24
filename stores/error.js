module.exports = error

function error (state, emitter) {
  if (state.prefetch || typeof window !== 'undefined') state.error = null
  else state.error = state.error || null

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
