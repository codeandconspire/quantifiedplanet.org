const html = require('choo/html')
const Component = require('nanocomponent')

module.exports = class Video extends Component {
  constructor () {
    super('story-video')
    this.ready = 0
    this.done = false
  }

  load (element) {
    const videos = element.querySelectorAll('.js-video')

    for (let i = 0, len = videos.length; i < len; i++) {
      this[videos[i].dataset.type] = videos[i]
      videos[i].addEventListener('canplay', this)
      videos[i].addEventListener('ended', this)
    }

    this.unload = function () {
      delete this.unload
      for (let i = 0, len = videos.length; i < len; i++) {
        videos[i].removeEventListener('canplay', this)
        videos[i].removeEventListener('ended', this)
      }
    }
  }

  oncanplay (event) {
    this.ready += 1
    event.target.muted = true
    event.target.removeEventListener('canplay', this)
    if (event.target.dataset.type === 'short') {
      event.target.play().catch(function () {
        event.target.classList.add('is-hidden')
      })
      event.target.classList.add('is-appearing')
      event.target.classList.remove('is-hidden')
    } else {
      event.target.pause()
    }
  }

  onended (event) {
    if (event.target.dataset.type === 'short') {
      if (this.ready === 2) {
        this.long.play()
        this.long.classList.remove('is-hidden')
        event.target.classList.add('is-hidden')
        event.target.removeEventListener('ended', this)
      } else {
        event.target.fastSeek(0)
        event.target.play()
      }
    } else {
      event.target.fastSeek(0)
      event.target.play()
    }
  }

  handleEvent (event) {
    if (this['on' + event.type]) this['on' + event.type](event)
  }

  update () {
    return false
  }

  createElement () {
    if (typeof window === 'undefined') {
      return html`<div id="${this._name}"></div>`
    }

    return html`
      <div id="${this._name}">
        <video data-type="short" class="Story-planet js-video is-hidden" autoplay preload="auto" playsinline muted width="300" height="300" id="${this._name}-video-1">
          <source src="//res.cloudinary.com/dykmd8idd/video/upload/ac_none,q_90/v1519898259/qp-render-4-sec_rlpax9.webm" type="video/webm" />
          <source src="//res.cloudinary.com/dykmd8idd/video/upload/ac_none,q_70,vc_h264/v1519898259/qp-render-4-sec_rlpax9.mp4" type="video/mp4" />
        </video>
        <video data-type="long" class="Story-planet js-video is-hidden" autoplay preload="auto" playsinline muted loop width="300" height="300" id="${this._name}-video-2">
          <source src="//res.cloudinary.com/dykmd8idd/video/upload/ac_none,q_90/v1519898259/qp-render-16-sec-smaller_ihw5n8.webm" type="video/webm" />
          <source src="//res.cloudinary.com/dykmd8idd/video/upload/ac_none,q_70,vc_h264/v1519898259/qp-render-16-sec-smaller_ihw5n8.mp4" type="video/mp4" />
        </video>
      </div>
    `
  }
}
