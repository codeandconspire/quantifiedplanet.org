const html = require('choo/html')
const nanoraf = require('nanoraf')
const Component = require('nanocomponent')
const { modulate, vh, vw } = require('../base')

module.exports = class Goals extends Component {
  constructor (emitter) {
    super('goals')

    if (typeof window !== 'undefined') {
      this.onresize = nanoraf(() => {
        this.vh = vh()
        this.vw = vw()
        this.height = this.goals.offsetHeight
        this.top = this.goals.offsetTop
        this.sm = this.vw < 768
        this.md = this.vw >= 768 && this.vw < 1024
        this.lg = this.vw >= 1024 && this.vw < 1280
        this.xl = this.vw >= 1280
      })

      emitter.on('inview', inview => {
        if (inview) window.addEventListener('scroll', this, {passive: true})
        else window.removeEventListener('scroll', this)

        if (inview) window.addEventListener('resize', this)
        else window.removeEventListener('resize', this)
      })
    }
  }

  onscroll (event) {
    const scroll = window.scrollY

    const start = this.top - this.vh
    const stop = start + this.vh + this.height
    let range = [50, -50]

    if (this.md) {
      range = [50, -280]
    }

    if (this.lg || this.xl) {
      const amount = this.xl ? 100 : 50
      const px1 = modulate(scroll, [start, stop], [0, amount], true)
      const px2 = modulate(scroll, [start, stop], [0, amount], true)

      this.goal11.style.transform = `translateY(${px1.toFixed(1)}px)`
      this.goal15.style.transform = `translateY(-${px2.toFixed(1)}px)`
    } else {
      const px = modulate(scroll, [start, stop], range, true)
      this.goal11.style.transform = `translateY(${px.toFixed(1)}px)`
      this.goal15.style.transform = `translateY(${px.toFixed(1)}px)`
    }
  }

  load (element) {
    this.onscroll = nanoraf(this.onscroll.bind(this))
    this.goals = element.querySelector('.js-goals')
    this.goal11 = element.querySelector('.js-goal11')
    this.goal13 = element.querySelector('.js-goal13')
    this.goal15 = element.querySelector('.js-goal15')
    this.onresize() // read initial dimensions
  }

  handleEvent (event) {
    if (this['on' + event.type]) this['on' + event.type](event)
  }

  update () {
    return false
  }

  createElement () {
    return html`
      <div>
        <div class="Goals js-goals">
          <div class="Goals-item Goals-item--11 js-goal11">
            <img class="Goals-icon" src="/goal-11.svg" width="188" height="188" alt="The Goal 11 icon" />
            <h2 class="u-hiddenVisually"></h2>
            <p class="Goal-desc">Make cities and human settlements inclusive, safe, resilient and sustainable.</p>
          </div>
          <div class="Goals-item Goals-item--13 js-goal13">
            <img class="Goals-icon" src="/goal-13.svg" width="188" height="188" alt="The Goal 13 icon" />
            <h2 class="u-hiddenVisually"></h2>
            <p class="Goal-desc">Take urgent action to combat climate change and its impacts.</p>
          </div>
          <div class="Goals-item Goals-item--15 js-goal15">
            <img class="Goals-icon" src="/goal-15.svg" width="188" height="188" alt="The Goal 15 icon" />
            <h2 class="u-hiddenVisually"></h2>
            <p class="Goal-desc">Protect, restore and promote sustainable use of terrestrial ecosystems, sustainably manage forests, combat desertification, and halt and reverse land degradation and halt biodiversity loss.</p>
          </div>
        </div>
        <div class="Story-block Story-block--dark">
          <div class="View-container">
            <div class="Story-copy">
              <img class="Story-logo" src="/global-goals.svg" width="121" height="121" alt="The Global Goals" />
              <div class="Text">
                <h2 class="Text-story2 Text-story2--center">We’re doing everything we can to help reach the Global Goals</h2>
                <p class="Text-story Text-story--center">We believe that the power of real time data about the health of people, cities and our planet can contribute to a sustainable and resilient planet for the benefit of humanity.</p>
              </div>
            </div>
            <a class="Story-link" href="/global-goals">Our work for the Global Goals</a>
          </div>
        </div>
      </div>
    `
  }
}
