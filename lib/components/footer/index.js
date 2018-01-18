const css = require('sheetify')
const html = require('choo/html')
const Component = require('nanocomponent')
require('../base')
css('./index.css')

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
