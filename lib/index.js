var path = require('path');
var createScene = require('scene-template');
// var SoundCloudAudio = require('soundcloud-audio');
var glslify = require('glslify');
var analyse = require('web-audio-analyser');
var conf = require('../config/credentials.json');
var analyser, song_url;

module.exports = require('soundcloud-badge')({
  client_id: conf.soundcloud.client_id,
  song: 'https://soundcloud.com/rodrigovaz/johann-sebastian-bach-pachelbels-cannon-in-d-major',
  dark: true,
  getFonts: true
}, (err,src, data, div) => {
  if(err) throw err;
  song_url = src;
  init();
});

function init() {
  var audio = new Audio;
  audio.crossOrigin = 'Anonymous';
  audio.src = song_url;
  audio.lopp = true;
  audio.addEventListener('canplay', () => {
    analyser = analyse(audio, {audible: true, stere: false});
    audio.play();
  });
  audio.addEventListener('timeupdate', () => {
    console.log(analyser.waveform());
  })

} 