const assert = require('assert')
const html = require('choo/html')
const Component = require('nanocomponent')
const { text } = require('../base')

module.exports = class Thermometer extends Component {
  constructor (opts) {
    assert(typeof opts === 'object', 'Thermometer: opts should be an object')
    assert(typeof opts.city === 'string', 'Thermometer: opts.city should be a string')

    super(`thermometer-${(new Date() % 9e6).toString(36)}`)

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
    }

    if (!this.data) {
      window.fetch([
        'https://foobar.quantifiedplanet.org/api/?target=getAllMedianValuesForCity',
        `metric=temperature`,
        `city=${this.city}`,
        `start=${(new Date(Date.now() - 1000 * 60 * 60 * 24)).toJSON()}`,
        `end=${(new Date()).toJSON()}`,
        `apitoken=59dfa2d0-7e84-4158-801f-6bc4c72ce77e`
      ].join('&')).then(response => {
        return response.json().then(data => {
          if (response.status !== 200 || data.status !== 'SUCCESS') {
            throw new Error((data && data.error) || 'Could not reach the API')
          }
          if (!data.payload.find(value => value !== null)) {
            throw new Error('Temporary issue loading data')
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
    if (this.error) return Thermometer.error(this.error)
    if (!this.data) return Thermometer.loading()

    let min = 0
    let max = 0
    let latest = 0

    for (let i = 0, len = this.data.length; i < len; i++) {
      // ignore bad values
      if (this.data[i] && !this.data[i].message) {
        if (!max || this.data[i] > max) max = this.data[i]
        if (!min || this.data[i] < min) min = this.data[i]
        if (!latest && this.data[i]) latest = this.data[i]
      }
    }

    // show an error if all datapoints seem bad
    if (min === 0 && max === 0 && latest === 0) {
      return Thermometer.error('Temporary issue loading data')
    }

    // pad extremes to avoid closing the circle
    max += 1
    min -= 1

    const stroke = 36
    const radius = 170
    const circomference = Math.PI * (radius * 2)
    const fraction = (latest - min) / (max - min)
    const offset = circomference - (fraction * circomference)

    return html`
      <div class="Thermometer">
        <svg class="Thermometer-graph" width="374" height="374" viewBox="0 0 374 380" role="presentation">
          <defs>
            <mask id="Thermometer-mask" maskUnits="userSpaceOnUse" maskContentUnits="userSpaceOnUse">
              <circle class="Thermometer-mask" cx="187" cy="187" r="${radius}" stroke-dashoffset="${offset}" stroke-dasharray="${circomference}" stroke-width="${stroke}" transform="rotate(-90 187 187)" />
            </mask>
          </defs>
          <circle class="Thermometer-background" cx="187" cy="187" r="${radius}" />
          <image mask="url(#Thermometer-mask)" xlink:href="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAcAAAAHCAIAAABLMMCEAAAAd0lEQVR4AWJcLZgF6GiqEhCKYViaGfKD3/90uDtsa5/UNXnkeK1RTRJLogaqn4a/A7Lxrc4LAmsU8wv/G7FS7JiTExtRKepX6auGRfhu/sNHCejFT/3PIGOXKTiyftUXFS+CNrW4FBuyAsigz+1IWdUZEEQ7BkgD+is7VMlHXycAAAAASUVORK5CYII=" x="-2" y="-2" width="380" height="380" />
          <circle class="Thermometer-point" cx="187" cy="187" r="${radius}" fill="none" stroke-width="${stroke * 0.625}" stroke-dashoffset="${circomference - 0.1}" stroke-dasharray="${circomference}" transform="rotate(${(360 * fraction) - 90} 187 187)" />
        </svg>
        <p class="Thermometer-description">
          <span class="Thermometer-text">Temperature right now in ${this.city}</span>
          <span class="Thermometer-value ${Math.round(latest) < 0 ? 'Thermometer-value--minus' : ''}">${Math.round(latest)}<sup class="Thermometer-unit">°</sup></span>
        </p>
      </div>
    `
  }

  static loading () {
    const radius = 170

    return html`
      <div class="Thermometer is-loading">
        <div class="Gallery-spinner"></div>
      </div>
    `
  }

  static error (err) {
    return html`
      <div class="Thermometer is-error">
        <p class="Thermometer-description">
          ${text(err.message || 'Something went wrong')}
        </p>
      </div>
    `
  }
}
