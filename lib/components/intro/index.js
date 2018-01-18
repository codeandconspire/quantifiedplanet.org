const { asText } = require('prismic-richtext')
const asElement = require('prismic-element')
const css = require('sheetify')
const html = require('choo/html')
const { text } = require('../base')
css('./index.css')

module.exports = intro

function intro (doc) {
  return html`
    <header class="Intro">
      <h1 class="Intro-title">${asText(doc.data.title)}</h1>
      ${doc.data.description.length ? html`
        <div class="Intro-description">${asElement(doc.data.description)}</div>
      ` : null}
    </header>
  `
}

intro.loading = function () {
  return html`
    <header class="Intro is-loading">
      <h1 class="Intro-title">${text`LOADING_SHORT`}</h1>
      <div class="Intro-preamble">${text`LOADING_LONG`}</div>
    </header>
  `
}
