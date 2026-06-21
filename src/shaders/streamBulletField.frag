// shaders/streamBulletField.frag
precision highp float;
varying vec2 vUv;

// Example swirl flow around the center (0.5, 0.5).
uniform float uStrength;

void main() {
    // Move [0,1]^2 so the center becomes (0,0).
    vec2 p = vUv - 0.5;
    float r = length(p);

    // Avoid division by zero at the center.
    if (r < 1e-4) {
        gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
        return;
    }

    // Tangential flow direction (-y, x).
    vec2 dir = vec2(-p.y, p.x) / r;

    // Distance falloff.
    float falloff = exp(-r * 4.0);

    vec2 v = dir * falloff * uStrength;

    // Store vector in RG.
    gl_FragColor = vec4(v, 0.0, 1.0);
}
