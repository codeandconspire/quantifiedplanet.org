const fs = require('fs')
const path = require('path')
const css = require('sheetify')
const texts = require('./texts.json')
css('normalize.css')
css('./fonts.css')
css('./utils.css')
css('./index.css')
css('./utils.css')

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
// (arr, ...str) -> str
exports.text = text
function text (strings, ...parts) {
  const key = strings.join('%s')
  let value = texts[key]

  if (!value && typeof window === 'undefined') {
    value = texts[key] = key
    fs.writeFileSync(
      path.resolve(__dirname, 'texts.json'),
      JSON.stringify(texts, null, 2)
    )
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

// resolve route path by path in props
// (str, obj) -> str
exports.resolveRoute = resolveRoute
function resolveRoute (route, props) {
  return route.replace(/\/:(\w+)/g, function (match, key) {
    return '/' + key.split('.').reduce(function (node, branch) {
      return node[branch]
    }, props)
  })
}

// resolve document href
// (obj[, obj]) -> fn|str
exports.resolveLink = resolveLink
function resolveLink (routes, doc) {
  if (!doc) return _doc => resolveLink(routes, _doc)
  switch (doc.type) {
    case 'homepage': return routes.homepage
    case 'page': return resolveRoute(routes.page, doc)
    default: throw error(500, text`Unrecognized document type`)
  }
}
