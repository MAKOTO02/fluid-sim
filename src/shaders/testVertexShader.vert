precision highp float;

attribute vec3 aPosition;
attribute vec2 aTexCoord;

varying vec2 vTexCoord;

void main() {
    // 行列は一切使わず、そのままクリップ空間へ
    gl_Position = vec4(aPosition.xy, 0.0, 1.0);
    vTexCoord = aTexCoord;
}
