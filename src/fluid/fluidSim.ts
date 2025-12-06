import { Program } from "../gl/program";
import { 
    type FBO, type DoubleFBO, 
    createFBO, createDoubleFBO, 
    type BlitFunc ,
    resizeFBO, resizeDoubleFBO
} from "../gl/frameBuffer";
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
    splat: Program;
};
type FluidConfig = {
    CURL: number;
    GRAVITY: number;
    PRESSURE: number;
    PRESSURE_ITERATIONS: number;
    VELOCITY_DISSIPATION: number;
    DENSITY_DISSIPATION: number;
    SPLAT_RADIUS: number;
    LOGIC_DISSIPATION: number;
};

export class FluidSim{
    private gl: WebGLRenderingContext | WebGL2RenderingContext;
    private ext: { supportLinearFiltering: boolean };
    private blit: BlitFunc;
    private shaders: FluidShaders;
    private config: FluidConfig;
    private width: number;
    private height: number;

    private copyProgram: Program;

     // dye の相対スケールを覚えておく
    private dyeScaleX: number;
    private dyeScaleY: number;

    // 内部FBOたち（外に出さない）
    private velocity: DoubleFBO;
    private dye: DoubleFBO;
    private logicDye: DoubleFBO;
    private curl: FBO;
    private divergence: FBO;
    private pressure: DoubleFBO;
    private stream: FBO;
    private obstacle: FBO;
    private paused = false;
    private formats: {
        vel: { internalFormat: number; format: number; type: number; param: number };
        dye: { internalFormat: number; format: number; type: number; param: number };
        pressure: { internalFormat: number; format: number; type: number; param: number };
        stream: { internalFormat: number; format: number; type: number; param: number };
        obstacle: { internalFormat: number; format: number; type: number; param: number };
    };
    
    constructor(
        gl: WebGLRenderingContext | WebGL2RenderingContext,
        ext: { supportLinearFiltering: boolean },
        blit: BlitFunc,
        shaders: FluidShaders,
        config: FluidConfig,
        width: number,
        height: number,
        dyeWidth: number,
        dyeHeight: number,
        formats: {
            vel: { internalFormat: number; format: number; type: number; param: number };
            dye: { internalFormat: number; format: number; type: number; param: number };
            pressure: { internalFormat: number; format: number; type: number; param: number };
            stream: { internalFormat: number; format: number; type: number; param: number };
            obstacle: { internalFormat: number; format: number; type: number; param: number };
        },
        copyProgram: Program
    ) {
        this.gl = gl;
        this.ext = ext;
        this.blit = blit;
        this.shaders = shaders;
        this.config = config;
        this.width = width;
        this.height = height;
        this.formats = formats;
        this.copyProgram = copyProgram;
        this.dyeScaleX = dyeWidth  / width;
        this.dyeScaleY = dyeHeight / height;

        // ここで FBO/DoubleFBO を全部作る
        this.velocity = createDoubleFBO(gl, width, height, 
            formats.vel.internalFormat, formats.vel.format, formats.vel.type, formats.vel.param);
        this.dye = createDoubleFBO(gl, dyeWidth, dyeHeight, 
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
        this.logicDye = createDoubleFBO(gl, dyeWidth, dyeHeight,
            formats.dye.internalFormat, formats.dye.format, formats.dye.type, formats.dye.param);

        this.clearObstacle();
        this.clearStream();
    }
    step(
        dt: number, 
        rect: ViewRect = {uMin: 0, uMax: 1, vMin: 0, vMax: 1},
        accel: { x: number; y: number } = { x: 0, y: 0 },
    ){
        if(this.paused){
            this.decayOnly(dt, rect);
            return;
        }
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
    setPaused(p: boolean) {
        this.paused = p;
    }
    getPaused(){
        return this.paused;
    }

    splat(u: number, v: number, dx: number, dy: number, color: { r: number, g: number, b: number, a?: number } , canvas: HTMLCanvasElement){
        const gl = this.gl;
        const program = this.shaders.splat;

        program.bind();
        const aspect = this.width / this.height;
        const locTarget   = program.uniforms.get("uTarget")!;
        const locAspect   = program.uniforms.get("aspectRatio")!;
        const locPoint    = program.uniforms.get("point")!;
        const locColor    = program.uniforms.get("color")!;
        const locRadius   = program.uniforms.get("radius")!;
        const a = color.a ?? 1.0;

        gl.uniform1i(locTarget, this.velocity.read.attach(0));
        gl.uniform1f(locAspect, aspect);
        gl.uniform2f(locPoint, u, v);
        gl.uniform3f(locColor, dx, dy, 0.0);
        gl.uniform1f(locRadius, this.correctRadius(this.config.SPLAT_RADIUS / 100.0, canvas));

        this.blit(this.velocity.write);
        this.velocity.swap();

        gl.uniform1i(locTarget, this.dye.read.attach(0));
        gl.uniform3f(locColor, color.r * a, color.g * a, color.b * a);

        this.blit(this.dye.write);
        this.dye.swap();
    }

    logicSplat(u: number, v: number, 
        value: { r: number; g: number; b: number; a?: number },
        canvas: HTMLCanvasElement
    ) {
        const gl = this.gl;
        const program = this.shaders.splat;

        program.bind();
        const aspect = this.width / this.height;
        const locTarget   = program.uniforms.get("uTarget")!;
        const locAspect   = program.uniforms.get("aspectRatio")!;
        const locPoint    = program.uniforms.get("point")!;
        const locColor    = program.uniforms.get("color")!;
        const locRadius   = program.uniforms.get("radius")!;

        const a = value.a ?? 1.0;

        gl.uniform1i(locTarget, this.logicDye.read.attach(0));
        gl.uniform1f(locAspect, aspect);
        gl.uniform2f(locPoint, u, v);
        gl.uniform3f(locColor, value.r * a, value.g * a, value.b * a);
        gl.uniform1f(locRadius, this.correctRadius(this.config.SPLAT_RADIUS / 100.0, canvas));

        this.blit(this.logicDye.write);
        this.logicDye.swap();
    }

    getDyeTexture(){
        return this.dye.read.texture;
    }
    getVelTexture(){
        return this.velocity.read.texture;
    }
    getLogicTexture() {
        return this.logicDye.read.texture;
    }
    // FluidSim のメソッドとして追加
    sampleVelocity(u: number, v: number): { x: number; y: number } {
        const gl = this.gl;

        // UV → テクセル座標
        const ix = Math.min(this.width  - 1, Math.max(0, Math.floor(u * this.width)));
        const iy = Math.min(this.height - 1, Math.max(0, Math.floor(v * this.height)));

        const prevFbo = gl.getParameter(gl.FRAMEBUFFER_BINDING);

        // velocity の FBO から 1ピクセル読み取る
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.velocity.read.fbo);

        const buf = new Float32Array(4);
        gl.readPixels(ix, iy, 1, 1, gl.RGBA, gl.FLOAT, buf);
        // buf.xy が velocity

        gl.bindFramebuffer(gl.FRAMEBUFFER, prevFbo);

        return { x: buf[0], y: buf[1] };
    }
    sampleLogic(u: number, v: number): { r: number; g: number; b: number; a: number } {
        const gl = this.gl;

        const ix = Math.min(this.logicDye.width  - 1, Math.max(0, Math.floor(u * this.logicDye.width)));
        const iy = Math.min(this.logicDye.height - 1, Math.max(0, Math.floor(v * this.logicDye.height)));

        const prevFbo = gl.getParameter(gl.FRAMEBUFFER_BINDING);
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.logicDye.read.fbo);

        const buf = new Float32Array(4);
        gl.readPixels(ix, iy, 1, 1, gl.RGBA, gl.FLOAT, buf);

        gl.bindFramebuffer(gl.FRAMEBUFFER, prevFbo);

        return { r: buf[0], g: buf[1], b: buf[2], a: buf[3] };
}

    getObstacleTarget(): FBO{
        return this.obstacle;
    }

    getStreamTarget(): FBO{
        return this.stream;
    }

    private clearObstacle() {
        const gl = this.gl;
        const ob = this.obstacle;
        gl.bindFramebuffer(gl.FRAMEBUFFER, ob.fbo);
        gl.viewport(0, 0, ob.width, ob.height);
        gl.clearColor(0.0, 0.0, 0.0, 1.0); // mask = 0
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    }
    private clearStream() {
        const gl = this.gl;
        const s = this.stream;
        gl.bindFramebuffer(gl.FRAMEBUFFER, s.fbo);
        gl.viewport(0, 0, s.width, s.height);
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
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
        const locAccel = getOptionalUniform(prog, "uAccel");
        const locGravity  = getOptionalUniform(prog, "uGravity");
        const locStreamMask = getOptionalUniform(prog, "uStreamForce");
        
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
    private advectVelocityAndDye(dt: number, rect: ViewRect, decayOnly = false){
        const prog = this.shaders.advection;
        prog.bind();
        this.applyCommonUniforms(prog, rect, this.velocity)
        const locDyeTexelSize = getOptionalUniform(prog, "dyeTexelSize");
        const locuVelocity = getRequiredUniform(prog, "uVelocity");
        const locuSource = getRequiredUniform(prog, "uSource");
        let locDissipation = getRequiredUniform(prog, "dissipation");

        const locAdvectDt = getOptionalUniform(prog, "advectDt");
        const locDecayDt  = getOptionalUniform(prog, "decayDt");

        const advectDt = decayOnly ? 0.0 : dt;
        const decayDt  = dt;

        if (locAdvectDt) this.gl.uniform1f(locAdvectDt, advectDt);
        if (locDecayDt)  this.gl.uniform1f(locDecayDt, decayDt);

        // dyeTexelSize だけは「MANUAL_FILTERING のときだけ存在していれば良い」
        if (!this.ext.supportLinearFiltering && locDyeTexelSize == null) {
            throw new Error("dyeTexelSize uniform が見つかりません（MANUAL_FILTERING 有効時）");
        }
        if (!this.ext.supportLinearFiltering)
            this.gl.uniform2f(locDyeTexelSize as WebGLUniformLocation, this.velocity.texelSizeX, this.velocity.texelSizeY);
        let velocityId = this.velocity.read.attach(0);
        this.gl.uniform1i(locuVelocity, velocityId);
        this.gl.uniform1i(locuSource, velocityId);
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

        // --- ★ logicDye（ロジック） ---
        if (!this.ext.supportLinearFiltering)
            this.gl.uniform2f(locDyeTexelSize as WebGLUniformLocation,this.logicDye.texelSizeX, this.logicDye.texelSizeY);

        // 速度場は同じ velocity を使う
        this.gl.uniform1i(locuVelocity, this.velocity.read.attach(0));
        this.gl.uniform1i(locuSource,  this.logicDye.read.attach(1));
        this.gl.uniform1f(locDissipation, this.config.LOGIC_DISSIPATION);

        this.blit(this.logicDye.write);
        this.logicDye.swap();
    }

    private decayOnly(dt: number, rect: ViewRect) {
        this.advectVelocityAndDye(dt, rect, /*decayOnly=*/true);
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

    private correctRadius(radius: number, canvas: HTMLCanvasElement){
        let aspectRatio = canvas.width / canvas.height;
        if (aspectRatio > 1)
            radius *= aspectRatio;
        return radius;
    }

      // ---- ここから新規メソッド ----

  /**
   * 外部からキャンバスサイズの変更を伝えるためのリサイズ関数
   * @param canvasWidth  キャンバスの実ピクセル幅
   * @param canvasHeight キャンバスの実ピクセル高さ
   */
  resize(canvasWidth: number, canvasHeight: number): void {
    const gl = this.gl;

    const newWidth  = Math.max(1, canvasWidth);
    const newHeight = Math.max(1, canvasHeight);

    // ※ ここで 1/2 解像度などにしたければスケールを掛ける：
    // const newWidth  = Math.max(1, Math.floor(canvasWidth  * 0.5));
    // const newHeight = Math.max(1, Math.floor(canvasHeight * 0.5));

    // 変化なしなら何もしない
    if (newWidth === this.width && newHeight === this.height) {
      return;
    }

    this.width = newWidth;
    this.height = newHeight;

    // dye / logicDye の解像度は「もともとの比率」を維持
    const newDyeWidth  = Math.max(1, Math.floor(newWidth  * this.dyeScaleX));
    const newDyeHeight = Math.max(1, Math.floor(newHeight * this.dyeScaleY));

    const { vel, dye, pressure, stream, obstacle } = this.formats;

    // velocity / curl / divergence / pressure / stream / obstacle は
    // 物理シミュレーション解像度に追従
    this.velocity = resizeDoubleFBO(
      gl, this.blit, this.copyProgram,
      this.velocity,
      newWidth,
      newHeight,
      vel.internalFormat,
      vel.format,
      vel.type,
      vel.param,
    );

    this.curl = resizeFBO(
      gl, this.blit, this.copyProgram,
      this.curl,
      newWidth,
      newHeight,
      vel.internalFormat,
      vel.format,
      vel.type,
      vel.param,
    );

    this.divergence = resizeFBO(
      gl, this.blit, this.copyProgram,
      this.divergence,
      newWidth,
      newHeight,
      pressure.internalFormat,
      pressure.format,
      pressure.type,
      pressure.param,
    );

    this.pressure = resizeDoubleFBO(
      gl, this.blit, this.copyProgram,
      this.pressure,
      newWidth,
      newHeight,
      pressure.internalFormat,
      pressure.format,
      pressure.type,
      pressure.param,
    );

    this.stream = resizeFBO(
      gl, this.blit, this.copyProgram,
      this.stream,
      newWidth,
      newHeight,
      stream.internalFormat,
      stream.format,
      stream.type,
      stream.param,
    );

    this.obstacle = resizeFBO(
      gl, this.blit, this.copyProgram,
      this.obstacle,
      newWidth,
      newHeight,
      obstacle.internalFormat,
      obstacle.format,
      obstacle.type,
      obstacle.param,
    );

    // dye / logicDye は別解像度
    this.dye = resizeDoubleFBO(
      gl, this.blit, this.copyProgram,
      this.dye,
      newDyeWidth,
      newDyeHeight,
      dye.internalFormat,
      dye.format,
      dye.type,
      dye.param,
    );

    this.logicDye = resizeDoubleFBO(
      gl, this.blit, this.copyProgram,
      this.logicDye,
      newDyeWidth,
      newDyeHeight,
      dye.internalFormat,
      dye.format,
      dye.type,
      dye.param,
    );

    // obstacle / stream は内容を描き直した方がいいのでクリアしておく
    this.clearObstacle();
    this.clearStream();
  }

}