const html = require('choo/html')
const nanoraf = require('nanoraf')
const nanobus = require('nanobus')
const Component = require('nanocomponent')
const asElement = require('prismic-element')
const { asText } = require('prismic-richtext')
const System = require('../system')
const Goals = require('../goals')
const { vw, vh, modulate } = require('../base')

module.exports = class Story extends Component {
  constructor (id) {
    super(id)

    this.state = {}
    this.sections = [ System, Goals ].map((Section, index) => {
      const emitter = nanobus()
      const section = {
        inview: false,
        emitter: emitter,
        component: new Section(emitter)
      }
      emitter.on('inview', inview => {
        section.inview = inview
      })
      return section
    })
  }

  static id (doc) {
    return `story-${doc.id}`
  }

  update (doc) {
    return Story.id(doc) !== this._name
  }

  load (doc) {
    this.overlay = this.element.querySelector('.js-overlay')
    this.blueprint = this.element.querySelector('.js-blueprint')
    this.intro = this.element.querySelector('.js-intro')
    this.fade = this.element.querySelector('.js-fade')
    this.content = this.element.querySelector('.js-content')

    this.onresize() // read initial dimensions
    this.onscroll = nanoraf(this.onscroll.bind(this))
    this.onresize = nanoraf(this.onresize.bind(this))

    window.addEventListener('scroll', this, {passive: true})
    window.addEventListener('resize', this, {passive: true})
  }

  unload () {
    window.removeEventListener('scroll', this)
    window.removeEventListener('resize', this)
    this.sections.forEach(section => section.emitter.emit('inview', false))
  }

  handleEvent (event) {
    if (this['on' + event.type]) this['on' + event.type](event)
  }

  onresize () {
    const width = vw()
    const height = vh()
    const isLandscape = width > height

    this.dimensions = { width, height, isLandscape }
    this.content.style.paddingTop = `${(isLandscape ? width : height) * 2.1}px`
    this.sections.forEach(section => {
      section.top = section.component.element.offsetTop
      section.height = section.component.element.offsetHeight
    })

    this.onscroll()
  }

  onscroll (event) {
    const scroll = window.scrollY
    const { width, height, isLandscape } = this.dimensions

    if (scroll < width) {
      const offset = modulate(scroll, [0, width], [width, 0], true)
      const value = isLandscape ? (height * 2) : (height * 2)
      const intro = modulate(scroll, [value, 0], [-50, 0], true)

      this.overlay.style.transform = `translateX(${(width - offset.toFixed(1)) * -1}px)`
      this.blueprint.style.transform = `translateX(${width - offset.toFixed(1)}px)`
      this.intro.style.transform = `translateY(${intro.toFixed(1)}px)`
      this.intro.style.display = ''
      this.fade.style.opacity = 0
    } else if (scroll < (width + (height / 3))) {
      const fade = modulate(scroll, [(width + (height / 3)), width], [1, 0], true)
      this.intro.style.display = ''
      this.fade.style.opacity = fade.toFixed(2)
    } else {
      this.intro.style.display = 'none'
      this.fade.style.opacity = 0
    }

    for (let i = 0, len = this.sections.length; i < len; i++) {
      const section = this.sections[i]
      const inview = (
        ((section.top) < (scroll + (isLandscape ? width : height))) &&
        ((section.top + section.height) > scroll)
      )
      if (inview !== section.inview) section.emitter.emit('inview', inview)
    }
  }

  createElement (doc) {
    return html`
      <div class="Story" id="${this._name}">
        <div class="Story-intro js-intro" id="${this._name}-intro">

          <video class="Story-planet" src="/out.webm" preload="metadata" role="presentation" autoplay playsinline muted loop></video>

          <div class="Story-body">
            <div class="Text">
              <h1 class="Text-story1">${asText(doc.data.title)}</h1>
              <div class="Text-story3">${asElement(doc.data.description)}</div>
            </div>
          </div>

          <div class="Story-overlay js-overlay">
            <div class="Story-blueprint js-blueprint"></div>
          </div>

          <div class="Story-fade js-fade"></div>
        </div>

        <div class="Story-content js-content">
          ${this.sections.map(section => section.component.render())}


          <div class="Story-block Story-block--dark">
            <div class="View-container">
              <img class="Story-logo" src="/global-goals.svg" width="121" height="121" alt="The Global Goals" />
              <div class="Text">
                <h2 class="Text-story2">We’re doing everything we can to help reach the Global Goals</h2>
                <p>We believe that the power of real time data about the health of people, cities and our planet can contribute to a sustainable and resilient planet for the benefit of humanity.</p>
              </div>
            </div>
          </div>

          <div class="Story-block">
            <div class="View-container">
              <div class="Text">
                <h2 class="Text-story2">Quantified Planet is a non-profit organization passionate about open real time data.</h2>
                <p>We believe that the power of real time data about the health of people, cities and our planet can contribute to a sustainable and resilient planet for the benefit of humanity.</p>
              </div>
            </div>
          </div>

          <div class="Story-steps">
            <div class="Story-step Story-step--1">Thing</div>
          </div>

          <div class="Story-block">
            <div class="View-container">
              <div class="Text">
                <h2 class="Text-story2">Quantified Planet is a non-profit organization passionate about open real time data.</h2>
                <p>We believe that the power of real time data about the health of people, cities and our planet can contribute to a sustainable and resilient planet for the benefit of humanity.</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    `
  }
}
