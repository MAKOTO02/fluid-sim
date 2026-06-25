// shaders/streamBulletField.frag
precision highp float;
varying vec2 vUv;

uniform vec2 uCenter;
uniform float uStrength;
uniform float uFalloff;

void main() {
    vec2 p = vUv - uCenter;
    float r = length(p);

    if (r < 1e-4) {
        gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
        return;
    }

    vec2 dir = vec2(-p.y, p.x) / r;
    float falloff = exp(-r * uFalloff);
    vec2 v = dir * falloff * uStrength;

    gl_FragColor = vec4(v, 0.0, 1.0);
}
