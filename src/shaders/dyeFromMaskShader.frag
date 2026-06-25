precision highp float;
precision highp sampler2D;

varying vec2 vUv;
uniform sampler2D uTarget;
uniform sampler2D uMask;
uniform vec3 uColor;
uniform float uStrength;

void main() {
    vec3 base = texture2D(uTarget, vUv).rgb;
    float mask = texture2D(uMask, vUv).r;
    gl_FragColor = vec4(base + uColor * mask * uStrength, 1.0);
}
