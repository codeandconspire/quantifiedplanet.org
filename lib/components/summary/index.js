const html = require('choo/html')
const nanoraf = require('nanoraf')
const Component = require('nanocomponent')
const { modulate, vh } = require('../base')

module.exports = class Goals extends Component {
  constructor (emitter) {
    super('summary')
    emitter.on('inview', inview => {
      if (inview) window.addEventListener('scroll', this)
      else window.removeEventListener('scroll', this)
    })
  }

  handleEvent (event) {
    if (this['on' + event.type]) this['on' + event.type](event)
  }

  onscroll (event) {
    const scroll = window.scrollY
    const top = this.summary.offsetTop - this.vh
    const stop = this.vh * 0.5
    const minMax = [0, this.width - this.knobSize + 4]
    const offset = top + this.knobSize

    console.log(top, scroll)

    const translate = [
      modulate(scroll, [offset, offset + stop], minMax, true),
      modulate(scroll, [offset + (this.height * 0.2), offset + (this.height * 0.2) + stop], minMax, true),
      modulate(scroll, [offset + (this.height * 0.4), offset + (this.height * 0.4) + stop], minMax, true),
      modulate(scroll, [offset + (this.height * 0.6), offset + (this.height * 0.6) + stop], minMax, true)
    ]

    this.knob1.style.transform = `translateX(${translate[0].toFixed(1)}px)`
    this.knob2.style.transform = `translateX(${translate[1].toFixed(1)}px)`
    this.knob3.style.transform = `translateX(${translate[2].toFixed(1)}px)`
    this.knob4.style.transform = `translateX(${translate[3].toFixed(1)}px)`
  }

  load () {
    this.onscroll = nanoraf(this.onscroll.bind(this))
    this.summary = this.element.querySelector('.js-summary')
    this.knob1 = this.element.querySelector('.js-knob1')
    this.knob2 = this.element.querySelector('.js-knob2')
    this.knob3 = this.element.querySelector('.js-knob3')
    this.knob4 = this.element.querySelector('.js-knob4')
    this.width = this.summary.offsetWidth
    this.height = this.summary.offsetHeight
    this.knobSize = this.knob1.offsetWidth
    this.vh = vh()
  }

  update () {
    return false
  }

  createElement () {
    return html`
      <div class="View-container">
        <div class="Story-block">
          <div class="Story-copy">
            <div class="Text">
              <h2 class="Text-story2">Quantified Planet is a non-profit organization passionate about open real time data.</h2>
              <p class="Text-story">We believe that the power of real time data about the health of people, cities and our planet can contribute to a sustainable and resilient planet for the benefit of humanity.</p>
            </div>
          </div>
        </div>

        <div class="Summary js-summary">
          <div class="Summary-bar js-bar"><div class="Summary-knob js-knob1"></div></div>
          <div class="Summary-bar"><div class="Summary-knob js-knob2"></div></div>
          <div class="Summary-bar"><div class="Summary-knob js-knob3"></div></div>
          <div class="Summary-bar"><div class="Summary-knob js-knob4"></div></div>
        </div>

        <div class="Story-block Story-block--end">
          <div class="Story-copy">
            <div class="Text">
              <h2 class="Text-story2">Quantified Planet is a non-profit organization passionate about open real time data.</h2>
              <p class="Text-story Text-story--end">We believe that the power of real time data about the health of people, cities and our planet can contribute to a sustainable and resilient planet for the benefit of humanity.</p>
            </div>
          </div>
        </div>
      </div>
    `
  }
}
