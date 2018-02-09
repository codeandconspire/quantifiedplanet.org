const assert = require('assert')
const html = require('choo/html')
const Component = require('nanocomponent')
const { text } = require('../base')

const UNITS = {
  humidity: '%',
  no2: ' ppb',
  pm10: ' μg/m3',
  wind_strength: ' m/s',
  pressure: ' hPa'
}

const DESCRIPTIONS = {
  humidity: 'Humidity',
  no2: 'Pollution gas',
  pm10: 'Air particles',
  wind_strength: 'Wind',
  pressure: 'Air pressure'
}

module.exports = class BubbleChart extends Component {
  constructor (opts) {
    assert(typeof opts === 'object', 'SummaryChart: opts should be an object')
    assert(typeof opts.city === 'string', 'SummaryChart: opts.city should be a string')

    super(`summary-chart-${(new Date() % 9e6).toString(36)}`)

    this.data = null
    this.error = null
    Object.assign(this, opts)

    if (typeof opts.auto !== 'undefined' && opts.auto) this.load = this.init
  }

  update () {
    return false
  }

  init () {
    if (!this.data) {
      window.fetch([
        'https://foobar.quantifiedplanet.org/api/?target=getCity',
        `city=${this.city}`,
        `start=${(new Date(Date.now() - 1000 * 60 * 60 * 24)).toJSON()}`,
        `end=${(new Date()).toJSON()}`,
        `apitoken=59dfa2d0-7e84-4158-801f-6bc4c72ce77e`
      ].join('&')).then(response => {
        return response.json().then(data => {
          if (response.status !== 200 || data.status !== 'SUCCESS') {
            throw new Error((data && data.error) || text`Could not reach the API`)
          }
          this.data = data.payload
          this.rerender()
        })
      }).catch(err => {
        this.error = err
        this.rerender()
      })
    }
  }

  createElement () {
    if (this.error) return BubbleChart.error(this.error)
    if (!this.data) return BubbleChart.loading()

    const types = Object.keys(this.data).filter(key => {
      return this.data[key] !== null && UNITS[key]
    })

    return html`
      <div class="BubbleChart">
        <div class="BubbleChart-canvas">
          <svg class="BubbleChart-box" width="100" height="100" viewBox="0 0 100 100"></svg>
          <div class="BubbleChart-wrapper">
            ${types.map(type => html`
              <div class="BubbleChart-bubble">
                <div>
                  <div class="BubbleChart-value">${this.data[type].toFixed(0)}${UNITS[type]}</div>
                  <div class="BubbleChart-name">${text(DESCRIPTIONS[type])}</div>
                </div>
              </div>
            `)}
          </div>
        </div>
      </div>
    `
  }

  static loading () {
    return html`
      <div class="BubbleChart is-loading">
        ${text`Loading`}
      </div>
    `
  }

  static error (err) {
    return html`
      <div class="BubbleChart has-error">
        ${text`Something went wrong`}
        ${process.env.NODE_ENV === 'development' ? html`
          <pre>${err.stack}</pre>
        ` : null}
      </div>
    `
  }
}
