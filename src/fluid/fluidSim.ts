import { Program } from "../gl/program";
import { type FBO, type DoubleFBO, createFBO, createDoubleFBO, type BlitFunc } from "../gl/frameBuffer";
import { type ViewRect } from "./uv.";
import { getOptionalUniform, getRequiredUniform } from "./shaderUtils";

type FluidShaders = {
    curl: Program;
    vorticity: Program;
    physics: Program;
    divergence: Program;
    pressure: Program;
    subtractGradient: Program;
    advection: Program;
    clear: Program;
};
type FluidConfig = {
    CURL: number;
    GRAVITY: number;
    PRESSURE: number;
    PRESSURE_ITERATIONS: number;
    VELOCITY_DISSIPATION: number;
    DENSITY_DISSIPATION: number;
};

export class FluidSim{
    private gl: WebGLRenderingContext | WebGL2RenderingContext;
    private ext: { supportLinearFiltering: boolean };
    private blit: BlitFunc;
    private shaders: FluidShaders;
    private config: FluidConfig;

    // 内部FBOたち（外に出さない）
    private velocity: DoubleFBO;
    private dye: DoubleFBO;
    private curl: FBO;
    private divergence: FBO;
    private pressure: DoubleFBO;
    private stream: FBO;
    private obstacle: FBO;
    
    constructor(
        gl: WebGLRenderingContext | WebGL2RenderingContext,
        ext: { supportLinearFiltering: boolean },
        blit: BlitFunc,
        shaders: FluidShaders,
        config: FluidConfig,
        width: number,
        height: number,
        formats: {
            vel: { internalFormat: number; format: number; type: number; param: number };
            dye: { internalFormat: number; format: number; type: number; param: number };
            pressure: { internalFormat: number; format: number; type: number; param: number };
            stream: { internalFormat: number; format: number; type: number; param: number };
            obstacle: { internalFormat: number; format: number; type: number; param: number };
        }
    ) {
        this.gl = gl;
        this.ext = ext;
        this.blit = blit;
        this.shaders = shaders;
        this.config = config;

        // ここで FBO/DoubleFBO を全部作る
        this.velocity = createDoubleFBO(gl, width, height, 
            formats.vel.internalFormat, formats.vel.format, formats.vel.type, formats.vel.param);
        this.dye = createDoubleFBO(gl, width, height, 
            formats.dye.internalFormat, formats.dye.format, formats.dye.type, formats.dye.param);
        this.curl = createFBO(gl, width, height, 
                formats.vel.internalFormat, formats.vel.format, formats.vel.type, formats.vel.param);
        this.divergence = createFBO(gl, width, height, 
            formats.pressure.internalFormat, formats.pressure.format, formats.pressure.type, formats.pressure.param);
        this.pressure = createDoubleFBO(gl, width, height, 
            formats.pressure.internalFormat, formats.pressure.format, formats.pressure.type, formats.pressure.param);
        this.stream = createFBO(gl, width, height,
            formats.stream.internalFormat, formats.stream.format, formats.stream.type, formats.stream.param);
        this.obstacle = createFBO(gl, width, height,
            formats.obstacle.internalFormat, formats.obstacle.format, formats.obstacle.type, formats.obstacle.param);
    }
    step(
        dt: number, 
        rect: ViewRect = {uMin: 0, uMax: 1, vMin: 0, vMax: 1},
        accel: { x: number; y: number } = { x: 0, y: 0 },
    ){
        // 共通Uniformのbind
        this.computeCurl(rect);
        this.applyVorticity(dt, rect);
        this.applyPhysics(dt, rect, accel);
        this.computeDivergence(rect);
        this.clearPressure();
        this.solvePressure(rect);
        this.subtractGradient(rect);
        this.advectVelocityAndDye(dt, rect);
    }

    private computeCurl(rect: ViewRect){
        const prog = this.shaders.curl;
        prog.bind();
        this.applyCommonUniforms(prog, rect, this.velocity);
        
        const locuVelocity = getRequiredUniform(prog, "uVelocity"); 
        
        this.gl.uniform1i(locuVelocity, this.velocity.read.attach(0));
        this.blit(this.curl);
    }
    private applyVorticity(dt: number, rect: ViewRect){
        const prog = this.shaders.vorticity;
        prog.bind();
        this.applyCommonUniforms(prog, rect, this.velocity);
        const locuVelocity = getRequiredUniform(prog, "uVelocity");
        const locuCurl = getRequiredUniform(prog, "uCurlMap");
        const locCurl = getRequiredUniform(prog, "curlStrength");   // vorticity confinementの強さ.
        const locDt  = getRequiredUniform(prog, "dt");
    
        this.gl.uniform1i(locuVelocity, this.velocity.read.attach(0));
        this.gl.uniform1i(locuCurl, this.curl.attach(1));
        this.gl.uniform1f(locCurl, this.config.CURL);
        this.gl.uniform1f(locDt, dt);
        this.blit(this.velocity.write);
        this.velocity.swap();
    }
    private applyPhysics(dt: number, rect: ViewRect, 
        accel: {x: number, y:number} = {x: 0, y: 0},
    ){
        const prog = this.shaders.physics;
        prog.bind();
        this.applyCommonUniforms(prog, rect, this.velocity);

        const locuVelocity = getRequiredUniform(prog, "uVelocity");
        const locDt       = getRequiredUniform(prog, "dt");
        const  locAccel = getOptionalUniform(prog, "uAccel");
        const  locGravity  = getOptionalUniform(prog, "uGravity");
        const  locStreamMask = getOptionalUniform(prog, "uStreamForce");
        
        this.gl.uniform1i(locuVelocity, this.velocity.read.attach(0));
        this.gl.uniform1f(locDt, dt);
        if(locGravity!=null) this.gl.uniform2f(locGravity, 0.0, -this.config.GRAVITY); 
        if(locAccel!=null) this.gl.uniform2f(locAccel, accel.x, accel.y);
        if(locStreamMask!=null) this.gl.uniform1i(locStreamMask, this.stream.attach(1))

        this.blit(this.velocity.write);
        this.velocity.swap();
    }
    private computeDivergence(rect: ViewRect){
        const prog = this.shaders.divergence;
        prog.bind();
        this.applyCommonUniforms(prog, rect, this.velocity)
        const locuVelocity = getRequiredUniform(prog, "uVelocity")
        this.gl.uniform1i(locuVelocity, this.velocity.read.attach(0));
        this.blit(this.divergence);
    }
    private clearPressure(){
        const prog = this.shaders.clear;
        prog.bind();
        // clear用には obstacle / texelSize / uvClamp は不要なら何もせずでOK

        const locuTexture = getRequiredUniform(prog, "uTexture");
        const locValue    = getRequiredUniform(prog, "value");

        this.gl.uniform1i(locuTexture, this.pressure.read.attach(0));
        this.gl.uniform1f(locValue, this.config.PRESSURE);

        this.blit(this.pressure.write);
        this.pressure.swap();
    }
    private solvePressure(rect: ViewRect){
        const prog = this.shaders.pressure;
        prog.bind();
        this.applyCommonUniforms(prog, rect, this.velocity);
        
        const locuDivergence = getRequiredUniform(prog, "uDivergence");
        const locuPressure = getRequiredUniform(prog, "uPressure");
       
        this.gl.uniform1i(locuDivergence, this.divergence.attach(0));
        for (let i = 0; i < this.config.PRESSURE_ITERATIONS; i++) {
            this.gl.uniform1i(locuPressure, this.pressure.read.attach(1));
            this.blit(this.pressure.write);
            this.pressure.swap();
        }
    }
    private subtractGradient(rect: ViewRect){
        const prog = this.shaders.subtractGradient;
        prog.bind();
        this.applyCommonUniforms(prog, rect, this.velocity)
        const locuPressure = getRequiredUniform(prog, "uPressure");
        const locuVelocity = getRequiredUniform(prog, "uVelocity");
        
        this.gl.uniform1i(locuPressure, this.pressure.read.attach(0));
        this.gl.uniform1i(locuVelocity, this.velocity.read.attach(1));
        this.blit(this.velocity.write);
        this.velocity.swap();
    }
    private advectVelocityAndDye(dt: number, rect: ViewRect){
        const prog = this.shaders.advection;
        prog.bind();
        this.applyCommonUniforms(prog, rect, this.velocity)
        const locDyeTexelSize = getOptionalUniform(prog, "dyeTexelSize");
        const locuVelocity = getRequiredUniform(prog, "uVelocity");
        const locuSource = getRequiredUniform(prog, "uSource");
        const locDt = getRequiredUniform(prog, "dt");
        let locDissipation = getRequiredUniform(prog, "dissipation");
        // dyeTexelSize だけは「MANUAL_FILTERING のときだけ存在していれば良い」
        if (!this.ext.supportLinearFiltering && locDyeTexelSize == null) {
            throw new Error("dyeTexelSize uniform が見つかりません（MANUAL_FILTERING 有効時）");
        }
        if (!this.ext.supportLinearFiltering)
            this.gl.uniform2f(locDyeTexelSize as WebGLUniformLocation, this.velocity.texelSizeX, this.velocity.texelSizeY);
        let velocityId = this.velocity.read.attach(0);
        this.gl.uniform1i(locuVelocity, velocityId);
        this.gl.uniform1i(locuSource, velocityId);
        this.gl.uniform1f(locDt, dt);
        this.gl.uniform1f(locDissipation, this.config.VELOCITY_DISSIPATION);
        this.blit(this.velocity.write);
        this.velocity.swap();

        if (!this.ext.supportLinearFiltering)
            this.gl.uniform2f(locDyeTexelSize as WebGLUniformLocation, this.dye.texelSizeX, this.dye.texelSizeY);
        this.gl.uniform1i(locuVelocity, this.velocity.read.attach(0));
        this.gl.uniform1i(locuSource, this.dye.read.attach(1));
        this.gl.uniform1f(locDissipation, this.config.DENSITY_DISSIPATION);
        this.blit(this.dye.write);
        this.dye.swap();
    }

    private applyCommonUniforms(program: Program, rect: ViewRect, fbo: FBO | DoubleFBO) {
        this.bindObstacle(program);
        this.bindUVClamp(program, rect);
        const locTexelSize = getRequiredUniform(program, "texelSize");
        this.gl.uniform2f(locTexelSize, fbo.texelSizeX, fbo.texelSizeY);
    }
    private  bindObstacle(program: Program) {
        const loc = program.uniforms.get("uObstacle");
        if (loc == null) return; // そのシェーダが uObstacle を使ってないなら何もしない
        this.gl.uniform1i(loc, this.obstacle.attach(3));
    }

    private bindUVClamp(program: Program, rect: ViewRect){
        const loc = program.uniforms.get("uViewRect");
        if (loc == null) return; // そのシェーダが uViewRect を使ってないなら何もしない
        this.gl.uniform4f(loc, rect.uMin, rect.vMin, rect.uMax, rect.vMax);
    }
}