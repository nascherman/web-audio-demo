const budo = require('budo');
const path = require('path');
const fs = require('fs');
const chalk = require('chalk');
var envify = require('envify/custom');

const lessStream = require('less-css-stream');
const AutoPrefix = require('less-plugin-autoprefix');

const alert = () => console.log('\x07');
const lessFile = path.resolve(__dirname, './lib/less/index.less');
const outputCss = path.resolve(__dirname, './app/assets/css/main.css');

console.log(lessFile);

const isProduction = process.argv[2] === 'production';

const lessOpts = {
  paths: [],
  compress: isProduction,
  plugins: [ new AutoPrefix() ]
};

function compileLESS () {
  const writer = fs.createWriteStream(outputCss);
  writer.on('error', err => console.error(err));

  fs.createReadStream(lessFile)
    .on('error', err => console.error(err.message))
    .pipe(lessStream(lessFile, lessOpts))
    .on('error', err => {
      console.error(chalk.red('Error in ' + chalk.bold(lessFile)));
      console.error(err.message);
      alert();
    })
    .pipe(writer);
}

function startDevServer () {
  const app = budo('index.js:bundle.js', {
    dir: path.join(__dirname,'app'),
    browserify: {
      transform: [ require('babelify'), envify({
        NODE_ENV: 'development'
      }) ]
    },
    debug: true,
    live: true,
    css: 'assets/css/main.css',
    stream: process.stdout
  }).live()
    .watch([path.join(__dirname, './lib/less/*.less'), path.join(__dirname, './app/**/*.{css,html}')])
    .on('watch', (ev, file) => {
      console.log(file);
      if (path.extname(file) === '.less') {
        compileLESS();
      } else {
        app.reload(file);
      }
    })
    .on('pending', () => app.reload())
    .on('connect', compileLESS);
}

if (!isProduction) {
  startDevServer();
} else {
  compileLESS();
}
