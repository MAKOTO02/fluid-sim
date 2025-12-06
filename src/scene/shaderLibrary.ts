// ShaderLibrary.ts
import { Program } from "../gl/program";
import { compileShader } from "../gl/program";

export class ShaderLibrary {
     private gl: WebGL2RenderingContext | WebGLRenderingContext;
  private programs = new Map<string, Program>();

  constructor(gl: WebGL2RenderingContext | WebGLRenderingContext) {
    this.gl = gl;
  }

  load(name: string, vsSrc: string, fsSrc: string): Program {
    if (this.programs.has(name)) {
      return this.programs.get(name)!;
    }
    const vs = compileShader(this.gl, this.gl.VERTEX_SHADER, vsSrc);
    const fs = compileShader(this.gl, this.gl.FRAGMENT_SHADER, fsSrc);
    const prog = new Program(this.gl, vs, fs);
    this.programs.set(name, prog);
    return prog;
  }

  get(name: string): Program {
    const prog = this.programs.get(name);
    if (!prog) throw new Error(`Program '${name}' not loaded`);
    return prog;
  }
}
