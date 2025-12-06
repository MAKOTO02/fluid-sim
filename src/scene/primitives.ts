// primitives.ts
import { Mesh, type Vertex3D } from "./mesh";

export function createQuad(size = 1): Mesh {
    const h = size * 0.5;
    const verts: Vertex3D[] = [
        { pos: [-h,  h, 0], uv: [0, 1] },
        { pos: [-h, -h, 0], uv: [0, 0] },
        { pos: [ h, -h, 0], uv: [1, 0] },
        { pos: [ h,  h, 0], uv: [1, 1] },
    ];
    const indices = [0, 1, 2, 0, 2, 3];
    return new Mesh(verts, indices);
}

export function createCube(size = 1): Mesh {
    const s = size * 0.5;

    const raw = [
        // +Z 面
        { pos: [-s, -s,  s], uv: [0.0,      0.5] }, // 0
        { pos: [ s, -s,  s], uv: [0.333333, 0.5] }, // 1
        { pos: [ s,  s,  s], uv: [0.333333, 1.0] }, // 2
        { pos: [-s,  s,  s], uv: [0.0,      1.0] }, // 3

        // -X 面
        { pos: [-s, -s, -s], uv: [0.333333, 0.5] }, // 4
        { pos: [-s, -s,  s], uv: [0.666667, 0.5] }, // 5
        { pos: [-s,  s,  s], uv: [0.666667, 1.0] }, // 6
        { pos: [-s,  s, -s], uv: [0.333333, 1.0] }, // 7

        // -Z 面
        { pos: [ s, -s, -s], uv: [0.666667, 0.5] }, // 8
        { pos: [-s, -s, -s], uv: [1.0,     0.5] }, // 9
        { pos: [-s,  s, -s], uv: [1.0,     1.0] }, // 10
        { pos: [ s,  s, -s], uv: [0.666667, 1.0] }, // 11

        // +Y 面
        { pos: [-s,  s,  s], uv: [0.0,      0.0] }, // 12
        { pos: [ s,  s,  s], uv: [0.333333, 0.0] }, // 13
        { pos: [ s,  s, -s], uv: [0.333333, 0.5] }, // 14
        { pos: [-s,  s, -s], uv: [0.0,      0.5] }, // 15

        // +X 面
        { pos: [ s, -s,  s], uv: [0.333333, 0.0] }, // 16
        { pos: [ s, -s, -s], uv: [0.666667, 0.0] }, // 17
        { pos: [ s,  s, -s], uv: [0.666667, 0.5] }, // 18
        { pos: [ s,  s,  s], uv: [0.333333, 0.5] }, // 19

        // -Y 面
        { pos: [-s, -s, -s], uv: [0.666667, 0.0] }, // 20
        { pos: [ s, -s, -s], uv: [1.0,     0.0] }, // 21
        { pos: [ s, -s,  s], uv: [1.0,     0.5] }, // 22
        { pos: [-s, -s,  s], uv: [0.666667, 0.5] }, // 23
    ];

    const verts: Vertex3D[] = raw.map(v => ({
        pos: v.pos as [number, number, number],
        uv:  v.uv  as [number, number],
    }));

    const indices = [
        0, 1, 2, 2, 3, 0,      // +Z
        4, 5, 6, 6, 7, 4,      // -X
        8, 9,10,10,11, 8,      // -Z
        12,13,14,14,15,12,      // +Y
        16,17,18,18,19,16,      // +X
        20,21,22,22,23,20       // -Y
    ];

    return new Mesh(verts, indices);
}

export function createSphere(radius = 0.5, lat = 16, lon = 32): Mesh {
    const verts: Vertex3D[] = [];
    const indices: number[] = [];

    for (let i = 0; i <= lat; i++) {
        const theta = (i * Math.PI) / lat;
        const sinT = Math.sin(theta);
        const cosT = Math.cos(theta);

        for (let j = 0; j <= lon; j++) {
            const phi = (j * 2 * Math.PI) / lon;
            const sinP = Math.sin(phi);
            const cosP = Math.cos(phi);

            const x = cosP * sinT;
            const y = cosT;
            const z = sinP * sinT;

            const u = j / lon;
            const v = i / lat;

            verts.push({
                pos: [x * radius, y * radius, z * radius],
                uv: [u, 1 - v],
            });
        }
    }

    for (let i = 0; i < lat; i++) {
        for (let j = 0; j < lon; j++) {
            const first = i * (lon + 1) + j;
            const second = first + lon + 1;
            indices.push(first, second, first + 1);
            indices.push(second, second + 1, first + 1);
        }
    }

    return new Mesh(verts, indices);
}

export function createCylinder(
    radius = 0.5,
    height = 1,
    segments = 24,
): Mesh {
    const verts: Vertex3D[] = [];
    const indices: number[] = [];
    const h = height * 0.5;

    // 側面
    for (let i = 0; i <= segments; i++) {
        const t = (i / segments) * 2 * Math.PI;
        const x = Math.cos(t) * radius;
        const z = Math.sin(t) * radius;
        const u = i / segments;

        verts.push({ pos: [x, -h, z], uv: [u, 0] }); // 下
        verts.push({ pos: [x,  h, z], uv: [u, 1] }); // 上
    }
    for (let i = 0; i < segments; i++) {
        const i0 = i * 2;
        const i1 = i0 + 1;
        const i2 = i0 + 2;
        const i3 = i0 + 3;
        indices.push(i0, i1, i2);
        indices.push(i1, i3, i2);
    }

    // 上下のフタ（簡易：中心＋三角ファン）
    const topCenterIndex = verts.length;
    verts.push({ pos: [0, h, 0], uv: [0.5, 0.5] });
    for (let i = 0; i <= segments; i++) {
        const t = (i / segments) * 2 * Math.PI;
        const x = Math.cos(t) * radius;
        const z = Math.sin(t) * radius;
        const u = 0.5 + 0.5 * Math.cos(t);
        const v = 0.5 + 0.5 * Math.sin(t);
        verts.push({ pos: [x, h, z], uv: [u, v] });
    }
    for (let i = 0; i < segments; i++) {
        indices.push(
            topCenterIndex,
            topCenterIndex + 1 + i,
            topCenterIndex + 1 + i + 1
        );
    }

    const bottomCenterIndex = verts.length;
    verts.push({ pos: [0, -h, 0], uv: [0.5, 0.5] });
    for (let i = 0; i <= segments; i++) {
        const t = (i / segments) * 2 * Math.PI;
        const x = Math.cos(t) * radius;
        const z = Math.sin(t) * radius;
        const u = 0.5 + 0.5 * Math.cos(t);
        const v = 0.5 + 0.5 * Math.sin(t);
        verts.push({ pos: [x, -h, z], uv: [u, v] });
    }
    for (let i = 0; i < segments; i++) {
        indices.push(
            bottomCenterIndex,
            bottomCenterIndex + 1 + i + 1,
            bottomCenterIndex + 1 + i
        );
    }

    return new Mesh(verts, indices);
}
