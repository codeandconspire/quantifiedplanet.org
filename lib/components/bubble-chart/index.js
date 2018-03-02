const assert = require('assert')
const html = require('choo/html')
const nanoraf = require('nanoraf')
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

    if (typeof opts.auto !== 'undefined' && opts.auto) {
      this.load = () => this.init()
    }
  }

  update () {
    return false
  }

  init (city) {
    if (city) {
      this.city = city
      delete this.data
      this.rerender()
      this.onresize()
    }

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
            throw new Error((data && data.error) || 'Could not reach the API')
          }
          if (!Object.keys(UNITS).find(type => data.payload[type])) {
            throw new Error('Data missing')
          }

          this.data = data.payload
          this.rerender()
          this.onresize()
        })
      }).catch(err => {
        this.error = err
        this.rerender()
        this.onresize()
      })
    }

    this.bubbles = [...this.element.querySelectorAll('.js-bubble')]
    console.log(this.element.querySelectorAll('.js-bubble'))

    if (this.element) {
      this.bubbles = [...this.element.querySelectorAll('.js-bubble')]

      this.onresize = nanoraf(() => {
        const bubbles = [...this.element.querySelectorAll('.js-bubble')]
        this.element.style.width = `${this.element.offsetHeight}px`
        bubbles.forEach((bubble) => {
          bubble.style.width = `${bubble.offsetWidth}px`
          bubble.style.height = `${bubble.offsetWidth}px`
          bubble.style.visibility = 'visible'
        })
      })
      window.addEventListener('resize', this, {passive: true})
      this.onresize()
    }
  }

  unload () {
    this.bubbles = [...this.element.querySelectorAll('.js-bubble')]
    window.removeEventListener('resize', this)
  }

  handleEvent (event) {
    if (this['on' + event.type]) this['on' + event.type](event)
  }

  createElement () {
    if (this.error) return BubbleChart.error(this.error)
    if (!this.data) return BubbleChart.loading()

    const types = Object.keys(this.data).filter(key => {
      return this.data[key] !== null && UNITS[key]
    })

    return html`
      <div class="BubbleChart" style="${this.element ? `width: ${this.element.offsetHeight}px` : null}">
        ${types.map(type => html`
          <div class="BubbleChart-bubble js-bubble">
            <div class="BubbleChart-body">
              <div class="BubbleChart-value">${this.data[type].toFixed(0)}${UNITS[type]}</div>
              <div class="BubbleChart-name">${text(DESCRIPTIONS[type])}</div>
            </div>
          </div>
        `)}
      </div>
    `
  }

  static loading () {
    return html`
      <div class="BubbleChart is-loading">
        <div class="Gallery-spinner"></div>
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
