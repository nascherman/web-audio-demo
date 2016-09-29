global.THREE = require('three');
global.EffectComposer = require('three-effectcomposer')(THREE);

var app = require('./lib/index.js');

console.log(process.env.NODE_ENV);

require('domready')(() => {
  app();
});

THREE.BadTVShader = {
  uniforms: {
    "tDiffuse":   { type: "t", value: null },
    "time":     { type: "f", value: 0.0 },
    "distortion":   { type: "f", value: 3.0 },
    "distortion2":  { type: "f", value: 5.0 },
    "speed":      { type: "f", value: 0.2 },
    "rollSpeed":    { type: "f", value: 0.1 },
  },

  vertexShader: [
    "varying vec2 vUv;",
    "void main() {",
    "vUv = uv;",
    "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",
    "}"

  ].join("\n"),

  fragmentShader: [

    "uniform sampler2D tDiffuse;",
    "uniform float time;",
    "uniform float distortion;",
    "uniform float distortion2;",
    "uniform float speed;",
    "uniform float rollSpeed;",
    "varying vec2 vUv;",
    
    // Start Ashima 2D Simplex Noise

    "vec3 mod289(vec3 x) {",
    "  return x - floor(x * (1.0 / 289.0)) * 289.0;",
    "}",

    "vec2 mod289(vec2 x) {",
    "  return x - floor(x * (1.0 / 289.0)) * 289.0;",
    "}",

    "vec3 permute(vec3 x) {",
    "  return mod289(((x*34.0)+1.0)*x);",
    "}",

    "float snoise(vec2 v)",
    "  {",
    "  const vec4 C = vec4(0.211324865405187,  // (3.0-sqrt(3.0))/6.0",
    "                      0.366025403784439,  // 0.5*(sqrt(3.0)-1.0)",
    "                     -0.577350269189626,  // -1.0 + 2.0 * C.x",
    "                      0.024390243902439); // 1.0 / 41.0",
    "  vec2 i  = floor(v + dot(v, C.yy) );",
    "  vec2 x0 = v -   i + dot(i, C.xx);",

    "  vec2 i1;",
    "  i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);",
    "  vec4 x12 = x0.xyxy + C.xxzz;",
    " x12.xy -= i1;",

    "  i = mod289(i); // Avoid truncation effects in permutation",
    "  vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))",
    "   + i.x + vec3(0.0, i1.x, 1.0 ));",

    "  vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);",
    "  m = m*m ;",
    "  m = m*m ;",

    "  vec3 x = 2.0 * fract(p * C.www) - 1.0;",
    "  vec3 h = abs(x) - 0.5;",
    "  vec3 ox = floor(x + 0.5);",
    "  vec3 a0 = x - ox;",

    "  m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );",

    "  vec3 g;",
    "  g.x  = a0.x  * x0.x  + h.x  * x0.y;",
    "  g.yz = a0.yz * x12.xz + h.yz * x12.yw;",
    "  return 130.0 * dot(m, g);",
    "}",

    // End Ashima 2D Simplex Noise

    "void main() {",

      "vec2 p = vUv;",
      "float ty = time*speed;",
      "float yt = p.y - ty;",
      //smooth distortion
      "float offset = snoise(vec2(yt*3.0,0.0))*0.2;",
      // boost distortion
      "offset = offset*distortion * offset*distortion * offset;",
      //add fine grain distortion
      "offset += snoise(vec2(yt*50.0,0.0))*distortion2*0.001;",
      //combine distortion on X with roll on Y
      "gl_FragColor = texture2D(tDiffuse,  vec2(fract(p.x + offset),fract(p.y-time*rollSpeed) ));",

    "}"

  ].join("\n")

};

THREE.StaticShader = {

  uniforms: {

    "tDiffuse": { type: "t", value: null },
    "time":     { type: "f", value: 0.0 },
    "amount":   { type: "f", value: 0.5 },
    "size":     { type: "f", value: 4.0 }
  },

  vertexShader: [

  "varying vec2 vUv;",

  "void main() {",

    "vUv = uv;",
    "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

  "}"

  ].join("\n"),

  fragmentShader: [

  "uniform sampler2D tDiffuse;",
  "uniform float time;",
  "uniform float amount;",
  "uniform float size;",

  "varying vec2 vUv;",

  "float rand(vec2 co){",
    "return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);",
  "}",

  "void main() {",
    "vec2 p = vUv;",
    "vec4 color = texture2D(tDiffuse, p);",
    "float xs = floor(gl_FragCoord.x / size);",
    "float ys = floor(gl_FragCoord.y / size);",
    "vec4 snow = vec4(rand(vec2(xs * time,ys * time))*amount);",

    //"gl_FragColor = color + amount * ( snow - color );", //interpolate

    "gl_FragColor = color+ snow;", //additive

  "}"

  ].join("\n")

};

/**
 * @author alteredq / http://alteredqualia.com/
 *
 * Film grain & scanlines shader
 *
 * - ported from HLSL to WebGL / GLSL
 * http://www.truevision3d.com/forums/showcase/staticnoise_colorblackwhite_scanline_shaders-t18698.0.html
 *
 * Screen Space Static Postprocessor
 *
 * Produces an analogue noise overlay similar to a film grain / TV static
 *
 * Original implementation and noise algorithm
 * Pat 'Hawthorne' Shearon
 *
 * Optimized scanlines + noise version with intensity scaling
 * Georg 'Leviathan' Steinrohder
 *
 * This version is provided under a Creative Commons Attribution 3.0 License
 * http://creativecommons.org/licenses/by/3.0/
 */

THREE.FilmShader = {

  uniforms: {

    "tDiffuse":   { type: "t", value: null },
    "time":       { type: "f", value: 0.0 },
    "nIntensity": { type: "f", value: 0.5 },
    "sIntensity": { type: "f", value: 0.05 },
    "sCount":     { type: "f", value: 4096 },
    "grayscale":  { type: "i", value: 1 }

  },

  vertexShader: [

    "varying vec2 vUv;",

    "void main() {",

      "vUv = uv;",
      "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

    "}"

  ].join( "\n" ),

  fragmentShader: [

    // control parameter
    "uniform float time;",

    "uniform bool grayscale;",

    // noise effect intensity value (0 = no effect, 1 = full effect)
    "uniform float nIntensity;",

    // scanlines effect intensity value (0 = no effect, 1 = full effect)
    "uniform float sIntensity;",

    // scanlines effect count value (0 = no effect, 4096 = full effect)
    "uniform float sCount;",

    "uniform sampler2D tDiffuse;",

    "varying vec2 vUv;",

    "void main() {",

      // sample the source
      "vec4 cTextureScreen = texture2D( tDiffuse, vUv );",

      // make some noise
      "float x = vUv.x * vUv.y * time *  1000.0;",
      "x = mod( x, 13.0 ) * mod( x, 123.0 );",
      "float dx = mod( x, 0.01 );",

      // add noise
      "vec3 cResult = cTextureScreen.rgb + cTextureScreen.rgb * clamp( 0.1 + dx * 100.0, 0.0, 1.0 );",

      // get us a sine and cosine
      "vec2 sc = vec2( sin( vUv.y * sCount ), cos( vUv.y * sCount ) );",

      // add scanlines
      "cResult += cTextureScreen.rgb * vec3( sc.x, sc.y, sc.x ) * sIntensity;",

      // interpolate between source and result by intensity
      "cResult = cTextureScreen.rgb + clamp( nIntensity, 0.0,1.0 ) * ( cResult - cTextureScreen.rgb );",

      // convert to grayscale if desired
      "if( grayscale ) {",

        "cResult = vec3( cResult.r * 0.3 + cResult.g * 0.59 + cResult.b * 0.11 );",

      "}",

      "gl_FragColor =  vec4( cResult, cTextureScreen.a );",

    "}"

  ].join( "\n" )

};
