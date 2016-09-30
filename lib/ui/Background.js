'use strict';
import React, {PropTypes} from 'react';
import ReactDOM from 'react-dom';
import config from '../../config/credentials.json';

const glslify = require('glslify');
const path = require('path');
const createLoop = require('raf-loop');
const equal = require('deep-equal');

const PLANESIZE = 10;
const PLANESEGMENTS = 30;

const MAX_WAVE_INTENSITY = 300;
const MAX_STATIC_AMOUNT = 1.2;
const MAX_DISTORTION = 20;

let shaderTime = 0;

let scene, camera, renderer, material, composer, badTVPass, filmPass, staticPass;

const badTVParams = {
  distortion: 3.2,
  distortion2: 1.0,
  rollSpeed: 0.1,
  speed: 0.1,
};

const filmParams = {
  sIntensity: 3.5,
  nIntensity: 3.5,
  sCount: 600
};

const staticParams = {
  amount: 0.4,
  size: 1.3
};

const Background = React.createClass ({
  getDefaultProps () {
    return {
      audioData: {
        form: [0],
        freq: [0]
      }
    };
  },

  componentDidMount () {
    let _this = this;
    let bg = ReactDOM.findDOMNode(this.refs['canvas-container']);
    this.createCanvasBackground();
    window.addEventListener('resize', this.onWindowResize, false);
    setInterval(() => {
      let newImage = config.backgrounds[parseInt(Math.random() * config.backgrounds.length - 0)];
      bg.style['background-image'] = 'url("/assets/images/' + newImage + '")';
    },13000);
  },

  componentWillUnmount () {
    window.removeEventListener('resize', this.onWindowResize, false);
  },

  
  updateStaticUniforms (audioData) {
    if(!audioData) return;
    let form = audioData.form;
    let maxForm = this.getMaxForm(form);
    staticPass.uniforms['amount'].value = parseFloat(MAX_STATIC_AMOUNT * (maxForm / MAX_WAVE_INTENSITY));
    renderer.domElement.style.opacity = parseFloat((maxForm) / (MAX_WAVE_INTENSITY));
  },

  getMaxForm(form) {
    let maxForm = 0;
    form.forEach((item) => {
      if(item > maxForm) maxForm = item;
    });
    return maxForm;
  },

  createCanvasBackground() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 3, 3000);
    renderer = new THREE.WebGLRenderer();
    renderer.setSize( window.innerWidth, window.innerHeight);
    renderer.setClearColor(0xffffff, true);
    this.createScene(scene);
    createLoop((dt) => {
      shaderTime += 0.1;
      this.updateStaticUniforms(this.props.audioData);
      badTVPass.uniforms[ 'time' ].value = shaderTime;
      filmPass.uniforms[ 'time' ].value = shaderTime;
      staticPass.uniforms[ 'time' ].value = shaderTime;
      composer.render(scene, camera);
    }).start();
    composer = new EffectComposer(renderer);
    composer.addPass(new EffectComposer.RenderPass(scene, camera));
    badTVPass = new EffectComposer.ShaderPass(THREE.BadTVShader);
    badTVPass.uniforms[ 'distortion' ].value = badTVParams.distortion;
    badTVPass.uniforms[ 'distortion2' ].value = badTVParams.distortion2;
    badTVPass.uniforms[ 'speed' ].value = badTVParams.speed;
    badTVPass.uniforms[ 'rollSpeed' ].value = badTVParams.rollSpeed;
    staticPass = new EffectComposer.ShaderPass(THREE.StaticShader);
    staticPass.uniforms['amount'].value = staticParams.amount;
    staticPass.uniforms['size'].value = staticParams.size;
    filmPass = new EffectComposer.ShaderPass(THREE.FilmShader);
    filmPass.uniforms['sIntensity'].value = filmParams.sIntensity;
    filmPass.uniforms['nIntensity'].value = filmParams.nIntensity;
    filmPass.uniforms['sCount'].value = filmParams.count;
    filmPass.uniforms.grayscale.value = 0;

    composer.addPass(badTVPass);
    composer.addPass(filmPass);
    composer.addPass(staticPass);
    
    badTVPass.renderToScreen = true;
    staticPass.renderToScreen = true;
    filmPass.renderToScreen = true;

    this.refs['canvas-container'].appendChild(renderer.domElement);
  },

  createScene(scene) {
    const textureLoader = new THREE.TextureLoader();
    let textureBackground = textureLoader.load('/assets/images/web-audio-background.jpg');
    let geometry = new THREE.PlaneGeometry(PLANESIZE, PLANESIZE, PLANESEGMENTS, PLANESEGMENTS);
    material = new THREE.ShaderMaterial({
      vertexShader: glslify( '../shaders/index.vert'),
      fragmentShader: glslify('../shaders/index.frag'),
      side: THREE.DoubleSide,
      wireframe: false,
      uniforms: {
        time: { type: 'f', value: 0.0 },
        slow_time: { type: 'f', value: 0.0 },
        opacity: { type: 'f', value: 1.0 },
        texture: { type: 't', value: textureBackground }
      },
      transparent: true,
      depthWrite: false,
      alphaTest: 1.0
    });
    let plane = new THREE.Mesh(geometry, material);
    camera.position.z = 5;
    scene.add(plane);
    window.scene = scene;
  },

  onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
  },

  render() {
    const style = Object.assign({}, {}, this.props.style);
    const className = 'background';
    return (
      <div
        className={`${className} ${this.props.className}`}
        style={style}
        ref='canvas-container'
      >
      </div>
    )
  }
})

Background.propTypes = {
  style: PropTypes.object,
  className: PropTypes.string
};

Background.defaultProps = {
  style: {},
  className: ''
};

module.exports =  Background;
