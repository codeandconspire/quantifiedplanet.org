const html = require('choo/html')
const Component = require('nanocomponent')
const asElement = require('prismic-element')
const { asText } = require('prismic-richtext')

module.exports = class Story extends Component {
  static id (doc) {
    return `story-${doc.id}`
  }

  update (doc) {
    return Story.id(doc) !== this._name
  }

  load (doc) {
    this.vw = Math.max(document.documentElement.clientWidth, window.innerWidth || 0)
    this.vh = Math.max(document.documentElement.clientHeight, window.innerHeight || 0)
    this.overlay = this.element.querySelector('.js-overlay')
    this.intro = this.element.querySelector('.js-intro')
    this.fade = this.element.querySelector('.js-fade')
    this.content = this.element.querySelector('.js-content')

    this.content.style.paddingTop = this.vh + 'px'

    window.addEventListener('scroll', this.onScroll.bind(this), {passive: true})
  }

  onScroll (event) {
    this.scroll = window.scrollY
    const clip = modulate(this.scroll, [0, this.vw], [this.vw, 0], true)
    const intro = modulate(this.scroll, [this.vh, 0], [-50, 0], true)
    const fade = modulate(this.scroll, [(this.vw + (this.vh / 3)), this.vw], [1, 0], true)

    this.overlay.style.WebkitClipPath = `inset(0 0 0 ${clip}px)`
    this.intro.style.transform = `translateY(${intro}px)`
    this.fade.style.opacity = fade

    // Todo: unbind things when not needed (scrolled past etc.)
    // Todo: add will change when needed
  }

  createElement (doc) {
    this.isFixed = true

    return html`
      <div class="Story">
        <div class="Story-intro js-intro ${this.isFixed ? 'is-fixed' : ''}">
          <img class="Story-planet" src="https://i.imgur.com/kwjNfzw.png" role="presentation" />
          <div class="Story-body">
            <div class="Text">
              <h1 class="Text-story1">${asText(doc.data.title)}</h1>
              ${asElement(doc.data.description)}
            </div>
          </div>

          <div class="Story-overlay js-overlay"></div>
          <div class="Story-fade js-fade"></div>
        </div>

        <div class="Story-content js-content">
          <div class="Story-steps">
            <div class="Story-step Story-step--1">Step 1</div>
            <div class="Story-step Story-step--2">Step 2</div>
            <div class="Story-step Story-step--3">Step 3</div>
          </div>

          <div class="Story-block">
            <div class="View-container">
              <div class="Text">
                <h2 class="Text-story2">Quantified Planet is a non-profit organization passionate about open real time data.</h2>
                <p>We believe that the power of real time data about the health of people, cities and our planet can contribute to a sustainable and resilient planet for the benefit of humanity.</p>
              </div>
            </div>
          </div>

          <div class="Story-steps">
            <div class="Story-step Story-step--1">Thing</div>
          </div>

          <div class="Story-block">
            <div class="View-container">
              <div class="Text">
                <h2 class="Text-story2">Quantified Planet is a non-profit organization passionate about open real time data.</h2>
                <p>We believe that the power of real time data about the health of people, cities and our planet can contribute to a sustainable and resilient planet for the benefit of humanity.</p>
              </div>
            </div>
          </div>


          <div class="Story-block Story-block--dark">
            <div class="View-container">
              <svg class="Story-logo" viewBox="0 0 120 121" width="120" height="121"><defs><path id="gg-a" d="M0 .1h120v16.1H0z"/><path id="gg-c" d="M.2.1h9.3v7.4H.2z"/></defs><g fill="none" fill-rule="evenodd"><path fill="#FFFFFE" d="M30.7 98.8h3.8v8.4h-2v-1.7c-.3 1.2-1 1.9-2.4 1.9-2.3 0-3.3-1.8-3.3-4.3v-7.6c0-2.5 1.1-4.3 4-4.3 2.8 0 3.7 1.6 3.7 4v1.4H32V95c0-1-.4-1.6-1.3-1.6-1 0-1.4.7-1.4 1.6v8.5c0 1 .4 1.7 1.3 1.7s1.3-.5 1.3-1.5v-2.8h-1.3v-2.1M35.8 91.4h2.6V105h3.1v2.2h-5.7V91.4M47.7 103.5V95c0-1-.4-1.6-1.3-1.6-1 0-1.4.7-1.4 1.6v8.5c0 1 .4 1.7 1.4 1.7 1 0 1.3-.7 1.3-1.7m-5.3-.4v-7.6c0-2.5 1.2-4.3 4-4.3s4 1.8 4 4.3v7.6c0 2.5-1.2 4.3-4 4.3s-4-1.8-4-4.3M54.3 100v5h1.1c1 0 1.3-.4 1.3-1.3v-2.3c0-.9-.4-1.3-1.3-1.3h-1.1zm0-2h.9c.9 0 1.2-.4 1.2-1.2v-2c0-.8-.3-1.2-1.2-1.2h-1V98zm-2.7-6.6h3.9c2.6 0 3.5 1.2 3.5 3.5v1.6c0 1.3-.5 2.1-1.6 2.5 1.3.3 2 1.2 2 2.6v2.1c0 2.3-1 3.5-3.7 3.5h-4V91.4zM63.2 102.2h2.1l-1-6.4-1 6.4zm-3.3 5l3-15.8h3l3 15.8h-2.7l-.5-2.9h-2.8l-.5 2.9H60zM69.7 91.4h2.7V105h3.1v2.2h-5.8V91.4M82.6 98.8h3.8v8.4h-2v-1.7c-.3 1.2-1 1.9-2.4 1.9-2.3 0-3.3-1.8-3.3-4.3v-7.6c0-2.5 1.1-4.3 4-4.3 2.8 0 3.7 1.6 3.7 4v1.4H84V95c0-1-.4-1.6-1.3-1.6-1 0-1.4.7-1.4 1.6v8.5c0 1 .4 1.7 1.3 1.7.8 0 1.3-.5 1.3-1.5v-2.8h-1.3v-2.1M93 103.5V95c0-1-.4-1.6-1.4-1.6-.9 0-1.3.7-1.3 1.6v8.5c0 1 .4 1.7 1.3 1.7 1 0 1.4-.7 1.4-1.7m-5.3-.4v-7.6c0-2.5 1.2-4.3 4-4.3 2.7 0 4 1.8 4 4.3v7.6c0 2.5-1.3 4.3-4 4.3-2.8 0-4-1.8-4-4.3M99.4 102.2h2.1l-1-6.4-1 6.4zm-3.3 5l3-15.8h3l3 15.8h-2.7l-.5-2.9H99l-.5 2.9h-2.5zM105.9 91.4h2.7V105h3.1v2.2h-5.8V91.4"/><g transform="translate(0 91.2)"><mask id="gg-b" fill="#fff"><use xlink:href="#gg-a"/></mask><path fill="#FFFFFE" d="M112.4 12.6v-2h2.5v2c0 1 .4 1.5 1.3 1.5.8 0 1.2-.6 1.2-1.4V12c0-1-.4-1.5-1.2-2.3l-1.6-1.5c-1.5-1.5-2.1-2.4-2.1-4.2v-.6c0-2 1-3.4 3.7-3.4 2.6 0 3.6 1.3 3.6 3.5V5h-2.4V3.5c0-.9-.4-1.3-1.2-1.3-.8 0-1.3.4-1.3 1.3v.3c0 1 .5 1.4 1.3 2.2l1.7 1.6c1.4 1.5 2 2.4 2 4.2v.7c0 2.2-1 3.7-3.7 3.7s-3.8-1.5-3.8-3.6M0 .2h7v2.2H4.8V16H2.2V2.4H0V.2" mask="url(#b)"/></g><path fill="#FFFFFE" d="M13.2 100.2h-2.6v7H8V91.4h2.6v6.7h2.6v-6.7h2.6v15.8h-2.6v-7M17.1 91.4h6.3v2.2h-3.7v4.5h2.7v2.1h-2.7v4.8h3.7v2.2h-6.3V91.4M39.8 29a23 23 0 0 1 3.6-4.7l-11.8-13c-3 2.8-5.4 6.1-7.4 9.8l15.6 7.8M68.6 19.7c1.8.9 3.5 2 5 3.2l11.8-13c-3.1-2.7-6.7-5-10.5-6.6l-6.3 16.4M95.7 23.7L80 31.5c.8 1.8 1.3 3.7 1.6 5.6L99 35.4c-.5-4.1-1.7-8-3.3-11.7M79 29.2l15.5-7.8c-1.9-3.7-4.4-7-7.3-9.8l-11.8 13c1.4 1.4 2.5 3 3.5 4.6M36.7 40.5v-1.1l-17.4-1.6a42.2 42.2 0 0 0 1.1 12.4l16.8-4.8a23 23 0 0 1-.5-5M76.7 54.9a23 23 0 0 1-4.2 4l9.2 15c3.4-2.3 6.4-5.1 9-8.4L76.7 55M81.8 40.5c0 1.6-.1 3.2-.5 4.8l16.8 4.9A40.7 40.7 0 0 0 99.2 38l-17.4 1.6v.9M42.1 55.2L28.2 66c2.6 3.2 5.7 6 9 8.3l9.3-15c-1.6-1.1-3.1-2.5-4.4-4M37 36.9c.3-2 .9-4 1.7-5.7L23 23.3c-1.7 3.8-2.9 7.8-3.4 12L37 36.9M79.5 75.3l-9.1-15c-1.7 1-3.5 1.7-5.4 2.2l3.2 17.4c4-1 7.9-2.5 11.3-4.6M80.7 47.8c-.7 1.8-1.5 3.5-2.5 5l14 10.7c2.2-3.3 4-7 5.2-10.9l-16.7-4.8M62.5 63a22.5 22.5 0 0 1-5.9 0l-3.2 17.4a40 40 0 0 0 12.4 0L62.5 63M60.7 17.7c2 .1 3.8.5 5.6 1.1l6.3-16.5A39.4 39.4 0 0 0 60.7.1v17.6M54.2 62.7c-2-.5-3.9-1.2-5.6-2.2l-9.2 15c3.6 2 7.4 3.6 11.5 4.5l3.3-17.3M52.5 18.7c1.8-.5 3.7-.9 5.7-1V.1C54 0 50 1 46.2 2.3l6.3 16.4M40.6 53.2c-1.1-1.6-2-3.5-2.7-5.4l-16.8 4.9c1.3 4 3.2 7.8 5.6 11.2l13.9-10.7M45.3 22.6c1.5-1.2 3-2.2 4.8-3L43.8 3.2a40 40 0 0 0-10.3 6.4l11.8 13M5.5 114.4H2.4v3.5h-.7v-7.3h4.1v.6H2.4v2.6h3.1v.6M8.7 113.5c-1.3 0-1.3.9-1.3 2 0 1 0 2 1.3 2s1.4-1 1.4-2c0-1.1-.1-2-1.4-2zm0 4.5c-1.6 0-2-1-2-2.5s.4-2.6 2-2.6c1.7 0 2 1 2 2.6 0 1.5-.3 2.5-2 2.5zM14.6 113.6H14c-.7 0-1 0-1.4.3v4h-.7V113h.4l.1.4c.5-.3 1-.5 1.6-.5h.6v.7M17.6 112.5c0 1 .6 1.2 1.8 1.3 1.4.2 2.3.6 2.3 2 0 1-.5 2.2-2.7 2.2a6 6 0 0 1-2-.4v-.6c.4.2 1 .4 2 .4 1.5 0 2-.7 2-1.6 0-1-.5-1.2-1.7-1.4-1.7-.2-2.3-.6-2.3-1.9 0-.8.4-2 2.4-2 .9 0 1.5.2 1.9.3v.7c-.7-.3-1.2-.4-2-.4-1.3 0-1.7.7-1.7 1.4M23.5 116.6c0 .6.3.8 1 .8.6 0 .9 0 1.2-.3v-4h.7v4.8H26l-.1-.4c-.5.4-1 .5-1.5.5-1.1 0-1.6-.5-1.6-1.4V113h.7v3.6M29.3 115.1c1.4.1 1.7.6 1.7 1.4 0 .8-.5 1.5-2 1.5-.4 0-1 0-1.4-.2v-.6l1.5.2c1 0 1.2-.4 1.2-.9 0-.4-.1-.7-1-.8-1.5-.1-1.8-.6-1.8-1.3 0-.7.5-1.5 1.9-1.5.4 0 1 .1 1.4.3v.6a4 4 0 0 0-1.5-.3c-1 0-1.1.4-1.1.9 0 .4.2.6 1 .7M34.6 118h-.4c-.8 0-1.5-.3-1.5-1.3v-3.1h-1v-.3l1-.3v-1.3l.6-.2v1.5h1.5v.6h-1.5v3c0 .6.4.9 1 .9h.3v.5M37.3 115.5c-.7 0-1 .4-1 1 0 .4.1 1 1 1 .6 0 .9-.2 1.3-.5v-1.7l-1.3.2zm.2-2c-.7 0-1.1.2-1.5.3v-.6c.4-.2 1-.3 1.5-.3 1.4 0 1.8.7 1.8 1.7v3.3h-.4l-.1-.4c-.5.4-1 .5-1.5.5-1.3 0-1.7-.7-1.7-1.5 0-.9.5-1.5 1.7-1.6h1.3v-.3c0-.7-.2-1-1.1-1zM40.7 117v-4h.7v4c0 .4 0 .5.4.5v.5c-.7 0-1-.3-1-1zm.3-6c.3 0 .5.3.5.6 0 .2-.2.5-.5.5a.5.5 0 0 1-.4-.5c0-.3.2-.5.4-.5zM45.8 114.4c0-.7-.3-.9-1-.9-.6 0-.9.2-1.2.4v4h-.7V113h.4l.1.4c.5-.3 1-.5 1.5-.5 1.1 0 1.6.6 1.6 1.5v3.5h-.7v-3.5M49.3 115.5c-.7 0-1 .4-1 1 0 .4 0 1 1 1 .5 0 .9-.2 1.3-.5v-1.7l-1.3.2zm.1-2c-.6 0-1 .2-1.4.3v-.6c.4-.2 1-.3 1.4-.3 1.5 0 1.9.7 1.9 1.7v3.3h-.4l-.2-.4c-.4.4-1 .5-1.4.5-1.3 0-1.7-.7-1.7-1.5 0-.9.4-1.5 1.7-1.6h1.3v-.3c0-.7-.3-1-1.2-1zM53.2 113.9v3.2c.4.2.7.3 1.3.3 1.2 0 1.4-1 1.4-2 0-.9-.2-1.9-1.4-1.9-.6 0-1 .2-1.3.4zm3.3 1.6c0 1.4-.4 2.5-2 2.5-.5 0-1-.1-1.5-.5l-.1.4h-.4v-7.3h.7v2.7c.4-.2.9-.4 1.3-.4 1.6 0 2 1.2 2 2.6zM57.9 117v-6.4h.6v6.4c0 .4.1.5.4.5v.5c-.7 0-1-.3-1-1M60.6 115.2h2.5c0-.8 0-1.7-1.1-1.7-1.2 0-1.4.9-1.4 1.7zM62 113c1.6 0 1.8 1.2 1.8 2.6v.3h-3.2c0 .8.3 1.6 1.4 1.6.7 0 1 0 1.6-.3v.6c-.6.3-1.2.3-1.6.3-1.7 0-2-1.1-2-2.5s.3-2.6 2-2.6zM67.4 117.3h1.3c1.8 0 2.3-1.3 2.3-3 0-1.8-.5-3-2.3-3h-1.3v6zm-.7.6v-7.3h2c2.4 0 3 1.6 3 3.7 0 2-.6 3.6-3 3.6h-2zM73.5 115.2H76c0-.8 0-1.7-1.1-1.7s-1.3.9-1.4 1.7zM75 113c1.6 0 1.8 1.2 1.8 2.6v.3h-3.2c0 .8.3 1.6 1.4 1.6.7 0 1.1 0 1.6-.3v.6c-.6.3-1.1.3-1.6.3-1.7 0-2-1.1-2-2.5s.3-2.6 2-2.6zM78.1 113l1.4 4 1.4-4h.7l-1.9 5h-.5l-1.8-5h.7M82.8 115.2h2.5c0-.8 0-1.7-1.1-1.7s-1.3.9-1.4 1.7zm1.4-2.3c1.6 0 1.8 1.2 1.8 2.6v.3h-3.2c0 .8.3 1.6 1.4 1.6.7 0 1.1 0 1.6-.3v.6c-.6.3-1.1.3-1.6.3-1.7 0-2-1.1-2-2.5s.3-2.6 2-2.6zM87.3 117v-6.4h.7v6.4c0 .4.1.5.4.5v.5c-.7 0-1-.3-1-1"/><g transform="translate(89.2 112.9)"><mask id="gg-d" fill="#fff"><use xlink:href="#gg-c"/></mask><path fill="#FFFFFE" d="M2.2.7C1 .7 1 1.5 1 2.7c0 1 0 1.9 1.3 1.9s1.4-.9 1.4-2c0-1-.1-2-1.4-2zm0 4.5c-1.6 0-2-1-2-2.6C.2 1.1.6.1 2.2.1c1.7 0 2 1 2 2.5s-.3 2.6-2 2.6zM8.8 2.6c0-1-.2-2-1.3-2-.7 0-1 .2-1.4.4v3.2c.4.2.7.4 1.4.4 1.1 0 1.3-1 1.3-2zM6 4.8v2.7h-.7V.2h.4l.2.4C6.5.2 7 0 7.5 0c1.5 0 2 1.1 2 2.5s-.5 2.6-2 2.6c-.5 0-1-.2-1.4-.4z" mask="url(#d)"/></g><path fill="#FFFFFE" d="M105.5 114.4c0-.7-.3-.9-.9-.9-.6 0-1 .2-1.3.4v4h-.6v-3.5c0-.7-.4-.9-1-.9-.5 0-.8.1-1.2.3v4.1h-.7V113h.4l.1.4c.5-.3 1-.5 1.5-.5.6 0 1 .2 1.3.6.5-.4 1-.6 1.5-.6 1 0 1.6.5 1.6 1.5v3.5h-.7v-3.5M108 115.2h2.5c0-.8 0-1.7-1.1-1.7-1.2 0-1.4.9-1.4 1.7zm1.4-2.3c1.6 0 1.8 1.2 1.8 2.6v.3H108c0 .8.3 1.6 1.4 1.6.7 0 1 0 1.6-.3v.6c-.6.3-1.2.3-1.6.3-1.7 0-2-1.1-2-2.5s.3-2.6 2-2.6zM115.3 114.4c0-.7-.3-.9-1-.9-.6 0-.9.2-1.3.4v4h-.6V113h.3l.2.4c.4-.3 1-.5 1.5-.5 1.1 0 1.6.6 1.6 1.5v3.5h-.7v-3.5M119.7 118h-.4c-.8 0-1.6-.3-1.6-1.3v-3.1h-1v-.3l1-.3v-1.3l.7-.2v1.5h1.5v.6h-1.5v3c0 .6.3.9 1 .9h.3v.5"/></g></svg>

              <div class="Text">
                <h2 class="Text-story2">We’re doing everything we can to help reach the Global Goals</h2>
                <p>We believe that the power of real time data about the health of people, cities and our planet can contribute to a sustainable and resilient planet for the benefit of humanity.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    `
  }
}

/**
 * Modulate function from Framer.js
 * @param {number} value Actual value
 * @param {array} rangeA Actual value range (min, max)
 * @param {array} rangeB Target value range (min, max)
 * @param {boolean} limit Whether to restrain limit within rangeB bounds
 * @return {number}
 */

function modulate (value, rangeA, rangeB, limit = false) {
  const [fromLow, fromHigh] = rangeA
  const [toLow, toHigh] = rangeB
  const result = toLow + (((value - fromLow) / (fromHigh - fromLow)) * (toHigh - toLow))

  if (limit === true) {
    if (toLow < toHigh) {
      if (result < toLow) { return toLow }
      if (result > toHigh) { return toHigh }
    } else {
      if (result > toLow) { return toLow }
      if (result < toHigh) { return toHigh }
    }
  }

  return result
}
