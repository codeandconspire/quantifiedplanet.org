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
const icons = require('../icon')
const { ROUTES, resolveRoute, vh, modulate, className } = require('../base')

const SOCIAL_LINKS = ['facebook', 'twitter', 'instagram']

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
    if (this.route !== this.state.route && this.state.route === ROUTES.explorer) {
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

    if (this.state.route === ROUTES.explorer) {
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
      const intro = modulate(scroll, [value, 0], [height * (narrow ? -0.2 : -0.05), 0], false)

      this.fade.style.opacity = 0
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
      this.overlay.style.transform = ''
      this.blueprint.style.transform = ''
      this.intro.style.transform = ''
      this.fade.style.opacity = 1
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
        <a class="Story-lab" href="http://globalgoalslab.org/" target="_blank" rel="noopener noreferrer" title="Visit the Global Goals Lab website">
          <svg width="157" height="40" viewBox="0 0 141 36">
            <g fill="#FFF" fill-rule="evenodd">
              <path d="M51.3 8.6v.7H48V13h-.7V5.2h4.4v.7H48v2.7h3.3zm5.9 1.8c0 1.6-.4 2.7-2.2 2.7-1.8 0-2.2-1.1-2.2-2.7s.4-2.7 2.2-2.7c1.8 0 2.2 1.1 2.2 2.7zm-.7 0c0-1.2-.1-2-1.5-2s-1.4.8-1.4 2 0 2 1.4 2 1.5-.8 1.5-2zm2.9-2.6v3.8c0 .7.4.9 1 .9.7 0 1-.2 1.4-.4V7.8h.8V13h-.4l-.2-.4a3 3 0 0 1-1.6.5c-1.2 0-1.7-.6-1.7-1.6V7.8h.7zm8 5.2V9.2c0-.7-.4-.9-1-.9-.8 0-1.1.2-1.5.4V13h-.7V7.8h.4l.1.4a3 3 0 0 1 1.6-.5c1.2 0 1.8.6 1.8 1.6V13h-.7zm4.3-5.3c.5 0 1 .1 1.4.4V5.2h.8V13h-.4l-.2-.4a3 3 0 0 1-1.6.5c-1.7 0-2.2-1.2-2.2-2.7 0-1.5.5-2.7 2.2-2.7zm0 .6c-1.3 0-1.4 1-1.4 2.1 0 1 .1 2 1.4 2 .7 0 1 0 1.4-.3V8.7c-.4-.2-.7-.4-1.4-.4zm5 4.8c-.7 0-1-.3-1-1.1V7.8h.7V12c0 .4 0 .5.4.5v.6zm-1.2-6.9c0-.3.2-.5.5-.5s.5.2.5.5-.2.6-.5.6a.5.5 0 0 1-.5-.6zm6 6.8V9.2c0-.7-.5-.9-1.1-.9-.7 0-1 .2-1.4.4V13h-.8V7.8h.4l.2.4a3 3 0 0 1 1.6-.5c1.2 0 1.7.6 1.7 1.6V13h-.7zm4-1.4H85c-.2 0-.2.2-.2.3 0 .3 0 .4.4.4l1.7.2c1 .1 1.5.5 1.5 1.4 0 1.3-1.3 1.8-2.7 1.8-1.5 0-2.4-.4-2.4-1.6 0-.7.5-1.1 1-1.3L84 12c0-.3.1-.6.4-.7-.7-.4-.9-1-.9-1.7 0-1.1.5-2 2-2l.9.1h1.8v.4l-1 .2c.3.4.4.8.4 1.3 0 1-.5 2-2 2zm1.2 1.5l-1.5-.2c-.7.2-1.3.5-1.3 1.2 0 .8.6 1 1.7 1 1 0 2-.3 2-1.2 0-.5-.3-.7-1-.8zM85.6 11c1.2 0 1.3-.7 1.3-1.3 0-.7-.1-1.4-1.3-1.4-1.3 0-1.4.7-1.4 1.4 0 .6.1 1.3 1.4 1.3zm11.9 2V9.2c0-.7-.4-.9-1-.9-.7 0-1 .2-1.4.4V13h-.7V9.2c0-.7-.4-.9-1-.9s-1 .1-1.4.4V13h-.7V7.8h.4l.2.4a3 3 0 0 1 1.5-.5c.7 0 1.2.2 1.5.6a3 3 0 0 1 1.6-.6c1 0 1.7.5 1.7 1.6V13h-.7zm2.1-2.6c0-1.5.5-2.7 2.2-2.7 1.8 0 2 1.2 2 2.7v.3h-3.4c0 1 .3 1.8 1.4 1.8a4 4 0 0 0 1.7-.3v.6c-.5.3-1.2.3-1.7.3-1.7 0-2.2-1.2-2.2-2.7zm2.2-2c-1.2 0-1.4.8-1.4 1.7h2.7c0-.9 0-1.8-1.3-1.8zm9.7 4.6V9.2c0-.7-.4-.9-1-.9-.7 0-1 .2-1.4.4V13h-.7V9.2c0-.7-.4-.9-1-.9s-1 .1-1.4.4V13h-.7V7.8h.4l.2.4a3 3 0 0 1 1.5-.5c.7 0 1.2.2 1.5.6a3 3 0 0 1 1.6-.6c1 0 1.7.5 1.7 1.6V13h-.7zm4.4-5.3c1.7 0 2.2 1.2 2.2 2.7 0 1.5-.5 2.7-2.2 2.7a3 3 0 0 1-1.6-.5l-.1.4h-.4V5.2h.7v3a2 2 0 0 1 1.4-.5zm0 .6c-.6 0-1 .2-1.4.4V12c.4.2.8.4 1.4.4 1.3 0 1.4-1 1.4-2.1 0-1-.1-2-1.4-2zm3.6 2.1c0-1.5.4-2.7 2.2-2.7 1.7 0 2 1.2 2 2.7v.3h-3.5c0 1 .3 1.8 1.5 1.8a4 4 0 0 0 1.7-.3v.6c-.6.3-1.2.3-1.7.3-1.8 0-2.2-1.2-2.2-2.7zm2.2-2c-1.2 0-1.5.8-1.5 1.7h2.7c0-.9 0-1.8-1.2-1.8zm6.3-.7v.7a2 2 0 0 0-.6 0c-.7 0-1.1 0-1.5.3V13h-.7V7.8h.4l.1.4c.5-.3 1.1-.5 1.7-.5h.6zm7.5 2.7c0 1.6-.4 2.7-2.2 2.7-1.8 0-2.2-1.1-2.2-2.7s.4-2.7 2.2-2.7c1.8 0 2.2 1.1 2.2 2.7zm-.7 0c0-1.2-.1-2-1.5-2s-1.4.8-1.4 2 0 2 1.4 2 1.5-.8 1.5-2zm5.4-5.2v.6h-.7c-.7 0-1.2.2-1.2.9v1.1h1.6v.6h-1.6V13h-.7V8.4h-1V8l1-.3v-1c0-1 .6-1.6 1.9-1.6h.7z"/>
              <path d="M46.2 18.2h4.5v1.4h-1.4v9h-1.7v-9h-1.4v-1.4zm8.4 5.8H53v4.6h-1.7V18.2H53v4.4h1.6v-4.4h1.8v10.4h-1.8zm2.5-5.8h4v1.4h-2.3v3h1.7V24h-1.7v3.2h2.3v1.4h-4V18.2zm8.7 4.8h2.4v5.6H67v-1.1c-.2.7-.7 1.2-1.6 1.2-1.5 0-2.1-1.2-2.1-2.8v-5c0-1.7.7-2.8 2.5-2.8 1.9 0 2.4 1 2.4 2.6v.9h-1.5v-1c0-.7-.2-1-.8-1-.6 0-1 .4-1 1v5.6c0 .6.3 1 .9 1 .6 0 .8-.2.8-1v-1.8h-.8V23zm3.2-4.8h1.7v9h2v1.4H69zm4 7.7v-5c0-1.7.8-2.9 2.6-2.9s2.6 1.2 2.6 2.8v5c0 1.7-.8 2.9-2.6 2.9s-2.5-1.2-2.5-2.8zm3.5.3v-5.6c0-.7-.3-1.1-1-1.1-.5 0-.8.4-.8 1v5.7c0 .6.3 1 .9 1 .6 0 .9-.4.9-1zm2.5-8h2.4c1.7 0 2.2.8 2.2 2.2v1.1c0 .9-.3 1.5-1 1.7.8.2 1.3.7 1.3 1.7v1.4c0 1.4-.7 2.3-2.3 2.3H79V18.2zm1.6 4.4h.6c.5 0 .8-.3.8-.9v-1.3c0-.5-.3-.8-.8-.8h-.6v3zm0 1.3V27h.7c.6 0 .9-.2.9-.8v-1.6c0-.5-.3-.8-.9-.8h-.7zm3.6 4.7l2-10.4H88l2 10.4h-1.8l-.3-2H86l-.3 2h-1.6zm2.1-3.3h1.4L87 21l-.7 4.2zm4.2-7.1h1.7v9h2v1.4h-3.7zm8.2 4.8h2.4v5.6h-1.2v-1.1c-.3.7-.7 1.2-1.6 1.2-1.5 0-2.1-1.2-2.1-2.8v-5c0-1.7.7-2.8 2.5-2.8s2.4 1 2.4 2.6v.9h-1.6v-1c0-.7-.2-1-.8-1-.6 0-.9.4-.9 1v5.6c0 .6.3 1 .9 1 .5 0 .8-.2.8-1v-1.8h-.8V23zm3.2 2.9v-5c0-1.7.8-2.9 2.5-2.9 1.8 0 2.6 1.2 2.6 2.8v5c0 1.7-.8 2.9-2.6 2.9-1.7 0-2.5-1.2-2.5-2.8zm3.4.3v-5.6c0-.7-.3-1.1-.9-1.1-.5 0-.8.4-.8 1v5.7c0 .6.3 1 .8 1 .6 0 1-.4 1-1zm2 2.4l1.9-10.4h1.9l1.9 10.4h-1.7l-.3-2h-1.8l-.3 2h-1.6zm2.1-3.3h1.3l-.6-4.2-.7 4.2zm4.2-7.1h1.6v9h2v1.4h-3.6zm4 8.1V25h1.5v1.5c0 .6.3.9.9.9.5 0 .7-.4.7-1V26c0-.6-.2-1-.7-1.5l-1-1c-1-1-1.4-1.6-1.4-2.8v-.3c0-1.3.7-2.3 2.4-2.3s2.3.9 2.3 2.4v.8h-1.5v-1c0-.5-.3-.8-.8-.8s-.8.3-.8.9v.2c0 .5.3.9.8 1.4l1 1c1 1 1.4 1.6 1.4 2.8v.5c0 1.4-.7 2.4-2.4 2.4-1.8 0-2.4-1-2.4-2.4zm6.9-8.1h1.7v9h2v1.4h-3.7zm4.1 10.4l1.8-10.4h2l1.9 10.4h-1.8l-.3-2h-1.8l-.3 2h-1.5zm2-3.3h1.4l-.6-4.2-.7 4.2zm4.2-7.1h2.4c1.7 0 2.3.8 2.3 2.2v1.1c0 .9-.3 1.5-1 1.7.8.2 1.2.7 1.2 1.7v1.4c0 1.4-.6 2.3-2.3 2.3h-2.6V18.2zm1.7 4.4h.6c.5 0 .8-.3.8-.9v-1.3c0-.5-.3-.8-.8-.8h-.6v3zm0 1.3V27h.7c.6 0 .8-.2.8-.8v-1.6c0-.5-.2-.8-.8-.8h-.7zM9.4 12.9c.4-.8 1-1.5 1.6-2L5.7 5a17.8 17.8 0 0 0-3.3 4.3l7 3.5zm12.8-4.1l2.2 1.4 5.2-5.7a18 18 0 0 0-4.6-3l-2.8 7.3zm12 1.8l-7 3.4c.4.8.6 1.6.8 2.5l7.7-.7a21 21 0 0 0-1.5-5.2M26.8 13l6.9-3.5c-.9-1.6-2-3-3.2-4.3L25.2 11l1.6 2M8 18v-.5l-7.7-.7V18c0 1.5.1 3 .5 4.3l7.4-2.1A10 10 0 0 1 8 18m17.8 6.4c-.6.7-1.2 1.3-1.9 1.8l4 6.6c1.6-1 3-2.3 4-3.7l-6.1-4.7zM28 18c0 .7 0 1.4-.2 2.2l7.5 2.1c.3-1.4.5-2.8.5-4.3v-1.1l-7.8.7v.4m-17.6 6.5l-6.2 4.8c1.2 1.4 2.5 2.6 4 3.6l4.1-6.6a9.8 9.8 0 0 1-1.9-1.8m-2.3-8.1c.2-.9.4-1.7.8-2.5l-7-3.5a19 19 0 0 0-1.5 5.3l7.7.7zm18.9 17l-4-6.6-2.4 1 1.4 7.6c1.8-.4 3.5-1 5-2m.5-12.2c-.2.8-.6 1.6-1 2.3l6.1 4.7c1-1.5 1.8-3 2.4-4.8l-7.5-2.2zm-8 6.8a9 9 0 0 1-2.6 0l-1.5 7.7a18.3 18.3 0 0 0 5.5 0L19.5 28zm-.8-20c.8 0 1.7.1 2.5.4l2.7-7.3c-1.6-.6-3.4-.9-5.2-1V8zm-2.9 19.8a7 7 0 0 1-2.5-1l-4 6.7a18 18 0 0 0 5 2l1.5-7.7zM15 8.4a10 10 0 0 1 2.5-.5V.1a16 16 0 0 0-5.3 1L15 8.4zM9.7 23.6a9 9 0 0 1-1.2-2.4l-7.4 2.2c.5 1.8 1.4 3.5 2.4 5l6.2-4.8zM11.8 10c.7-.4 1.4-.9 2.2-1.2l-2.8-7.3c-1.7.7-3.3 1.7-4.6 2.8l5.2 5.8z" fill-rule="nonzero"/>
            </g>
          </svg>
        </a>
        <div class="Story-social">
          ${this.state.meta.social.filter(item => SOCIAL_LINKS.includes(item.type)).map(item => html`
            <a class="Story-socialIcon" href="${item.link.url}" target="_blank" rel="noopener noreferrer" title="${item.type}">
              ${icons[item.type]({ theme: 'white' })}
            </a>
          `)}
        </div>
        <div class="Story-intro js-intro" id="${this._name}-intro">
          <video class="Story-planet js-video ${this.videosLoaded === 2 ? 'is-hidden' : ''}" autoplay preload="auto" playsinline muted role="presentation" width="300" height="300" id="${this._name}video1">
            <source src="http://res.cloudinary.com/dykmd8idd/video/upload/ac_none,q_90/v1519898259/qp-render-4-sec_rlpax9.webm" type="video/webm" />
            <source src="http://res.cloudinary.com/dykmd8idd/video/upload/ac_none,q_70,vc_h264/v1519898259/qp-render-4-sec_rlpax9.mp4" type="video/mp4" />
          </video>
          <video class="Story-planet js-video ${this.videosLoaded !== 2 ? 'is-loading' : ''}" preload="auto" playsinline muted loop role="presentation" width="300" height="300" id="${this._name}video2">
            <source src="http://res.cloudinary.com/dykmd8idd/video/upload/ac_none,q_90/v1519898259/qp-render-16-sec-smaller_ihw5n8.webm" type="video/webm" />
            <source src="http://res.cloudinary.com/dykmd8idd/video/upload/ac_none,q_70,vc_h264/v1519898259/qp-render-16-sec-smaller_ihw5n8.mp4" type="video/mp4" />
          </video>

          <div class="Story-body ${typeof window !== 'undefined' ? 'is-visible' : ''}">
            <div class="Text">
              <h1 class="Text-story1">${asText(doc.data.title)}</h1>
              <div class="Text-story3">${asElement(doc.data.description)}</div>
            </div>
            <a class="Story-button js-enter" href="#system" onclick=${scrollIntoView}>How it works</a>
          </div>
          <div class="Story-overlay js-overlay">
            <div class="Story-blueprint js-blueprint">
              <svg class="Story-planet Story-planet--blueprint" viewBox="0 0 606 606">
                <defs>
                  <filter id="story-blur" width="161.2%" height="141.1%" x="-30.6%" y="-20.5%" filterUnits="objectBoundingBox"><feGaussianBlur in="SourceGraphic" stdDeviation="50" color-interpolation-filters="sRGB"/></filter>
                </defs>
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
                </g>
                <path fill="#2F00DE" fill-rule="evenodd" d="M0 0h490v730H0c79.6-130.7 119.4-252.3 119.4-365C119.4 252.3 79.6 130.7 0 0z" filter="url(#story-blur)" transform="translate(120 -40) scale(1.1) rotate(-12)" style="opacity: 0.9" />
              </svg>
            </div>
          </div>
        </div>

        <div class="Story-fade js-fade"></div>

        <div class="Story-content js-content" style="padding-top: ${this.element ? this.dimensions.introDuration : 0}px;">
          ${this.sections.map(section => section.component.render(doc))}

          <div class="Story-block Story-block--dark Story-block--outro">
            <div class="View-container">
              <div class="Story-copy">
                <div class="Text">
                  <h2 class="Text-story5">Our culture is about co-creation</h2>
                  <p class="Text-story Text-story--center">We're always looking for exciting new partnerships and collaborations. <a href="/company">Get to know us</a>.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `

    function scrollIntoView (event) {
      const el = document.querySelector(event.target.hash)
      if (el) el.scrollIntoView({ block: 'start', behavior: 'smooth' })
      event.preventDefault()
    }
  }
}
