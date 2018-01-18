const css = require('sheetify')
const html = require('choo/html')
const Component = require('nanocomponent')
const asElement = require('prismic-element')
require('../base')
require('../text')
css('./index.css')

module.exports = class Hero extends Component {
  static id (doc) {
    return `hero-${doc.id}`
  }

  update (doc) {
    return Hero.id(doc) !== this._name
  }

  createElement (doc) {
    return html`
      <div class="Hero">
        <div class="Text">
          ${asElement(doc.data.title)}
          ${asElement(doc.data.description)}
        </div>
      </div>
    `
  }
}
