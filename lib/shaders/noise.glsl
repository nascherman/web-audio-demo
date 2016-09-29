#pragma glslify: noise2d = require('glsl-noise/simplex/2d')
#pragma glslify: noise3d = require('glsl-noise/simplex/3d')

float computeNoise (vec2 coord) {
  // convert [ -1 .. 1 ] to [ 0 .. 1 ]
  return noise2d(coord) * 0.5 + 0.5;
}

float computeNoise (vec3 coord) {
  // convert [ -1 .. 1 ] to [ 0 .. 1 ]
  return noise3d(coord) * 0.5 + 0.5;
}

#pragma glslify: export(computeNoise)