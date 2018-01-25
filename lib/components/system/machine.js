const html = require('choo/html')
const Component = require('nanocomponent')

const GRID_SIZE = 12 * 12

module.exports = class Scene extends Component {
  constructor (emitter) {
    super('system-machine')

    let interval
    emitter.on('inview', inview => {
      if (inview) interval = window.setInterval(() => this.rerender(), 800)
      else window.clearInterval(interval)
    })
  }

  update () {
    return false
  }

  drop () {
    const fill = Math.random() > 0.5 ? '#fff' : '#010119'
    return html`
      <svg class="System-drop" width="19" height="25" viewBox="0 0 19 25">
        <path fill="${fill}" fill-rule="evenodd" d="M9 0C3 7 0 12 0 15a9 9 0 0 0 18 0c0-3-3-8-9-15z"/>
      </svg>
    `
  }

  createElement (type) {
    const cells = []
    for (let i = 0; i < GRID_SIZE; i++) {
      if (type === 'drops' && Math.random() < 0.1) cells.push(this.drop())
      else if (type === 'numbers') cells.push(Math.round(Math.random()))
      else cells.push(null)
    }

    return html`
      <div class="System-machine" role="presentational">
        ${cells.map(el => html`<span class="System-cell">${el}</span>`)}
      </div>
    `
  }
}
