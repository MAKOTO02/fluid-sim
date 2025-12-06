precision mediump float;
precision mediump sampler2D;

varying highp vec2 vUv;
varying highp vec2 vL;
varying highp vec2 vR;
varying highp vec2 vT;
varying highp vec2 vB;
uniform sampler2D uVelocity;
uniform vec4 uViewRect;

void main () {
    float L = texture2D(uVelocity, vL).y;
    float R = texture2D(uVelocity, vR).y;
    float T = texture2D(uVelocity, vT).x;
    float B = texture2D(uVelocity, vB).x;
    float vorticity = (R - L - T + B) * 0.5;
    //float inside =
        //step(uViewRect.x, vUv.x) * step(vUv.x, uViewRect.z) *
        //step(uViewRect.y, vUv.y) * step(vUv.y, uViewRect.w);
    vec4 result = vec4(vorticity, 0.0, 0.0, 1.0);
    //gl_FragColor = result * inside;
    gl_FragColor = result;
}