const { asText } = require('prismic-richtext')
const asElement = require('prismic-element')
const html = require('choo/html')
const { text } = require('../base')

module.exports = intro

function intro (doc) {
  return html`
    <header class="Intro">
      <div class="Intro-text">
        <div class="Text">
          <h1>${asText(doc.data.title)}</h1>
          ${asElement(doc.data.description)}
        </div>
      </div>

      <figure class="Intro-banner">
        <img class="Intro-image" src="${doc.data.image.url}" width="${doc.data.image.dimensions.width}" height="${doc.data.image.dimensions.height}" alt="${doc.data.image.alt || ''}">
      </figure>
    </header>
  `
}

intro.loading = function () {
  return html`
    <header class="Intro is-loading">
      <div class="Text">
        <h1>${text`LOADING_SHORT`}</h1>
        <p>${text`LOADING_LONG`}</p>
      </div>
    </header>
  `
}
