const html = require('choo/html')
const nanoraf = require('nanoraf')
const nanobus = require('nanobus')
const Component = require('nanocomponent')
const StormWater = require('../storm-water')
const Machine = require('./machine')
const { vh, vw, className } = require('../base')

module.exports = class System extends Component {
  constructor (emitter) {
    super('system')

    this.vizmode = false
    this.visualization = new StormWater()
    this.narrow = typeof window !== 'undefined' && vw() < 768

    this.machinebus = nanobus()
    this.drops = new Machine('drops', this.machinebus)
    this.numbers = new Machine('numbers', this.machinebus)

    emitter.on('inview', inview => {
      if (inview) {
        if (!this.vizmode) this.machinebus.emit('inview', true)
        window.addEventListener('scroll', this)
        window.addEventListener('resize', this)
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
    this.viewport = vh()
    this.narrow = vw() < 768
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

  createElement () {
    return html`
      <div class="View-container">
        <div class="${className('System', {'System--vizmode': this.vizmode, 'has-js': typeof window !== 'undefined'})}">

          <div class="System-col">
            <p class="System-title">Collecting the Data</p>
          </div>
          <div class="System-col">
            <p class="System-title System-title--muted">Example: Storm Water</p>
            <p>Our sensors and partners collect raw data from all around the world.</p>
            <span class="Text"><a href="/markets">Our markets</a></span>
          </div>
          <div class="System-col System-col--machine System-col--z2">
            <div class="${className('System-frame System-frame--faux', {'System-frame--vizmode': this.vizmode})}">
              ${this.drops.render()}
            </div>
          </div>

          <div class="System-col">
            <div class="Text Text--lg">
              <p>Crunching and Making Sense of the Data</p>
            </div>
          </div>
          <div class="System-col">
            <div class="Text">
              <p>
                The backend system does the heavy lifting and makes the data available in an open API.
                <br /><br />
                <a href="/api">For Developers</a>
              </p>
            </div>
          </div>
          <div class="System-col System-col--machine System-col--z1 js-breakpoint">
            <div class="${className('System-frame', {'System-frame--vizmode': this.vizmode})}">
              ${this.numbers.render()}
              ${this.vizmode && !this.narrow ? html`
                <div class="System-visualization" role="presentational">
                  ${this.visualization.render({locality: 'Stockholm', value: 0.87, evaluation: 'high', season: 'winter'})}
                </div>
              ` : null}
            </div>
          </div>

          <div class="System-col">
            <div class="Text Text--lg">
              <p>Visualize and Find a Meaninful Context</p>
            </div>
          </div>
          <div class="System-col">
            <div class="Text">
              <p>
                The data can now be visualized however you want. See the examples.
                <br /><br />
                <a href="/data-explirer">Data Explorer</a>
              </p>
            </div>
          </div>
          <div class="System-col System-col--machine System-col--z1 System-col--expander">
            ${typeof window === 'undefined' || this.narrow ? html`
              <div class="System-frame System-frame--vizmode">
                <div class="System-visualization" role="presentational">
                  ${this.visualization.render({locality: 'Stockholm', value: 0.87, evaluation: 'high', season: 'winter'})}
                </div>
              </div>
            ` : null}
          </div>
        </div>
      </div>
    `
  }
}
