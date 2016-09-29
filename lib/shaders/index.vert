precision highp float;

varying vec2 vUv;

void main() {
    vUv = uv;
    vec3 outPosition = position.xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(outPosition, 1.0);
}