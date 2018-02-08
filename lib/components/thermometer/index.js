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

    if (typeof opts.auto !== 'undefined' && opts.auto) this.load = this.init
  }

  update () {
    return false
  }

  init () {
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
            throw new Error((data && data.error) || text`Could not reach the API`)
          }
          this.data = data.payload
          this.rerender()
          this.draw()
        })
      }).catch(err => {
        this.error = err
        this.rerender()
      })
    } else {
      this.draw()
    }
  }

  draw () {

  }

  createElement () {
    if (this.error) return Thermometer.error(this.error)
    if (!this.data) return Thermometer.loading()

    let min, max, latest
    for (let i = 0, len = this.data.length; i < len; i++) {
      if (!max || this.data[i] > max) max = this.data[i]
      if (!min || this.data[i] < min) min = this.data[i]
      if (!latest && this.data[i]) latest = this.data[i]
    }

    const stroke = 35
    const radius = 170
    const circomference = Math.PI * (radius * 2)
    const fraction = (latest - min) / (max - min)
    const offset = circomference - (fraction * circomference)

    return html`
      <div class="Thermometer">
        <svg class="Thermometer-graph" width="374" height="374" viewBox="0 0 374 380" role="presentational">
          <defs>
            <mask id="Thermometer-mask" maskUnits="userSpaceOnUse" maskContentUnits="userSpaceOnUse">
              <circle class="Thermometer-mask" cx="187" cy="187" r="${radius}" stroke-dashoffset="${offset}" stroke-dasharray="${circomference}" stroke-width="${stroke}" transform="rotate(-90 ${radius + stroke / 2} ${radius + stroke / 2})" />
            </mask>
          </defs>
          <circle class="Thermometer-background" cx="187" cy="187" r="${radius}" />
          <image mask="url(#Thermometer-mask)" xlink:href="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAcAAAAHCAIAAABLMMCEAAAAeElEQVR4ARWNUQ6DMAxDEzcpjAmENDRpp9yRdkxG26SkX5Yt249/2zezZ9gDNsMmmKBLdVBIB9Hwimi4XA4bUXumOqPFQnmk0tgVvEo9tIB7J5KQBXbo9cnnS8/aYZ5kT2XX8s7/JbVpALxGd9WyaVnQwMQUtDjoNxvmODZfntKcAAAAAElFTkSuQmCC" x="0" y="0" width="380" height="380" />
          <circle class="Thermometer-point" cx="187" cy="17" r="12" transform="rotate(${360 * fraction} ${radius + stroke / 2} ${radius + stroke / 2})" />
        </svg>
        <p class="Thermometer-description">
          <span class="Thermometer-text">Temperature right now in ${this.city}</span>
          <span class="Thermometer-value">${Math.round(latest)}<sup>°</sup></span>
        </p>
      </div>
    `
  }

  static loading () {
    const radius = 170

    return html`
      <div class="Thermometer is-loading">
        <svg class="Thermometer-graph" width="374" height="374" viewBox="0 0 374 380" role="presentational">
          <circle class="Thermometer-background" cx="187" cy="187" r="${radius}" />
        </svg>
        <p class="Thermometer-description">
          ${text`Loading`}
        </p>
      </div>
    `
  }

  static error (err) {
    return html`
      <div class="Thermometer has-error">
        ${text`Something went wrong`}
        ${process.env.NODE_ENV === 'development' ? html`
          <pre>${err.stack}</pre>
        ` : null}
      </div>
    `
  }
}
