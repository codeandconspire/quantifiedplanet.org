const App = require('./lib/app')

const app = new App()

if (process.env.NODE_ENV === 'development') {
  app.use(require('choo-devtools')())
}

// expose route patterns on state for reverse engineering (document -> route)
const routes = app.state.routes = {
  homepage: '/',
  page: '/:page',
  section: '/:page/:section'
}

app.route(routes.homepage, require('./lib/views/home'))
app.route(routes.page, require('./lib/views/page'))
app.route(routes.section, require('./lib/views/page'))
app.use(require('./lib/stores/core'))
app.use(require('./lib/stores/api'))
app.use(require('./lib/stores/pages'))
app.use(require('./lib/stores/error'))

if (module.parent) module.exports = app
else app.mount('body')
