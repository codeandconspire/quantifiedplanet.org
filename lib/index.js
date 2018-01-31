const App = require('./app')

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

app.route(routes.page, require('./views/page'))
app.route(routes.section, require('./views/page'))
app.route(routes.homepage, require('./views/home'))
app.use(require('./stores/api'))
app.use(require('./stores/core'))
app.use(require('./stores/pages'))
app.use(require('./stores/error'))

if (module.parent) module.exports = app
else app.mount('body')
