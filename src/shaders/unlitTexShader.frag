precision highp float;

varying vec2 vTexCoord;
varying vec3 vFragPos;

uniform sampler2D uTexture;
uniform vec2 uUVOffset;
uniform vec2 uUVScale;

void main(){
    vec2 uv = vTexCoord * uUVScale + uUVOffset;
    gl_FragColor = texture2D(uTexture, uv) + vec4(0, 0, 0, 0.1);
}