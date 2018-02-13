const App = require('./app')
const { ROUTES } = require('./components/base')

const app = new App()

if (process.env.NODE_ENV === 'development') {
  app.use(require('choo-devtools')())
}

app.route(ROUTES.page, require('./views/page'))
app.route(ROUTES.section, require('./views/page'))
app.route(ROUTES.homepage, require('./views/home'))
app.route(ROUTES.explorer, require('./views/home'))
app.use(require('./stores/api'))
app.use(require('./stores/core'))
app.use(require('./stores/pages'))
app.use(require('./stores/error'))

if (module.parent) module.exports = app
else app.mount('body')
