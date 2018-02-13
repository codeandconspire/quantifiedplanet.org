const fs = require('fs')
const path = require('path')
const texts = require('./texts.json')

// application routes
const ROUTES = exports.ROUTES = {
  homepage: '/',
  page: '/:page',
  section: '/:page/:section',
  explorer: '/data-explorer'
}

if (typeof window !== 'undefined') {
  const scrollIntoView = window.Element.prototype.scrollIntoView
  window.Element.prototype.scrollIntoView = function (...args) {
    try {
      scrollIntoView.apply(this, args)
    } catch (err) {
      window.scrollTo(0, this.offsetTop)
    }
  }
}

// compose class name ruled by provided conditions
// (str, obj) -> str
exports.className = className
function className (root, classes) {
  if (typeof root === 'object') {
    classes = root
    root = ''
  }

  return Object.keys(classes).filter(key => classes[key]).reduce((str, key) => {
    return str + ' ' + key
  }, root).trim()
}

// get text by applying as tagged template literal i.e. text`Hello ${str}`
// (arr|str[, ...str]) -> str
exports.text = text
function text (strings, ...parts) {
  parts = parts || []

  const key = Array.isArray(strings) ? strings.join('%s') : strings
  let value = texts[key]

  if (!value) {
    value = texts[key] = key
    if (typeof window === 'undefined') {
      fs.writeFileSync(
        path.resolve(__dirname, 'texts.json'),
        JSON.stringify(texts, null, 2)
      )
    }
  }

  return value.split(/%s/).reduce(function (result, val, index) {
    return result + val + (parts[index] || '')
  }, '')
}

// create a decorated error
// (num, str) -> Error
exports.error = error
function error (status, msg) {
  const err = new Error(msg || 'Error')
  err.status = status
  return err
}

// map route path to keys in props
// (str, obj) -> str
exports.resolveRoute = resolveRoute
function resolveRoute (route, props) {
  return route.replace(/\/:(\w+)/g, function (match, key) {
    return '/' + props[key]
  })
}

// resolve document href
// (obj[, obj]) -> fn|str
exports.resolveLink = resolveLink
function resolveLink (doc) {
  switch (doc.type) {
    case 'homepage': return ROUTES.homepage
    case 'page': return resolveRoute(ROUTES.page, { page: doc.uid })
    default: throw error(500, text`Unrecognized document type`)
  }
}

// get viewport height
// () -> num
exports.vh = vh
function vh () {
  return Math.max(document.documentElement.clientHeight, window.innerHeight || 0)
}

// get viewport width
// () -> num
exports.vw = vw
function vw () {
  return Math.max(document.documentElement.clientWidth, window.innerWidth || 0)
}

// format string as url-friendly id
// str -> str
exports.friendlyUrl = friendlyUrl
function friendlyUrl (str) {
  return str
    .replace(/[^\w]/g, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^-?(.+?)-?$/, '$1')
    .toLowerCase()
}

// modulate value in range (from Framer.js)
// (num, arr, arr, bool) -> num
exports.modulate = modulate
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

// calculate distance between two lat/lng points in km
// (arr, arr) -> num
exports.distance = distance
function distance (posA, posB) {
  const [lng1, lat1] = posA
  const [lng2, lat2] = posB

  const R = 6371 // radius of the earth in km
  const dLat = deg2rad(lat2 - lat1)
  const dLon = deg2rad(lng2 - lng1)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const d = R * c // distance in km

  return d
}

// convert degrees to radius
function deg2rad (deg) {
  return deg * (Math.PI / 180)
}
