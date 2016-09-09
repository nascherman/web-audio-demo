global.THREE = require('three');
var app = require('./lib/index.js');

require('domready')(() => {
  app();
});
