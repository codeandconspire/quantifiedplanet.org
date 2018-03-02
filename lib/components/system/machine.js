const html = require('choo/html')
const nanoraf = require('nanoraf')
const Component = require('nanocomponent')

const GRID_SIZE = 12 * 12

module.exports = class Scene extends Component {
  constructor (type, emitter) {
    super(`system-machine-${type}`)

    this.type = type
    this.inview = false
    this.narrow = typeof window === 'undefined' || document.documentElement.clientWidth < 768

    if (typeof window !== 'undefined') {
      this.onresize = nanoraf(() => { this.narrow = document.documentElement.clientWidth < 768 })

      let last = Date.now()
      this.onframe = nanoraf(() => {
        const now = Date.now()
        if ((now - last) >= 650) {
          last = now
          this.element.style.setProperty('--rand1', Math.floor(Math.random() * 5))
          this.element.style.setProperty('--rand2', Math.floor(Math.random() * 5))
          this.element.style.setProperty('--rand3', Math.floor(Math.random() * 5))
          this.element.style.setProperty('--rand4', Math.floor(Math.random() * 5))
          this.element.style.setProperty('--rand5', Math.floor(Math.random() * 5))
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

  drop (visible) {
    const fill = Math.random() > 0.5 ? '#fff' : '#010119'
    if (!visible && this.type === 'numbers' && this.narrow) {
      return this.number(Math.round(Math.random()))
    }
    return html`
      <svg class="System-drop ${visible ? 'is-visible' : ''}" width="19" height="25" viewBox="0 0 19 25">
        <path fill="${fill}" fill-rule="evenodd" d="M9 0C3 7 0 12 0 15a9 9 0 0 0 18 0c0-3-3-8-9-15z"/>
      </svg>
    `
  }

  number (number) {
    return html`
      <div class="System-number System-number--${number}"></div>
    `
  }

  createElement () {
    const cells = []
    for (let i = 0; i < GRID_SIZE; i++) {
      if (this.type === 'drops') {
        cells.push(this.drop(Math.random() < 0.15))
      } else if (this.type === 'numbers') {
        if (this.narrow) {
          cells.push(this.drop(Math.random() < 0.15))
        } else {
          cells.push(this.number(Math.round(Math.random())))
        }
      } else {
        cells.push(null)
      }
    }

    return html`
      <div class="System-machine System-machine--${this.type} ${this.inview ? 'System-machine--on' : ''}" role="presentational">
        <div class="System-cells">
          ${cells.map(el => html`<div class="System-cell"><div class="System-item">${el}</div></div>`)}
        </div>
      </div>
    `
  }
}
