module.exports = document

function document (state, body, stack) {
  return `
    <!doctype html>
    <html lang="${state.lang || 'en-US'}" dir="${state.meta.dir || 'ltr'}">
      <head>
        <meta charset="utf-8">
        <meta http-equiv="x-ua-compatible" content="ie=edge">
        <title>${state.title}</title>
        <meta name="description" content="${state.meta.description}">
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
        <meta property="theme" name="theme-color" content="${state.meta.theme}">
        <meta property="og:title" content="${state.title}">
        <meta property="og:description" content="${state.meta.description}">
        ${state.meta.image ? `
          <meta property="og:image" content="${state.meta.image.url}">
          <meta property="og:image:width" content="${state.meta.image.width}">
          <meta property="og:image:height" content="${state.meta.image.height}">
        ` : ''}
        <meta property="og:url" content="${state.meta.url}">
        <meta property="og:site_name" content="${state.meta.site_name}">
        ${state.meta.twitter_name ? `<meta name="twitter:site" content="@${state.meta.twitter_name}">` : ''}
        ${state.meta.facebook_id ? `<meta property="fb:app_id" content="${state.meta.facebook_id}">` : ''}
        <link rel="dns-prefetch" href="//res.cloudinary.com">
        <link rel="dns-prefetch" href="//quantifiedplanet.cdn.prismic.io">
        <link rel="manifest" href="/manifest.json">
        <link rel="apple-touch-icon" href="/icon.png">
        <link rel="mask-icon" href="/icon.svg" color="${state.meta.theme}">
        <script>document.documentElement.classList.add('has-js')</script>
        ${script(stack)}
        ${stack.styles ? stylesheet(stack) : ''}
      </head>
      ${body.replace(/<\/body>\s*$/, `
        ${polyfill(stack)}
        <script>window.initialState = ${JSON.stringify(state, replacer)}</script>
      </body>
      `)}
    </html>
  `
}

function script (stack) {
  if (process.env.NODE_ENV === 'development') {
    return `<script src="/bundle.js" defer></script>`
  }
  var hex = stack.main.hash.toString('hex').slice(0, 16)
  var base64 = `sha512-${stack.main.hash.toString('base64')}`
  var src = `/${hex}/bundle.js`
  return `<script src="${src}" defer integrity="${base64}"></script>`
}

function stylesheet (stack) {
  if (process.env.NODE_ENV === 'development') {
    return '<link rel="stylesheet" href="/bundle.css">'
  }

  return `<style>${stack.styles.buffer.toString('utf8')}</style>`
}

function polyfill (stack) {
  if (process.env.NODE_ENV === 'development') return ''
  var fills = stack.opts.polyfill
  if (!fills && fills !== false) {
    fills = [
      'Array.prototype.includes',
      'Array.prototype.find',
      'Array.prototype.findIndex'
    ]
  }
  return `<script src="https://cdn.polyfill.io/v2/polyfill.min.js${fills ? `?features=default,${fills.join(',')}` : ''}"></script>`
}

// clean up borked JSON
// (str, any) -> str
function replacer (key, value) {
  if (typeof value !== 'string') return value

  if (key === 'html') {
    // Remove all line breaks in embedded html
    value = value.replace(/\n+/g, '')
    value = value.replace(/<\//g, '<\\/')
  }

  // Remove special characters and invisible linebreaks
  return value.replace(/[\u2028\u200B-\u200D\uFEFF]/g, '')
}
