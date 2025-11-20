import { Program } from "../gl/program";

export function getRequiredUniform(
    program: Program,
    name: string
): WebGLUniformLocation {
    const loc = program.uniforms.get(name);
    // getUniformLocation は null を返すこともあるので == null でまとめてチェック
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
    // 見つからなければ null のまま返す（エラーにしない）
    return loc;
}
