require('babel-polyfill');
// main.js
const React = require('react');
const ReactDOM = require('react-dom');
const Landing = require('./ui/Landing');

function start () {
  let app = document.getElementById('app');
  if(app === null) {
    app = document.createElement('div');
    app.setAttribute('id', 'app');
    document.body.appendChild(app);
  }
  console.log('rendering');

  ReactDOM.render(
    <Landing />,
    app
  );
}

module.exports = start;