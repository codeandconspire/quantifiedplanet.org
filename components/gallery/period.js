const html = require('choo/html')
const Component = require('choo/component')

const DAY = 1000 * 60 * 60 * 24
const CHOICES = [{
  label: '1 year',
  offset: DAY * 365
}, {
  label: '30 days',
  offset: DAY * 30
}, {
  label: '7 days',
  offset: DAY * 7
}]

module.exports = class Period extends Component {
  constructor (id, state, emit, onclick) {
    super(id)
    this.selected = 2
    this.onclick = onclick || Function.prototype
  }

  static id (id) {
    return `period-${id}`
  }

  update () {
    return false
  }

  createElement (id, callback) {
    const self = this

    return html`
      <ol class="Gallery-periods">
        ${CHOICES.map((tab, index) => html`
          <li class="Gallery-period">
            <button class="Gallery-choice ${this.selected === index ? 'is-selected' : ''}" onclick=${onclick(tab.offset, index)}>
              ${tab.label}
            </button>
          </li>
        `)}
      </ol>
    `

    function onclick (offset, id) {
      return function () {
        self.selected = id
        self.onclick(offset)
        self.rerender()
      }
    }
  }
}
