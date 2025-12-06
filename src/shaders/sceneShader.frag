precision highp float;

varying vec2 vTexCoord;
varying vec3 vFragPos;

uniform vec4 uColor;

void main(){
    gl_FragColor = uColor;
}