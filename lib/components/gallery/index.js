const html = require('choo/html')
const Component = require('nanocomponent')
const BubbleChart = require('../bubble-chart')
const Thermometer = require('../thermometer')
const { distance, text } = require('../base')
const LineChart = require('../line-chart')
const icons = require('../icon')

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
    if (!this.state.data.location) this.emitter.emit('location:fetch')
    if (!this.state.data.cities) this.emitter.emit('cities:fetch')
  }

  update () {
    if (!this.initialized) {
      if (!this.state.data.location || !this.state.data.cities) return false

      this.initialized = true

      const { longitude, latitude } = this.state.data.location
      const location = [longitude, latitude]
      const cities = Object.keys(this.state.data.cities)
      const closest = cities.map(key => {
        const city = this.state.data.cities[key]
        return {
          city: key,
          distance: distance(location, [city.center_long, city.center_lat])
        }
      }).sort(function (a, b) {
        return a > b ? 1 : -1
      })[0]

      const city = this.city = closest.city
      this.summary = new BubbleChart({auto: true, city: city})
      this.thermometer = new Thermometer({auto: true, city: city})
      this.humidity = new LineChart({auto: true, type: 'humidity', city: city})

      return true
    }

    return false
  }

  createElement () {
    return html`
      <div class="Gallery">
        <div class="View-container">
          <div class="Gallery-prequel">
            <p class="Gallery-prequelText">This is how we do it.</p>
          </div>
          <div class="Gallery-intro">
            <div class="Gallery-live"></div>
            <div class="Text">
              <p class="Text-label">${this.city || text`Loading`}</p>
              <h2 class="Text-story4">We are always live</h2>
            </div>
          </div>
          <div class="Gallery-grid">
            <div class="Gallery-cell">
              <div class="Gallery-content">
                <div class="Gallery-icon">${icons.location()}</div>
                ${this.initialized ? this.summary.render() : BubbleChart.loading()}
                <div class="Gallery-description">
                  <h3 class="Gallery-heading">Summary</h3>
                  ${this.city ? html`<p class="Gallery-text">This is a summary of the different datasets in ${this.city} right now</p>` : null}
                </div>
              </div>
            </div>
            <div class="Gallery-cell">
              <div class="Gallery-content">
                <div class="Gallery-icon">${icons.temperature()}</div>
                ${this.initialized ? this.thermometer.render() : Thermometer.loading()}
                <div class="Gallery-description">
                  <h3 class="Gallery-heading">Temperature</h3>
                  <p class="Gallery-text">This data set meassures how cold or hot is it outside today</p>
                </div>
              </div>
            </div>
            <div class="Gallery-cell">
              <div class="Gallery-content">
                <div class="Gallery-icon">${icons.humidity()}</div>
                ${this.initialized ? this.humidity.render() : LineChart.loading()}
                <div class="Gallery-description">
                  <h3 class="Gallery-heading">Humidity</h3>
                  <p class="Gallery-text">This data set meassures how much moisture is in the air</p>
                </div>
              </div>
            </div>
            <div class="Gallery-cell">
              <article class="Gallery-content Gallery-content--accent">
                <div class="Gallery-contentWrap">
                  <div class="Gallery-icon">${icons.chart()}</div>
                  <div class="Text">
                    <h3 class="Text-h4">We're measuring more than 30 different data sets</h3>
                    <p>Morbi lorem mauris, bibendum ut laoreet ac, placerat id mi. Proin laoreet, sapien in molestie finibus, lorem ipsum feugiat lectus, vel fringilla nunc.</p>
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
