const assert = require('assert')
const html = require('choo/html')
const nanoraf = require('nanoraf')
const Component = require('choo/component')
const { text } = require('../base')

const OFFSET = 80
const STROKE_WIDTH = 3
const END_RADIUS = 8

module.exports = class LineChart extends Component {
  constructor (opts) {
    assert(typeof opts === 'object', 'LineChart: opts should be an object')
    assert(typeof opts.type === 'string', 'LineChart: opts.type should be a string')
    assert(typeof opts.city === 'string', 'LineChart: opts.city should be a string')

    super(`line-chart-${opts.type}`)

    this.period = 1000 * 60 * 60 * 24 * 7
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

  setPeriod (period) {
    this.period = period
    delete this.data
    this.rerender()
    this.init()
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
        `metric=${this.type}`,
        `city=${this.city}`,
        `start=${(new Date(normalize(Date.now()) - this.period)).toJSON()}`,
        `end=${(new Date(normalize(Date.now()))).toJSON()}`,
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

  unload () {
    window.removeEventListener('resize', this)
    this.chart.detach()
    delete this.chart
  }

  handleEvent (event) {
    if ('on' + event.type in this) this['on' + event.type](event)
  }

  draw () {
    if (this.error) return

    const Chartist = require('chartist')
    const canvas = this.canvas = this.element.querySelector('.js-canvas')

    this.chart = new Chartist.Line(canvas, {series: [this.data]}, {
      fullWidth: true,
      showPoint: false,
      showArea: true,
      areaBase: -Infinity,
      axisX: {
        showGrid: false
      },
      axisY: {
        showGrid: true,
        showLabel: true,
        scaleMinSpace: 50,
        onlyInteger: true,
        labelInterpolationFnc: value => `${value}`
      },
      chartPadding: {
        top: 8,
        right: 0,
        bottom: OFFSET / 2,
        left: OFFSET / 2
      },
      lineSmooth: Chartist.Interpolation.simple({
        divisor: 2
      }),
      height: canvas.offsetHeight
    })

    const update = nanoraf(() => this.chart.svg.addClass('LineChart-canvas'))

    this.onresize = nanoraf(() => {
      if (!this.chart) return
      window.requestAnimationFrame(() => {
        // offset measuring height another frame `\_(ó_ò )_/´
        this.chart.update(null, {height: this.canvas.offsetHeight}, true)
      })
    })
    window.addEventListener('resize', this, {passive: true})

    this.chart.on('draw', data => {
      // call throttled root element edit as it doesn't emit its own draw event
      update()

      if (data.type === 'line') {
        data.element.addClass('LineChart-line')
        data.element.attr({style: `stroke: url(#${this._name}-stroke);`})
        data.group.attr({transform: `translate(-${OFFSET + STROKE_WIDTH} 0)`})
        const point = data.path.pathElements[data.path.pathElements.length - 1]
        data.group.getNode().appendChild(
          html`<circle class="LineChart-end" cx="${point.x}" cy="${point.y}" r="${END_RADIUS}" stroke="#56C0D5" stroke-width="3" />`
        )
      }

      if (data.type === 'area') {
        data.element.addClass('LineChart-area')
        data.element.attr({style: `fill: url(#${this._name}-background);`})
      }

      if (data.type === 'label') {
        data.element.getNode().firstElementChild.classList.add('LineChart-label')
      }

      if (data.type === 'grid') {
        data.element.addClass('LineChart-grid')
        data.element.attr({
          transform: `scale(${1 - ((OFFSET - 24 + STROKE_WIDTH) / data.axis.chartRect.width())}, 1)`
        })
      }
    })
  }

  createElement () {
    if (this.error) return LineChart.error(this.error)
    if (!this.data) return LineChart.loading()

    const theme = this.type === 'wind_strength' ? 'wind' : this.type

    return html`
      <div class="LineChart LineChart--${theme}">
        <svg class="u-hiddenVisually">
          <defs>
            <linearGradient id="${this._name}-stroke" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" class="LineChart-stroke--start" />
              <stop offset="100%" class="LineChart-stroke--end" />
            </linearGradient>
            <linearGradient id="${this._name}-background" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" class="LineChart-background--start" />
              <stop offset="100%" class="LineChart-background--end" />
            </linearGradient>
          </def>
        </svg>
        <div class="LineChart-wrapper js-canvas"></div>
      </div>
    `
  }

  static loading () {
    return html`
      <div class="LineChart is-loading">
        <div class="Gallery-spinner"></div>
      </div>
    `
  }

  static error (err) {
    return html`
      <div class="LineChart has-error">
        ${text(err.message || 'Something went wrong')}
        ${process.env.NODE_ENV === 'development' ? html`
          <pre>${err.stack}</pre>
        ` : null}
      </div>
    `
  }
}

// normalize ms offset to start of day
// num -> num
function normalize (time) {
  const now = new Date()
  time -= 1000 * 60 * 60 * now.getHours()
  time -= 1000 * 60 * now.getMinutes()
  time -= 1000 * now.getSeconds()
  time -= now.getMilliseconds()
  return time
}
