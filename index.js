const App = require('./lib/app')

const app = new App()

if (process.env.NODE_ENV === 'development') {
  app.use(require('choo-devtools')())
}

// expose reverse route pattern on state (document -> route)
app.state.routes = {
  homepage: '/',
  page: '/:uid',
  section: '/:uid/:section'
}

app.route('/', require('./lib/views/home'))
app.route('/:page', require('./lib/views/page'))
app.route('/:page/:section', require('./lib/views/page'))
app.use(require('./lib/stores/api'))
app.use(require('./lib/stores/pages'))
app.use(require('./lib/stores/error'))

if (module.parent) module.exports = app
else app.mount('body')
