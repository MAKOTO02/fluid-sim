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

  /** Velocity field: RGBA16F or RGBA. */
    velocityFormat() {
        return {
            internalFormat: this.ext.formatRGBA!.internalFormat,
            format: this.ext.formatRGBA!.format,
            type: this.ext.halfFloatTexType,
            param: this.ext.supportLinearFiltering ? this.gl.LINEAR : this.gl.NEAREST,
        };
    }

  /** Pressure field: R16F or RED. */
    pressureFormat() {
        return {
            internalFormat: this.ext.formatR!.internalFormat,
            format: this.ext.formatR!.format,
            type: this.ext.halfFloatTexType,
            param: this.gl.NEAREST,
        };
    }

  /** Dye color field: RGBA16F or RGBA. */
    dyeFormat() {
        return {
            internalFormat: this.ext.formatRGBA!.internalFormat,
            format: this.ext.formatRGBA!.format,
            type: this.ext.halfFloatTexType,
            param: this.ext.supportLinearFiltering ? this.gl.LINEAR : this.gl.NEAREST,
        };
    }

    // Stream and helper buffers can use the pressure-like format.
    streamFormat(){
        return {
            internalFormat: this.ext.formatRG!.internalFormat,
            format: this.ext.formatRG!.format,
            type: this.ext.halfFloatTexType,
            param: this.gl.NEAREST,
        }
    } 

    // Obstacle mask only needs to represent 0/1 values.
    obstacleFormat(){
    const r = this.ext.formatR ?? this.ext.formatRGBA!;
    return {
        internalFormat: r.internalFormat,
        format: r.format,
        type: this.ext.halfFloatTexType,
        param: this.gl.NEAREST,
    };
}
}
