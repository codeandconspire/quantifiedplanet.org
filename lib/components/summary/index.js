const html = require('choo/html')
const { asText } = require('prismic-richtext')
const nanoraf = require('nanoraf')
const Component = require('nanocomponent')
const { modulate, vh } = require('../base')

module.exports = class Goals extends Component {
  constructor (emitter) {
    super('summary')

    if (typeof window !== 'undefined') {
      this.onresize = nanoraf(() => {
        this.vh = vh()
        this.knobs = this.bars.querySelectorAll('.js-knob')
        this.knobSize = this.knobs[0].getBoundingClientRect().width
        this.top = this.element.offsetTop
        this.width = this.bars.offsetWidth
        this.height = this.bars.offsetHeight
        console.log(this.bars.querySelector('.js-knob'))
      })

      emitter.on('inview', inview => {
        if (inview) window.addEventListener('scroll', this, {passive: true})
        else window.removeEventListener('scroll', this)

        if (inview) {
          window.addEventListener('resize', this, {passive: true})
          this.onresize()
        } else {
          window.removeEventListener('resize', this)
        }
      })
    }
  }

  handleEvent (event) {
    if (this['on' + event.type]) this['on' + event.type](event)
  }

  onscroll (event) {
    const scroll = window.scrollY
    const start = this.bars.offsetTop - this.vh - this.knobSize - 20
    const stop = (start + (this.vh * 0.8))
    const range1 = modulate(scroll, [start, stop], [0, this.width - this.knobSize + 4], true)
    const range2 = modulate(scroll, [start + (this.height * 0.4), stop + (this.height * 0.4)], [0, this.width - this.knobSize + 4], true)
    const range3 = modulate(scroll, [start + (this.height * 0.8), stop + (this.height * 0.8)], [0, this.width - this.knobSize + 4], true)
    const range4 = modulate(scroll, [start + (this.height * 1.2), stop + (this.height * 1.2)], [0, this.width - this.knobSize + 4], true)

    this.knobs[0].style.transform = `translateX(${range1.toFixed(1)}px)`
    this.knobs[1].style.transform = `translateX(${range2.toFixed(1)}px)`
    this.knobs[2].style.transform = `translateX(${range3.toFixed(1)}px)`
    this.knobs[3].style.transform = `translateX(${range4.toFixed(1)}px)`
  }

  load () {
    this.onscroll = nanoraf(this.onscroll.bind(this))
    this.bars = this.element.querySelector('.js-bars')
    this.onresize() // read initial dimensions
  }

  update () {
    return false
  }

  createElement (doc) {
    return html`
      <div class="View-container">
        <div class="Story-block Story-block--first">
          <div class="Story-copy">
            <div class="Text">
              <h2 class="Text-story2">${asText(doc.data.products_title).trim()}</h2>
              <p class="Text-story">${asText(doc.data.products_body).trim()}</p>
            </div>
          </div>
          <a class="Story-link" href="/products">${doc.data.products_link_text}</a>
        </div>

        <div class="Summary js-bars">
          <div class="Summary-bar">
            <svg class="Summary-knob js-knob" viewBox="0 0 86 86">
              <defs><circle id="a-knob-1" cx="43" cy="43" r="43"/></defs>
              <g fill="none" fill-rule="evenodd">
                <mask id="b-knob-1" fill="#fff">
                  <use xlink:href="#a-knob-1"/>
                </mask>
                <use fill="#2F00DE" xlink:href="#a-knob-1"/>
                <g fill="#FFF" fill-rule="nonzero" mask="url(#b-knob-1)">
                  <path d="M43 23a20 20 0 1 0 20 20v-.1c0-11-9-19.9-20-19.9zm10 35.2l-.6.5c-2.8 1.6-6 2.5-9.4 2.5a22 22 0 0 1-5.2-.7c-.3-.3-.4-.6-.3-.9a4.6 4.6 0 0 1 3.5-2.2c3-.3 6.9 2 7.5 1.5.5-.4 1.8-2 3.7-2 .6 0 1.1.2 1.7.5l-.8.6v.2zM41 25h.4l1.7-.2c8.5 0 16 6 17.9 14.3v.3c-.3.5-1 1-1.5.7a1 1 0 0 1-.6-.6c-.1-.3-1-1-1 .3 0 1.2 1.3 1.4 0 2-.5.5-1.2.8-2 .8a3 3 0 0 0-1 2.2c.2.7 2 2.5.6 2.5a7 7 0 0 1-2.7-2.5L51.5 42c-.1-.5-.8-.8-1.4-.7l-.2.2c-.7.4 0 .8-.3 1.8-.4 1-.9 1.8-1.6 1-1.8-2.1-4.3-1-4.7-3.3-.3-1.2-1.3-1-2.1-1.8-.9-.7-1.4-1.1-1.6-.5-.1.5 2.8 2.8 3 3.3.3.9-.9 1.7-1.7 1.8-.8.2-1.3-.4-2.1-1.4-.8-1-1.3-1.5-1.3-.8 0 1.3.7 2.4 1.7 3 .7.5 1.6.8 1.3 1.5-.3.7 0 .3-.9 1.1-.7.6-1 1.4-1 2.2 0 1.2-.2 1.2-.4 2.1-.1 1-.5.2-1 1.6 0 .8-.5 1.6-1 2.3a4 4 0 0 1-2.6 1c-.8 0-1-2.2-1-3.3 0-.4-.5.8-.8-1.6-.1-1.5-1.1.2-1.2-.8-.2-1-.6-.8-1.2-1.4-.5-.6-1 0-1.8.4-.7.4-.4.4-1.4.2-1-2.3-1.4-4.7-1.4-7.2 0-.5 0-2.8 1-3.5.4-.1.8-.3 1.3-.3l2.9.7c1.1.5 2.7 1.3 3.6 1 .7-.3 1.3-.7 1.1-1.2 0-.6-.7-1-1.4-.5-.2.2-.8-1-1.2-1-.4.2.6 1.6.1 1.6-.4 0-1-1.5-1.2-1.8-.2-.3-.7-.9-1.1-.4-1.2 1-2.7.5-3.3.8-1.2.4-1.2.1-1.2-.4l.1-.4c.6-.5 1.4-.5 2.1-.3.4.3.9-.2 1-.3V36c-.1-.3.3-.4.4-.6l1.4-.8c1-.3 1.8-.3 2.8 0 .6.3 1.4.1 1.8-.4.4-.4.9-.9 1.3-1.1.3-.2-.7-1-1.4 0s-1.1 1-1.6 1c-.4 0-2.5-.6-2.6-1.2-.1-.5.7-1 1.4-1.5a14 14 0 0 1 3.5-.4c1.1-.3 2.5-.9 3.2-.3.7.6-3 1.3-1.7 2 .4.2 2.4-1.2 3.1-1.4 1.5-.9-1.5-1.2-1.1-2.7.4-1.8-3.8-1.1-5.9-1 2-1.2 4.2-2 6.6-2.5l1.1-.1zm14.5 30.7c-1-.5-.8.3-1.4.2-.5-.2.6-1.3-1-.5-1.5.9-1 0-1.6-1.8-.4-1.6.4-3.3 2-3.9 1-.4 2.2-.7 3.3-.8 2.2-.6 2.7-1.8 3-1.1l.4.4.2 1c-.8 2.5-2.3 4.7-4.2 6.7l-.7-.2zm.7-10c-.2 0-.4-.3-.5-.7-.2-.2 0-.5.1-.6.2-.1.3 0 .4 0 .5.3.7.6.9 1 .1.4-.6.4-.9.3zm2 1.6c-.6.3-1.3.3-1.7-.1-.4-.4.3-1 .6-1 .5 0 1.5.9 1.1 1.1zm2-5.6c.2-.2-.6-1.2-.3-1.2.5 0 1.1.3 1.4.8l.1 1.6c0 1.2-.1 2.3-.4 3.6-.6-.3-2.4-3-.8-4.8zm-12 4c-.6.2-1.3.2-1.7-.2-.5-.4.2-1 .5-1 .7-.1 1.6.9 1.1 1.2zm-7.5 3.5c-.3.4-1 3.5-1.4 3-.4-.4.2-3.5.3-3.7.8-1.3 2.4-1.2 1.1.7zM27.8 33.3c.4-.2.8-.5 1.4-.5.4 0 1 .1 1 .4 0 .3-1 .8-1.3 1.1-.6.6-1.7 1.7-2.3 1.8h-.4c.4-1 .9-1.8 1.4-2.6 0-.2 0-.2.2-.2zm2.8-3.6l.7.3c0 .4 0 .8-.3 1.1-.6.6-1.3.9-2 .9l-.4-.3c.6-.6 1.1-1.3 2-2zM98-4.8S65.6 14 64 15.5a12.2 12.2 0 0 1-10.8 3.7c-5.5-1-8.7-1.4-11.5-1.8-2.7-.4-4.6 0-4.7-1-.3-1.3 1.2-2.5 3.5-2.8 2.2-.2 6 .2 6.8.2.8 0 1.4-.3 1.2-1-.3-.5-4.7-.8-6-.7a31 31 0 0 0-8.9 2.4c-2.4 1.3-7 4.7-7.7 5-.8.2-2.3 1-2.8.2s.5-2 1.4-2.8a97 97 0 0 1 12.7-9.4c3.9-2.2 4.9-2.5 8.9-2.2 4 .4 7.4 1.7 9.4 1.4 2.3-.3 4.6-1.2 6.4-2.7 1-.7 17.3-16 17.3-16H98v7.2z"/>
                  <path d="M-14 90.8S18.4 72 20 70.5c2.8-3 6.8-4.3 10.8-3.7 5.5 1 8.7 1.4 11.5 1.8 2.7.4 4.6 0 4.7 1 .3 1.3-1.2 2.5-3.5 2.8-2.2.2-6-.2-6.8-.2-.8 0-1.4.3-1.2 1 .3.5 4.7.8 6 .7a31 31 0 0 0 8.9-2.4c2.4-1.3 7-4.7 7.7-5 .8-.2 2.3-1 2.8-.2s-.5 2-1.4 2.8a97 97 0 0 1-12.7 9.4c-3.9 2.2-4.9 2.5-8.9 2.2-4-.4-7.4-1.7-9.4-1.4-2.3.3-4.6 1.2-6.4 2.7-1 .7-17.3 16-17.3 16H-14v-7.2z"/>
                </g>
              </g>
            </svg>
          </div>
          <div class="Summary-bar">
            <svg class="Summary-knob js-knob" viewBox="0 0 86 86">
              <defs><circle id="a-knob-2" cx="43" cy="43" r="43"/></defs>
              <g fill="none" fill-rule="evenodd" transform="rotate(90 43 43)">
                <mask id="b-knob-2" fill="#fff">
                  <use xlink:href="#a-knob-2"/>
                </mask>
                <use fill="#2F00DE" xlink:href="#a-knob-2"/>
                <g fill="#FFF" fill-rule="nonzero" mask="url(#b-knob-2)">
                  <path d="M82.3 97.5S63.5 65.1 62 63.5a12.2 12.2 0 0 1-3.7-10.8c1-5.5 1.4-8.7 1.8-11.5.4-2.7 0-4.6 1-4.7 1.3-.3 2.5 1.2 2.8 3.5.2 2.2-.2 6-.2 6.8 0 .8.3 1.4 1 1.2.5-.3.8-4.7.7-6a31 31 0 0 0-2.4-8.9c-1.3-2.4-4.7-7-5-7.7-.2-.8-1-2.3-.2-2.8s2 .5 2.8 1.4A97 97 0 0 1 70 36.7c2.2 3.9 2.5 4.9 2.2 8.9-.4 4-1.7 7.4-1.4 9.4.3 2.3 1.2 4.6 2.7 6.4.7 1 16 17.3 16 17.3v18.8h-7.2z"/>
                  <path d="M41.4 54.5c5.2.8 10.5-2 12.8-7 .2-.8.4-1.5.4-2.1 0 0-9.3 3-24.5-2.8 0 0 16.3 4.9 28.4-.2 1-.3 2-.9 2.9-1.4 3.2-1.1 5.4-1.8 6-3.3.4-1-6 1.2-6.6 1.5-2.6 1.3-5.1 2-7.8 2.2-2.1-3.2-6.1-8-11.4-8-7 0-12 7.7-21.1 6.5-2.2-.6 10 13.6 20.9 14.6z"/>
                </g>
              </g>
            </svg>
          </div>
          <div class="Summary-bar">
            <svg class="Summary-knob js-knob" viewBox="0 0 86 86">
              <defs><circle id="a-knob-3" cx="43" cy="43" r="43"/></defs>
              <g fill="none" fill-rule="evenodd" transform="rotate(90 43 43)">
                <mask id="b-knob-3" fill="#fff">
                  <use xlink:href="#a-knob-3"/>
                </mask>
                <use fill="#2F00DE" xlink:href="#a-knob-3"/>
                <g fill="#FFF" fill-rule="nonzero" mask="url(#b-knob-3)">
                  <path d="M52.4 9c-3 0-5.5 2.4-5.5 5.5v.3a7.3 7.3 0 1 0 .6 14.6c1.3 0 2.3-.4 3.4-.8a8.3 8.3 0 0 0 16.4-1.8v-2.5h16.4l.3-.1v-3c0-.2-.2-.2-.3-.2H67.2v-5c0-3.2-2.6-5.8-5.9-5.8-1.5 0-2.9.6-4 1.5A5.9 5.9 0 0 0 52.4 9zm4.7 38.8c0 1.7-1.4 3.1-3.1 3.1-1.1 0-2.1-.6-2.7-1.6l-.6.2c-.8 0-1.3-.8-1.2-1.5-.1-.8.5-1.5 1.2-1.6l.5.1c.7-1.5 2.6-2.2 4.1-1.5 1.1.6 1.8 1.7 1.8 2.8zm11.3 8.8L60.1 54s-2.4-.9-2.4-3v-6.4c0-2 2.4-3 2.4-3l8.3-2.6s1.3-.4 1.8.5h.1l15.7-3c.2 0 .5.1.5.4v.1c0 .2-.2.4-.4.5l-15.7 3h-.1c-.1.8-1.1 1.1-1.1 1.1l-7 2.1s-.5.1-.4.5c.1.4.7.2.7.2l13.1-3.6v3.3h9.3c.9 0 1.6.7 1.6 1.6 0 1-.7 1.6-1.6 1.6h-9.3v1h9.3c.9 0 1.5.7 1.5 1.6-.1.8-.7 1.4-1.5 1.5h-9.3v3.3l-13.1-3.6s-.6 0-.7.2c-.1.3.4.5.4.5l7 2.1s1.5.4 1.1 1.7c-.4 1.3-1.9 1-1.9 1zM21 88.4c0 .3.3.6.5.6h66.9c.3 0 .6-.3.6-.5v-9.6H77.6v-6.2H89v-9c0-.4-.3-.7-.5-.7H21.6c-.3 0-.6.3-.6.6v24.8zm62.4-7.7l.2.2v5c0 .2-.1.3-.2.3h-5.6l-.2-.2v-5c0-.2.1-.3.2-.3h5.6zm-10.7 0l.2.2v5c0 .2 0 .3-.2.3h-5.5c-.2 0-.3-.1-.3-.2v-5c0-.2.1-.3.3-.3h5.5zm-10.5 0l.2.2v5c0 .2-.1.3-.2.3h-5.6l-.2-.2v-5c0-.2.1-.3.2-.3h5.6zm-10.7 0l.2.2v5c0 .2 0 .3-.2.3H46c-.2 0-.3-.1-.3-.2v-5c0-.2.1-.3.3-.3h5.5zm-10.6 0c.2 0 .3.1.3.2v5c0 .2-.1.3-.3.3h-5.5l-.2-.2v-5c0-.2.1-.3.2-.3H41zm-10.6 0l.2.2v5c0 .2 0 .3-.2.3h-5.5c-.2 0-.3-.1-.3-.2v-5c0-.2.1-.3.3-.3h5.5zM72.8 73l.3.2v5c0 .2-.2.3-.3.3h-5.5l-.3-.2v-5c0-.2.2-.3.3-.3h5.5zm-10.6 0l.2.2v5c0 .2-.1.3-.2.3h-5.6l-.2-.2v-5c0-.2.1-.3.2-.3h5.6zm-10.7 0l.2.2v5c0 .2 0 .3-.2.3H46c-.2 0-.3-.1-.3-.2v-5c0-.2.1-.3.3-.3h5.5zm-10.6 0c.2 0 .3.1.3.2v5c0 .2-.1.3-.3.3h-5.5l-.2-.2v-5c0-.2.1-.3.2-.3H41zm-10.6 0l.2.2v5c0 .2 0 .3-.2.3h-5.5c-.2 0-.3-.1-.3-.2v-5c0-.2.1-.3.3-.3h5.5zm53-7.7c.2 0 .3.1.3.2v5c0 .2-.1.3-.2.3h-5.6l-.2-.2v-5c0-.2.1-.3.2-.3h5.6zm-10.5 0l.3.2v5c0 .2-.2.3-.3.3h-5.5l-.3-.2v-5c0-.2.2-.3.3-.3h5.5zm-10.6 0l.2.2v5c0 .2-.1.3-.2.3h-5.6l-.2-.2v-5c0-.2.1-.3.2-.3h5.6zm-10.7 0l.2.2v5c0 .2 0 .3-.2.3H46c-.2 0-.3-.1-.3-.2v-5c0-.2.1-.3.3-.3h5.5zm-10.6 0c.2 0 .3.1.3.2v5c0 .2-.1.3-.3.3h-5.5l-.2-.2v-5c0-.2.1-.3.2-.3H41zm-10.6 0l.2.2v5c0 .2 0 .3-.2.3h-5.5c-.2 0-.3-.1-.3-.2v-5c0-.2.1-.3.3-.3h5.5z"/>
                </g>
              </g>
            </svg>
          </div>
          <div class="Summary-bar">
            <svg class="Summary-knob js-knob" viewBox="0 0 86 86">
              <defs><circle id="a-knob-4" cx="43" cy="43" r="43"/></defs>
              <g fill="none" fill-rule="evenodd" transform="rotate(90 43 43)">
                <mask id="b-knob-4" fill="#fff">
                  <use xlink:href="#a-knob-4"/>
                </mask>
                <use fill="#2F00DE" xlink:href="#a-knob-4"/>
                <g fill="#FFF" fill-rule="nonzero" mask="url(#b-knob-4)">
                  <path d="M64.75 66.45l9.6 3.34s1.5.45 1.95-.91c.15-.76-.3-1.67-1.05-1.82L67 64.33s-.6-.15-.45-.6c.15-.46.6-.3.6-.3L78.4 66.6v-2.43h7.2c1.2 0 2.25-.9 2.25-2.27 0-.3 0-.6-.15-.76a2.3 2.3 0 0 0-2.25-1.51h-7.2v-1.37h7.05c.9 0 1.8-.6 2.1-1.51.45-1.21-.3-2.43-1.35-2.88-.3-.15-.45-.15-.75-.15h-7.2V51.3l-8.25 2.28c-.3.15-.6.15-1.05.15h-1.05c-.3 0-.75-.15-1.05-.3l-9.15-5.16a2.4 2.4 0 0 0-2.25-1.82H40.75c-.6 0-1.2-.15-1.2-1.2 0-.77.75-.77 1.2-.92h43.5a3.5 3.5 0 0 0 3.45-3.48 3.5 3.5 0 0 0-3.45-3.49h-24.9c-.45 0-.9-.3-1.05-.9v-.16c0-.45.3-.9.9-.9h25.2a3.38 3.38 0 0 0 3.15-3.64 3.53 3.53 0 0 0-3.15-3.18H40.9c-.45 0-1.2-.16-1.2-.91 0-1.06.75-1.22 1.2-1.22h14.55a2.27 2.27 0 0 0 2.1-2.57c-.15-1.21-1.05-2.12-2.1-2.12h-16.8a8.17 8.17 0 0 0-8.1 7.42v14.4a8.17 8.17 0 0 0 8.1 7.42h16.8c.15 0 .45 0 .6-.15l1.05.6c.15.16 3.9 2.28 4.5 2.88.45.3.6.91.6 1.37v7.42a3.58 3.58 0 0 0 2.55 3.33z"/>
                  <path d="M55.9 54.48a4.44 4.44 0 0 0-4.5 4.55 4.44 4.44 0 0 0 4.5 4.55c2.55 0 4.5-1.97 4.5-4.55s-2.1-4.55-4.5-4.55zM22.15 30.7a6.2 6.2 0 0 0 0 12.42 6.11 6.11 0 0 0 6.15-6.21 6.15 6.15 0 0 0-5.85-6.21h-.3z"/>
                </g>
              </g>
            </svg>
          </div>
        </div>

        <div class="Story-block Story-block--end">
          <div class="Story-copy">
            <div class="Text">
              <h2 class="Text-story2">${asText(doc.data.markets_title).trim()}</h2>
              <p class="Text-story Text-story--end">${asText(doc.data.markets_body).trim()}</p>
            </div>
          </div>
          <a class="Story-link" href="/markets">${doc.data.markets_link_text}</a>
        </div>
      </div>
    `
  }
}
