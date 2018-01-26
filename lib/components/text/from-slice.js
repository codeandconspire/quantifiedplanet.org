const html = require('choo/html')
const { asText, Elements } = require('prismic-richtext')
const asElement = require('prismic-element')
const { resolveLink } = require('../base')

module.exports = fromSlice

function fromSlice (slice, linkResolver) {
  switch (slice.slice_type) {
    case 'heading': return html`
      <div>
        <hr />
        <h2>${asText(slice.primary.heading).trim()}</h2>
      </div>
    `
    case 'preamble': return asElement(slice.primary.text, linkResolver, (element, content, children) => {
      return (element.type === Elements.paragraph) ? html`
        <p class="Text-preamble">${children}</p>
      ` : null
    })
    case 'text': return asElement(slice.primary.body, linkResolver)
    case 'blockquote': return html`
      <blockquote>
        ${asElement(slice.primary.text, linkResolver)}
        ${slice.primary.cite ? html`<cite>${slice.primary.cite}</cite>` : null}
      </blockquote>
    `
    case 'image': return html`
      <figure>
        <img src="${slice.primary.image.url}" width="${slice.primary.image.dimensions.width}" height="${slice.primary.image.dimensions.height}" alt="${slice.primary.image.alt || ''}" />
        ${slice.primary.caption ? html`<figcaption>${slice.primary.caption}</figcaption>` : null}
      </figure>
    `
    case 'vcards': return html`
      <div class="Grid">
        ${slice.items.map(item => html`
          <address>
            <strong>${item.name}</strong><br />
            ${item.role}<br />
            <a href="mailto:${item.email}">${item.email}</a>
          </address>
        `)}
      </div>
    `
    default: return null
  }
}
