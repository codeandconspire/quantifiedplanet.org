const App = require('./lib/app')

const app = new App()

if (process.env.NODE_ENV === 'development') {
  app.use(require('choo-devtools')())
}

app.route('/', require('./lib/views/home'))
app.route('/:page', require('./lib/views/page'))
app.use(require('./lib/stores/api'))
app.use(require('./lib/stores/pages'))
app.use(require('./lib/stores/error'))

if (module.parent) module.exports = app
else app.mount('body')
