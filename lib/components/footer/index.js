const html = require('choo/html')
const Component = require('nanocomponent')
const asElement = require('prismic-element')
const icons = require('../icon')
const { ROUTES, resolveRoute } = require('../base')

module.exports = class Footer extends Component {
  constructor (id, state) {
    super(id)
    this.state = state
  }

  static id () {
    return 'footer'
  }

  update () {
    return false
  }

  createElement (props) {
    return html`
      <footer class="Footer" id="footer">
        <nav class="View-container">
          <ul class="Footer-partners">
            ${props.partners.map(partner => html`
              <li class="Footer-partner">
                <a class="Footer-link Footer-link--partner" target="_blank" rel="noopener noreferrer" href="${partner.link.url}" title="${partner.label}">
                  <img class="Footer-partnerLogo" src="${partner.logo.url}" width="${partner.logo.dimensions.width}" height="${partner.logo.dimensions.height}" />
                </a>
              </li>
            `)}
          </ul>
          <ul class="Footer-nav">
            ${props.menu.map(item => html`
              <li class="Footer-page">
                <a class="Footer-link Footer-link--primary" href="${resolveRoute(ROUTES.page, item.params)}">${item.label}</a>
                ${item.sections.length ? html`
                  <ul class="Footer-sections">
                    ${item.sections.map(section => html`
                      <li class="Footer-section">
                        <a class="Footer-link" href="${resolveRoute(ROUTES.section, section.params)}">${section.label}</a>
                      </li>
                    `)}
                  </ul>
                ` : null}
              </li>
            `)}
          </ul>
          <ul class="Footer-socials">
            ${props.social.map(item => html`
              <li class="Footer-social">
                <a class="Footer-socialLink" href="${item.link.url}" target="_blank" rel="noopener noreferrer" title="${item.type}">
                  ${icons[item.type]({ theme: 'blue' })}
                </a>
              </li>
            `)}
          </ul>
        </nav>
        <address class="Footer-contact">
          ${asElement(props.contact)}
        </address>
        <svg class="Footer-logo Footer-logo--qp" width="31" height="54" viewBox="0 0 31 54" role="presentation">
          <path fill="#fff" d="M15.8 36.2v-5.4l3.8 3.7a9.6 9.6 0 0 1-3.8 1.7zM4.1 27c0-4.5 3.2-8.3 7.5-9.2v18.4A9.5 9.5 0 0 1 4.1 27zm19.2 0c0 1.5-.4 3-1 4.3l-6.5-6.4v-7c4.3.9 7.5 4.6 7.5 9.1zm4.1 15.2l3-3-5.1-5a13 13 0 0 0 2.1-7.2c0-6.7-5-12.3-11.6-13.3V0h-4.2v13.7C5 14.7 0 20.3 0 27c0 6.8 5 12.4 11.6 13.4V54h4.2V40.4c2.5-.4 4.8-1.4 6.7-3l4.9 4.8z"/>
        </svg>
      </footer>
    `
  }
}
