global.THREE = require('three');
var app = require('./lib/index.js');

console.log(process.env.NODE_ENV);

require('domready')(() => {
  app();
});
