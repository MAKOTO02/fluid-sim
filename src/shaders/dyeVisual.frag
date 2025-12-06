precision highp float;

varying vec2 vTexCoord;

uniform sampler2D uDye;      // 元の dye
uniform sampler2D uVelocity; // 速度テクスチャ (RG に vx,vy)
uniform float uVelScale;     // 速度→明るさのスケール
uniform float uMix;          // 0=dyeだけ, 1=最大限ゆらす

// HSV → RGB 変換
vec3 hsv2rgb(vec3 c) {
    vec4 K = vec4(1.0, 2.0/3.0, 1.0/3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

void main() {
    vec3 dye = texture2D(uDye, vTexCoord).rgb;

    // --- 1) dye の強さでマスク -------------------------
    float intensity = dot(dye, vec3(0.299, 0.587, 0.114));
    float dyeMask = smoothstep(0.05, 0.20, intensity);

    // --- 2) 速度から色を計算 ---------------------------
    vec2 vel = texture2D(uVelocity, vTexCoord).xy;

    float speed = length(vel);
    float vMag  = clamp(speed * uVelScale, 0.0, 1.0);

    float angle = atan(vel.y, vel.x);                  // -pi..pi
    float hue   = angle / (2.0 * 3.14159265) + 0.5;    // 0..1

    // ★ 彩度・明るさをかなり抑える
    float sat = mix(0.1, 0.3, vMag);   // 0.1〜0.3
    float val = mix(0.3, 0.8, vMag);   // 0.3〜0.8

    vec3 velColor = hsv2rgb(vec3(hue, sat, val));

    // ★ dye が薄いところでは、ほぼ何も乗せない
    float localMix = uMix * dyeMask * vMag;

    // ★ 「完全に置き換え」ではなく、少しだけずらす
    //    ＝ dye に対して速度色との差分を少しだけ足すイメージ
    vec3 shaded = (dye + localMix * (velColor - dye)) * 0.5;

    // ハイライトが飛び過ぎないようにクランプ
    shaded = clamp(shaded, 0.0, 1.0);

    gl_FragColor = vec4(shaded, 1.0);
}
