precision highp float;
precision highp sampler2D;

varying vec2 vUv;
varying vec2 vL;
varying vec2 vR;
varying vec2 vT;
varying vec2 vB;
uniform sampler2D uVelocity;
uniform sampler2D uCurlMap;
uniform float curlStrength;
uniform float dt;

uniform float time;

void main () {
    float L = texture2D(uCurlMap, vL).x;
    float R = texture2D(uCurlMap, vR).x;
    float T = texture2D(uCurlMap, vT).x;
    float B = texture2D(uCurlMap, vB).x;
    float C = texture2D(uCurlMap, vUv).x;

    vec2 force = 0.5 * vec2(abs(T) - abs(B), abs(R) - abs(L));
    force /= length(force) + 0.0001;
    force *= curlStrength * C;
    force.y *= -1.0;

    vec2 velocity = texture2D(uVelocity, vUv).xy;
    velocity += force * dt;
    velocity = min(max(velocity, -1000.0), 1000.0);
    gl_FragColor = vec4(velocity, 0.0, 1.0);
}