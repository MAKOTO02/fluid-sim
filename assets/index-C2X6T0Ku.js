(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const n of document.querySelectorAll('link[rel="modulepreload"]'))i(n);new MutationObserver(n=>{for(const o of n)if(o.type==="childList")for(const s of o.addedNodes)s.tagName==="LINK"&&s.rel==="modulepreload"&&i(s)}).observe(document,{childList:!0,subtree:!0});function r(n){const o={};return n.integrity&&(o.integrity=n.integrity),n.referrerPolicy&&(o.referrerPolicy=n.referrerPolicy),n.crossOrigin==="use-credentials"?o.credentials="include":n.crossOrigin==="anonymous"?o.credentials="omit":o.credentials="same-origin",o}function i(n){if(n.ep)return;n.ep=!0;const o=r(n);fetch(n.href,o)}})();class ot{frameId=null;last=0;running=!1;paused=!1;onFrame;maxDelta;constructor(e,r=1/30){this.onFrame=e,this.maxDelta=r}start(){this.running||(this.running=!0,this.paused=!1,this.last=performance.now(),this.frameId=requestAnimationFrame(this.tick))}stop(){this.frameId!=null&&(cancelAnimationFrame(this.frameId),this.frameId=null),this.running=!1,this.paused=!1}pause(){this.paused=!0}resume(){this.running&&(this.paused=!1,this.last=performance.now())}isRunning(){return this.running}isPaused(){return this.paused}tick=e=>{if(!this.running)return;let r=(e-this.last)/1e3;this.last=e,r=Math.min(r,this.maxDelta),this.paused||this.onFrame(r,e),this.frameId=requestAnimationFrame(this.tick)}}class at{gameLoop;onStart;constructor(e){this.onStart=e.onStart,this.gameLoop=new ot(e.onFrame,e.maxDelta)}start(){this.gameLoop.isRunning()||(this.onStart?.(),this.gameLoop.start())}stop(){this.gameLoop.stop()}pause(){this.gameLoop.pause()}resume(){this.gameLoop.resume()}isRunning(){return this.gameLoop.isRunning()}isPaused(){return this.gameLoop.isPaused()}}function ct(t){const{gl:e,scene:r,renderer:i,fluidSim:n,obstacleLayer:o}=t;r.update(0);const s=r.MainCamera;if(!s)return;const a=s.cullingMask,c=n.getObstacleTarget();s.cullingMask=o;const h=e.getParameter(e.FRAMEBUFFER_BINDING),l=e.getParameter(e.VIEWPORT);i.render(r,s,c),e.bindFramebuffer(e.FRAMEBUFFER,h),e.viewport(l[0],l[1],l[2],l[3]),s.cullingMask=a}function lt(t){const{canvas:e,scene:r,fluidSim:i,fitter:n,onResized:o}=t;if(!ut(e))return;const a=e.width,c=e.height,h=r.MainCamera;h&&h.setAspect(a/c),i.resize(a,c),n.updateLocalTransform(),o()}function ht(t){const{gl:e,scene:r,renderer:i,fluidSim:n,dyeVisualMaterial:o,streamLayer:s,dt:a}=t;r.update(a);const c=r.MainCamera;if(!c)return;const h=c.cullingMask,l=e.getParameter(e.FRAMEBUFFER_BINDING),u=e.getParameter(e.VIEWPORT),f=n.getStreamTarget();c.cullingMask=s,i.render(r,c,f),e.bindFramebuffer(e.FRAMEBUFFER,l),e.viewport(u[0],u[1],u[2],u[3]),c.cullingMask=h,n.step(a),o.setTextures(n.getDyeTexture(),n.getVelTexture()),i.render(r,c)}function Ee(t){const e=window.devicePixelRatio||1;return Math.floor(t*e)}function ut(t){const e=Ee(t.clientWidth),r=Ee(t.clientHeight);return t.width!==e||t.height!==r?(t.width=e,t.height=r,!0):!1}function ft(t){const e={alpha:!0,depth:!1,stencil:!1,antialias:!1,preserveDrawingBuffer:!1};let r;r=t.getContext("webgl2",e);const i=!!r;if(i||(r=t.getContext("webgl",e)||t.getContext("experimental-webgl",e)),!r)throw new Error("WebGL is not supported");let n,o;i?(r.getExtension("EXT_color_buffer_float"),o=r.getExtension("OES_texture_float_linear")):(n=r.getExtension("OES_texture_half_float"),o=r.getExtension("OES_texture_half_float_linear")),r.clearColor(0,0,0,1);const s=i?r.HALF_FLOAT:n.HALF_FLOAT_OES;let a,c,h;if(i){const l=r;a=B(l,l.RGBA16F,l.RGBA,s),c=B(l,l.RG16F,l.RG,s),h=B(l,l.R16F,l.RED,s)}else{const l=r;a=B(l,l.RGBA,l.RGBA,s),c=B(l,l.RGBA,l.RGBA,s),h=B(l,l.RGBA,l.RGBA,s)}return{gl:r,ext:{formatRGBA:a,formatRG:c,formatR:h,halfFloatTexType:s,supportLinearFiltering:!!o}}}function B(t,e,r,i){if(!mt(t,e,r,i)){if("RGBA16F"in t){const n=t;switch(e){case n.R16F:return B(n,n.RG16F,n.RG,i);case n.RG16F:return B(n,n.RGBA16F,n.RGBA,i);default:return null}}return null}return{internalFormat:e,format:r}}function mt(t,e,r,i){let n=t.createTexture();t.bindTexture(t.TEXTURE_2D,n),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_MIN_FILTER,t.NEAREST),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_MAG_FILTER,t.NEAREST),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_WRAP_S,t.CLAMP_TO_EDGE),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_WRAP_T,t.CLAMP_TO_EDGE),t.texImage2D(t.TEXTURE_2D,0,e,4,4,0,r,i,null);let o=t.createFramebuffer();return t.bindFramebuffer(t.FRAMEBUFFER,o),t.framebufferTexture2D(t.FRAMEBUFFER,t.COLOR_ATTACHMENT0,t.TEXTURE_2D,n,0),t.checkFramebufferStatus(t.FRAMEBUFFER)===t.FRAMEBUFFER_COMPLETE}class dt{gl;uniforms;program;constructor(e,r,i){this.gl=e,this.uniforms=new Map,this.program=pt(e,r,i),this.uniforms=vt(e,this.program)}bind(){this.gl.useProgram(this.program)}}function pt(t,e,r){let i=t.createProgram();if(!i)throw new Error("WebGLProgram を作成できませんでした");return t.attachShader(i,e),t.attachShader(i,r),t.linkProgram(i),t.getProgramParameter(i,t.LINK_STATUS)||console.trace(t.getProgramInfoLog(i)),i}function vt(t,e){let r=new Map,i=t.getProgramParameter(e,t.ACTIVE_UNIFORMS);for(let n=0;n<i;n++){let o=t.getActiveUniform(e,n);if(!o)continue;let s=o.name;r.set(s,t.getUniformLocation(e,s))}return r}function Pe(t,e,r,i){r=yt(r);const n=t.createShader(e);if(!n)throw new Error("shader が見つかりません");return t.shaderSource(n,r),t.compileShader(n),t.getShaderParameter(n,t.COMPILE_STATUS)||console.trace(t.getShaderInfoLog(n)),n}function yt(t,e){return t}class Le{gl;programs=new Map;constructor(e){this.gl=e}load(e,r,i){if(this.programs.has(e))return this.programs.get(e);const n=Pe(this.gl,this.gl.VERTEX_SHADER,r),o=Pe(this.gl,this.gl.FRAGMENT_SHADER,i),s=new dt(this.gl,n,o);return this.programs.set(e,s),s}get(e){const r=this.programs.get(e);if(!r)throw new Error(`Program '${e}' not loaded`);return r}}function U(t,e,r,i,n,o,s){const a=t.createTexture();if(!a)throw new Error("createFBO: failed to create texture");t.bindTexture(t.TEXTURE_2D,a),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_MIN_FILTER,s),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_MAG_FILTER,s),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_WRAP_S,t.CLAMP_TO_EDGE),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_WRAP_T,t.CLAMP_TO_EDGE),t.texImage2D(t.TEXTURE_2D,0,i,e,r,0,n,o,null);const c=t.createFramebuffer();if(!c)throw new Error("createFBO: failed to create framebuffer");t.bindFramebuffer(t.FRAMEBUFFER,c),t.framebufferTexture2D(t.FRAMEBUFFER,t.COLOR_ATTACHMENT0,t.TEXTURE_2D,a,0);const h=t.checkFramebufferStatus(t.FRAMEBUFFER);if(h!==t.FRAMEBUFFER_COMPLETE)throw console.error("createFBO: incomplete framebuffer",{status:"0x"+h.toString(16),w:e,h:r,internalFormat:i,format:n,type:o}),new Error("createFBO: FRAMEBUFFER_INCOMPLETE (0x"+h.toString(16)+")");t.bindFramebuffer(t.FRAMEBUFFER,null),t.bindTexture(t.TEXTURE_2D,null);const l=1/e,u=1/r;return{texture:a,fbo:c,width:e,height:r,texelSizeX:l,texelSizeY:u,attach(f){return t.activeTexture(t.TEXTURE0+f),t.bindTexture(t.TEXTURE_2D,a),f}}}function ne(t,e,r,i,n,o,s){let a=U(t,e,r,i,n,o,s),c=U(t,e,r,i,n,o,s);return{width:e,height:r,texelSizeX:a.texelSizeX,texelSizeY:a.texelSizeY,get read(){return a},set read(h){a=h},get write(){return c},set write(h){c=h},swap(){let h=a;a=c,c=h}}}function ee(t,e,r,i,n,o,s,a,c,h){let l=U(t,n,o,s,a,c,h);r.bind();let u=r.uniforms.get("uTexture");if(!u)throw new Error("uniform uTexture が見つかりません.");return t.uniform1i(u,i.attach(0)),e(l),l}function se(t,e,r,i,n,o,s,a,c,h){return i.width==n&&i.height==o||(i.read=ee(t,e,r,i.read,n,o,s,a,c,h),i.write=U(t,n,o,s,a,c,h),i.width=n,i.height=o,i.texelSizeX=1/n,i.texelSizeY=1/o),i}function gt(t){const e=t.createBuffer();t.bindBuffer(t.ARRAY_BUFFER,e),t.bufferData(t.ARRAY_BUFFER,new Float32Array([-1,-1,-1,1,1,1,1,-1]),t.STATIC_DRAW);const r=t.createBuffer();return t.bindBuffer(t.ELEMENT_ARRAY_BUFFER,r),t.bufferData(t.ELEMENT_ARRAY_BUFFER,new Uint16Array([0,1,2,0,2,3]),t.STATIC_DRAW),t.vertexAttribPointer(0,2,t.FLOAT,!1,0,0),t.enableVertexAttribArray(0),(i,n=!1)=>{i==null?(t.viewport(0,0,t.drawingBufferWidth,t.drawingBufferHeight),t.bindFramebuffer(t.FRAMEBUFFER,null)):(t.viewport(0,0,i.width,i.height),t.bindFramebuffer(t.FRAMEBUFFER,i.fbo)),n&&(t.clearColor(0,0,0,1),t.clear(t.COLOR_BUFFER_BIT)),t.drawElements(t.TRIANGLES,6,t.UNSIGNED_SHORT,0)}}const D=`precision highp float;\r
\r
attribute vec2 aPosition;\r
varying vec2 vUv;\r
varying vec2 vL;\r
varying vec2 vR;\r
varying vec2 vT;\r
varying vec2 vB;\r
uniform vec2 texelSize;\r
uniform vec2 uOffset;\r
uniform vec2 uScale;\r
\r
void main(){\r
    vUv = aPosition * 0.5 + 0.5;\r
    vL = vUv - vec2(texelSize.x, 0.0);\r
    vR = vUv + vec2(texelSize.x, 0.0);\r
    vT = vUv + vec2(0.0, texelSize.y);\r
    vB = vUv - vec2(0.0, texelSize.y);\r
    gl_Position = vec4(aPosition, 0.0, 1.0);\r
}`,xt=`precision mediump float;\r
precision mediump sampler2D;\r
\r
varying highp vec2 vUv;\r
varying highp vec2 vL;\r
varying highp vec2 vR;\r
varying highp vec2 vT;\r
varying highp vec2 vB;\r
uniform sampler2D uVelocity;\r
uniform vec4 uViewRect;\r
\r
void main () {\r
    float L = texture2D(uVelocity, vL).y;\r
    float R = texture2D(uVelocity, vR).y;\r
    float T = texture2D(uVelocity, vT).x;\r
    float B = texture2D(uVelocity, vB).x;\r
    float vorticity = (R - L - T + B) * 0.5;\r
    //float inside =\r
        //step(uViewRect.x, vUv.x) * step(vUv.x, uViewRect.z) *\r
        //step(uViewRect.y, vUv.y) * step(vUv.y, uViewRect.w);\r
    vec4 result = vec4(vorticity, 0.0, 0.0, 1.0);\r
    //gl_FragColor = result * inside;\r
    gl_FragColor = result;\r
}`,wt=`precision highp float;\r
precision highp sampler2D;\r
\r
varying vec2 vUv;\r
varying vec2 vL;\r
varying vec2 vR;\r
varying vec2 vT;\r
varying vec2 vB;\r
uniform sampler2D uVelocity;\r
uniform sampler2D uCurlMap;\r
uniform float curlStrength;\r
uniform float dt;\r
\r
uniform float time;\r
\r
void main () {\r
    float L = texture2D(uCurlMap, vL).x;\r
    float R = texture2D(uCurlMap, vR).x;\r
    float T = texture2D(uCurlMap, vT).x;\r
    float B = texture2D(uCurlMap, vB).x;\r
    float C = texture2D(uCurlMap, vUv).x;\r
\r
    vec2 force = 0.5 * vec2(abs(T) - abs(B), abs(R) - abs(L));\r
    force /= length(force) + 0.0001;\r
    force *= curlStrength * C;\r
    force.y *= -1.0;\r
\r
    vec2 velocity = texture2D(uVelocity, vUv).xy;\r
    velocity += force * dt;\r
    velocity = min(max(velocity, -1000.0), 1000.0);\r
    gl_FragColor = vec4(velocity, 0.0, 1.0);\r
}`,Tt=`// physics.frag\r
precision mediump float;\r
precision mediump sampler2D;\r
\r
varying vec2 vUv;\r
uniform sampler2D uVelocity;\r
uniform float dt;\r
\r
uniform vec2 uGravity;  // Conceptually like (0.0, -9.8); scale is tuned for gameplay.
uniform vec2 uAccel;
uniform sampler2D uObstacle;
uniform sampler2D uStreamForce;
uniform float uStreamForceScale;
\r
\r
void main () {\r
    vec2 v = texture2D(uVelocity, vUv).xy;\r
    float mask = texture2D(uObstacle, vUv).r;\r
    vec2 streamMask = texture2D(uStreamForce, vUv).xy;\r
    v += uGravity * dt;      // v^{*} = v^n + dt * g
    v -= uAccel * dt;
    v += streamMask * dt * uStreamForceScale;
\r
    // Prevent runaway velocity.
    v = clamp(v, vec2(-1000.0), vec2(1000.0));\r
\r
    v *= (1.0 - mask);\r
\r
    gl_FragColor = vec4(v, 0.0, 1.0);\r
}\r
`,bt=`precision mediump float;\r
precision mediump sampler2D;\r
\r
varying highp vec2 vUv;\r
varying highp vec2 vL;\r
varying highp vec2 vR;\r
varying highp vec2 vT;\r
varying highp vec2 vB;\r
uniform sampler2D uVelocity;\r
\r
void main () {\r
    float L = texture2D(uVelocity, vL).x;\r
    float R = texture2D(uVelocity, vR).x;\r
    float T = texture2D(uVelocity, vT).y;\r
    float B = texture2D(uVelocity, vB).y;\r
\r
    vec2 C = texture2D(uVelocity, vUv).xy;\r
    if (vL.x < 0.0) { L = -C.x; }\r
    if (vR.x > 1.0) { R = -C.x; }\r
    if (vT.y > 1.0) { T = -C.y; }\r
    if (vB.y < 0.0) { B = -C.y; }\r
\r
    float div = 0.5 * (R - L + T - B);\r
    gl_FragColor = vec4(div, 0.0, 0.0, 1.0);\r
}\r
`,Ft=`precision mediump float;\r
precision mediump sampler2D;\r
\r
varying highp vec2 vUv;\r
varying highp vec2 vL;\r
varying highp vec2 vR;\r
varying highp vec2 vT;\r
varying highp vec2 vB;\r
uniform sampler2D uPressure;\r
uniform sampler2D uDivergence;\r
\r
void main () {\r
    float L = texture2D(uPressure, vL).x;\r
    float R = texture2D(uPressure, vR).x;\r
    float T = texture2D(uPressure, vT).x;\r
    float B = texture2D(uPressure, vB).x;\r
    float C = texture2D(uPressure, vUv).x;\r
    float divergence = texture2D(uDivergence, vUv).x;\r
    float pressure = (L + R + B + T - divergence) * 0.25;\r
    gl_FragColor = vec4(pressure, 0.0, 0.0, 1.0);\r
}`,Rt=`precision mediump float;\r
precision mediump sampler2D;\r
\r
varying highp vec2 vUv;\r
varying highp vec2 vL;\r
varying highp vec2 vR;\r
varying highp vec2 vT;\r
varying highp vec2 vB;\r
uniform sampler2D uPressure;\r
uniform sampler2D uVelocity;\r
\r
void main () {\r
    float L = texture2D(uPressure, vL).x;\r
    float R = texture2D(uPressure, vR).x;\r
    float T = texture2D(uPressure, vT).x;\r
    float B = texture2D(uPressure, vB).x;\r
    vec2 velocity = texture2D(uVelocity, vUv).xy;\r
    velocity.xy -= vec2(R - L, T - B) * 0.5;\r
    gl_FragColor = vec4(velocity, 0.0, 1.0);\r
}`,Mt=`precision highp float;\r
precision highp sampler2D;\r
\r
varying vec2 vUv;\r
\r
uniform sampler2D uVelocity;\r
uniform sampler2D uSource;\r
uniform vec2 texelSize;\r
uniform vec2 dyeTexelSize;\r
uniform float decayDt;\r
uniform float advectDt;\r
uniform float dissipation;\r
uniform sampler2D uObstacle;\r
uniform vec4 uViewRect;\r
\r
vec4 bilerp (sampler2D sam, vec2 uv, vec2 tsize) {\r
    vec2 st = uv / tsize - 0.5;\r
\r
    vec2 iuv = floor(st);\r
    vec2 fuv = fract(st);\r
\r
    vec4 a = texture2D(sam, (iuv + vec2(0.5, 0.5)) * tsize);\r
    vec4 b = texture2D(sam, (iuv + vec2(1.5, 0.5)) * tsize);\r
    vec4 c = texture2D(sam, (iuv + vec2(0.5, 1.5)) * tsize);\r
    vec4 d = texture2D(sam, (iuv + vec2(1.5, 1.5)) * tsize);\r
\r
    return mix(mix(a, b, fuv.x), mix(c, d, fuv.x), fuv.y);\r
}\r
\r
void main () {\r
    float mask = texture2D(uObstacle, vUv).r;\r
    float inside =\r
        step(uViewRect.x, vUv.x) * step(vUv.x, uViewRect.z) *\r
        step(uViewRect.y, vUv.y) * step(vUv.y, uViewRect.w);\r
#ifdef MANUAL_FILTERING\r
    vec2 coord = vUv - advectDt * bilerp(uVelocity, vUv, texelSize).xy * texelSize;\r
    vec4 result = bilerp(uSource, coord, dyeTexelSize);\r
#else\r
    vec2 coord = vUv - advectDt * texture2D(uVelocity, vUv).xy * texelSize;\r
    vec4 result = texture2D(uSource, coord);\r
#endif\r
    float normalDecay = 1.0 + dissipation * decayDt;\r
    float decay = mix(normalDecay, 1.0, clamp(mask, 0.0, 1.0));\r
\r
    gl_FragColor = result * inside / decay;\r
}`,St=`precision mediump float;\r
precision mediump sampler2D;\r
\r
varying highp vec2 vUv;\r
uniform sampler2D uTexture;\r
uniform float value;\r
\r
void main () {\r
    gl_FragColor = value * texture2D(uTexture, vUv);\r
}`,Et=`precision highp float;\r
precision highp sampler2D;\r
\r
varying vec2 vUv;\r
uniform sampler2D uTarget;\r
uniform float aspectRatio;\r
uniform vec3 color;\r
uniform vec2 point;\r
uniform float radius;\r
\r
void main () {\r
    vec2 p = vUv - point.xy;\r
    p.x *= aspectRatio;\r
    vec3 splat = exp(-dot(p, p) / radius) * color;\r
    vec3 base = texture2D(uTarget, vUv).xyz;\r
    gl_FragColor = vec4(base + splat, 1.0);\r
}`,Pt=`precision mediump float;\r
precision mediump sampler2D;\r
\r
varying highp vec2 vUv;\r
uniform sampler2D uTexture;\r
\r
void main () {\r
    gl_FragColor = texture2D(uTexture, vUv);\r
}`;function Dt(t){return{fluidShaders:{curl:t.load("curl",D,xt),vorticity:t.load("vorticity",D,wt),physics:t.load("physics",D,Tt),divergence:t.load("divergence",D,bt),pressure:t.load("pressure",D,Ft),subtractGradient:t.load("subtractGradient",D,Rt),advection:t.load("advection",D,Mt),clear:t.load("clear",D,St),splat:t.load("splat",D,Et)},copyProgram:t.load("copy",D,Pt)}}class At{gl;ext;constructor(e,r){this.gl=e,this.ext=r}velocityFormat(){return{internalFormat:this.ext.formatRGBA.internalFormat,format:this.ext.formatRGBA.format,type:this.ext.halfFloatTexType,param:this.ext.supportLinearFiltering?this.gl.LINEAR:this.gl.NEAREST}}pressureFormat(){return{internalFormat:this.ext.formatR.internalFormat,format:this.ext.formatR.format,type:this.ext.halfFloatTexType,param:this.gl.NEAREST}}dyeFormat(){return{internalFormat:this.ext.formatRGBA.internalFormat,format:this.ext.formatRGBA.format,type:this.ext.halfFloatTexType,param:this.ext.supportLinearFiltering?this.gl.LINEAR:this.gl.NEAREST}}streamFormat(){return{internalFormat:this.ext.formatRG.internalFormat,format:this.ext.formatRG.format,type:this.ext.halfFloatTexType,param:this.gl.NEAREST}}obstacleFormat(){const e=this.ext.formatR??this.ext.formatRGBA;return{internalFormat:e.internalFormat,format:e.format,type:this.ext.halfFloatTexType,param:this.gl.NEAREST}}}function R(t,e){const r=t.uniforms.get(e);if(r==null)throw new Error(`Required uniform '${e}' is missing in program`);return r}function I(t,e){return t.uniforms.get(e)??null}class Ct{gl;ext;blit;shaders;config;width;height;copyProgram;dyeScaleX;dyeScaleY;velocity;dye;logicDye;curl;divergence;pressure;stream;obstacle;paused=!1;formats;constructor(e,r,i,n,o,s,a,c,h,l,u){this.gl=e,this.ext=r,this.blit=i,this.shaders=n,this.config=o,this.width=s,this.height=a,this.formats=l,this.copyProgram=u,this.dyeScaleX=c/s,this.dyeScaleY=h/a,this.velocity=ne(e,s,a,l.vel.internalFormat,l.vel.format,l.vel.type,l.vel.param),this.dye=ne(e,c,h,l.dye.internalFormat,l.dye.format,l.dye.type,l.dye.param),this.curl=U(e,s,a,l.vel.internalFormat,l.vel.format,l.vel.type,l.vel.param),this.divergence=U(e,s,a,l.pressure.internalFormat,l.pressure.format,l.pressure.type,l.pressure.param),this.pressure=ne(e,s,a,l.pressure.internalFormat,l.pressure.format,l.pressure.type,l.pressure.param),this.stream=U(e,s,a,l.stream.internalFormat,l.stream.format,l.stream.type,l.stream.param),this.obstacle=U(e,s,a,l.obstacle.internalFormat,l.obstacle.format,l.obstacle.type,l.obstacle.param),this.logicDye=ne(e,c,h,l.dye.internalFormat,l.dye.format,l.dye.type,l.dye.param),this.clearObstacle(),this.clearStream()}step(e,r={uMin:0,uMax:1,vMin:0,vMax:1},i={x:0,y:0}){if(this.paused){this.decayOnly(e,r);return}this.computeCurl(r),this.applyVorticity(e,r),this.applyPhysics(e,r,i),this.computeDivergence(r),this.clearPressure(),this.solvePressure(r),this.subtractGradient(r),this.advectVelocityAndDye(e,r)}setPaused(e){this.paused=e}getPaused(){return this.paused}splat(e,r,i,n,o,s){const a=this.gl,c=this.shaders.splat;c.bind();const h=this.width/this.height,l=c.uniforms.get("uTarget"),u=c.uniforms.get("aspectRatio"),f=c.uniforms.get("point"),m=c.uniforms.get("color"),d=c.uniforms.get("radius"),p=o.a??1;a.uniform1i(l,this.velocity.read.attach(0)),a.uniform1f(u,h),a.uniform2f(f,e,r),a.uniform3f(m,i,n,0),a.uniform1f(d,this.correctRadius(this.config.SPLAT_RADIUS/100,s)),this.blit(this.velocity.write),this.velocity.swap(),a.uniform1i(l,this.dye.read.attach(0)),a.uniform3f(m,o.r*p,o.g*p,o.b*p),this.blit(this.dye.write),this.dye.swap()}logicSplat(e,r,i,n){const o=this.gl,s=this.shaders.splat;s.bind();const a=this.width/this.height,c=s.uniforms.get("uTarget"),h=s.uniforms.get("aspectRatio"),l=s.uniforms.get("point"),u=s.uniforms.get("color"),f=s.uniforms.get("radius"),m=i.a??1;o.uniform1i(c,this.logicDye.read.attach(0)),o.uniform1f(h,a),o.uniform2f(l,e,r),o.uniform3f(u,i.r*m,i.g*m,i.b*m),o.uniform1f(f,this.correctRadius(this.config.SPLAT_RADIUS/100,n)),this.blit(this.logicDye.write),this.logicDye.swap()}getDyeTexture(){return this.dye.read.texture}getVelTexture(){return this.velocity.read.texture}getLogicTexture(){return this.logicDye.read.texture}sampleVelocity(e,r){const i=this.gl,n=Math.min(this.width-1,Math.max(0,Math.floor(e*this.width))),o=Math.min(this.height-1,Math.max(0,Math.floor(r*this.height))),s=i.getParameter(i.FRAMEBUFFER_BINDING);i.bindFramebuffer(i.FRAMEBUFFER,this.velocity.read.fbo);const a=new Float32Array(4);return i.readPixels(n,o,1,1,i.RGBA,i.FLOAT,a),i.bindFramebuffer(i.FRAMEBUFFER,s),{x:a[0],y:a[1]}}sampleLogic(e,r){const i=this.gl,n=Math.min(this.logicDye.width-1,Math.max(0,Math.floor(e*this.logicDye.width))),o=Math.min(this.logicDye.height-1,Math.max(0,Math.floor(r*this.logicDye.height))),s=i.getParameter(i.FRAMEBUFFER_BINDING);i.bindFramebuffer(i.FRAMEBUFFER,this.logicDye.read.fbo);const a=new Float32Array(4);return i.readPixels(n,o,1,1,i.RGBA,i.FLOAT,a),i.bindFramebuffer(i.FRAMEBUFFER,s),{r:a[0],g:a[1],b:a[2],a:a[3]}}getObstacleTarget(){return this.obstacle}getStreamTarget(){return this.stream}clearObstacle(){const e=this.gl,r=this.obstacle;e.bindFramebuffer(e.FRAMEBUFFER,r.fbo),e.viewport(0,0,r.width,r.height),e.clearColor(0,0,0,1),e.clear(e.COLOR_BUFFER_BIT),e.bindFramebuffer(e.FRAMEBUFFER,null)}clearStream(){const e=this.gl,r=this.stream;e.bindFramebuffer(e.FRAMEBUFFER,r.fbo),e.viewport(0,0,r.width,r.height),e.clearColor(0,0,0,1),e.clear(e.COLOR_BUFFER_BIT),e.bindFramebuffer(e.FRAMEBUFFER,null)}computeCurl(e){const r=this.shaders.curl;r.bind(),this.applyCommonUniforms(r,e,this.velocity);const i=R(r,"uVelocity");this.gl.uniform1i(i,this.velocity.read.attach(0)),this.blit(this.curl)}applyVorticity(e,r){const i=this.shaders.vorticity;i.bind(),this.applyCommonUniforms(i,r,this.velocity);const n=R(i,"uVelocity"),o=R(i,"uCurlMap"),s=R(i,"curlStrength"),a=R(i,"dt");this.gl.uniform1i(n,this.velocity.read.attach(0)),this.gl.uniform1i(o,this.curl.attach(1)),this.gl.uniform1f(s,this.config.CURL),this.gl.uniform1f(a,e),this.blit(this.velocity.write),this.velocity.swap()}applyPhysics(e,r,i={x:0,y:0}){const n=this.shaders.physics;n.bind(),this.applyCommonUniforms(n,r,this.velocity);const o=R(n,"uVelocity"),s=R(n,"dt"),a=I(n,"uAccel"),c=I(n,"uGravity"),h=I(n,"uStreamForce"),l=I(n,"uStreamForceScale");this.gl.uniform1i(o,this.velocity.read.attach(0)),this.gl.uniform1f(s,e),c!=null&&this.gl.uniform2f(c,0,-this.config.GRAVITY),a!=null&&this.gl.uniform2f(a,i.x,i.y),h!=null&&this.gl.uniform1i(h,this.stream.attach(1)),l!=null&&this.gl.uniform1f(l,this.config.STREAM_FORCE_SCALE),this.blit(this.velocity.write),this.velocity.swap()}computeDivergence(e){const r=this.shaders.divergence;r.bind(),this.applyCommonUniforms(r,e,this.velocity);const i=R(r,"uVelocity");this.gl.uniform1i(i,this.velocity.read.attach(0)),this.blit(this.divergence)}clearPressure(){const e=this.shaders.clear;e.bind();const r=R(e,"uTexture"),i=R(e,"value");this.gl.uniform1i(r,this.pressure.read.attach(0)),this.gl.uniform1f(i,this.config.PRESSURE),this.blit(this.pressure.write),this.pressure.swap()}solvePressure(e){const r=this.shaders.pressure;r.bind(),this.applyCommonUniforms(r,e,this.velocity);const i=R(r,"uDivergence"),n=R(r,"uPressure");this.gl.uniform1i(i,this.divergence.attach(0));for(let o=0;o<this.config.PRESSURE_ITERATIONS;o++)this.gl.uniform1i(n,this.pressure.read.attach(1)),this.blit(this.pressure.write),this.pressure.swap()}subtractGradient(e){const r=this.shaders.subtractGradient;r.bind(),this.applyCommonUniforms(r,e,this.velocity);const i=R(r,"uPressure"),n=R(r,"uVelocity");this.gl.uniform1i(i,this.pressure.read.attach(0)),this.gl.uniform1i(n,this.velocity.read.attach(1)),this.blit(this.velocity.write),this.velocity.swap()}advectVelocityAndDye(e,r,i=!1){const n=this.shaders.advection;n.bind(),this.applyCommonUniforms(n,r,this.velocity);const o=I(n,"dyeTexelSize"),s=R(n,"uVelocity"),a=R(n,"uSource");let c=R(n,"dissipation");const h=I(n,"advectDt"),l=I(n,"decayDt"),u=i?0:e,f=e;if(h&&this.gl.uniform1f(h,u),l&&this.gl.uniform1f(l,f),!this.ext.supportLinearFiltering&&o==null)throw new Error("dyeTexelSize uniform が見つかりません（MANUAL_FILTERING 有効時）");this.ext.supportLinearFiltering||this.gl.uniform2f(o,this.velocity.texelSizeX,this.velocity.texelSizeY);let m=this.velocity.read.attach(0);this.gl.uniform1i(s,m),this.gl.uniform1i(a,m),this.gl.uniform1f(c,this.config.VELOCITY_DISSIPATION),this.blit(this.velocity.write),this.velocity.swap(),this.ext.supportLinearFiltering||this.gl.uniform2f(o,this.dye.texelSizeX,this.dye.texelSizeY),this.gl.uniform1i(s,this.velocity.read.attach(0)),this.gl.uniform1i(a,this.dye.read.attach(1)),this.gl.uniform1f(c,this.config.DENSITY_DISSIPATION),this.blit(this.dye.write),this.dye.swap(),this.ext.supportLinearFiltering||this.gl.uniform2f(o,this.logicDye.texelSizeX,this.logicDye.texelSizeY),this.gl.uniform1i(s,this.velocity.read.attach(0)),this.gl.uniform1i(a,this.logicDye.read.attach(1)),this.gl.uniform1f(c,this.config.LOGIC_DISSIPATION),this.blit(this.logicDye.write),this.logicDye.swap()}decayOnly(e,r){this.advectVelocityAndDye(e,r,!0)}applyCommonUniforms(e,r,i){this.bindObstacle(e),this.bindUVClamp(e,r);const n=R(e,"texelSize");this.gl.uniform2f(n,i.texelSizeX,i.texelSizeY)}bindObstacle(e){const r=e.uniforms.get("uObstacle");r!=null&&this.gl.uniform1i(r,this.obstacle.attach(3))}bindUVClamp(e,r){const i=e.uniforms.get("uViewRect");i!=null&&this.gl.uniform4f(i,r.uMin,r.vMin,r.uMax,r.vMax)}correctRadius(e,r){let i=r.width/r.height;return i>1&&(e*=i),e}resize(e,r){const i=this.gl,n=Math.max(1,e),o=Math.max(1,r);if(n===this.width&&o===this.height)return;this.width=n,this.height=o;const s=Math.max(1,Math.floor(n*this.dyeScaleX)),a=Math.max(1,Math.floor(o*this.dyeScaleY)),{vel:c,dye:h,pressure:l,stream:u,obstacle:f}=this.formats;this.velocity=se(i,this.blit,this.copyProgram,this.velocity,n,o,c.internalFormat,c.format,c.type,c.param),this.curl=ee(i,this.blit,this.copyProgram,this.curl,n,o,c.internalFormat,c.format,c.type,c.param),this.divergence=ee(i,this.blit,this.copyProgram,this.divergence,n,o,l.internalFormat,l.format,l.type,l.param),this.pressure=se(i,this.blit,this.copyProgram,this.pressure,n,o,l.internalFormat,l.format,l.type,l.param),this.stream=ee(i,this.blit,this.copyProgram,this.stream,n,o,u.internalFormat,u.format,u.type,u.param),this.obstacle=ee(i,this.blit,this.copyProgram,this.obstacle,n,o,f.internalFormat,f.format,f.type,f.param),this.dye=se(i,this.blit,this.copyProgram,this.dye,s,a,h.internalFormat,h.format,h.type,h.param),this.logicDye=se(i,this.blit,this.copyProgram,this.logicDye,s,a,h.internalFormat,h.format,h.type,h.param),this.clearObstacle(),this.clearStream()}}const _t={CURL:30,GRAVITY:0,PRESSURE:.8,PRESSURE_ITERATIONS:15,VELOCITY_DISSIPATION:.2,DENSITY_DISSIPATION:2.2,SPLAT_RADIUS:.01,LOGIC_DISSIPATION:2.2,STREAM_FORCE_SCALE:1e6},Ut=256,Vt=1024;function Lt({gl:t,ext:e,blit:r,fluidShaders:i,copyProgram:n}){const o=De(t,Ut),s=De(t,Vt),a=new At(t,e),c={vel:a.velocityFormat(),dye:a.dyeFormat(),pressure:a.pressureFormat(),stream:a.streamFormat(),obstacle:a.obstacleFormat()};return{fluidSim:new Ct(t,e,r,i,_t,o.width,o.height,s.width,s.height,c,n),resolver:a}}function De(t,e){let r=t.drawingBufferWidth/t.drawingBufferHeight;r<1&&(r=1/r);const i=Math.round(e),n=Math.round(e*r);return t.drawingBufferWidth>t.drawingBufferHeight?{width:n,height:i}:{width:i,height:n}}const Bt=`// shaders/streamBulletField.frag
precision highp float;
varying vec2 vUv;

// Example swirl flow around the center (0.5, 0.5).
uniform float uStrength;

void main() {
    // Move [0,1]^2 so the center becomes (0,0).
    vec2 p = vUv - 0.5;
    float r = length(p);

    // Avoid division by zero at the center.
    if (r < 1e-4) {
        gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
        return;
    }

    // Tangential flow direction (-y, x).
    vec2 dir = vec2(-p.y, p.x) / r;

    // Distance falloff.
    float falloff = exp(-r * 4.0);

    vec2 v = dir * falloff * uStrength;

    // Store vector in RG.
    gl_FragColor = vec4(v, 0.0, 1.0);
}
`,Ot=3e-4;function zt(t,e,r,i){const n=e.load("BulletStreamField",D,Bt),o=64,s=i.streamFormat(),a=U(t,o,o,s.internalFormat,s.format,s.type,s.param);t.bindFramebuffer(t.FRAMEBUFFER,a.fbo),t.viewport(0,0,o,o),n.bind();const c=n.uniforms.get("uStrength");return c&&t.uniform1f(c,Ot),r(a),t.bindFramebuffer(t.FRAMEBUFFER,null),a.texture}class It{pressedKeys=new Set;shootCommands=[];keyboardTarget;pointerTarget;constructor(e={}){this.keyboardTarget=e.keyboardTarget??window,this.pointerTarget=e.pointerTarget,this.keyboardTarget.addEventListener("keydown",this.onKeyDown),this.keyboardTarget.addEventListener("keyup",this.onKeyUp),this.keyboardTarget.addEventListener("blur",this.onBlur),this.pointerTarget?.addEventListener("click",this.onClick)}getMoveAxis(){let e=0,r=0;return(this.isPressed("a")||this.isPressed("arrowleft"))&&(e-=1),(this.isPressed("d")||this.isPressed("arrowright"))&&(e+=1),(this.isPressed("s")||this.isPressed("arrowdown"))&&(r-=1),(this.isPressed("w")||this.isPressed("arrowup"))&&(r+=1),{x:e,y:r}}consumeShootCommands(){return this.shootCommands.splice(0)}dispose(){this.keyboardTarget.removeEventListener("keydown",this.onKeyDown),this.keyboardTarget.removeEventListener("keyup",this.onKeyUp),this.keyboardTarget.removeEventListener("blur",this.onBlur),this.pointerTarget?.removeEventListener("click",this.onClick)}isPressed(e){return this.pressedKeys.has(e)}onKeyDown=e=>{const r=this.normalizeKey(e.key);this.isMovementKey(r)&&(e.preventDefault(),this.pressedKeys.add(r))};onKeyUp=e=>{const r=this.normalizeKey(e.key);this.isMovementKey(r)&&(e.preventDefault(),this.pressedKeys.delete(r))};onBlur=()=>{this.pressedKeys.clear()};onClick=e=>{if(!this.pointerTarget)return;const r=this.pointerTarget.getBoundingClientRect(),i=e.clientX-r.left,n=e.clientY-r.top;this.shootCommands.push({u:i/r.width,v:1-n/r.height})};normalizeKey(e){return e.toLowerCase()}isMovementKey(e){return e==="a"||e==="d"||e==="s"||e==="w"||e==="arrowleft"||e==="arrowright"||e==="arrowdown"||e==="arrowup"}}class Gt{element;constructor(e=document.body){this.element=document.createElement("pre"),this.element.style.position="fixed",this.element.style.left="8px",this.element.style.top="8px",this.element.style.zIndex="10",this.element.style.margin="0",this.element.style.padding="8px 10px",this.element.style.maxWidth="420px",this.element.style.maxHeight="60vh",this.element.style.overflow="auto",this.element.style.pointerEvents="none",this.element.style.background="rgba(0, 0, 0, 0.65)",this.element.style.color="#e8f2ff",this.element.style.font="12px/1.45 Consolas, Monaco, monospace",this.element.style.whiteSpace="pre-wrap",this.element.style.border="1px solid rgba(255, 255, 255, 0.18)",this.element.style.borderRadius="6px",e.appendChild(this.element)}setText(e){this.element.textContent=e}dispose(){this.element.remove()}}function kt(t){const{stage:e}=t;return["World Snapshot","",`Player: ${oe(e.player)}`,`Enemies: ${e.enemies.length}`,...e.enemies.map(r=>`  ${oe(r)}`),`Obstacles: ${e.obstacles.length}`,...e.obstacles.map(r=>`  ${oe(r)}`),`Streams: ${e.streams.length}`,...e.streams.map(r=>`  ${oe(r)}`)].join(`
`)}function oe(t){const e=t.velocity?` vel=${de(t.velocity)}`:"";return`#${t.id} ${t.name} pos=${de(t.position)} scale=${de(t.localScale)}${e}`}function de(t){return`[${pe(t[0])}, ${pe(t[1])}, ${pe(t[2])}]`}function pe(t){return t.toFixed(2)}class re{enabled=!0;owner;radius;layer;isTrigger;scene;onTriggerEnter;constructor(e,r,i,n=!0){this.radius=r,this.layer=i,this.isTrigger=n,this.scene=e}start(){}update(e){}onAttach(){this.scene.collisionSystem.add(this)}onDetach(){this.scene.collisionSystem.remove(this)}}class Nt{colliders=[];add(e){this.colliders.push(e)}remove(e){this.colliders=this.colliders.filter(r=>r!==e)}update(e){const r=this.colliders.length;for(let i=0;i<r;i++){const n=this.colliders[i],o=n.owner;if(!n.enabled||!o)continue;const s=o.transform.getWorldPosition();for(let a=i+1;a<r;a++){const c=this.colliders[a],h=c.owner;if(!c.enabled||!h||!this.shouldCollide(n,c))continue;const l=h.transform.getWorldPosition(),u=s[0]-l[0],f=s[1]-l[1],m=s[2]-l[2],d=n.radius+c.radius;u*u+f*f+m*m<=d*d&&n.isTrigger&&c.isTrigger&&(n.onTriggerEnter?.(c),c.onTriggerEnter?.(n))}}}shouldCollide(e,r){return!0}}class Xt{objects=[];_mainCamera=null;destroyQueue=[];collisionSystem=new Nt;addObject(e){this.objects.push(e),e.scene=this}removeObject(e){const r=this.objects.indexOf(e);r>=0&&this.objects.splice(r,1)}markForDestroy(e){this.destroyQueue.push(e)}findByName(e){return this.objects.find(r=>r.name===e)??null}setMainCamera(e){this._mainCamera=e}get MainCamera(){return this._mainCamera}update(e){for(const r of this.objects)r.update(e);if(this.collisionSystem.update(e),this.destroyQueue.length>0){const r=new Set(this.destroyQueue);for(const i of this.destroyQueue)i.forEachComponent(n=>n.onDetach?.());this.objects=this.objects.filter(i=>!r.has(i)),this.destroyQueue.length=0}}getObjects(){return this.objects}}var Wt=1e-6,S=typeof Float32Array<"u"?Float32Array:Array,Yt="zyx";function $t(){var t=new S(9);return S!=Float32Array&&(t[1]=0,t[2]=0,t[3]=0,t[5]=0,t[6]=0,t[7]=0),t[0]=1,t[4]=1,t[8]=1,t}function $(){var t=new S(16);return S!=Float32Array&&(t[1]=0,t[2]=0,t[3]=0,t[4]=0,t[6]=0,t[7]=0,t[8]=0,t[9]=0,t[11]=0,t[12]=0,t[13]=0,t[14]=0),t[0]=1,t[5]=1,t[10]=1,t[15]=1,t}function jt(t,e){return t[0]=e[0],t[1]=e[1],t[2]=e[2],t[3]=e[3],t[4]=e[4],t[5]=e[5],t[6]=e[6],t[7]=e[7],t[8]=e[8],t[9]=e[9],t[10]=e[10],t[11]=e[11],t[12]=e[12],t[13]=e[13],t[14]=e[14],t[15]=e[15],t}function Ae(t,e){var r=e[0],i=e[1],n=e[2],o=e[3],s=e[4],a=e[5],c=e[6],h=e[7],l=e[8],u=e[9],f=e[10],m=e[11],d=e[12],p=e[13],w=e[14],F=e[15],E=r*a-i*s,v=r*c-n*s,y=r*h-o*s,g=i*c-n*a,x=i*h-o*a,j=n*h-o*c,H=l*p-u*d,K=l*w-f*d,q=l*F-m*d,Z=u*w-f*p,Q=u*F-m*p,J=f*F-m*w,M=E*J-v*Q+y*Z+g*q-x*K+j*H;return M?(M=1/M,t[0]=(a*J-c*Q+h*Z)*M,t[1]=(n*Q-i*J-o*Z)*M,t[2]=(p*j-w*x+F*g)*M,t[3]=(f*x-u*j-m*g)*M,t[4]=(c*q-s*J-h*K)*M,t[5]=(r*J-n*q+o*K)*M,t[6]=(w*y-d*j-F*v)*M,t[7]=(l*j-f*y+m*v)*M,t[8]=(s*Q-a*q+h*H)*M,t[9]=(i*q-r*Q-o*H)*M,t[10]=(d*x-p*y+F*E)*M,t[11]=(u*y-l*x-m*E)*M,t[12]=(a*K-s*Z-c*H)*M,t[13]=(r*Z-i*K+n*H)*M,t[14]=(p*v-d*g-w*E)*M,t[15]=(l*g-u*v+f*E)*M,t):null}function Ht(t,e,r){var i=e[0],n=e[1],o=e[2],s=e[3],a=e[4],c=e[5],h=e[6],l=e[7],u=e[8],f=e[9],m=e[10],d=e[11],p=e[12],w=e[13],F=e[14],E=e[15],v=r[0],y=r[1],g=r[2],x=r[3];return t[0]=v*i+y*a+g*u+x*p,t[1]=v*n+y*c+g*f+x*w,t[2]=v*o+y*h+g*m+x*F,t[3]=v*s+y*l+g*d+x*E,v=r[4],y=r[5],g=r[6],x=r[7],t[4]=v*i+y*a+g*u+x*p,t[5]=v*n+y*c+g*f+x*w,t[6]=v*o+y*h+g*m+x*F,t[7]=v*s+y*l+g*d+x*E,v=r[8],y=r[9],g=r[10],x=r[11],t[8]=v*i+y*a+g*u+x*p,t[9]=v*n+y*c+g*f+x*w,t[10]=v*o+y*h+g*m+x*F,t[11]=v*s+y*l+g*d+x*E,v=r[12],y=r[13],g=r[14],x=r[15],t[12]=v*i+y*a+g*u+x*p,t[13]=v*n+y*c+g*f+x*w,t[14]=v*o+y*h+g*m+x*F,t[15]=v*s+y*l+g*d+x*E,t}function Kt(t,e,r,i){var n=e[0],o=e[1],s=e[2],a=e[3],c=n+n,h=o+o,l=s+s,u=n*c,f=n*h,m=n*l,d=o*h,p=o*l,w=s*l,F=a*c,E=a*h,v=a*l,y=i[0],g=i[1],x=i[2];return t[0]=(1-(d+w))*y,t[1]=(f+v)*y,t[2]=(m-E)*y,t[3]=0,t[4]=(f-v)*g,t[5]=(1-(u+w))*g,t[6]=(p+F)*g,t[7]=0,t[8]=(m+E)*x,t[9]=(p-F)*x,t[10]=(1-(u+d))*x,t[11]=0,t[12]=r[0],t[13]=r[1],t[14]=r[2],t[15]=1,t}function qt(t,e,r,i,n){var o=1/Math.tan(e/2);if(t[0]=o/r,t[1]=0,t[2]=0,t[3]=0,t[4]=0,t[5]=o,t[6]=0,t[7]=0,t[8]=0,t[9]=0,t[11]=-1,t[12]=0,t[13]=0,t[15]=0,n!=null&&n!==1/0){var s=1/(i-n);t[10]=(n+i)*s,t[14]=2*n*i*s}else t[10]=-1,t[14]=-2*i;return t}var Zt=qt,xe=Ht;function T(){var t=new S(3);return S!=Float32Array&&(t[0]=0,t[1]=0,t[2]=0),t}function Qt(t){var e=new S(3);return e[0]=t[0],e[1]=t[1],e[2]=t[2],e}function Be(t){var e=t[0],r=t[1],i=t[2];return Math.sqrt(e*e+r*r+i*i)}function b(t,e,r){var i=new S(3);return i[0]=t,i[1]=e,i[2]=r,i}function k(t,e){return t[0]=e[0],t[1]=e[1],t[2]=e[2],t}function G(t,e,r,i){return t[0]=e,t[1]=r,t[2]=i,t}function Y(t,e,r){return t[0]=e[0]+r[0],t[1]=e[1]+r[1],t[2]=e[2]+r[2],t}function Jt(t,e,r){return t[0]=e[0]-r[0],t[1]=e[1]-r[1],t[2]=e[2]-r[2],t}function _(t,e,r){return t[0]=e[0]*r,t[1]=e[1]*r,t[2]=e[2]*r,t}function Oe(t,e,r,i){return t[0]=e[0]+r[0]*i,t[1]=e[1]+r[1]*i,t[2]=e[2]+r[2]*i,t}function er(t,e){var r=e[0]-t[0],i=e[1]-t[1],n=e[2]-t[2];return Math.sqrt(r*r+i*i+n*n)}function O(t,e){var r=e[0],i=e[1],n=e[2],o=r*r+i*i+n*n;return o>0&&(o=1/Math.sqrt(o)),t[0]=e[0]*o,t[1]=e[1]*o,t[2]=e[2]*o,t}function ze(t,e){return t[0]*e[0]+t[1]*e[1]+t[2]*e[2]}function ve(t,e,r){var i=e[0],n=e[1],o=e[2],s=r[0],a=r[1],c=r[2];return t[0]=n*c-o*a,t[1]=o*s-i*c,t[2]=i*a-n*s,t}function tr(t,e,r,i){var n=e[0],o=e[1],s=e[2];return t[0]=n+i*(r[0]-n),t[1]=o+i*(r[1]-o),t[2]=s+i*(r[2]-s),t}var ie=Jt,rr=Be;(function(){var t=T();return function(e,r,i,n,o,s){var a,c;for(r||(r=3),i||(i=0),n?c=Math.min(n*r+i,e.length):c=e.length,a=i;a<c;a+=r)t[0]=e[a],t[1]=e[a+1],t[2]=e[a+2],o(t,t,s),e[a]=t[0],e[a+1]=t[1],e[a+2]=t[2];return e}})();function ir(){var t=new S(4);return S!=Float32Array&&(t[0]=0,t[1]=0,t[2]=0,t[3]=0),t}function z(t,e,r,i){var n=new S(4);return n[0]=t,n[1]=e,n[2]=r,n[3]=i,n}function nr(t,e){return t[0]=e[0],t[1]=e[1],t[2]=e[2],t[3]=e[3],t}function sr(t,e){var r=e[0],i=e[1],n=e[2],o=e[3],s=r*r+i*i+n*n+o*o;return s>0&&(s=1/Math.sqrt(s)),t[0]=r*s,t[1]=i*s,t[2]=n*s,t[3]=o*s,t}function ye(t,e,r){var i=e[0],n=e[1],o=e[2],s=e[3];return t[0]=r[0]*i+r[4]*n+r[8]*o+r[12]*s,t[1]=r[1]*i+r[5]*n+r[9]*o+r[13]*s,t[2]=r[2]*i+r[6]*n+r[10]*o+r[14]*s,t[3]=r[3]*i+r[7]*n+r[11]*o+r[15]*s,t}(function(){var t=ir();return function(e,r,i,n,o,s){var a,c;for(r||(r=4),i||(i=0),n?c=Math.min(n*r+i,e.length):c=e.length,a=i;a<c;a+=r)t[0]=e[a],t[1]=e[a+1],t[2]=e[a+2],t[3]=e[a+3],o(t,t,s),e[a]=t[0],e[a+1]=t[1],e[a+2]=t[2],e[a+3]=t[3];return e}})();function N(){var t=new S(4);return S!=Float32Array&&(t[0]=0,t[1]=0,t[2]=0),t[3]=1,t}function or(t){return t[0]=0,t[1]=0,t[2]=0,t[3]=1,t}function he(t,e,r){r=r*.5;var i=Math.sin(r);return t[0]=i*e[0],t[1]=i*e[1],t[2]=i*e[2],t[3]=Math.cos(r),t}function Ie(t,e,r){var i=e[0],n=e[1],o=e[2],s=e[3],a=r[0],c=r[1],h=r[2],l=r[3];return t[0]=i*l+s*a+n*h-o*c,t[1]=n*l+s*c+o*a-i*h,t[2]=o*l+s*h+i*c-n*a,t[3]=s*l-i*a-n*c-o*h,t}function ge(t,e,r,i){var n=e[0],o=e[1],s=e[2],a=e[3],c=r[0],h=r[1],l=r[2],u=r[3],f,m,d,p,w;return m=n*c+o*h+s*l+a*u,m<0&&(m=-m,c=-c,h=-h,l=-l,u=-u),1-m>Wt?(f=Math.acos(m),d=Math.sin(f),p=Math.sin((1-i)*f)/d,w=Math.sin(i*f)/d):(p=1-i,w=i),t[0]=p*n+w*c,t[1]=p*o+w*h,t[2]=p*s+w*l,t[3]=p*a+w*u,t}function ar(t,e){var r=e[0]+e[4]+e[8],i;if(r>0)i=Math.sqrt(r+1),t[3]=.5*i,i=.5/i,t[0]=(e[5]-e[7])*i,t[1]=(e[6]-e[2])*i,t[2]=(e[1]-e[3])*i;else{var n=0;e[4]>e[0]&&(n=1),e[8]>e[n*3+n]&&(n=2);var o=(n+1)%3,s=(n+2)%3;i=Math.sqrt(e[n*3+n]-e[o*3+o]-e[s*3+s]+1),t[n]=.5*i,i=.5/i,t[3]=(e[o*3+s]-e[s*3+o])*i,t[o]=(e[o*3+n]+e[n*3+o])*i,t[s]=(e[s*3+n]+e[n*3+s])*i}return t}function cr(t,e,r,i){var n=arguments.length>4&&arguments[4]!==void 0?arguments[4]:Yt,o=Math.PI/360;e*=o,i*=o,r*=o;var s=Math.sin(e),a=Math.cos(e),c=Math.sin(r),h=Math.cos(r),l=Math.sin(i),u=Math.cos(i);switch(n){case"xyz":t[0]=s*h*u+a*c*l,t[1]=a*c*u-s*h*l,t[2]=a*h*l+s*c*u,t[3]=a*h*u-s*c*l;break;case"xzy":t[0]=s*h*u-a*c*l,t[1]=a*c*u-s*h*l,t[2]=a*h*l+s*c*u,t[3]=a*h*u+s*c*l;break;case"yxz":t[0]=s*h*u+a*c*l,t[1]=a*c*u-s*h*l,t[2]=a*h*l-s*c*u,t[3]=a*h*u+s*c*l;break;case"yzx":t[0]=s*h*u+a*c*l,t[1]=a*c*u+s*h*l,t[2]=a*h*l-s*c*u,t[3]=a*h*u-s*c*l;break;case"zxy":t[0]=s*h*u-a*c*l,t[1]=a*c*u+s*h*l,t[2]=a*h*l+s*c*u,t[3]=a*h*u-s*c*l;break;case"zyx":t[0]=s*h*u-a*c*l,t[1]=a*c*u+s*h*l,t[2]=a*h*l-s*c*u,t[3]=a*h*u+s*c*l;break;default:throw new Error("Unknown angle order "+n)}return t}var lr=nr,Ce=Ie,Ge=sr;(function(){var t=T(),e=b(1,0,0),r=b(0,1,0);return function(i,n,o){var s=ze(n,o);return s<-.999999?(ve(t,e,n),rr(t)<1e-6&&ve(t,r,n),O(t,t),he(i,t,Math.PI),i):s>.999999?(i[0]=0,i[1]=0,i[2]=0,i[3]=1,i):(ve(t,n,o),i[0]=t[0],i[1]=t[1],i[2]=t[2],i[3]=1+s,Ge(i,i))}})();(function(){var t=N(),e=N();return function(r,i,n,o,s,a){return ge(t,i,s,a),ge(e,n,o,a),ge(r,t,e,2*a*(1-a)),r}})();(function(){var t=$t();return function(e,r,i,n){return t[0]=i[0],t[3]=i[1],t[6]=i[2],t[1]=n[0],t[4]=n[1],t[7]=n[2],t[2]=-r[0],t[5]=-r[1],t[8]=-r[2],Ge(e,ar(e,t))}})();function ke(){var t=new S(2);return S!=Float32Array&&(t[0]=0,t[1]=0),t}function we(t,e){var r=new S(2);return r[0]=t,r[1]=e,r}function _e(t,e){return t[0]=e[0],t[1]=e[1],t}function hr(t,e,r){return t[0]=e,t[1]=r,t}(function(){var t=ke();return function(e,r,i,n,o,s){var a,c;for(r||(r=2),i||(i=0),n?c=Math.min(n*r+i,e.length):c=e.length,a=i;a<c;a+=r)t[0]=e[a],t[1]=e[a+1],o(t,t,s),e[a]=t[0],e[a+1]=t[1];return e}})();class ur{position;rotation;scale;localMatrix;worldMatrix;_dirty=!0;parent=null;children=[];constructor(){this.position=T(),this.rotation=N(),this.scale=b(1,1,1),this.localMatrix=$(),this.worldMatrix=$()}setParent(e){if(this.parent!==e){if(this.parent){const r=this.parent.children.indexOf(this);r>=0&&this.parent.children.splice(r,1)}this.parent=e,e&&e.children.push(this),this.markDirty()}}updateMatrix(){return this.parent&&this.parent.updateMatrix(),this._dirty&&(Kt(this.localMatrix,this.rotation,this.position,this.scale),this.parent?xe(this.worldMatrix,this.parent.worldMatrix,this.localMatrix):jt(this.worldMatrix,this.localMatrix),this._dirty=!1),this.worldMatrix}updateHierarchy(){this.updateMatrix();for(const e of this.children)e.updateHierarchy()}getWorldPosition(e){this.updateMatrix();const r=this.worldMatrix,i=e??T();return G(i,r[12],r[13],r[14]),i}getForward(e){this.updateMatrix();const r=this.worldMatrix,i=e??T();return G(i,-r[8],-r[9],-r[10]),O(i,i)}getUp(e){this.updateMatrix();const r=this.worldMatrix,i=e??T();return G(i,r[4],r[5],r[6]),O(i,i)}getRight(e){this.updateMatrix();const r=this.worldMatrix,i=e??T();return G(i,r[0],r[1],r[2]),O(i,i)}translate(e){Y(this.position,this.position,e),this.markDirty()}rotate(e,r){const i=N();he(i,r,e),Ie(this.rotation,i,this.rotation),this.markDirty()}setScale(e){k(this.scale,e),this.markDirty()}setPosition(e){k(this.position,e),this.markDirty()}setRotation(e){lr(this.rotation,e),this.markDirty()}setRotationEuler(e,r,i){const n=e*180/Math.PI,o=r*180/Math.PI,s=i*180/Math.PI;cr(this.rotation,n,o,s),this.markDirty()}getWorldMatrix(){return this.updateMatrix()}getLocalMatrix(){return this._dirty&&this.updateMatrix(),this.localMatrix}markDirty(){if(!this._dirty){this._dirty=!0;for(const e of this.children)e.markDirty()}}getRoot(){let e=this;for(;e.parent;)e=e.parent;return e}*getParents(){let e=this.parent;for(;e;)yield e,e=e.parent}}class Ne{enabled=!0;owner;path;time=0;originLocal=T();prevLocalOnPath=T();_curr=T();_delta=T();constructor(e){this.path=e}start(){this.owner&&(this.time=0,k(this.originLocal,this.owner.transform.position),k(this.prevLocalOnPath,this.originLocal))}update(e){if(!this.enabled||!this.owner)return;this.time+=e;const r=this.path(this.time);G(this._curr,this.originLocal[0]+r.x,this.originLocal[1]+r.y,this.originLocal[2]+r.z),ie(this._delta,this._curr,this.prevLocalOnPath),this.owner.transform.translate(this._delta),k(this.prevLocalOnPath,this._curr)}onAttach(){}onDetach(){}}function Xe(t,e){const r=O(T(),t);return i=>({x:r[0]*e*i,y:r[1]*e*i,z:r[2]*e*i})}let fr=1;class A{active=!0;destroyed=!1;transform=new ur;components=[];componentStarted=new WeakMap;id;name;layer=1;scene;constructor(e="GameObject"){this.id=fr++,this.name=e}setActive(e){if(this.active!==e)if(this.active=e,e)for(const r of this.components)r.onEnable?.();else for(const r of this.components)r.onDisable?.()}addComponent(e){return this.components.push(e),e.owner=this,e.onAttach?.(),e}getComponent(e){for(const r of this.components)if(r instanceof e)return r;return null}getComponents(e){const r=[];for(const i of this.components)i instanceof e&&r.push(i);return r}removeComponent(e){const r=this.components.indexOf(e);r>=0&&(this.components.splice(r,1),e.onDetach?.())}update(e){if(!(!this.active||this.destroyed)){for(const r of this.components)this.componentStarted.get(r)||(r.start?.(),this.componentStarted.set(r,!0));this.components.forEach(r=>r.enabled&&r.update?.(e))}}destroy(){this.destroyed||(this.destroyed=!0,this.active=!1,this.scene?.markForDestroy(this))}forEachComponent(e){for(const r of this.components)e(r)}}class V{enabled=!0;mesh;constructor(e){this.mesh=e}start(){}update(e){}onAttach(){}onDetach(){}setMesh(e){this.mesh=e}}class L{enabled=!0;owner;gl;material;vao=null;vbo=null;ibo=null;vertexCount=0;indexCount=0;constructor(e,r){this.gl=e,this.material=r}start(){if(!this.owner){console.warn("MeshRenderer: owner が設定されていません");return}const e=this.owner.getComponent(V);if(!e||!e.mesh){console.warn("MeshRenderer: MeshFilter または mesh が設定されていません.");return}this.initBuffers(e.mesh)}update(e){}onAttach(){}onDetach(){const e=this.gl;this.vao&&(e.deleteVertexArray(this.vao),this.vao=null),this.vbo&&(e.deleteBuffer(this.vbo),this.vbo=null),this.ibo&&(e.deleteBuffer(this.ibo),this.ibo=null)}initBuffers(e){const r=this.gl,i=e.vertices;if(!i||i.length===0){console.warn("MeshRenderer: vertices が空です");return}const n=i[0].uv!==void 0,o=3,s=n?2:0,a=4,c=o+s,h=c*a,l=i.flatMap(d=>n?[...d.pos,...d.uv]:[...d.pos]),u=new Float32Array(l);this.vertexCount=u.length/c,this.vao=r.createVertexArray(),this.vbo=r.createBuffer(),this.ibo=null,r.bindVertexArray(this.vao),r.bindBuffer(r.ARRAY_BUFFER,this.vbo),r.bufferData(r.ARRAY_BUFFER,u,r.STATIC_DRAW);let f=0;const m=r.getAttribLocation(this.material.program.program,"aPosition");if(m>=0&&(r.enableVertexAttribArray(m),r.vertexAttribPointer(m,o,r.FLOAT,!1,h,f)),f+=o*a,n){const d=r.getAttribLocation(this.material.program.program,"aTexCoord");d>=0&&(r.enableVertexAttribArray(d),r.vertexAttribPointer(d,s,r.FLOAT,!1,h,f)),f+=s*a}e.indices&&e.indices.length>0&&(this.ibo=r.createBuffer(),r.bindBuffer(r.ELEMENT_ARRAY_BUFFER,this.ibo),r.bufferData(r.ELEMENT_ARRAY_BUFFER,new Uint16Array(e.indices),r.STATIC_DRAW),this.indexCount=e.indices.length),r.bindVertexArray(null)}render(e){const r=this.gl;!this.vao||!this.owner||(this.material.bind(r,this.owner,e),r.bindVertexArray(this.vao),this.ibo&&this.indexCount>0?r.drawElements(r.TRIANGLES,this.indexCount,r.UNSIGNED_SHORT,0):this.vertexCount>0&&r.drawArrays(r.TRIANGLES,0,this.vertexCount),r.bindVertexArray(null))}}class We{vertices;indices;constructor(e,r){this.vertices=e,this.indices=r}}function te(t=1){const e=t*.5,r=[{pos:[-e,e,0],uv:[0,1]},{pos:[-e,-e,0],uv:[0,0]},{pos:[e,-e,0],uv:[1,0]},{pos:[e,e,0],uv:[1,1]}],i=[0,1,2,0,2,3];return new We(r,i)}function Re(t=.5,e=16,r=32){const i=[],n=[];for(let o=0;o<=e;o++){const s=o*Math.PI/e,a=Math.sin(s),c=Math.cos(s);for(let h=0;h<=r;h++){const l=h*2*Math.PI/r,u=Math.sin(l),m=Math.cos(l)*a,d=c,p=u*a,w=h/r,F=o/e;i.push({pos:[m*t,d*t,p*t],uv:[w,1-F]})}}for(let o=0;o<e;o++)for(let s=0;s<r;s++){const a=o*(r+1)+s,c=a+r+1;n.push(a,c,a+1),n.push(c,c+1,a+1)}return new We(i,n)}class W{enabled=!0;owner;transform;velocity=T();acceleration=T();forceAccum=T();mass;dragK;freezePosX=!1;freezePosY=!1;freezePosZ=!1;_tmpV=T();_tmpA=T();_tmpPos=T();constructor(e=1,r=2){this.mass=e,this.dragK=r,this.transform=void 0}onAttach(){if(!this.owner){console.warn("RigidBody: owner is missing");return}this.transform=this.owner.transform}start(){}update(e){this.integrate(e)}onDetach(){}addForce(e,r="force"){r==="impulse"?(_(this._tmpV,e,1/this.mass),Y(this.velocity,this.velocity,this._tmpV)):Y(this.forceAccum,this.forceAccum,e)}integrate(e){if(e<=0||!this.transform)return;const r=this.transform.position;k(this._tmpPos,r),this.applyFreezeToForce();const i=k(this._tmpV,this.velocity);if(this.dragK>0){const n=this.dragK/this.mass,o=Math.exp(-n*e);_(this._tmpV,this.velocity,o);const s=(1-o)/this.dragK;_(this._tmpA,this.forceAccum,s);const a=this.velocity;Y(a,this._tmpV,this._tmpA),this.applyFreezeToVector(a),_(this._tmpA,a,e),this.freezePosX&&(this._tmpA[0]=0),this.freezePosY&&(this._tmpA[1]=0),this.freezePosZ&&(this._tmpA[2]=0),Y(r,r,this._tmpA),ie(this.acceleration,a,i),_(this.acceleration,this.acceleration,1/e)}else _(this.acceleration,this.forceAccum,1/this.mass),this.applyFreezeToVector(this.acceleration),Oe(this.velocity,this.velocity,this.acceleration,e),this.applyFreezeToVector(this.velocity),_(this._tmpA,this.velocity,e),this.freezePosX&&(this._tmpA[0]=0),this.freezePosY&&(this._tmpA[1]=0),this.freezePosZ&&(this._tmpA[2]=0),Y(r,r,this._tmpA);this.freezePosX&&(r[0]=this._tmpPos[0]),this.freezePosY&&(r[1]=this._tmpPos[1]),this.freezePosZ&&(r[2]=this._tmpPos[2]),G(this.forceAccum,0,0,0),this.transform.markDirty()}setPosition(e){if(!this.transform)return;const r=this.transform.position;this.freezePosX||(r[0]=e[0]),this.freezePosY||(r[1]=e[1]),this.freezePosZ||(r[2]=e[2]),this.applyFreezeToVector(this.velocity),this.applyFreezeToVector(this.acceleration),G(this.forceAccum,0,0,0),this.transform.markDirty()}applyFreezeToVector(e){this.freezePosX&&(e[0]=0),this.freezePosY&&(e[1]=0),this.freezePosZ&&(e[2]=0)}applyFreezeToForce(){this.freezePosX&&(this.forceAccum[0]=0),this.freezePosY&&(this.forceAccum[1]=0),this.freezePosZ&&(this.forceAccum[2]=0)}}class Ye{strength;color;logicColor;scene;fluidSim;canvas;prevUV=ke();initialized=!1;logicSplat;rb=null;enabled=!0;owner;constructor(e,r,i,n=1,o={r:1,g:0,b:0,a:1},s=!1,a=null){this.scene=e,this.fluidSim=r,this.canvas=i,this.logicSplat=s,this.strength=n,this.color=o,this.logicColor=a??void 0}start(){if(!this.owner)return;const e=this.scene.MainCamera;if(!e)return;const r=e.worldToScreenUV(this.owner.transform.getWorldPosition());hr(this.prevUV,r.u,r.v),this.initialized=!0,this.rb=this.owner.getComponent(W)}update(e){if(!this.owner||!this.enabled)return;const r=this.scene.MainCamera;if(!r)return;const i=r.worldToScreenUV(this.owner.transform.getWorldPosition()),n=we(i.u,i.v);if(!this.initialized){_e(this.prevUV,n),this.initialized=!0;return}let o,s;const a=this.rb;if(a){const c=this.strength*e;o=a.velocity[0]*c,s=a.velocity[1]*c}else o=(n[0]-this.prevUV[0])*this.strength,s=(n[1]-this.prevUV[1])*this.strength;if(n[0]>=0&&n[0]<=1&&n[1]>=0&&n[1]<=1&&(this.fluidSim.splat(n[0],n[1],o,s,this.color,this.canvas),this.logicSplat)){const c=this.logicColor?this.logicColor:this.color;this.fluidSim.logicSplat(n[0],n[1],c,this.canvas)}_e(this.prevUV,n)}onAttach(){}onDetach(){}}class $e{enabled=!0;owner;scene;life;targetLayers;outOfBoundsMargin;onHitCallback;constructor(e,r=5,i=[],n=.1){this.scene=e,this.life=r,this.targetLayers=i,this.outOfBoundsMargin=n}canHit(e){return this.targetLayers.length===0?!0:this.targetLayers.includes(e)}start(){if(!this.owner)return;const e=this.owner.getComponent(re);e&&(e.onTriggerEnter=r=>this.onTrigger(r))}update(e){if(!this.enabled||!this.owner)return;if(this.life-=e,this.life<=0){this.destroySelf();return}const r=this.scene.MainCamera;if(!r)return;const i=this.owner.transform.getWorldPosition(),n=r.worldToScreenUV(i),o=this.outOfBoundsMargin;if(n.u<-o||n.u>1+o||n.v<-o||n.v>1+o){this.destroySelf();return}}onTrigger(e){this.owner&&this.canHit(e.layer)&&(this.onHitCallback&&e.owner&&this.onHitCallback(this.owner,e.owner),this.destroySelf())}destroySelf(){this.owner&&(typeof this.owner.destroy=="function"?this.owner.destroy():(this.owner.active=!1,this.scene.removeObject&&this.scene.removeObject(this.owner)))}onAttach(){}onDetach(){}}class je{enabled=!0;owner;scene;fluid;dragStrength;rb=null;waveFactor=1;_triedGetRb=!1;constructor(e,r,i=.01){this.scene=e,this.fluid=r,this.dragStrength=i}setWaveFactor(e){this.waveFactor=Math.max(0,Math.min(1,e))}start(){this.tryCacheRb()}update(e){if(!this.enabled||!this.owner)return;const r=this.scene.MainCamera;if(!r)return;const i=this.rb;if(!i||this.fluid.getPaused())return;const n=this.owner.transform.getWorldPosition(),o=r.worldToScreenUV(n);let s=o.u,a=o.v;if(s<0||s>1||a<0||a>1)return;const c=this.fluid.sampleVelocity(s,a);let h=c.x-i.velocity[0],l=c.y-i.velocity[1];const u=.05;s<u&&h<0&&(h=0),s>1-u&&h>0&&(h=0),a<u&&l<0&&(l=0),a>1-u&&l>0&&(l=0),i.addForce(b(this.dragStrength*this.waveFactor*h,this.dragStrength*this.waveFactor*l,0))}onAttach(){this.tryCacheRb()}onDetach(){}tryCacheRb(){if(!this.owner||this.rb)return;const e=this.owner.getComponent(W);if(!e&&!this._triedGetRb){console.warn("FluidDrag: RigidBody が見つかりません"),this._triedGetRb=!0;return}e&&(this.rb=e,this._triedGetRb=!0)}}function He(t,e,r){const{radius:i,material:n,colliderLayer:o,hitLayers:s,lifeSec:a=5,localPath:c,hitScale:h=1,name:l="ProjectileSphere"}=r,u=Re(i),f=new A(l);f.addComponent(new V(u)),f.addComponent(new L(t,n));const m=new re(e,i*h,o,!0);if(f.addComponent(m),f.addComponent(new Ne(c)),f.addComponent(new $e(e,a,s)),r.fluid?.enabled){const{fluidSim:d,canvas:p,strength:w=10,color:F={r:.5,g:.1,b:.1}}=r.fluid;f.addComponent(new Ye(e,d,p,w,F)),f.addComponent(new W),f.addComponent(new je(e,d,.015))}return e.addObject(f),f}const Me={Default:"default",Dead:"dead"};class mr{enabled=!0;owner;state=Me.Default;name="enemy";config;strategy;target;constructor(e,r,i){const n=Ke.get(e);if(!n)throw new Error(`EnemyConfig not found for typeId=${e}`);this.config=n,this.name=i??"enemy",this.strategy=n.createStrategy?n.createStrategy(r):Se}setTarget(e){this.target=e}start(){if(!this.owner)return;const e=this.owner.getComponent(re);if(!e){console.warn("Enemy: SphereCollider が見つかりません");return}e.onTriggerEnter=r=>{if(r.layer!=="bullet")return;const i=r.owner;if(!i)return;const n=i.getComponent($e);n&&n.canHit("enemy")&&(console.log("[Enemy] hit by bullet",{self:this.owner,other:r}),this.kill())}}update(e){this.strategy.update(this,e)}onAttach(){}onDetach(){}get State(){return this.state}get instanceId(){return this.owner?.id}kill(){this.state="dead",console.log(`${this.name} is killed.`)}createVisual(e,r){this.owner&&this.config.visual(e,r,this.owner,this.config)}}const Te={Default:"default",FixedInterval:"fixedInterval"},be=new Map;function dr(t){be.set(Te.Default,()=>Se),be.set(Te.FixedInterval,()=>new pr(t,.5))}const Se={update(t,e){t.State===Me.Dead&&t.owner?.destroy()}};class pr{timer=0;interval;ctx;constructor(e,r){this.ctx=e,this.interval=Math.max(r,.1)}update(e,r){e.State===Me.Dead&&e.owner?.destroy();const i=e.config;!i||!i.fire||(this.timer+=r,this.timer>=this.interval&&(console.log("fire"),this.timer-=this.interval,i.fire(this.ctx,e)))}}const vr={getDirectionToTarget(t,e){const r=t.getWorldPosition(),i=e.getWorldPosition(),n=ie(T(),i,r);return O(n,n)},getDistance(t,e){const r=t.getWorldPosition(),i=e.getWorldPosition();return er(r,i)},getClampedDirection(t,e,r){const i=t.getForward(),n=this.getDirectionToTarget(t,e),o=Math.acos(ze(i,n)),s=r*Math.PI/180;if(o<=s)return n;const a=s/o,c=tr(T(),i,n,a);return O(c,c)},getLookAtAngleZ(t,e){const r=t.getWorldPosition(),i=e.getWorldPosition(),n=i[0]-r[0],o=i[1]-r[1];return Math.atan2(o,n)}},yr=(t,e,r,i)=>{if(!i.material)return;const n=Re(.07);r.addComponent(new V(n)),r.addComponent(new L(t,i.material)),r.addComponent(new re(e,.07,"enemy",!0))},Ke=new Map,qe={id:0,hitPoint:10,visual:yr,materialKey:"enemySmall",getBulletSource(t){const e=t.owner;if(!e)throw new Error("Enemy has no owner");return e.transform},fire(t,e){const o=60*Math.PI/180,a=(e.config??qe).getBulletSource(e),c=e.target?vr.getDirectionToTarget(a,e.target):b(0,-1,0);for(let h=0;h<5;h++){const f=(h/4-.5)*o,m=Qt(c),d=m[0],p=m[1],w=Math.cos(f),F=Math.sin(f);m[0]=d*w-p*F,m[1]=d*F+p*w;const E=Xe(m,3),v=He(t.gl,t.scene,{radius:.05,material:t.material,colliderLayer:"bullet",hitLayers:["player","wall"],localPath:E,lifeSec:10});v.transform.setParent(a),v.transform.setPosition(b(0,0,0))}},createStrategy(t){const e=be.get(Te.FixedInterval);return e?e(t):Se}};function gr(t){const e={...qe,material:t.enemySmall};Ke.set(e.id,e)}const xr=`precision highp float;\r
\r
varying vec2 vTexCoord;\r
varying vec3 vFragPos;\r
\r
uniform sampler2D uTexture;\r
uniform vec2 uUVOffset;\r
uniform vec2 uUVScale;\r
\r
void main(){\r
    vec2 uv = vTexCoord * uUVScale + uUVOffset;\r
    gl_FragColor = texture2D(uTexture, uv) + vec4(0, 0, 0, 0.1);\r
}`,wr=`precision highp float;\r
\r
varying vec2 vTexCoord;\r
\r
uniform sampler2D uDye;      // Source dye texture.
uniform sampler2D uVelocity; // Velocity texture, with vx/vy in RG.
uniform float uVelScale;     // Velocity-to-brightness scale.
uniform float uMix;          // 0=dye only, 1=maximum velocity tint.
\r
// HSV to RGB conversion.
vec3 hsv2rgb(vec3 c) {\r
    vec4 K = vec4(1.0, 2.0/3.0, 1.0/3.0, 3.0);\r
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);\r
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);\r
}\r
\r
void main() {\r
    vec3 dye = texture2D(uDye, vTexCoord).rgb;\r
\r
    // --- 1) Mask by dye intensity -------------------------
    float intensity = dot(dye, vec3(0.299, 0.587, 0.114));\r
    float dyeMask = smoothstep(0.05, 0.20, intensity);\r
\r
    // --- 2) Compute color from velocity -------------------
    vec2 vel = texture2D(uVelocity, vTexCoord).xy;\r
\r
    float speed = length(vel);\r
    float vMag  = clamp(speed * uVelScale, 0.0, 1.0);\r
\r
    float angle = atan(vel.y, vel.x);                  // -pi..pi\r
    float hue   = angle / (2.0 * 3.14159265) + 0.5;    // 0..1\r
\r
    // Keep saturation and brightness subtle.
    float sat = mix(0.1, 0.3, vMag);
    float val = mix(0.3, 0.5, vMag);
\r
    vec3 velColor = hsv2rgb(vec3(hue, sat, val));\r
\r
    // Apply almost no tint where dye is weak.
    float localMix = uMix * dyeMask * vMag;\r
\r
    // Shift the dye color slightly instead of replacing it.
    vec3 shaded = (dye + localMix * (velColor - dye)) * 0.5;\r
\r
    // Clamp to avoid blown-out highlights.
    shaded = clamp(shaded, 0.0, 1.0);\r
\r
    gl_FragColor = vec4(shaded, 1.0);\r
}\r
`,Tr=`precision highp float;

varying vec2 vTexCoord;

uniform sampler2D uTexture;
uniform float uScale;

void main() {
    vec2 v = texture2D(uTexture, vTexCoord).xy;
    float mag = clamp(length(v) * uScale, 0.0, 1.0);

    vec2 dir = vec2(0.0);
    if (length(v) > 1e-8) {
        dir = normalize(v);
    }

    vec3 directionColor = vec3(dir * 0.5 + 0.5, 0.0);
    vec3 color = mix(vec3(0.02, 0.04, 0.08), directionColor, mag);

    gl_FragColor = vec4(color + vec3(mag * 0.25), 1.0);
}
`,le=`precision highp float;\r
\r
attribute vec3 aPosition;\r
attribute vec2 aTexCoord;\r
\r
uniform mat4 uModelMat;  \r
uniform mat4 uViewMat;\r
uniform mat4 uProjectionMat;\r
\r
varying vec2 vTexCoord;\r
varying vec3 vFragPos;\r
\r
void main() {\r
    vec4 worldPos = uModelMat * vec4(aPosition, 1.0);\r
    vFragPos = worldPos.xyz;\r
\r
    vec4 viewPos = uViewMat * worldPos;\r
    gl_Position = uProjectionMat * viewPos;\r
\r
    vTexCoord = aTexCoord;\r
}\r
`;class me{program;constructor(e){this.program=e}uploadCommonMatrices(e,r,i){const n=R(this.program,"uModelMat");e.uniformMatrix4fv(n,!1,r.transform.getWorldMatrix()),i.updateShaderUniforms(this.program)}bind(e,r,i){this.program.bind(),this.uploadCommonMatrices(e,r,i),this.uploadMaterialUniforms(e)}}class ue extends me{color=z(1,1,1,1);constructor(e,r){super(e),r&&(this.color=r)}uploadMaterialUniforms(e){const r=this.program.uniforms.get("uColor");r&&e.uniform4fv(r,this.color)}}const br=`precision highp float;\r
\r
varying vec2 vTexCoord;\r
varying vec3 vFragPos;\r
\r
uniform vec4 uColor;\r
\r
void main(){\r
    gl_FragColor = uColor;\r
}`;function Fr(t){return{unlitColor:t.load("UnlitColor",le,br)}}function Rr(t){const e=z(1,.8,.8,0),r=z(1,.3,.3,0),i=new ue(t.unlitColor,e),n=new ue(t.unlitColor,r);return{player:i,enemySmall:n}}function Mr(t){const e=Fr(t),r=Rr(e),i=z(1,0,0,0),n=new ue(e.unlitColor,i),o=z(1,1,1,.35),s=new ue(e.unlitColor,o),a=t.load("UnlitTex",le,xr),c=t.load("StreamVisual",le,Tr),h=t.load("DyeVelVisual",le,wr);return{materials:r,obstacleMaterial:n,debugFrameMaterial:s,unlitTexProgram:a,streamVisualProgram:c,dyeVisualProgram:h}}class Sr extends me{texture=null;scale;textureUnit;constructor(e,r=null,i=5e3,n=0){super(e),this.texture=r,this.scale=i,this.textureUnit=n}setTexture(e){this.texture=e}uploadMaterialUniforms(e){const r=this.program.uniforms.get("uTexture"),i=this.program.uniforms.get("uScale");e.activeTexture(e.TEXTURE0+this.textureUnit),e.bindTexture(e.TEXTURE_2D,this.texture),r&&e.uniform1i(r,this.textureUnit),i&&e.uniform1f(i,this.scale)}}class Ze extends me{texture=null;textureUnit=0;uvOffset=we(0,0);uvScale=we(1,1);constructor(e,r=null,i=0){super(e),this.texture=r,this.textureUnit=i}setTexture(e){this.texture=e}uploadMaterialUniforms(e){const r=this.program.uniforms.get("uTexture"),i=this.program.uniforms.get("uUVOffset"),n=this.program.uniforms.get("uUVScale");e.activeTexture(e.TEXTURE0+this.textureUnit),e.bindTexture(e.TEXTURE_2D,this.texture),r&&e.uniform1i(r,this.textureUnit),i&&e.uniform2fv(i,this.uvOffset),n&&e.uniform2fv(n,this.uvScale)}}function Er(t){const{scene:e,gl:r,program:i,streamVisualProgram:n,frameMaterial:o,fluidSim:s,layer:a}=t,c=s.getObstacleTarget().width/s.getObstacleTarget().height,h=.45,l=b(h*c,h,1),u=new Ze(i,s.getObstacleTarget().texture),f=new Sr(n,s.getStreamTarget().texture),m=Ue({scene:e,gl:r,material:u,frameMaterial:o,name:"ObstaclePreview",layer:a,position:b(1.45,1.15,1),scale:l}),d=Ue({scene:e,gl:r,material:f,frameMaterial:o,name:"StreamPreview",layer:a,position:b(1.45,.35,1),scale:l});return{obstaclePreview:m,streamPreview:d,updateTextures(){u.setTexture(s.getObstacleTarget().texture),f.setTexture(s.getStreamTarget().texture)}}}function Ue(t){const{scene:e,gl:r,material:i,frameMaterial:n,name:o,layer:s,position:a,scale:c}=t,h=new A(`${o}Frame`);h.layer=s,h.transform.setPosition(b(a[0],a[1],a[2]-.01)),h.transform.setScale(b(c[0]+.06,c[1]+.06,1)),h.addComponent(new V(te(1))),h.addComponent(new L(r,n)),e.addObject(h);const l=new A(o);return l.layer=s,l.transform.setPosition(a),l.transform.setScale(c),l.addComponent(new V(te(1))),l.addComponent(new L(r,i)),e.addObject(l),l}class Pr{gl;constructor(e){this.gl=e}render(e,r,i=null){const n=this.gl;n.bindFramebuffer(n.FRAMEBUFFER,i?i.fbo:null);const o=i?i.width:n.drawingBufferWidth,s=i?i.height:n.drawingBufferHeight;n.viewport(0,0,o,s),n.enable(n.DEPTH_TEST),n.depthMask(!0),n.clearColor(0,0,0,1),n.clear(n.COLOR_BUFFER_BIT|n.DEPTH_BUFFER_BIT);const a=e.getObjects();for(const c of a){if(!c.active)continue;const h=c.getComponent(L);!h||!h.enabled||(c.layer&r.cullingMask)!=0&&h.render(r)}}}class Dr{enabled=!0;owner;camera;dist;follow;constructor(e,r=1,i=!1){this.camera=e,this.dist=r,this.follow=i}start(){!this.owner||!this.camera.owner||(this.follow&&this.owner.transform.setParent(this.camera.owner.transform),this.updateLocalTransform())}update(e){}updateLocalTransform(){if(!this.owner||!this.camera.owner)return;const e=this.camera.getFov(),r=this.camera.getAspect(),i=this.camera.owner.transform.getWorldPosition();if(this.follow){const n=2*this.dist*Math.tan(e/2),o=n*r;this.owner.transform.setPosition(b(0,0,-this.dist)),this.owner.transform.setScale(b(o,n,1))}else{const n=i[2]-this.dist,o=2*this.dist*Math.tan(e/2),s=o*r;this.owner.transform.setPosition(b(i[0],i[1],n)),this.owner.transform.setScale(b(s,o,1))}}}class Ar extends me{dyeTex;velTex;velScale=5;mix=.7;constructor(e,r,i,n=5,o=.7){super(e),this.dyeTex=r,this.velTex=i,this.velScale=n,this.mix=o}setTextures(e,r){this.dyeTex=e,this.velTex=r}uploadMaterialUniforms(e){const r=this.program.uniforms.get("uDye"),i=this.program.uniforms.get("uVelocity"),n=this.program.uniforms.get("uVelScale"),o=this.program.uniforms.get("uMix");e.activeTexture(e.TEXTURE0),e.bindTexture(e.TEXTURE_2D,this.dyeTex),r&&e.uniform1i(r,0),e.activeTexture(e.TEXTURE1),e.bindTexture(e.TEXTURE_2D,this.velTex),i&&e.uniform1i(i,1),n&&e.uniform1f(n,this.velScale),o&&e.uniform1f(o,this.mix)}}function Cr(t){const{scene:e,gl:r,camera:i,mesh:n,program:o,fluidSim:s,layer:a}=t,c=new A("Quad");c.layer=a;const h=new Ar(o,s.getDyeTexture(),s.getVelTexture()),l=new Dr(i,5,!1);return c.addComponent(new V(n)),c.addComponent(new L(r,h)),c.addComponent(l),e.addObject(c),{fluidPlane:c,dyeVisualMaterial:h,fitter:l}}function _r(t){const{scene:e,gl:r,mesh:i,material:n,layer:o}=t,s=new A("obstacle");return s.layer=o,s.addComponent(new V(i)),s.addComponent(new L(r,n)),s.transform.setScale(b(.5,.5,.5)),s.transform.translate(b(-2,-1.5,0)),e.addObject(s),s}function Ur(t){const{scene:e,gl:r,program:i,texture:n,layer:o}=t,s=te(9),a=new A("stream"),c=new Ze(i,n);return a.addComponent(new V(s)),a.addComponent(new L(r,c)),a.layer=o,a.transform.translate(b(0,0,0)),e.addObject(a),a}function Vr(t){const{scene:e,gl:r,canvas:i,material:n,fluidSim:o,target:s}=t,a=new A;a.transform.translate(b(1,1,0)),e.addObject(a);const c=new A("Enemy");c.transform.setParent(a.transform),c.addComponent(new Ne(u=>({x:Math.cos(u),y:Math.sin(u),z:0})));const h={gl:r,scene:e,canvas:i,material:n,fluid:o};dr(h);const l=new mr(0,h);return l.setTarget(s),c.addComponent(l),l.createVisual(r,e),e.addObject(c),c}const X={default:1,obstacle:2,stream:4};function Lr(t,e,r){const{radius:i,material:n,layer:o,hitScale:s=1,name:a="Sphere",isTrigger:c=!0}=r,h=Re(i),l=new A(a);return l.addComponent(new V(h)),l.addComponent(new L(t,n)),l.addComponent(new re(e,i*s,o,c)),e.addObject(l),l}function Qe(t){return Math.max(0,Math.min(1,t))}function Br(t,e,r){const i=Qe(r);return t+(e-t)*i}class Or{enabled=!0;owner;input;thrustForce;maxSpeed;dragK;moveHeldTime=0;hadInputLastFrame=!1;constructor(e,r=20,i=4,n=10){this.input=e,this.thrustForce=r,this.maxSpeed=i,this.dragK=n}start(){}update(e){if(!this.owner||!this.enabled)return;const r=this.owner.getComponent(W);if(!r)return;const i=T(),n=this.input.getMoveAxis();i[0]=n.x,i[1]=n.y;const o=Math.hypot(i[0],i[1]);if(o>0){if(this.hadInputLastFrame?this.moveHeldTime+=e:this.moveHeldTime=0,this.hadInputLastFrame=!0,i[0]/=o,i[1]/=o,r.velocity[0]*i[0]+r.velocity[1]*i[1]<this.maxSpeed){const a=T(),c=this.thrustCurve(this.moveHeldTime);_(a,i,this.thrustForce*c),r.addForce(a)}}else{this.hadInputLastFrame=!1,this.moveHeldTime=0;const s=T();_(s,r.velocity,-this.dragK),r.addForce(s)}}onAttach(){}onDetach(){}thrustCurve(e){if(e<=0)return 0;if(e<.08)return e/.08;const n=(e-.08)/.25,o=Br(1.3,.7,Qe(n));return Math.max(.6,o)}}class zr{enabled=!0;owner;scene;padding;constructor(e,r=.05){this.scene=e,this.padding=r}start(){}update(e){if(!this.enabled||!this.owner)return;const r=this.scene.MainCamera;if(!r)return;const i=this.owner.transform.getWorldPosition(),n=r.worldToScreenUV(i);let{u:o,v:s}=n,a=!1;if(o<this.padding&&(o=this.padding,a=!0),o>1-this.padding&&(o=1-this.padding,a=!0),s<this.padding&&(s=this.padding,a=!0),s>1-this.padding&&(s=1-this.padding,a=!0),!a)return;const c=r.screenUVToWorldOnPlane(o,s,i[2]);if(!c)return;this.owner.transform.setPosition(c);const h=this.owner.getComponent(W);h&&(o===this.padding&&h.velocity[0]<0&&(h.velocity[0]=0),o===1-this.padding&&h.velocity[0]>0&&(h.velocity[0]=0),s===this.padding&&h.velocity[1]<0&&(h.velocity[1]=0),s===1-this.padding&&h.velocity[1]>0&&(h.velocity[1]=0))}onAttach(){}onDetach(){}}const Ve=2e3;function Ir(t){const{scene:e,gl:r,canvas:i,material:n,fluidSim:o,input:s}=t,a=Lr(r,e,{radius:.05,material:n,layer:"player",hitScale:.3,name:"Player"}),c=new Or(s,50,1,20),h=new W(10);h.freezePosZ=!0;const l=new je(e,o,.05);a.addComponent(c),a.addComponent(h),a.addComponent(l),a.addComponent(new zr(e,.01));const u=new A("emitter"),f=new Ye(e,o,i,Ve,{r:0,g:0,b:.5});return u.addComponent(f),u.transform.setParent(a.transform),a.transform.translate(b(-2,-1.5,0)),e.addObject(u),{player:a,splatForce:Ve}}class Gr{enabled=!0;owner;gl;scene;input;material;fluidSim;canvas;splatForce;constructor(e){this.gl=e.gl,this.scene=e.scene,this.input=e.input,this.material=e.material,this.fluidSim=e.fluidSim,this.canvas=e.canvas,this.splatForce=e.splatForce}update(){if(!this.owner||!this.enabled)return;const e=this.input.consumeShootCommands();for(const r of e)this.shootAt(r.u,r.v)}shootAt(e,r){if(!this.owner)return;const i=this.scene.MainCamera;if(!i)return;const n=this.owner.transform.getWorldPosition(),o=i.screenUVToWorldOnPlane(e,r,n[2]);if(!o)return;const s=T();if(ie(s,o,n),Be(s)===0)return;const h=Xe(s,3);He(this.gl,this.scene,{radius:.04,material:this.material,colliderLayer:"bullet",hitLayers:["enemy"],lifeSec:5,localPath:h,name:"PlayerBullet",fluid:{enabled:!0,fluidSim:this.fluidSim,canvas:this.canvas,strength:this.splatForce,color:{r:0,g:1,b:0}}}).transform.setPosition(n)}}function kr(t){const{scene:e,gl:r,canvas:i,material:n,obstacleMaterial:o,unlitTexProgram:s,bulletStreamTexture:a,fluidSim:c,input:h}=t,l=te(1),u=_r({scene:e,gl:r,mesh:l,material:o,layer:X.obstacle}),f=Ur({scene:e,gl:r,program:s,texture:a,layer:X.stream}),{player:m,splatForce:d}=Ir({scene:e,gl:r,canvas:i,material:n,fluidSim:c,input:h}),p=Vr({scene:e,gl:r,canvas:i,material:n,fluidSim:c,target:m.transform});return m.addComponent(new Gr({gl:r,scene:e,input:h,material:n,fluidSim:c,canvas:i,splatForce:d})),{player:m,enemies:[p],obstacles:[u],streams:[f]}}class Nr{enabled=!0;cullingMask=-1;owner;gl;fov;aspect;near;far;yaw;pitch;viewMatrix;projectionMatrix;_vp;_invVP;_qYaw;_qPitch;_q;constructor(e,r){this.gl=e,this.fov=r?.fov??Math.PI/4,this.aspect=r?.aspect??1,this.near=r?.near??.1,this.far=r?.far??1e3,this.yaw=r?.yaw??-Math.PI/2,this.pitch=r?.pitch??0,this.viewMatrix=$(),this.projectionMatrix=$(),this._vp=$(),this._invVP=$(),this._qYaw=N(),this._qPitch=N(),this._q=N()}start(){}update(e){this.updateMatrices()}onAttach(){this.updateMatrices()}onDetach(){}rotate(e,r){this.yaw+=e,this.pitch+=r;const i=Math.PI/2-.01;this.pitch>i&&(this.pitch=i),this.pitch<-i&&(this.pitch=-i),this.updateMatrices()}setAspect(e){this.aspect=e,this.updateMatrices()}getFov(){return this.fov}getAspect(){return this.aspect}updateMatrices(){if(!this.owner)return;he(this._qYaw,[0,1,0],this.yaw),he(this._qPitch,[1,0,0],this.pitch),or(this._q),Ce(this._q,this._qPitch,this._q),Ce(this._q,this._qYaw,this._q),this.owner.transform.setRotation(this._q);const e=this.owner.transform.getWorldMatrix();Ae(this.viewMatrix,e),Zt(this.projectionMatrix,this.fov,this.aspect,this.near,this.far)}updateShaderUniforms(e){const r=R(e,"uViewMat"),i=R(e,"uProjectionMat");this.gl.uniformMatrix4fv(r,!1,this.viewMatrix),this.gl.uniformMatrix4fv(i,!1,this.projectionMatrix)}worldToScreenUV(e){const r=z(e[0],e[1],e[2],1);xe(this._vp,this.projectionMatrix,this.viewMatrix),ye(r,r,this._vp);const i=r[0]/r[3],n=r[1]/r[3],o=i*.5+.5,s=n*.5+.5;return{u:o,v:s}}screenUVToWorldOnPlane(e,r,i){const n=e*2-1,o=r*2-1;if(xe(this._vp,this.projectionMatrix,this.viewMatrix),!Ae(this._invVP,this._vp))return null;const s=z(n,o,-1,1),a=z(n,o,1,1);ye(s,s,this._invVP),ye(a,a,this._invVP);for(const p of[s,a])p[0]/=p[3],p[1]/=p[3],p[2]/=p[3],p[3]=1;const c=b(s[0],s[1],s[2]),h=b(a[0],a[1],a[2]),l=T();ie(l,h,c),O(l,l);const u=c,f=l[2];if(Math.abs(f)<1e-6)return null;const m=(i-u[2])/f;if(m<0)return null;const d=T();return Oe(d,u,l,m),d}isInView(e,r=0){const i=this.worldToScreenUV(e),n=i.u,o=i.v;return n>=-r&&n<=1+r&&o>=-r&&o<=1+r}getViewInfo(e,r=0){const i=this.worldToScreenUV(e);return{visible:i.u>=-r&&i.u<=1+r&&i.v>=-r&&i.v<=1+r,uv:i}}}function Xr(t){const{scene:e,gl:r,aspect:i,layer:n}=t,o=new A("MainCamera");o.transform.translate(b(0,0,5));const s=o.addComponent(new Nr(r,{fov:Math.PI/4,aspect:i,near:.1,far:1e3,yaw:0,pitch:0}));return s.cullingMask=n,e.addObject(o),e.setMainCamera(s),s}function Wr(t){const{gl:e,canvas:r,fluidSim:i,renderAssets:n,bulletStreamTexture:o,input:s}=t,a=new Xt,c=new Pr(e),h=Xr({scene:a,gl:e,aspect:r.width/r.height,layer:X.default}),l=te(1),{dyeVisualMaterial:u,fitter:f}=Cr({scene:a,gl:e,camera:h,mesh:l,program:n.dyeVisualProgram,fluidSim:i,layer:X.default}),m=kr({scene:a,gl:e,canvas:r,material:n.materials.player,obstacleMaterial:n.obstacleMaterial,unlitTexProgram:n.unlitTexProgram,bulletStreamTexture:o,fluidSim:i,input:s}),d=Er({scene:a,gl:e,program:n.unlitTexProgram,streamVisualProgram:n.streamVisualProgram,frameMaterial:n.debugFrameMaterial,fluidSim:i,layer:X.default});return{scene:a,renderer:c,stage:m,player:m.player,debugTextureMap:d,dyeVisualMaterial:u,fitter:f}}function Yr(t){return{stage:$r(t.stage)}}function $r(t){return{player:ae(t.player),enemies:t.enemies.map(ae),obstacles:t.obstacles.map(ae),streams:t.streams.map(ae)}}function ae(t){const e=t.getComponent(W);return{id:t.id,name:t.name,active:t.active,destroyed:t.destroyed,layer:t.layer,position:ce(t.transform.getWorldPosition()),localPosition:ce(t.transform.position),localScale:ce(t.transform.scale),velocity:e?ce(e.velocity):void 0}}function ce(t){return[t[0],t[1],t[2]]}const C=document.querySelector("canvas"),Je=window.devicePixelRatio||1,jr=C.clientWidth,Hr=C.clientHeight;C.width=jr*Je;C.height=Hr*Je;const{gl:P,ext:Kr}=ft(C);if(!P)throw new Error("WebGL RenderingContext が見つかりません.");const et=new Le(P),qr=new It({pointerTarget:C}),Zr=new Gt,tt=Mr(et);gr(tt.materials);const rt=gt(P),Qr=new Le(P),{fluidShaders:Jr,copyProgram:ei}=Dt(Qr),{fluidSim:fe,resolver:ti}=Lt({gl:P,ext:Kr,blit:rt,fluidShaders:Jr,copyProgram:ei}),ri=zt(P,et,rt,ti);P.bindFramebuffer(P.FRAMEBUFFER,null);P.viewport(0,0,C.width,C.height);const it=Wr({gl:P,canvas:C,fluidSim:fe,renderAssets:tt,bulletStreamTexture:ri,input:qr}),{scene:Fe,renderer:nt,debugTextureMap:ii,dyeVisualMaterial:ni,fitter:si}=it;function st(){ct({gl:P,scene:Fe,renderer:nt,fluidSim:fe,obstacleLayer:X.obstacle})}function oi(t){lt({canvas:C,scene:Fe,fluidSim:fe,fitter:si,onResized:st}),ii.updateTextures(),ht({gl:P,scene:Fe,renderer:nt,fluidSim:fe,dyeVisualMaterial:ni,streamLayer:X.stream,dt:t}),Zr.setText(kt(Yr(it)))}const ai=new at({onStart:st,onFrame:oi});ai.start();
