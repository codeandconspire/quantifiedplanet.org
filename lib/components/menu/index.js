const css = require('sheetify')
const html = require('choo/html')
css('./index.css')

module.exports = menu

function menu (items) {
  return html`
    <ol class="Menu">
      ${items.map(props => html`
        <li class="Menu-item">
          <a class="Menu-link" href="${props.href}" onclick=${props.onclick || null}>
            ${props.text}
          </a>
        </li>
      `)}
    </ol>
  `
}
