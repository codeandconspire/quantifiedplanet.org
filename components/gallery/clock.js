const html = require('choo/html')
const Component = require('choo/component')

module.exports = class Clock extends Component {
  static id (id) {
    return `clock-${id}`
  }

  load () {
    let interval = setInterval(this.rerender.bind(this), 1000)

    this.unload = () => clearInterval(interval)
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
