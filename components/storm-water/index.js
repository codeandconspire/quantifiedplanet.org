const html = require('choo/html')
const Component = require('choo/component')
const { text } = require('../base')

const BACKGROUND_PATHS = [
  'M0 52c32 13 72 19 120 17C244 73 258 7 362 7c35-2 62 2 82 13v202H0V52z',
  'M0 41c32-9 72-14 120-16 124 4 138 48 242 48 35-2 62-6 82-12v161H0V41z',
  'M0 61c32 11 72 16 120 14 124 4 182-25 242-30 35-3 62-1 82 5v172H0V61z',
  'M0 85c32-11 72-17 120-19 75 0 151 38 242 19 34-8 62-13 82-15v152H0V85z'
]
const FOREGROUND_PATHS = [
  'M444 22c-20 13-45 20-76 20-115 8-117-32-246-25C80 17 39 27 0 48v174h444V22z',
  'M444 43c-20-4-45-6-76-6-115 8-117 22-246 29-42 0-83-4-122-10v166h444V43z',
  'M444 75c-20 6-45 9-76 9-115 9-172-19-248-19-42 0-82 8-120 26v131h444V75z',
  'M444 78c-19-6-44-10-76-10-114 0-172 14-248 14-42 0-82-4-120-10v150h444V78z'
]

module.exports = class StormWater extends Component {
  load (element) {
    const background = element.querySelector('.js-background')
    const foreground = element.querySelector('.js-foreground')

    background.appendChild(html`
      <animate attributeName="d" begin="0ms" dur="3000ms" fill="freeze" keyTimes="0; 0.2; 0.4; 0.65; 1" values="${[background.getAttribute('d')].concat(BACKGROUND_PATHS).join(';')}" />
    `)

    foreground.appendChild(html`
      <animate attributeName="d" begin="0ms" dur="2250ms" fill="freeze" keyTimes="0; 0.2; 0.4; 0.65; 1" values="${[foreground.getAttribute('d')].concat(FOREGROUND_PATHS).join(';')}" />
    `)
  }

  update () {
    return false
  }

  createElement (props) {
    return html`
      <div class="StormWater">
        <svg class="StormWater-waves" width="444px" height="224px" viewBox="0 0 444 224">
          <defs>
            <linearGradient id="StormWater-wave--background" x1="82.9260927%" x2="-19.8704786%" y1="50%" y2="-20.1671987%">
              <stop offset="0%" stop-color="#010119"/>
              <stop offset="100%" stop-color="#400CFF"/>
            </linearGradient>
            <linearGradient id="StormWater-wave--foreground" x1="6.39620919%" x2="119.424777%" y1="32.1204722%" y2="84.5912976%">
              <stop offset="0%" stop-color="#010119"/>
              <stop offset="100%" stop-color="#010119"/>
            </linearGradient>
          </defs>
          <g fill="none" fill-rule="evenodd">
            <path class="StormWater-wave--background js-background" fill="url(#StormWater-wave--background)" d="M0 36C32 15 72 4 120 2c124 4 138 45 242 45 35-2 62-6 82-11v187H0V36z"/>
            <path class="StormWater-wave--foreground js-foreground" fill="url(#StormWater-wave--foreground)" d="M444 23C424 8 399 1 368 1 253 9 251 65 122 72 80 72 39 64 0 49v174h444V23z" opacity="0.64"/>
          </g>
        </svg>
        <svg class="StormWater-icon" width="70" height="73" viewBox="0 0 70 73">
          <g fill="none" fill-rule="evenodd">
            <path d="M-5 2h80v80H-5z"/>
            <g fill="#FFF">
              <path fill-rule="nonzero" d="M57 41c4 0 8-3 8-8 0-3-3-7-7-7l-2-1v-2c0-10-8-18-18-18-7 0-14 4-17 11v2l-2-1h-2c-6 0-11 6-11 12 0 7 5 12 11 12h40zm13-8c0 7-6 13-13 13H17C8 46 1 38 1 29s7-17 16-17C22 5 29 0 38 0c12 0 22 9 23 21 5 2 9 7 9 12z"/>
              <path d="M14 49c-4 4-6 8-6 10a6 6 0 1 0 12 0c0-2-2-6-6-10z"/>
              <path d="M32 57c-4 4-6 8-6 10a6 6 0 1 0 12 0c0-2-2-6-6-10z"/>
              <path d="M46 35c-4 4-6 8-6 10a6 6 0 1 0 12 0c0-2-2-6-6-10z"/>
            </g>
          </g>
        </svg>
        <p class="StormWater-description">
          <span class="StormWater-text">Millimeters of Storm Water Right Now in ${props.locality}</span>
          <span class="StormWater-value">${props.value.toFixed(2)}</span>
          <span class="StormWater-evaluation">${text`${text(props.evaluation)} for ${text(props.season)}`}</span>
        </p>
      </div>
    `
  }
}
