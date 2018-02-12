const html = require('choo/html')
const { asText } = require('prismic-richtext')
const nanoraf = require('nanoraf')
const Component = require('nanocomponent')
const { modulate, vh } = require('../base')

module.exports = class Goals extends Component {
  constructor (emitter) {
    super('summary')

    if (typeof window !== 'undefined') {
      this.onresize = nanoraf(() => {
        this.vh = vh()
        this.knobSize = this.bars[0].querySelector('.js-knob').offsetWidth
        this.top = this.element.offsetTop
        this.width = this.bars[0].offsetWidth
      })

      emitter.on('inview', inview => {
        if (inview) window.addEventListener('scroll', this, {passive: true})
        else window.removeEventListener('scroll', this)

        if (inview) {
          window.addEventListener('resize', this, {passive: true})
          this.onresize()
        } else {
          window.removeEventListener('resize', this)
        }
      })
    }
  }

  handleEvent (event) {
    if (this['on' + event.type]) this['on' + event.type](event)
  }

  onscroll (event) {
    const scroll = window.scrollY

    this.bars.forEach((bar, index) => {
      const start = bar.offsetTop - this.vh - this.knobSize - 20
      const stop = start + (this.vh * 0.8)
      const range = [0, this.width - this.knobSize + 4]
      const px = modulate(scroll, [start, stop], range, true)
      bar.querySelector('.js-knob').style.transform = `translateX(${px.toFixed(1)}px)`
    })
  }

  load () {
    this.onscroll = nanoraf(this.onscroll.bind(this))
    this.bars = [...this.element.querySelectorAll('.js-bar')]
    this.onresize() // read initial dimensions
  }

  update () {
    return false
  }

  createElement (doc) {
    return html`
      <div class="View-container">
        <div class="Story-block Story-block--first">
          <div class="Story-copy">
            <div class="Text">
              <h2 class="Text-story2">${asText(doc.data.products_title).trim()}</h2>
              <p class="Text-story">${asText(doc.data.products_body).trim()}</p>
            </div>
          </div>
          <a class="Story-link" href="/products">${doc.data.products_link_text}</a>
        </div>

        <div class="Summary js-summary">
          <div class="Summary-bar js-bar"><div class="Summary-knob js-knob"></div></div>
          <div class="Summary-bar js-bar"><div class="Summary-knob js-knob"></div></div>
          <div class="Summary-bar js-bar"><div class="Summary-knob js-knob"></div></div>
          <div class="Summary-bar js-bar"><div class="Summary-knob js-knob"></div></div>
        </div>

        <div class="Story-block Story-block--end">
          <div class="Story-copy">
            <div class="Text">
              <h2 class="Text-story2">${asText(doc.data.markets_title).trim()}</h2>
              <p class="Text-story Text-story--end">${asText(doc.data.markets_body).trim()}</p>
            </div>
          </div>
          <a class="Story-link" href="/markets">${doc.data.markets_link_text}</a>
        </div>
      </div>
    `
  }
}
