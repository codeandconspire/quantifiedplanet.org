const html = require('choo/html')
const Component = require('nanocomponent')

module.exports = class Clock extends Component {
  static id (id) {
    return `clock-${id}`
  }

  load () {
    setInterval(this.rerender.bind(this), 1000)
  }

  update () {
    return false
  }

  createElement () {
    const now = new Date()
    return html`
      <time datetime="${JSON.stringify(now)}">${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}</time>
    `
  }
}

function pad (num) {
  return (num < 10) ? `0${num}` : num
}
