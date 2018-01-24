const html = require('choo/html')
const Component = require('nanocomponent')
const asElement = require('prismic-element')
const { asText } = require('prismic-richtext')

module.exports = class Hero extends Component {
  static id (doc) {
    return `hero-${doc.id}`
  }

  update (doc) {
    return Hero.id(doc) !== this._name
  }

  createElement (doc) {
    return html`
      <div class="Hero">
        <div class="Hero-intro">
          <img class="Hero-planet" src="https://i.imgur.com/kwjNfzw.png" role="presentation" />
          <div class="Hero-body">
            <div class="Text">
              <h1 class="Text-hero1">${asText(doc.data.title)}</h1>
              ${asElement(doc.data.description)}
            </div>
          </div>
        </div>

        <div class="Hero-blueprint"></div>
        <div class="Hero-fade"></div>

        <div class="Hero-steps">
          <div class="Hero-step Hero-step--1">Step 1</div>
          <div class="Hero-step Hero-step--2">Step 2</div>
          <div class="Hero-step Hero-step--3">Step 3</div>
        </div>

        <div class="Hero-block">
          <div class="View-container">
            <div class="Text">
              <h2 class="Text-hero2">Quantified Planet is a non-profit organization passionate about open real time data.</h2>
              <p>We believe that the power of real time data about the health of people, cities and our planet can contribute to a sustainable and resilient planet for the benefit of humanity.</p>
            </div>
          </div>
        </div>

        <div class="Hero-steps">
          <div class="Hero-step Hero-step--1">Thing</div>
        </div>

        <div class="Hero-block">
          <div class="View-container">
            <div class="Text">
              <h2 class="Text-hero2">Quantified Planet is a non-profit organization passionate about open real time data.</h2>
              <p>We believe that the power of real time data about the health of people, cities and our planet can contribute to a sustainable and resilient planet for the benefit of humanity.</p>
            </div>
          </div>
        </div>


        <div class="Hero-block Hero-block--dark">
          <div class="View-container">
            <div class="Text">
              <h2 class="Text-hero2">We’re doing everything we can to help reach the Global Goals</h2>
              <p>We believe that the power of real time data about the health of people, cities and our planet can contribute to a sustainable and resilient planet for the benefit of humanity.</p>
            </div>
          </div>
        </div>

      </div>
    `
  }
}
