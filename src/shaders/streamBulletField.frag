// shaders/streamBulletField.frag
precision highp float;
varying vec2 vUv;

// 中心 (0.5, 0.5) の周りをぐるぐる回る流れの例
uniform float uStrength;

void main() {
    // [0,1]^2 → 中心を (0,0) に
    vec2 p = vUv - 0.5;
    float r = length(p);

    // 半径ゼロで発散しないように
    if (r < 1e-4) {
        gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
        return;
    }

    // 接戦方向 (−y, x) 方向に流す
    vec2 dir = vec2(-p.y, p.x) / r;

    // 距離による減衰（お好みで調整）
    float falloff = exp(-r * 4.0);

    vec2 v = dir * falloff * uStrength;

    // RG にベクトルを格納
    gl_FragColor = vec4(v, 0.0, 1.0);
}
