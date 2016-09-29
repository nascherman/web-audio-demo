'use strict';
import React, {PropTypes} from 'react';
import ReactDOM from 'react-dom';

const glslify = require('glslify');
const path = require('path');
const createLoop = require('raf-loop');

const PLANESIZE = 10;
const PLANESEGMENTS = 30;

let scene, camera, renderer, material, composer, badTVPass, filmPass, staticPass;

const badTVParams = {
  distortion: 3.6,
  distortion2: 3,
  rollSpeed: 0.11,
  speed: 0.04,
};

const filmParams = {
  tDiffuse: 8,
  sIntensity: 0.9,
  nIntensity: 0.4,
  sCount: 10
};

const staticParams = {
  amount: 0.1,
  size: 10.0,
  tDiffuse: 10
};

const Background = React.createClass ({
  componentDidMount () {
    this.createCanvasBackground();
    window.addEventListener('resize', this.onWindowResize, false);
  },

  componentWillUnmount () {
    window.removeEventListener('resize', this.onWindowResize, false);
  },

  createCanvasBackground() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer();
    renderer.setSize( window.innerWidth, window.innerHeight);
    renderer.setClearColor(0xffffff, true);
    
    this.createScene(scene);
    createLoop((dt) => {
      badTVPass.uniforms[ 'time' ].value += dt / 1000;
      filmPass.uniforms[ 'time' ].value += dt / 1000;
      staticPass.uniforms[ 'time' ].value += dt / 1000;
      composer.render(scene, camera)
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
    staticPass.uniforms['tDiffuse'].value = staticParams.tDiffuse;
    filmPass = new EffectComposer.ShaderPass(THREE.FilmShader);
    filmPass.uniforms['tDiffuse'].value = filmParams.tDiffuse;
    filmPass.uniforms['sIntensity'].value = filmParams.sIntensity;
    filmPass.uniforms['nIntensity'].value = filmParams.nIntensity;
    filmPass.uniforms['sCount'].value = filmParams.count;
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
