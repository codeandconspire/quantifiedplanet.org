const html = require('choo/html')
const { className } = require('../base')

module.exports = menu

function menu (items) {
  return html`
    <ol class="Menu">
      ${items.map(props => html`
        <li class="Menu-item">
          <a class="${className('Menu-link', { 'is-active': props.isActive })}" href="${props.href}" onclick=${props.onclick || null}>
            ${props.text}
          </a>
        </li>
      `)}
    </ol>
  `
}
