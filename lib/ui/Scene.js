const React = require('react');
const ReactDOM = require('react-dom');

var path = require('path');
var createScene = require('scene-template');
var glslify = require('glslify');
var analyse = require('web-audio-analyser');
var path = require('path');
var bpm = require('web-audio-beat-detector');
var conf = require('../../config/credentials.json');
var loop = require('raf-loop');
var BOUNDS = 128;
var WIDTH = 128;
var FREQ_DIVISOR = 100;

const Scene = React.createClass({
  propTypes: {
    song: React.PropTypes.string
  },

  getDefaultProps () {
    return {
      song: 'https://soundcloud.com/rodrigovaz/gala-drop-drop'
    };
  },

  getInitialState () {
    return {
    };
  },

  componentDidMount () {
    let _this = this;
    require('soundcloud-badge')({
      client_id: conf.soundcloud.client_id,
      song: this.props.song,
      dark: true,
      getFonts: true
    }, (err,src, data, div) => {
      if(err) throw err;
      let song_url = src;
      _this.demo(song_url);
    });
  },

  demo(song_url) {
    let _this = this;
    let ambient = new THREE.AmbientLight(0xffffff, 1);
    const opts = {
      renderer: {
        antialias: true,
        alpha: true
      },
      controls: {
        theta: 0 * Math.PI / 180,
        phi: -90 * Math.PI / 180,
        distance: 8,
        type: 'orbit'
      },
      domElement: this.refs.canvas,
      objects: [
        ambient
      ]
    };
  
    this.init(song_url, (analyser, audio) => {
      let LENGTH = analyser.frequencies().length
      let WAVEFORM_LENGTH = analyser.waveform().length;
      const {
        renderer,
        camera,
        scene,
        updateControls
      } = createScene(opts, THREE);
      renderer.setClearColor(0x000000, 0);
      camera.far = 10000;
      window.scene = scene;
  
      var geo = new THREE.PlaneGeometry(10, 0.1, LENGTH, 1);
      var mat = new THREE.ShaderMaterial({
        uniforms: {
          zMin: { type: 'f', value: 0.0 },
          zMax: { type: 'f', value: 0.0}
        },
        vertexShader:  glslify(path.join(__dirname, '../../shaders/freq.vert')),
        fragmentShader:  glslify(path.join(__dirname, '../../shaders/freq.frag')),
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
        _this.manageCamera(camera);
        _this.updatePlaneFrequency(plane, analyser);
        _this.updatePlaneWaveForm(plane2, analyser);
        renderer.render(scene, camera);
      }).start();
    });
  },
  
  manageCamera(camera) {
    if(camera.position.z < -10) {
      camera.position.z = -9.9;
    }
    else if (camera.position.z > 10) {
      camera.position.z = 9.9;
    }
  },
  
  updatePlaneFrequency(plane, analyser) {
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
  },
  
  updatePlaneWaveForm(plane, analyser) {
    let freq = analyser.waveform();
    let verts = plane.geometry.vertices;
    freq.forEach((f, i) => {
      if(i === 0) return;
      verts[i].z = -(f / FREQ_DIVISOR);
      verts[verts.length/2 + i].z = -(f / FREQ_DIVISOR);
    });
    plane.geometry.verticesNeedUpdate = true;
    plane.geometry.normalsNeedUpdate = true; 
  },
  
  init(song_url, cb) {
    var audio = new Audio;
    audio.crossOrigin = 'Anonymous';
    audio.src = song_url;
    audio.loop = true;
    audio.addEventListener('canplay', () => {
      let analyser = analyse(audio, {audible: true, stere: false});
      audio.play();
      cb.call(this, analyser, audio);
    });
  }, 

  render () {
    return (
      <div 
        ref="canvas"
      />
    );
  }
})

module.exports = Scene;