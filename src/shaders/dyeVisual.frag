precision highp float;

varying vec2 vTexCoord;

uniform sampler2D uDye;      // Source dye texture.
uniform sampler2D uVelocity; // Velocity texture, with vx/vy in RG.
uniform float uVelScale;     // Velocity-to-brightness scale.
uniform float uMix;          // 0=dye only, 1=maximum velocity tint.

// HSV to RGB conversion.
vec3 hsv2rgb(vec3 c) {
    vec4 K = vec4(1.0, 2.0/3.0, 1.0/3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

void main() {
    vec3 dye = texture2D(uDye, vTexCoord).rgb;

    // --- 1) Mask by dye intensity -------------------------
    float intensity = dot(dye, vec3(0.299, 0.587, 0.114));
    float dyeMask = smoothstep(0.05, 0.20, intensity);

    // --- 2) Compute color from velocity -------------------
    vec2 vel = texture2D(uVelocity, vTexCoord).xy;

    float speed = length(vel);
    float vMag  = clamp(speed * uVelScale, 0.0, 1.0);

    float angle = atan(vel.y, vel.x);                  // -pi..pi
    float hue   = angle / (2.0 * 3.14159265) + 0.5;    // 0..1

    // Keep saturation and brightness subtle.
    float sat = mix(0.1, 0.3, vMag);
    float val = mix(0.3, 0.5, vMag);

    vec3 velColor = hsv2rgb(vec3(hue, sat, val));

    // Apply almost no tint where dye is weak.
    float localMix = uMix * dyeMask * vMag;

    // Shift the dye color slightly instead of replacing it.
    vec3 shaded = (dye + localMix * (velColor - dye)) * 0.5;

    // Clamp to avoid blown-out highlights.
    shaded = clamp(shaded, 0.0, 1.0);

    gl_FragColor = vec4(shaded, 1.0);
}
