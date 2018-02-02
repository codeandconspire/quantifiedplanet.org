module.exports = freshRequire

function freshRequire (file) {
  clearRequireAndChildren(file)

  var exports = require(file)

  return exports
}

function isNotNativeModulePath (file) {
  return /\.node$/.test(file.id) === false
}

function isNotInNodeModules (file) {
  return /node_modules/.test(file.id) === false
}

function clearRequireAndChildren (key) {
  if (!require.cache[key]) return

  require.cache[key].children
    .filter(isNotNativeModulePath)
    .filter(isNotInNodeModules)
    .forEach(function (child) {
      clearRequireAndChildren(child.id)
    })
  delete require.cache[key]
}
