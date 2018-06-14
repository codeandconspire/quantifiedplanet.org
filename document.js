const hyperstream = require('hstream')

module.exports = document

function document () {
  return hyperstream({
    '[name="theme-color"]': {
      content: '#010119'
    },
    head: {
      _appendHtml: `
        <link rel="dns-prefetch" href="https://quantifiedplanet.cdn.prismic.io">
        <meta property="og:site_name" content="Quantified Planet">
        <meta name="twitter:site" content="@QuantifiedPlnt">
        <meta property="fb:app_id" content="691778380943572">
        <link rel="apple-touch-icon" href="/icon.png">
        <link rel="mask-icon" href="/icon.svg" color="#010119">
        <script async src="https://www.googletagmanager.com/gtag/js?id=UA-114059493-1"></script>
        <script>
          (function () {
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'UA-114059493-1');
          }())
        </script>
        <script>document.documentElement.classList.add('has-js')</script>
      `
    }
  })
}
