const html = require('choo/html')
const nanoraf = require('nanoraf')
const nanobus = require('nanobus')
const Component = require('choo/component')
const asElement = require('prismic-element')
const StormWater = require('../storm-water')
const Machine = require('./machine')
const { className, resolveLink } = require('../base')

module.exports = class System extends Component {
  constructor (emitter) {
    super('system')

    this.vizmode = false
    this.visualization = new StormWater()
    this.narrow = typeof window !== 'undefined' && document.documentElement.clientWidth < 768

    this.machinebus = nanobus()
    this.drops = new Machine('drops', this.machinebus)
    this.numbers = new Machine('numbers', this.machinebus)

    emitter.on('inview', inview => {
      if (inview) {
        if (!this.vizmode) this.machinebus.emit('inview', true)
        window.addEventListener('scroll', this, {passive: true})
        window.addEventListener('resize', this, {passive: true})
        this.onresize()
      } else {
        this.machinebus.emit('inview', false)
        window.removeEventListener('scroll', this)
        window.removeEventListener('resize', this)
      }
    })
  }

  update () {
    return false
  }

  load (element) {
    this.center = element.querySelector('.js-breakpoint')

    this.onresize()
    this.onscroll()
    this.onresize = nanoraf(this.onresize.bind(this))
    this.onscroll = nanoraf(this.onscroll.bind(this))

    if (this.narrow) this.rerender()
  }

  handleEvent (event) {
    if ('on' + event.type in this) this['on' + event.type](event)
  }

  onresize () {
    // pluck out element dimensions as we'll be accessing them on scroll
    this.viewport = document.documentElement.clientHeight
    this.narrow = document.documentElement.clientWidth < 768
    this.breakpoint = this.element.offsetTop + (this.viewport * 1.75)
  }

  onscroll () {
    if (this.narrow) return

    const scroll = window.scrollY + (this.viewport / 2)

    if (!this.vizmode && (scroll > (this.breakpoint + 50))) {
      this.vizmode = true
      this.machinebus.emit('inview', false)
      this.rerender()
    } else if (this.vizmode && (scroll < (this.breakpoint - 50))) {
      this.vizmode = false
      this.machinebus.emit('inview', true)
      this.rerender()
    }
  }

  createElement (doc) {
    return html`
      <div class="View-container">
        <div class="${className('System', {'System--vizmode': this.vizmode, 'has-js': typeof window !== 'undefined'})}" id="system">

          <div class="System-col">
            <p class="System-title">${doc.data.parts[0].title}</p>
          </div>
          <div class="System-col">
            <p class="System-title System-title--muted">Example: Storm Water</p>
            <div class="Text">
              ${asElement(doc.data.parts[0].description, resolveLink)}
            </div>
          </div>
          <div class="System-col System-col--machine System-col--z2">
            <div class="${className('System-frame System-frame--faux js-firstFrame', {'System-frame--vizmode': this.vizmode})}">
              ${this.drops.render()}
            </div>
          </div>


          <div class="System-col">
            <p class="System-title">${doc.data.parts[1].title}</p>
          </div>
          <div class="System-col">
            <div class="Text">
              ${asElement(doc.data.parts[1].description, resolveLink)}
            </div>
          </div>
          <div class="System-col System-col--machine System-col--z1 js-breakpoint">
            <div class="${className('System-frame', {'System-frame--vizmode': this.vizmode})}">
              ${this.numbers.render()}
              ${this.vizmode && !this.narrow ? html`
                <div class="System-visualization" role="presentation">
                  ${this.visualization.render({locality: 'Stockholm', value: 0.59, evaluation: 'high', season: 'winter'})}
                </div>
              ` : null}
            </div>
          </div>

          <div class="System-col">
            <p class="System-title">${doc.data.parts[2].title}</p>
          </div>
          <div class="System-col">
            <div class="Text">
              ${asElement(doc.data.parts[2].description, resolveLink)}
              <a href="/explorer" onclick=${scrollIntoView}>Planet Explorer</a>
            </div>
          </div>

          <div class="System-col System-col--machine System-col--z1 System-col--expander">
            ${typeof window === 'undefined' || this.narrow ? html`
              <div class="System-frame System-frame--vizmode">
                <div class="System-visualization" role="presentation">
                  ${this.visualization.render({locality: 'Stockholm', value: 0.59, evaluation: 'high', season: 'winter'})}
                </div>
              </div>
            ` : null}
          </div>
        </div>
      </div>
    `
  }
}

function scrollIntoView (event) {
  const el = document.querySelector(event.target.hash)
  if (el) {
    el.scrollIntoView({block: 'start', behavior: 'smooth'})
    event.preventDefault()
  }
}
