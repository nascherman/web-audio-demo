uniform sampler2D texture;
uniform float time;
uniform float slow_time;
uniform float opacity;
varying vec2 vUv;

#pragma glslify: computeNoise = require('./noise');
 
void main() {
  vec4 texel = texture2D( texture, vec2(vUv.x, vUv.y) );  
  gl_FragColor = vec4(texel.rgb, opacity);
 }