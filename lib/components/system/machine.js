const html = require('choo/html')
const nanoraf = require('nanoraf')
const Component = require('nanocomponent')
const { vw } = require('../base')

const GRID_SIZE = 12 * 12

module.exports = class Scene extends Component {
  constructor (type, emitter) {
    super(`system-machine-${type}`)

    this.type = type
    this.inview = false
    this.narrow = typeof window === 'undefined' || vw() < 768

    if (typeof window !== 'undefined') {
      this.onresize = nanoraf(() => { this.narrow = vw() < 768 })

      let last = Date.now()
      this.onframe = nanoraf(() => {
        const now = Date.now()
        if ((now - last) >= 750) {
          last = now
          this.rerender()
        }
        if (this.inview) window.requestAnimationFrame(this.onframe)
      })

      emitter.on('inview', inview => {
        this.inview = inview
        if (inview && this.element) this.onframe()

        if (inview) {
          window.addEventListener('resize', this, {passive: true})
          this.onresize()
        } else {
          window.removeEventListener('resize', this)
        }
      })
    }
  }

  update () {
    return false
  }

  handleEvent (event) {
    if ('on' + event.type in this) this['on' + event.type](event)
  }

  drop () {
    const fill = Math.random() > 0.5 ? '#fff' : '#010119'
    return html`
      <svg class="System-drop" width="19" height="25" viewBox="0 0 19 25">
        <path fill="${fill}" fill-rule="evenodd" d="M9 0C3 7 0 12 0 15a9 9 0 0 0 18 0c0-3-3-8-9-15z"/>
      </svg>
    `
  }

  createElement () {
    const cells = []
    for (let i = 0; i < GRID_SIZE; i++) {
      if (this.type === 'drops' && Math.random() < 0.15) {
        cells.push(this.drop())
      } else if (this.type === 'numbers') {
        if (this.narrow && Math.random() < 0.15) {
          cells.push(this.drop())
        } else {
          cells.push(Math.round(Math.random()))
        }
      } else {
        cells.push(null)
      }
    }

    if (typeof this.cursor === 'undefined' || this.cursor === 2) {
      this.cursor = 1
    } else {
      this.cursor = 2
    }

    return html`
      <div class="System-machine System-machine--${this.type} System-machine--cursor${this.cursor}" role="presentational">
        <div class="System-cells">
          ${cells.map(el => html`<div class="System-cell"><span class="System-item">${el}</span></div>`)}
        </div>
      </div>
    `
  }
}
