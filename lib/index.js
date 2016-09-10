var path = require('path');
var createScene = require('scene-template');
var glslify = require('glslify');
var analyse = require('web-audio-analyser');
var path = require('path');
var bpm = require('web-audio-beat-detector');
var conf = require('../config/credentials.json');
var loop = require('raf-loop');
var BOUNDS = 128;
var WIDTH = 128;
var FREQ_DIVISOR = 100;

module.exports = () => {
  require('soundcloud-badge')({
    client_id: conf.soundcloud.client_id,
    song: 'https://soundcloud.com/rodrigovaz/gala-drop-drop',
    dark: false,
    getFonts: true
  }, (err,src, data, div) => {
    if(err) throw err;
    let song_url = src;
    demo(song_url);
  });
}

function demo(song_url) {
  let ambient = new THREE.AmbientLight(0xffffff, 1);
  const opts = {
    renderer: {
      antialias: true
    },
    controls: {
      theta: 0 * Math.PI / 180,
      phi: -90 * Math.PI / 180,
      distance: 8,
      type: 'orbit'
    },
    objects: [
      ambient
    ]
  };

  init(song_url, (analyser, audio) => {
    let LENGTH = analyser.frequencies().length
    let WAVEFORM_LENGTH = analyser.waveform().length;
    const {
      renderer,
      camera,
      scene,
      updateControls
    } = createScene(opts, THREE);
    camera.far = 10000;
    window.scene = scene;

    var geo = new THREE.PlaneGeometry(10, 0.1, LENGTH, 1);
    // var mat = new THREE.MeshPhongMaterial({
    //   color: 0xffffff,
    //   side: THREE.DoubleSide
    // })
    var mat = new THREE.ShaderMaterial({
      uniforms: {
        zMin: { type: 'f', value: 0.0 },
        zMax: { type: 'f', value: 0.0}
      },
      vertexShader:  glslify(path.join(__dirname, '../shaders/freq.vert')),
      fragmentShader:  glslify(path.join(__dirname, '../shaders/freq.frag')),
      side: THREE.DoubleSide
    });
    var plane = new THREE.Mesh(geo, mat);
    geo = new THREE.PlaneGeometry(10, 0.1, WAVEFORM_LENGTH, 1);
    var plane2 = new THREE.Mesh(geo, mat);

    var sun = new THREE.DirectionalLight( 0xFFFFFF, 1.0 );
    sun.position.set( 300, 400, 175 );
    scene.add( sun );
    scene.add(plane);
    scene.add(plane2);
    plane.rotation.x = 90 * Math.PI/180;
    mat.uniforms.zMin.value = plane.position.z;
    plane2.rotation.x = 90 * Math.PI/180;
    plane2.position.y -= 2.5;

    loop((dt) => {
      updateControls();
      manageCamera(camera);
      updatePlaneFrequency(plane, analyser);
      updatePlaneWaveForm(plane2, analyser);
      renderer.render(scene, camera);
    }).start();
  });
}

function manageCamera(camera) {
  if(camera.position.z < -10) {
    camera.position.z = -9.9;
  }
  else if (camera.position.z > 10) {
    camera.position.z = 9.9;
  }
}

function updatePlaneFrequency(plane, analyser) {
  let freq = analyser.frequencies();
  let verts = plane.geometry.vertices;
  freq.forEach((f, i) => {
    if(f / FREQ_DIVISOR > plane.material.uniforms.zMax.value) {
      plane.material.uniforms.zMax.value = f / FREQ_DIVISOR;
    }
    verts[i].z = -(f / FREQ_DIVISOR);
    verts[verts.length/2 + i].z = -(f / FREQ_DIVISOR);
  });
  plane.geometry.verticesNeedUpdate = true;
  plane.geometry.normalsNeedUpdate = true;
}

function updatePlaneWaveForm(plane, analyser) {
  let freq = analyser.waveform();
  let verts = plane.geometry.vertices;
  freq.forEach((f, i) => {
    if(i === 0) return;
    verts[i].z = -(f / FREQ_DIVISOR);
    verts[verts.length/2 + i].z = -(f / FREQ_DIVISOR);
  });
  plane.geometry.verticesNeedUpdate = true;
  plane.geometry.normalsNeedUpdate = true; 
}

function init(song_url, cb) {
  var audio = new Audio;
  audio.crossOrigin = 'Anonymous';
  audio.src = song_url;
  audio.loop = true;
  audio.addEventListener('canplay', () => {
    let analyser = analyse(audio, {audible: true, stere: false});
    audio.play();
    cb(analyser, audio);
  });
} 