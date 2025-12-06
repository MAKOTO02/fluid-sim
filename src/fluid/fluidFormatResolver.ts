import type { GLFormat } from "../gl/glContext"

export class FluidFormatResolver {
    public gl: WebGLRenderingContext | WebGL2RenderingContext;
    public ext: {
        formatRGBA: GLFormat | null;
        formatRG: GLFormat | null;
        formatR: GLFormat | null;
        halfFloatTexType: number;
        supportLinearFiltering: boolean;
    }

  constructor(
        gl: WebGLRenderingContext | WebGL2RenderingContext,
        ext: {
            formatRGBA: GLFormat | null;
            formatRG: GLFormat | null;
            formatR: GLFormat | null;
            halfFloatTexType: number;
            supportLinearFiltering: boolean;
        }
    ) {
        this.gl = gl;
        this.ext = ext;
    }

  /** 速度場（vel）→ RGBA16F または RGBA */
    velocityFormat() {
        return {
            internalFormat: this.ext.formatRGBA!.internalFormat,
            format: this.ext.formatRGBA!.format,
            type: this.ext.halfFloatTexType,
            param: this.ext.supportLinearFiltering ? this.gl.LINEAR : this.gl.NEAREST,
        };
    }

  /** 圧力場 → R16F or RED */
    pressureFormat() {
        return {
            internalFormat: this.ext.formatR!.internalFormat,
            format: this.ext.formatR!.format,
            type: this.ext.halfFloatTexType,
            param: this.gl.NEAREST,
        };
    }

  /** dye（色）→ RGBA16F or RGBA */
    dyeFormat() {
        return {
            internalFormat: this.ext.formatRGBA!.internalFormat,
            format: this.ext.formatRGBA!.format,
            type: this.ext.halfFloatTexType,
            param: this.ext.supportLinearFiltering ? this.gl.LINEAR : this.gl.NEAREST,
        };
    }

    // stream(発散や補助バッファ系): pressure と同じで OK
    streamFormat(){
        return {
            internalFormat: this.ext.formatRG!.internalFormat,
            format: this.ext.formatRG!.format,
            type: this.ext.halfFloatTexType,
            param: this.gl.NEAREST,
        }
    } 

    // obstacle(障害物マスク): 0/1 だけ分かればいいので byte でも良い
    obstacleFormat(){
    const r = this.ext.formatR ?? this.ext.formatRGBA!;
    return {
        internalFormat: r.internalFormat,
        format: r.format,
        type: this.ext.halfFloatTexType,  // ← 他と同じ
        param: this.gl.NEAREST,
    };
}
}
