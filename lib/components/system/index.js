const html = require('choo/html')
const Component = require('nanocomponent')
const Machine = require('./machine')

module.exports = class System extends Component {
  constructor (emitter) {
    super('system')
    this.drops = new Machine('drops', emitter)
    this.numbers = new Machine('numbers', emitter)
    emitter.on('inview', inview => {
      if (inview) window.addEventListener('scroll', this)
      else window.removeEventListener('scroll', this)
    })
  }

  update () {
    return false
  }

  createElement () {
    return html`
      <div class="View-container">
        <div class="System">
          <div class="System-col">
            <div class="Text Text--lg">
              <p>Crunching and Making Sense of the Data</p>
            </div>
          </div>
          <div class="System-col System-col--machine System-col--z2">
            ${this.drops.render()}
          </div>
          <div class="System-col">
            <div class="Text">
              <p>
                The backend system does the heavy lifting and makes the data available in an open API.
                <br /><br />
                <a href="/api">For Developers</a>
              </p>
            </div>
          </div>
          <div class="System-col">
            <div class="Text Text--lg">
              <p>Visualize and Find a Meaninful Context</p>
            </div>
          </div>
          <div class="System-col System-col--machine System-col--z1">
            ${this.numbers.render()}
          </div>
          <div class="System-col">
            <div class="Text">
              <p>
                The data can now be visualized however you want. See the examples.
                <br /><br />
                <a href="/data-explirer">Data Explorer</a>
              </p>
            </div>
          </div>
        </div>
      </div>
    `
  }
}
