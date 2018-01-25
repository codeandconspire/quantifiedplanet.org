const html = require('choo/html')
const nanoraf = require('nanoraf')
const Component = require('nanocomponent')
const Machine = require('./machine')
// const { vh } = require('../base')

module.exports = class System extends Component {
  constructor (emitter) {
    super('system')
    this.machine = new Machine(emitter)
    emitter.on('inview', inview => {
      if (inview) window.addEventListener('scroll', this)
      else window.removeEventListener('scroll', this)
    })
  }

  handleEvent (event) {
    if (this['on' + event.type]) this['on' + event.type](event)
  }

  onscroll (event) {

  }

  load () {
    this.onscroll = nanoraf(this.onscroll)
  }

  update () {
    return false
  }

  createElement () {
    return html`
      <div class="System">
        ${this.machine.render('numbers')}
      </div>
    `
  }
}
