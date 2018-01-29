const html = require('choo/html')
const nanoraf = require('nanoraf')
const Component = require('nanocomponent')
const { modulate, vh } = require('../base')

module.exports = class Goals extends Component {
  constructor (emitter) {
    super('system')
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
    const top = this.element.offsetTop
    const translate = modulate(scroll, [top, top + (vh() / 2)], [-20, -50], false)
    this.goal11.style.transform = `translateY(${translate.toFixed(2)}%)`
    this.goal15.style.transform = `translateY(${translate.toFixed(2)}%)`
  }

  load () {
    this.onscroll = nanoraf(this.onscroll.bind(this))
    this.goal11 = this.element.querySelector('.js-goal11')
    this.goal13 = this.element.querySelector('.js-goal13')
    this.goal15 = this.element.querySelector('.js-goal15')
  }

  update () {
    return false
  }

  createElement () {
    return html`
      <div class="Goals">
        <div class="Goals-grid">
          <img class="Goals-item Goals-item--11 js-goal11" src="/goal-11.svg" width="188" height="188" alt="The Goal 11 icon" />
          <img class="Goals-item Goals-item--13 js-goal13" src="/goal-13.svg" width="188" height="188" alt="The Goal 13 icon" />
          <img class="Goals-item Goals-item--15 js-goal15" src="/goal-15.svg" width="188" height="188" alt="The Goal 15 icon" />
        </div>

        <div class="View-container">

          <img class="Goals-logo" src="/global-goals.svg" width="121" height="121" alt="The Global Goals" />

          <div class="Text">
            <h2 class="Text-story2">We’re doing everything we can to help reach the Global Goals</h2>
            <p>We believe that the power of real time data about the health of people, cities and our planet can contribute to a sustainable and resilient planet for the benefit of humanity.</p>
          </div>
        </div>
      </div>
    `
  }
}
