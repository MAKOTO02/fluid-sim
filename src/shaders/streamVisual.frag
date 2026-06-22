precision highp float;

varying vec2 vTexCoord;

uniform sampler2D uTexture;
uniform float uScale;

void main() {
    vec2 v = texture2D(uTexture, vTexCoord).xy;
    float mag = clamp(length(v) * uScale, 0.0, 1.0);

    vec2 dir = vec2(0.0);
    if (length(v) > 1e-8) {
        dir = normalize(v);
    }

    vec3 directionColor = vec3(dir * 0.5 + 0.5, 0.0);
    vec3 color = mix(vec3(0.02, 0.04, 0.08), directionColor, mag);

    gl_FragColor = vec4(color + vec3(mag * 0.25), 1.0);
}
