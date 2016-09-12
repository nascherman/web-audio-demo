varying vec3 pos;

uniform float zMax;
uniform float zMin;
uniform float z;
uniform float y;
uniform float x;

vec3 createColor() {
  float spectrumZ = (pos.z) * -z;
  float spectrumY = (pos.z) * -y;
  float spectrumX = (pos.z) * -x;
  return vec3(spectrumX, spectrumY, spectrumZ);
}

void main() 
{
  vec3 color = createColor();
  gl_FragColor = vec4(color, 1.0);
}  