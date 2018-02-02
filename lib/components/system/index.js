const html = require('choo/html')
const nanoraf = require('nanoraf')
const nanobus = require('nanobus')
const Component = require('nanocomponent')
const Machine = require('./machine')
const { vh, className } = require('../base')

module.exports = class System extends Component {
  constructor (emitter) {
    super('system')

    this.vizmode = false

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
    this.onresize = nanoraf(this.onresize.bind(this))
    this.onscroll = nanoraf(this.onscroll.bind(this))
  }

  handleEvent (event) {
    if ('on' + event.type in this) this['on' + event.type](event)
  }

  onresize () {
    // pluck out element dimensions as we'll be accessing them on scroll
    this.viewport = vh()
    this.breakpoint = this.center.offsetTop + this.center.offsetHeight
  }

  onscroll () {
    const scroll = window.scrollY + (this.viewport / 2)

    if (!this.vizmode && (scroll > (this.breakpoint + 100))) {
      this.vizmode = true
      this.machinebus.emit('inview', false)
      this.rerender()
    } else if (this.vizmode && (scroll < (this.breakpoint - 100))) {
      this.vizmode = false
      this.machinebus.emit('inview', true)
      this.rerender()
    }
  }

  createElement () {
    return html`
      <div class="View-container">
        <div class="${className('System', {'System--vizmode': this.vizmode})}">

          <div class="System-col">
            <div class="Text Text--lg">
              <p>Collecting the Data</p>
            </div>
          </div>
          <div class="System-col System-col--machine System-col--z2">
            <div class="js-machine">
              ${this.drops.render()}
            </div>
          </div>
          <div class="System-col">
            <div class="Text">
              <p>Example: Storm Water</p>
              <p>
                Our sensors and partners collect raw data from all around the world.
                <br /><br />
                <a href="/markets">Our markets</a>
              </p>
            </div>
          </div>

          <div class="System-col">
            <div class="Text Text--lg">
              <p>Crunching and Making Sense of the Data</p>
            </div>
          </div>
          <div class="System-col System-col--machine System-col--z1 js-breakpoint">
            <div class="System-frame">
              <div class="js-machine">
                ${this.numbers.render()}
              </div>
              <div class="js-visualization"></div>
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

          <div class="System-col">
            <div class="Text Text--lg">
              <p>Visualize and Find a Meaninful Context</p>
            </div>
          </div>
          <div class="System-col System-col--machine System-col--z1">

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
        </div>
      </div>
    `
  }
}
