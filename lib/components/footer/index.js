const html = require('choo/html')
const Component = require('nanocomponent')

module.exports = class Footer extends Component {
  static id () {
    return 'footer'
  }

  update () {
    return false
  }

  createElement () {
    return html`
      <footer class="Footer">
        <nav>Footer</nav>
      </footer>
    `
  }
}
