module.exports = config

function config (ctx) {
  const plugins = [
    require('postcss-color-function')(),
    require('postcss-custom-media')(),
    require('postcss-selector-matches')()
  ]

  if (ctx.env !== 'development') {
    plugins.push(require('postcss-custom-properties')({warnings: false}))
  }

  return {
    map: ctx.env === 'development' ? ctx.map : false,
    plugins: plugins
  }
}
