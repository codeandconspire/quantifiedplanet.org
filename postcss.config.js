module.exports = config

function config (ctx) {
  const plugins = [
    require('postcss-import')(),
    require('postcss-custom-properties')(),
    require('postcss-color-function')(),
    require('postcss-custom-media')(),
    require('postcss-selector-matches')(),
    require('postcss-url')([{
      filter: '**/*.woff2',
      url: ctx.env === 'development' ? 'rebase' : 'inline'
    }, {
      useHash: true,
      url: ctx.env === 'development' ? 'rebase' : 'copy'
    }])
  ]

  if (ctx.env !== 'development') {
    plugins.push(
      require('autoprefixer')(),
      require('cssnano')({ preset: 'default' })
    )
  }

  return {
    map: ctx.env === 'development' ? ctx.map : false,
    plugins: plugins
  }
}
