const choo = require('choo')
const { ROUTES } = require('./components/base')

const app = choo()

if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
  app.use(require('choo-devtools')())
  app.use(require('choo-service-worker/clear')())
}

app.use(require('choo-service-worker')('/service-worker.js'))

app.route(ROUTES.page, require('./views/page').create('page'))
app.route(ROUTES.section, require('./views/page').create('section'))
app.route(ROUTES.homepage, require('./views/home').create('homepage'))
app.route(ROUTES.explorer, require('./views/explorer').create('explorer'))
app.use(require('./stores/api'))
app.use(require('./stores/core'))
app.use(require('./stores/pages'))
app.use(require('./stores/error'))
app.use(require('./stores/tracking'))
app.use(require('./stores/meta')('https://www.quantifiedplanet.org'))

module.exports = app.mount('body')
