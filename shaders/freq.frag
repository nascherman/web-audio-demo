varying vec3 pos;

uniform float zMax;
uniform float zMin;

vec3 createColor() {
  float spectrumZ = (pos.z) * -1.0;
  float spectrumY = (pos.z) * -1.0;
  float spectrumX = (pos.z) * -1.0;
  return vec3(spectrumX, spectrumY, spectrumZ);
}

void main() 
{
  vec3 color = createColor();
  gl_FragColor = vec4(color, 1.0);
}  