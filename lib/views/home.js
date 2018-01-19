const html = require('choo/html')
const Component = require('nanocomponent')
const Hero = require('../components/hero')
const view = require('../components/view')
const { text } = require('../components/base')

module.exports = class Home extends Component {
  constructor (id) {
    super(id)
    this.isLoading = false
    this.createElement = view('homepage', createElement.bind(this), 'Quantified Planet')
  }

  static id () {
    return 'homepage'
  }

  update (state) {
    const doc = state.pages.find(page => page.type === 'homepage')
    this.isLoading = !doc
    return !this.isLoading
  }
}

function createElement (state, emit, render) {
  const doc = state.pages.find(page => page.type === 'homepage')

  if (!doc) {
    if (!this.isLoading) emit('pages:fetch', { type: 'homepage' })
    this.isLoading = true
    return html`
      <main>
        ${text`Loading`}
      </main>
    `
  }

  return html`
    <main>
      ${render(Hero, doc)}
    </main>
  `
}
