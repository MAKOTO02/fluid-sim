precision highp float;
precision highp sampler2D;

varying vec2 vUv;

uniform sampler2D uVelocity;
uniform sampler2D uSource;
uniform vec2 texelSize;
uniform vec2 dyeTexelSize;
uniform float decayDt;
uniform float advectDt;
uniform float dissipation;
uniform sampler2D uObstacle;
uniform vec4 uViewRect;

vec4 bilerp (sampler2D sam, vec2 uv, vec2 tsize) {
    vec2 st = uv / tsize - 0.5;

    vec2 iuv = floor(st);
    vec2 fuv = fract(st);

    vec4 a = texture2D(sam, (iuv + vec2(0.5, 0.5)) * tsize);
    vec4 b = texture2D(sam, (iuv + vec2(1.5, 0.5)) * tsize);
    vec4 c = texture2D(sam, (iuv + vec2(0.5, 1.5)) * tsize);
    vec4 d = texture2D(sam, (iuv + vec2(1.5, 1.5)) * tsize);

    return mix(mix(a, b, fuv.x), mix(c, d, fuv.x), fuv.y);
}

void main () {
    float mask = texture2D(uObstacle, vUv).r;
    float inside =
        step(uViewRect.x, vUv.x) * step(vUv.x, uViewRect.z) *
        step(uViewRect.y, vUv.y) * step(vUv.y, uViewRect.w);
#ifdef MANUAL_FILTERING
    vec2 coord = vUv - advectDt * bilerp(uVelocity, vUv, texelSize).xy * texelSize;
    vec4 result = bilerp(uSource, coord, dyeTexelSize);
#else
    vec2 coord = vUv - advectDt * texture2D(uVelocity, vUv).xy * texelSize;
    vec4 result = texture2D(uSource, coord);
#endif
    float normalDecay = 1.0 + dissipation * decayDt;
    float decay = mix(normalDecay, 1.0, clamp(mask, 0.0, 1.0));

    gl_FragColor = result * inside / decay;
}