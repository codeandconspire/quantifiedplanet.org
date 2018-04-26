const { asText } = require('prismic-richtext')
const asElement = require('prismic-element')
const Component = require('nanocomponent')
const html = require('choo/html')
const { text } = require('../base')

module.exports = class Intro extends Component {
  static id (doc) {
    return `${doc.uid}-intro`
  }

  update () {
    return false
  }

  createElement (doc) {
    return html`
      <header class="Intro">
        <div class="Intro-text">
          <div class="Text">
            <h1>${asText(doc.data.title)}</h1>
            ${asElement(doc.data.description)}
          </div>
        </div>
        ${doc.data.image ? html`
          <figure class="Intro-banner">
            <img class="Intro-image" src="${doc.data.image.url}" width="${doc.data.image.dimensions.width}" height="${doc.data.image.dimensions.height}" alt="${doc.data.image.alt || ''}">
          </figure>
        ` : null}
      </header>
    `
  }

  static loading () {
    return html`
      <header class="Intro is-loading">
        <div class="Intro-text">
          <div class="Text">
            <h1><span class="u-loading">${text`LOADING_SHORT`}</span></h1>
            <p><span class="u-loading">${text`LOADING_LONG`}</span></p>
          </div>
        </div>

        <div class="Intro-banner">
        </div>
      </header>
    `
  }
}
