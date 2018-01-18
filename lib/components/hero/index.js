const css = require('sheetify')
const html = require('choo/html')
const Component = require('nanocomponent')
const asElement = require('prismic-element')
require('../base')
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
        ${asElement(doc.data.title)}
        ${asElement(doc.data.description)}
      </div>
    `
  }
}
