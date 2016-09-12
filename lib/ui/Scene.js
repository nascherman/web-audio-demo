const React = require('react');
const ReactDOM = require('react-dom');

var path = require('path');
var createScene = require('scene-template');
var glslify = require('glslify');
var analyse = require('web-audio-analyser');
var path = require('path');
var conf = require('../../config/credentials.json');
var loop = require('raf-loop');
var lerp = require('lerp');
var Random = require('random-js');
var soundcloudBadge = require('soundcloud-badge');
var BOUNDS = 128;
var WIDTH = 128;
var FREQ_DIVISOR = 100;
var GRADATIONS = 20;
var audio, analyser;
var r = new Random(Random.engines.mt19937().seedWithArray([0x12345678, 0x90abcdef]));


const Scene = React.createClass({
  propTypes: {
    song: React.PropTypes.object
  },

  getDefaultProps () {
    return {
    };
  },

  getInitialState () {
    return {
      z: 1.0,
      y: 1.0,
      x: 1.0,
      material: {}
    };
  },

  componentDidMount () {
    let _this = this;
    soundcloudBadge({
      client_id: conf.soundcloud.client_id,
      song: this.props.song.permalink_url,
      dark: false,
      getFonts: true
    }, (err,src, data, div) => {
      if(err) throw err;
      let song_url = src;
      _this.demo(song_url);
    });

    setTimeout(() => {
      _this.changeColor();
    },1000)
  },

  componentWillUpdate (nextProps, nextState) {
    let _this = this;
    if(nextProps.song !== this.props.song) {
      this.updateSong(nextProps.song);
    }
    if(nextState.z !== this.state.z || nextState.y !== this.state.y) {
      let changeZ = this.state.z;
      let changeY = this.state.y;
      let changeX = this.state.x;
      for (var i=0;i<=GRADATIONS;i++) {
        (function(ind) {
            setTimeout(() => {
              _this.state.material.uniforms.z.value = lerp(changeZ, nextState.z, ind/GRADATIONS);
              _this.state.material.uniforms.y.value = lerp(changeY, nextState.y, ind/GRADATIONS);  
              _this.state.material.uniforms.x.value = lerp(changeX, nextState.y, ind/GRADATIONS);  
              if(ind === GRADATIONS) {
                setTimeout(() => {
                  _this.changeColor();
                },1000)
              }
            }, 1000 + (100 * ind));
        })(i);
        
      }
    }
  },  

  changeColor () {
    this.setState({
      z: r.real(0,1, true),
      y: r.real(0,1, true),
      z: r.real(0,1, true)
    })
  },

  removeSoundCloudBadge() {
    let badge = document.getElementsByClassName('npm-scb-wrap')[0];
    badge.parentElement.removeChild(badge);
  },

  updateSong (song) {
    let _this = this;
    this.removeSoundCloudBadge();

    soundcloudBadge({
      client_id: conf.soundcloud.client_id,
      song: song.permalink_url,
      dark: false,
      getFonts: true
    }, (err,src, data, div) => {
      if(err) throw err;
      let song_url = src;
      _this.init(song_url);
    });
  },

  demo(song_url) {
    console.log('demo');
    let _this = this;
    let ambient = new THREE.AmbientLight(0xffffff, 1);
    const opts = {
      renderer: {
        antialias: true,
        alpha: true
      },
      controls: {
        theta: -45 * Math.PI / 180,
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
      _this.setState({material: new THREE.ShaderMaterial({
          uniforms: {
            zMin: { type: 'f', value: 0.0 },
            zMax: { type: 'f', value: 0.0},
            z: { type: 'f', value: _this.state.z },
            y: { type: 'f', value: _this.state.y },
            x: { type: 'f', value: _this.state.x }
          },
          vertexShader:  glslify(path.join(__dirname, '../../shaders/freq.vert')),
          fragmentShader:  glslify(path.join(__dirname, '../../shaders/freq.frag')),
          side: THREE.DoubleSide
        })
      });
      var plane = new THREE.Mesh(geo, _this.state.material);
      geo = new THREE.PlaneGeometry(10, 0.1, WAVEFORM_LENGTH, 1);
      var plane2 = new THREE.Mesh(geo, _this.state.material);
  
      var sun = new THREE.DirectionalLight( 0xFFFFFF, 1.0 );
      sun.position.set( 300, 400, 175 );
      scene.add( sun );
      scene.add(plane);
      scene.add(plane2);
      plane.rotation.x = 90 * Math.PI/180;
      _this.state.material.uniforms.zMin.value = plane.position.z;
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
    if(typeof audio !== 'object') {
      audio = new Audio;
      audio.crossOrigin = 'Anonymous';
      audio.loop = true;
      audio.addEventListener('canplay', () => {
        if(!analyser) {
          analyser = analyse(audio, {audible: true, stereo: false});
          cb.call(this, analyser, audio);
        }
        audio.play();
      });
      audio.addEventListener('ended', () => {
        this.props.end();
      });
    }
    else {
      audio.loop = false;
    }
    audio.src = song_url;
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