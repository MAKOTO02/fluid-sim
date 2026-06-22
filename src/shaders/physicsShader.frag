// physics.frag
precision mediump float;
precision mediump sampler2D;

varying vec2 vUv;
uniform sampler2D uVelocity;
uniform float dt;

uniform vec2 uGravity;  // Conceptually like (0.0, -9.8); scale is tuned for gameplay.
uniform vec2 uAccel;
uniform sampler2D uObstacle;
uniform sampler2D uStreamForce;
uniform float uStreamForceScale;


void main () {
    vec2 v = texture2D(uVelocity, vUv).xy;
    float mask = texture2D(uObstacle, vUv).r;
    vec2 streamMask = texture2D(uStreamForce, vUv).xy;
    v += uGravity * dt;      // v^{*} = v^n + dt * g
    v -= uAccel * dt;
    v += streamMask * dt * uStreamForceScale;

    // Prevent runaway velocity.
    v = clamp(v, vec2(-1000.0), vec2(1000.0));

    v *= (1.0 - mask);

    gl_FragColor = vec4(v, 0.0, 1.0);
}
