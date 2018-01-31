#! /usr/bin/env node

process.title = 'stack'

var path = require('path')
var chalk = require('chalk')
var dedent = require('dedent')
var minimist = require('minimist')
var Stack = require('./index')

var USAGE = dedent`
  $ ${chalk.bold('stack')} ${chalk.magenta('<command>')} ${chalk.magenta('[entry]')} [options]

  Commands:
    build         compile all files to target directory
    start         start a server

  Options:
    -h, --help    show this help text
    -d, --dir     directory to compile to

  Examples:

    Start a server
    ${chalk.bold('stack start index.js')}

    Compile all files to the "dist" folder
    ${chalk.bold('stack build index.js --dir dist')}
`

var NOCOMMAND = dedent`
  Please specify a stack command:
    $ ${chalk.bold('stack')} ${chalk.magenta('<command>')} ${chalk.magenta('[entry]')} [options]

  For example:
    ${chalk.bold('stack start index.js')}

  Run ${chalk.bold('stack --help')} to see all options.
`

var argv = minimist(process.argv.slice(2), {
  alias: {
    help: 'h',
    dir: 'd'
  },
  boolean: [
    'help'
  ]
})

var cmd = argv._[0]
var entry = argv._[1]

if (entry) {
  if (!path.isAbsolute(entry)) entry = path.join(process.cwd(), entry)
} else {
  entry = process.cwd()
}

var app = require(path.join(entry))

if (argv.help) {
  console.log(USAGE)
  process.exit(0)
} else if (cmd === 'build') {
  if (app instanceof Stack) app.build(argv.dir, process.exit.bind(process, 0))
  else (new Stack(path.join(entry), argv)).build(argv.dir)
} else if (cmd === 'start') {
  if (app instanceof Stack) app.start()
  else (new Stack(path.join(entry), argv)).start()
} else {
  console.log(NOCOMMAND)
  process.exit(1)
}
