import { Program } from "../gl/program";

export function getRequiredUniform(
    program: Program,
    name: string
): WebGLUniformLocation {
    const loc = program.uniforms.get(name);
    // getUniformLocation may return null, so check with == null.
    if (loc == null) {
        throw new Error(`Required uniform '${name}' is missing in program`);
    }
    return loc;
}

export function getOptionalUniform(
    program: Program,
    name: string
): WebGLUniformLocation | null {
    const loc = program.uniforms.get(name) ?? null;
    // Missing optional uniforms are returned as null instead of throwing.
    return loc;
}
