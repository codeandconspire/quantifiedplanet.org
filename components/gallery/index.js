const html = require('choo/html')
const Component = require('choo/component')
const BubbleChart = require('../bubble-chart')
const Thermometer = require('../thermometer')
const { distance } = require('../base')
const LineChart = require('../line-chart')
const Period = require('./period')
const Clock = require('./clock')
const icons = require('../icon')

const CITIES = [
  'Amsterdam',
  'Berlin',
  'Edinburgh',
  'Göteborg',
  'London',
  'Malmö',
  'New York',
  'San Francisco',
  'Stockholm'
]

module.exports = class Gallery extends Component {
  constructor (emitter, state, extended = false) {
    super('gallery')

    this.state = state
    this.cache = state.cache
    this.emitter = emitter
    this.extended = extended

    let initializing = false
    this.initialized = false

    if (this.emitter) {
      emitter.on('inview', inview => {
        if (!initializing) {
          initializing = true
          this.init()
        }
      })
    } else {
      initializing = true
      this.load = this.init
    }
  }

  init () {
    const data = this.state.data

    if (this.emitter) {
      if (!data.cities) this.emitter.emit('cities:fetch')
      if (!data.location && !data.error) this.emitter.emit('location:fetch')
    }

    if (data.cities && (data.location || data.error)) {
      this.initialized = true
      let city
      if (data.error) {
        city = 'Stockholm'
      } else {
        const [ latitude, longitude ] = data.location.ll
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
      this.wind = new LineChart({auto: true, type: 'wind_strength', city: city})
      this.pressure = new LineChart({auto: true, type: 'pressure', city: city})
      this.uv = new LineChart({auto: true, type: 'uv', city: city})

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

  cell (props) {
    return html`
      <div class="Gallery-cell">
        <div class="Gallery-content">
          <div class="Gallery-header">
            ${icons[props.icon]({className: 'Gallery-icon'})}
            ${props.control.render()}
          </div>
          ${this.initialized ? this[props.set].render() : props.component.loading()}
          <div class="Gallery-description">
            <h3 class="Gallery-heading">${props.heading}</h3>
            <p class="Gallery-text">${props.body}</p>
          </div>
        </div>
      </div>
    `
  }

  createElement () {
    const setCity = event => {
      const city = event.currentTarget.name
      this.city = city
      this.summary.init(city)
      this.thermometer.init(city)
      this.humidity.init(city)
      this.wind.init(city)
      this.pressure.init(city)
      this.uv.init(city)
      this.rerender()
    }

    const setPeriod = key => period => {
      if (!this[key]) return
      this[key].setPeriod(period)
    }

    return html`
      <div class="Gallery">
        <div class="View-container">
          ${this.extended ? html`
            <div class="Gallery-city">
              ${this.city ? CITIES.map(city => html`
                <button class="Gallery-option" disabled=${this.city === city} name="${city}" onclick=${setCity}>
                  ${this.city === city ? html`
                    <svg class="Gallery-check" width="17" height="11" viewBox="0 0 17 11"><path fill="#FFF" fill-rule="evenodd" d="M6.5 11l-.1-.2L.9 5.4 2.3 4l4.2 4.2L14.7 0l1.4 1.4-9.5 9.4v.2h-.1z"/></svg>
                  ` : null}
                  ${city}
                </button>
              `) : '···'}
            </div>
          ` : html`
            <div>
              <div class="Gallery-prequel">
                <p class="Gallery-prequelText">Let's see it in action.</p>
              </div>
              <div class="Gallery-intro">
                <div class="Gallery-live"></div>
                <div class="Text">
                  <p class="Text-label">${this.city || '···'}</p>
                  <h2 class="Text-story4">We are always live</h2>
                </div>
              </div>
            </div>
          `}

          ${this.extended ? html`
            <div class="Gallery-grid">
              ${this.cell({
                set: 'summary',
                icon: 'location',
                control: this.cache(Clock, 'extended-summary'),
                component: BubbleChart,
                heading: 'Summary',
                body: this.city ? `The current set of a few different datasets in ${this.city} right now.` : '···'
              })}
              ${this.cell({
                set: 'wind',
                icon: 'wind',
                control: this.cache(Period, 'extended-wind', setPeriod('wind')),
                component: LineChart,
                heading: 'Wind Speed',
                body: 'The speed and velocity of the wind (metre per second) over time.'
              })}
              ${this.cell({
                set: 'pressure',
                icon: 'temperature',
                control: this.cache(Period, 'extended-pressure', setPeriod('pressure')),
                component: LineChart,
                heading: 'Air Pressure',
                body: this.city ? `The atmospheric pressure (hectopascal) in ${this.city} over time.` : '···'
              })}
              ${this.cell({
                set: 'thermometer',
                icon: 'temperature',
                control: this.cache(Clock, 'extended-temperature'),
                component: Thermometer,
                heading: 'Air Temperature',
                body: 'The current temperature (celsius) of the outdoor air. The circle indicates the temperature relative to the past 7 days.'
              })}
              ${this.cell({
                set: 'uv',
                icon: 'temperature',
                control: this.cache(Period, 'extended-uv', setPeriod('uv')),
                component: LineChart,
                heading: 'Ultra Violet Beams',
                body: 'The percentage of ultra violet (UV) sun beams to reach the ground, over time.'
              })}
              ${this.cell({
                set: 'humidity',
                icon: 'humidity',
                control: this.cache(Period, 'extended-humidity', setPeriod('humidity')),
                component: LineChart,
                heading: 'Humidity',
                body: 'The amount of water vapor in the air over time. At 100%, the air is incapable of holding any more water.'
              })}
            </div>
          ` : html`
            <div class="Gallery-grid">
              ${this.cell({
                set: 'summary',
                icon: 'location',
                control: this.cache(Clock, 'summary'),
                component: BubbleChart,
                heading: 'Summary',
                body: this.city ? `The current set of a few different datasets in ${this.city} right now.` : '···'
              })}
              ${this.cell({
                set: 'thermometer',
                icon: 'temperature',
                control: this.cache(Clock, 'thermometer'),
                component: Thermometer,
                heading: 'Air Temperature',
                body: 'The current temperature (celsius) of the outdoor air. The circle indicates the temperature relative to the past 7 days.'
              })}
              ${this.cell({
                set: 'humidity',
                icon: 'humidity',
                control: this.cache(Period, 'extended-humidity', setPeriod('humidity')),
                component: LineChart,
                heading: 'Humidity',
                body: 'The amount of water vapor in the air over time. At 100%, the air is incapable of holding any more water.'
              })}

              <div class="Gallery-cell">
                <div class="Gallery-content Gallery-content--accent">
                  <div class="Gallery-contentWrap">
                    ${icons.chart({className: 'Gallery-icon'})}
                    <div class="Text">
                      <h3 class="Text-story5">We're measuring hyper local data in cities all over the world</h3>
                      <p>Contantly adding more sensors and working on new and exciting ways to explore the data.</p>
                    </div>
                    <a class="Gallery-button" href="/explorer">Planet Explorer</a>
                  </div>
                </div>
              </div>
            </div>
          `}
        </div>
      </div>
    `
  }
}
