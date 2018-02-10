const html = require('choo/html')
const { asText, Elements } = require('prismic-richtext')
const asElement = require('prismic-element')
const { resolveLink } = require('../base')

module.exports = fromSlice

function fromSlice (slice) {
  switch (slice.slice_type) {
    case 'heading': return html`
      <div>
        <hr />
        <h2>${asText(slice.primary.heading).trim()}</h2>
      </div>
    `
    case 'preamble': return asElement(slice.primary.text, resolveLink, (element, content, children) => {
      return (element.type === Elements.paragraph) ? html`
        <p class="Text-preamble">${children}</p>
      ` : null
    })
    case 'text': return asElement(slice.primary.body, resolveLink)
    case 'blockquote': return html`
      <blockquote>
        ${slice.primary.cite ? html`<cite>${slice.primary.cite}</cite>` : null}
        ${asElement(slice.primary.text, resolveLink)}
      </blockquote>
    `
    case 'image': return html`
      <figure>
        <img src="${slice.primary.image.url}" width="${slice.primary.image.dimensions.width}" height="${slice.primary.image.dimensions.height}" alt="${slice.primary.image.alt || ''}" />
        ${slice.primary.caption ? html`<figcaption>${slice.primary.caption}</figcaption>` : null}
      </figure>
    `
    case 'vcards': return html`
      <div class="Vcard">
        ${slice.items.map(item => html`
          <address class="Vcard-item">
            <strong class="Vcard-name">${item.name}</strong><br />
            <span class="Vcard-role">${item.role}</span><br />
            ${item.email ? html`<a class="Vcard-email" href="mailto:${item.email}">${item.email}</a>` : null}
          </address>
        `)}
      </div>
    `
    default: return null
  }
}
