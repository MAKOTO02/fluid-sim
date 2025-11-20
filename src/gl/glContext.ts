type GLFormat = {
  internalFormat: number;
  format: number;
};

type GLContextInfo = {
  gl: WebGLRenderingContext | WebGL2RenderingContext;
  ext: {
    formatRGBA: GLFormat | null;
    formatRG: GLFormat | null;
    formatR: GLFormat | null;
    halfFloatTexType: number;
    supportLinearFiltering: boolean;
  };
};

export function getWebGLContext (canvas: HTMLCanvasElement): GLContextInfo {
  const params = { 
    alpha: true, 
    depth: false, 
    stencil: false, 
    antialias: false, 
    preserveDrawingBuffer: false 
  };

  let gl :WebGL2RenderingContext | WebGLRenderingContext | null;
  gl = canvas.getContext('webgl2', params) as WebGL2RenderingContext | null;
  const isWebGL2 = !!gl;
  if (!isWebGL2){
    gl = 
      (canvas.getContext('webgl', params) as WebGLRenderingContext | null) || 
      (canvas.getContext('experimental-webgl', params) as WebGLRenderingContext | null);
  }
  if (!gl) {
    throw new Error("WebGL is not supported");
  }
        

  let halfFloat : any;
  let supportLinearFiltering: any;
  if (isWebGL2) {
      gl.getExtension('EXT_color_buffer_float');
      supportLinearFiltering = gl.getExtension('OES_texture_float_linear');
  } else {
      halfFloat = gl.getExtension('OES_texture_half_float');
      supportLinearFiltering = gl.getExtension('OES_texture_half_float_linear');
  }

  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  const halfFloatTexType = isWebGL2 ? (gl as WebGL2RenderingContext).HALF_FLOAT : halfFloat.HALF_FLOAT_OES;
  let formatRGBA: GLFormat | null;
  let formatRG: GLFormat | null;
  let formatR: GLFormat | null;

  if (isWebGL2)
  {
    const gl2 = gl as WebGL2RenderingContext;
    formatRGBA = getSupportedFormat(gl2, gl2.RGBA16F, gl2.RGBA, halfFloatTexType);
    formatRG = getSupportedFormat(gl2, gl2.RG16F, gl2.RG, halfFloatTexType);
    formatR = getSupportedFormat(gl2, gl2.R16F, gl2.RED, halfFloatTexType);
  }
  else
  {
    const gl1 = gl as WebGLRenderingContext;
    formatRGBA = getSupportedFormat(gl1, gl1.RGBA, gl1.RGBA, halfFloatTexType);
    formatRG = getSupportedFormat(gl1, gl1.RGBA, gl1.RGBA, halfFloatTexType);
    formatR = getSupportedFormat(gl1, gl1.RGBA, gl1.RGBA, halfFloatTexType);
  }

  return {
    gl,
    ext: {
      formatRGBA,
      formatRG,
      formatR,
      halfFloatTexType,
      supportLinearFiltering: !!supportLinearFiltering,
    }
  };
}

function getSupportedFormat(
  gl: WebGLRenderingContext | WebGL2RenderingContext,
  internalFormat: number,
  format: number,
  type: number
): GLFormat | null {
  // まず指定のフォーマットでレンダーターゲットとして使えるかチェック
  if (!supportRenderTextureFormat(gl, internalFormat, format, type)) {
    // フォールバックが必要になるのは WebGL2 の 16F 系だけ
    if ("RGBA16F" in gl) {
      const gl2 = gl as WebGL2RenderingContext;

      switch (internalFormat) {
        case gl2.R16F:
          return getSupportedFormat(gl2, gl2.RG16F, gl2.RG, type);
        case gl2.RG16F:
          return getSupportedFormat(gl2, gl2.RGBA16F, gl2.RGBA, type);
        default:
          return null;
      }
    }

    // WebGL1 の場合や、フォールバック先がない場合は null
    return null;
  }

  // このフォーマットで OK だった
  return {
    internalFormat,
    format,
  };
}

function supportRenderTextureFormat (
  gl: WebGLRenderingContext | WebGL2RenderingContext, 
  internalFormat: number, 
  format: number, 
  type: number) {
    let texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat, 4, 4, 0, format, type, null);

    let fbo = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);

    let status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
    return status === gl.FRAMEBUFFER_COMPLETE;
}

