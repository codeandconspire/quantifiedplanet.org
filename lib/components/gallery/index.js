const html = require('choo/html')
const Component = require('nanocomponent')
const BubbleChart = require('../bubble-chart')
const Thermometer = require('../thermometer')
const { distance } = require('../base')
const LineChart = require('../line-chart')
const icons = require('../icon')

const CITIES = [
  'Stockholm',
  'Linköping'
]

module.exports = class Gallery extends Component {
  constructor (emitter, state) {
    super('gallery')

    this.state = state
    this.emitter = emitter

    let initializing = false
    this.initialized = false
    emitter.on('inview', inview => {
      if (!initializing) {
        initializing = true
        this.init()
      }
    })
  }

  init () {
    const data = this.state.data

    if (!data.cities) this.emitter.emit('cities:fetch')
    if (!data.location && !data.error) this.emitter.emit('location:fetch')
    if (data.cities && (data.location || data.error)) {
      this.initialized = true

      let city
      if (data.error) {
        city = 'Stockholm'
      } else {
        const { longitude, latitude } = data.location
        const location = [longitude, latitude]
        const closest = CITIES.map(key => {
          const city = data.cities[key]
          return {
            city: key,
            distance: distance(location, [city.center_long, city.center_lat])
          }
        }).sort(function (a, b) {
          return a.distance > b.distance ? 1 : -1
        })[0]
        city = closest.city
      }

      this.city = city
      this.summary = new BubbleChart({auto: true, city: city})
      this.thermometer = new Thermometer({auto: true, city: city})
      this.humidity = new LineChart({auto: true, type: 'humidity', city: city})

      this.rerender()
    }
  }

  update () {
    const data = this.state.data
    if (!this.initialized) {
      if ((data.location || data.error) && data.cities) this.init()
    }
    return false
  }

  createElement () {
    const setCity = event => {
      const city = event.currentTarget.name
      this.city = city
      this.summary.init(city)
      this.thermometer.init(city)
      this.humidity.init(city)
      this.rerender()
    }

    return html`
      <div class="Gallery">
        <div class="View-container">
          <div class="Gallery-prequel">
            <p class="Gallery-prequelText">Let's see it in action.</p>
          </div>
          <div class="Gallery-intro" id="data-explorer">
            <div class="Gallery-live"></div>
            <div class="Text">
              <p class="Text-label">
                ${this.city ? CITIES.map(city => html`
                  <button class="Gallery-button" disabled=${this.city === city} name="${city}" onclick=${setCity}>${city}</button>
                `) : '···'}
              </p>
              <h2 class="Text-story4">We are always live</h2>
            </div>
          </div>
          <div class="Gallery-grid">
            <div class="Gallery-cell">
              <div class="Gallery-content">
                ${icons.location({className: 'Gallery-icon'})}
                ${this.initialized ? this.summary.render() : BubbleChart.loading()}
                <div class="Gallery-description">
                  <h3 class="Gallery-heading">Summary</h3>
                  ${this.city ? html`<p class="Gallery-text">This is a summary of the different datasets in ${this.city} right now</p>` : null}
                </div>
              </div>
            </div>
            <div class="Gallery-cell">
              <div class="Gallery-content">
                ${icons.temperature({className: 'Gallery-icon'})}
                ${this.initialized ? this.thermometer.render() : Thermometer.loading()}
                <div class="Gallery-description">
                  <h3 class="Gallery-heading">Temperature</h3>
                  <p class="Gallery-text">This data set measures how cold or hot is it outside today</p>
                </div>
              </div>
            </div>
            <div class="Gallery-cell">
              <div class="Gallery-content">
                ${icons.humidity({className: 'Gallery-icon'})}
                ${this.initialized ? this.humidity.render() : LineChart.loading()}
                <div class="Gallery-description">
                  <h3 class="Gallery-heading">Humidity</h3>
                  <p class="Gallery-text">This data set measures how much moisture is in the air</p>
                </div>
              </div>
            </div>
            <div class="Gallery-cell">
              <article class="Gallery-content Gallery-content--accent">
                <div class="Gallery-contentWrap">
                  ${icons.chart({className: 'Gallery-icon'})}
                  <div class="Text">
                    <h3 class="Text-story5">We're measuring more than 30 different data sets</h3>
                    <p>Contantly adding more sensors, and are working on an exciting new data explorer.</p>
                  </div>
                  <a class="Gallery-button" href="mailto:info@quantifiedplanet.org?subject=Data explorer access">Request early access</a>
                </div>
              </article>
            </div>
          </div>
        </div>
      </div>
    `
  }
}
