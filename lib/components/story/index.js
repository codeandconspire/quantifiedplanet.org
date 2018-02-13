const html = require('choo/html')
const nanoraf = require('nanoraf')
const nanobus = require('nanobus')
const Component = require('nanocomponent')
const asElement = require('prismic-element')
const { asText } = require('prismic-richtext')
const Goals = require('../goals')
const Summary = require('../summary')
const System = require('../system')
const Gallery = require('../gallery')
const { ROUTES, resolveRoute, vh, modulate, className } = require('../base')

module.exports = class Story extends Component {
  constructor (id, state, emit) {
    super(id)

    this.emit = emit
    this.state = state
    this.videosLoaded = 0
    this.sections = [ System, Summary, Goals, Gallery ].map((Section, index) => {
      const emitter = nanobus()
      const section = {
        inview: false,
        emitter: emitter,
        component: new Section(emitter, state)
      }
      emitter.on('*', function (event, data) {
        if (event === 'inview') section.inview = data
        else emit(event, data)
      })
      return section
    })
  }

  static id (doc) {
    return `story-${doc.id}`
  }

  update () {
    if (this.route !== this.state.href) {
      const gallery = this.sections.find(section => {
        return section.component instanceof Gallery
      })
      gallery.component.element.scrollIntoView()
      window.scrollTo(0, window.scrollY + vh() * 2 / 3)
    }
    return true
  }

  afterupdate () {
    this.onresize()
  }

  load () {
    this.videos = [...this.element.querySelectorAll('.js-video')]
    this.overlay = this.element.querySelector('.js-overlay')
    this.blueprint = this.element.querySelector('.js-blueprint')
    this.intro = this.element.querySelector('.js-intro')
    this.fade = this.element.querySelector('.js-fade')
    this.content = this.element.querySelector('.js-content')

    this.onresize() // read initial dimensions
    this.onscroll = nanoraf(this.onscroll.bind(this))
    this.onresize = nanoraf(this.onresize.bind(this))

    if (this.state.href === ROUTES.explorer) {
      const gallery = this.sections.find(section => {
        return section.component instanceof Gallery
      })
      gallery.component.element.scrollIntoView()
      window.scrollTo(0, window.scrollY + vh() * 2 / 3)
    }

    window.addEventListener('scroll', this, {passive: true})
    window.addEventListener('resize', this, {passive: true})

    this.videos.forEach((video, index) => {
      video.addEventListener('canplay', this, true)
      video.addEventListener('ended', this, true)
    })
  }

  unload () {
    window.removeEventListener('scroll', this)
    window.removeEventListener('resize', this)
    this.sections.forEach(section => section.emitter.emit('inview', false))
    this.unbindVideo()
  }

  unbindVideo () {
    this.videos.forEach((video, index) => {
      video.removeEventListener('canplay', this)
      video.removeEventListener('ended', this)
    })
  }

  handleEvent (event) {
    if (this['on' + event.type]) this['on' + event.type](event)
  }

  onresize () {
    const width = document.documentElement.clientWidth
    const height = document.documentElement.clientHeight
    const narrow = width < 768
    const isLandscape = width > height
    const slideDuration = width
    const firstFrame = narrow ? 0 : this.element.querySelector('.js-firstFrame').offsetTop
    const introDuration = (width + vh()) - firstFrame

    this.dimensions = { narrow, width, height, isLandscape, slideDuration, introDuration }

    this.content.style.paddingTop = `${introDuration}px`
    this.sections.forEach(section => {
      section.top = section.component.element.offsetTop
      section.height = section.component.element.offsetHeight
    })

    this.onscroll()
  }

  onscroll (event) {
    const scroll = window.scrollY
    const { narrow, width, height, isLandscape, slideDuration, introDuration } = this.dimensions

    // at intro
    if (scroll < introDuration) {
      const value = isLandscape ? (height * 2) : (height * 2)
      const intro = modulate(scroll, [value, 0], [height * (narrow ? -0.1 : -0.05), 0], false)

      this.intro.style.visibility = ''
      this.intro.style.transform = `translateY(${intro.toFixed(1)}px)`

      if (scroll < slideDuration) {
        const slide = modulate(scroll, [0, width], [width, 0], true)
        this.fade.style.opacity = 0
        this.overlay.style.transform = `translateX(${(width - slide.toFixed(1)) * -1}px)`
        this.blueprint.style.transform = `translateX(${width - slide.toFixed(1)}px)`
      } else {
        const fade = modulate(scroll, [(width + (height / 3)), width], [1, 0], true)
        this.fade.style.opacity = fade.toFixed(3)
        this.overlay.style.transform = `translateX(${width * -1}px)`
        this.blueprint.style.transform = `translateX(${width}px)`
      }
    } else {
      // at system
      this.intro.style.visibility = 'hidden'
      this.overlay.style.transform = ''
      this.blueprint.style.transform = ''
      this.intro.style.transform = ''
      this.fade.style.opacity = ''
    }

    // let story components know when they are in view
    for (let i = 0, len = this.sections.length; i < len; i++) {
      const section = this.sections[i]
      const inview = (
        ((section.top) < (scroll + (isLandscape ? width : height))) &&
        ((section.top + section.height) > scroll)
      )
      if (inview !== section.inview) {
        const isGallery = section.component instanceof Gallery
        if (this.state.href === ROUTES.explorer && !isGallery && inview) {
          this.emit('replaceState', resolveRoute(ROUTES.homepage))
        }
        section.emitter.emit('inview', inview)
      }
    }
  }

  oncanplay () {
    this.videosLoaded++

    if (this.videosLoaded === 1) {
      this.videos[0].muted = true
      this.videos[0].play()
      this.appeared = true
      this.element.classList.add('has-appeared')
    }
  }

  onended () {
    if (this.videosLoaded === 1) {
      // loop again
      this.videos[0].fastSeek(0)
      this.videos[0].play()
    } else {
      // play full video if ready
      this.videos[1].muted = true
      this.videos[1].play()
      this.videos[1].classList.remove('is-loading')
      this.videos[0].pause()
      this.videos[0].classList.add('is-hidden')
      this.unbindVideo()
    }
  }

  createElement (doc) {
    this.route = this.state.route
    return html`
      <div class="${className('Story', {'has-js': typeof window !== 'undefined', 'has-appeared': this.appeared})}" id="${this._name}">
        <div class="Story-intro js-intro" id="${this._name}-intro">
          <video class="Story-planet js-video ${this.videosLoaded === 2 ? 'is-hidden' : ''}" autoplay preload="auto" playsinline muted role="presentation" width="300" height="300" id="${this._name}video1">
            <source src="/short.mp4" type="video/mp4" />
          </video>
          <video class="Story-planet js-video ${this.videosLoaded !== 2 ? 'is-loading' : ''}" preload="auto" playsinline muted loop role="presentation" width="300" height="300" id="${this._name}video2">
            <source src="/long.mp4" type="video/mp4" />
          </video>

          <div class="Story-body ${typeof window !== 'undefined' ? 'is-visible' : ''}">
            <div class="Text">
              <h1 class="Text-story1">${asText(doc.data.title)}</h1>
              <div class="Text-story3">${asElement(doc.data.description)}</div>
            </div>
          </div>
          <div class="Story-overlay js-overlay">
            <div class="Story-blueprint js-blueprint">
              <svg class="Story-planet Story-planet--blueprint" viewBox="0 0 606 606">
                <defs>
                  <radialGradient id="story-gradient">
                    <stop offset="55%" stop-color="black" />
                    <stop offset="80%" stop-color="white" />
                  </radialGradient>
                </defs>
                <g class="Story-rotate">
                  <g fill="none" fill-rule="evenodd" stroke="#fff" stroke-dasharray="4 4" transform="translate(-18 -18)">
                    <ellipse cx="321" cy="321" rx="151" ry="302" transform="rotate(45 321 321)"/>
                    <ellipse cx="321" cy="321" rx="151" ry="302" transform="rotate(90 321 321)"/>
                    <ellipse cx="321" cy="321" rx="151" ry="302"/>
                    <ellipse cx="321" cy="321" rx="151" ry="302" transform="rotate(-45 321 321)"/>
                    <circle cx="321" cy="321" r="302"/>
                    <circle cx="321" cy="321" r="266"/>
                    <circle cx="321" cy="321" r="200"/>
                    <circle cx="321" cy="321" r="110"/>
                    <circle cx="321" cy="321" r="56"/>
                    <circle cx="321" cy="321" r="16"/>
                    <defs>
                      <filter id="story-blur" width="161.2%" height="141.1%" x="-30.6%" y="-20.5%" filterUnits="objectBoundingBox"><feGaussianBlur in="SourceGraphic" stdDeviation="50"/></filter>
                    </defs>
                  </g>
                </g>
                <path fill="#2F00DE" fill-rule="evenodd" d="M0 0h490v730H0c79.6-130.7 119.4-252.3 119.4-365C119.4 252.3 79.6 130.7 0 0z" filter="url(#story-blur)" transform="translate(120 -40) scale(1.1) rotate(-12)" style="opacity: 0.9" />
              </svg>
            </div>
          </div>
          <div class="Story-fade js-fade"></div>
        </div>

        <div class="Story-content js-content" style="padding-top: ${this.element ? this.dimensions.introDuration : 0}px;">
          ${this.sections.map(section => section.component.render(doc))}

          <div class="Story-block Story-block--dark Story-block--outro">
            <div class="View-container">
              <div class="Story-copy">
                <div class="Text">
                  <h2 class="Text-story5">Our culture is about co-creation</h2>
                  <p class="Text-story Text-story--center">We're alwasy looking for exciting new partnerships and collaborations. <a href="/company">Get to know us</a>.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `
  }
}
