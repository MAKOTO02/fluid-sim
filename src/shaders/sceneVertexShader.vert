precision highp float;

attribute vec3 aPosition;
attribute vec2 aTexCoord;

uniform mat4 uModelMat;
uniform mat4 uViewMat;
uniform mat4 uProjectionMat;

varying vec2 vTexCoord;
varying vec3 vFragPos;

void main() {
    vec4 worldPos = uModelMat * vec4(aPosition, 1.0);
    vFragPos = worldPos.xyz;

    vec4 viewPos = uViewMat * worldPos;
    gl_Position = uProjectionMat * viewPos;

    vTexCoord = aTexCoord;
}
