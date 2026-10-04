/**
 * 纯函数数学内核。
 *
 * 约定与 DirectXMath / D3D12 一致：
 *  - 矩阵按“行主序”存放在长度 16 的数组里：m[row * 4 + col]。
 *  - 向量是行向量，变换写作 v' = v · M（不是 M · v）。
 *  - 平移分量放在最后一行 r[3]，与 XMMatrixTranslation 一致。
 *  - 旋转、投影一律使用左手系，+z 指向屏幕内部。
 * 这套约定保证教材里显示的坐标与 C++ 示例给出的数值完全相同。
 */

export type Vec3 = readonly [number, number, number];
export type Vec4 = readonly [number, number, number, number];
/** 行主序 4x4 矩阵：m[r * 4 + c]。 */
export type Mat4 = readonly number[];

export const vec3 = (x: number, y: number, z: number): Vec3 => [x, y, z];
/** 只取齐次坐标的 xyz 三个分量。 */
export const xyz = (a: ReadonlyArray<number>): Vec3 => [a[0], a[1], a[2]];
export const add = (a: ReadonlyArray<number>, b: ReadonlyArray<number>): Vec3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
export const sub = (a: ReadonlyArray<number>, b: ReadonlyArray<number>): Vec3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
export const scale = (a: ReadonlyArray<number>, k: number): Vec3 => [a[0] * k, a[1] * k, a[2] * k];
export const negate = (a: ReadonlyArray<number>): Vec3 => [-a[0], -a[1], -a[2]];

/** 点积：u·v = ux·vx + uy·vy + uz·vz = |u||v|cosθ。 */
export const dot = (a: ReadonlyArray<number>, b: ReadonlyArray<number>): number => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];

/** 叉积：结果同时垂直于 u 和 v，|u×v| = |u||v|sinθ。左手系下用左手定则确定方向。 */
export const cross = (a: Vec3, b: Vec3): Vec3 => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0],
];

export const lengthSquared = (a: ReadonlyArray<number>): number => dot(a, a);
export const length = (a: ReadonlyArray<number>): number => Math.sqrt(lengthSquared(a));

/** 归一化（normalize）。零向量返回零向量，调用方需要自行判断。 */
export function normalize(a: Vec3): Vec3 {
  const n = length(a);
  return n === 0 ? [0, 0, 0] : scale(a, 1 / n);
}

/** v 在单位向量 n 上的正交投影：proj_n(v) = (v·n)n。 */
export const project = (v: Vec3, n: Vec3): Vec3 => scale(n, dot(v, n));

/** Gram-Schmidt 正交化：从 w 中减去平行于 v 的分量。 */
export const orthogonalize = (w: ReadonlyArray<number>, v: ReadonlyArray<number>): Vec3 => sub(w, project(xyz(w), xyz(v)));

/** 两个非零向量之间的夹角（弧度，0..π）。 */
export function angleBetween(a: Vec3, b: Vec3): number {
  const la = length(a);
  const lb = length(b);
  if (la === 0 || lb === 0) return 0;
  return Math.acos(Math.min(1, Math.max(-1, dot(a, b) / (la * lb))));
}

export const format = (value: number, digits = 2): string => {
  const rounded = Number(value.toFixed(digits));
  return Object.is(rounded, -0) ? '0' : String(rounded);
};
export const formatVec = (a: Vec3, digits = 2): string =>
  `(${a.map((component) => format(component, digits)).join(', ')})`;

// ---------------------------------------------------------------- 矩阵

export const identity = (): Mat4 => [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];

/** 行向量乘法 v' = v · M，v 的 w 分量按点 (1) 或方向 (0) 传入。 */
export function transformPoint(m: Mat4, v: Vec3): Vec3 {
  return [
    m[0] * v[0] + m[4] * v[1] + m[8] * v[2] + m[12],
    m[1] * v[0] + m[5] * v[1] + m[9] * v[2] + m[13],
    m[2] * v[0] + m[6] * v[1] + m[10] * v[2] + m[14],
  ];
}

/** 变换方向向量：忽略平移，且不做透视除法。 */
export function transformDirection(m: Mat4, v: Vec3): Vec3 {
  return [
    m[0] * v[0] + m[4] * v[1] + m[8] * v[2],
    m[1] * v[0] + m[5] * v[1] + m[9] * v[2],
    m[2] * v[0] + m[6] * v[1] + m[10] * v[2],
  ];
}

/** 返回齐次坐标（含 w），用于裁剪空间与投影纹理坐标的推演。 */
export function transformHomogeneous(m: Mat4, v: Vec3): Vec4 {
  return [
    m[0] * v[0] + m[4] * v[1] + m[8] * v[2] + m[12],
    m[1] * v[0] + m[5] * v[1] + m[9] * v[2] + m[13],
    m[2] * v[0] + m[6] * v[1] + m[10] * v[2] + m[14],
    m[3] * v[0] + m[7] * v[1] + m[11] * v[2] + m[15],
  ];
}

/** A · B：对应“先施加 A 再施加 B”，因为 v · A · B。 */
export function multiply(a: Mat4, b: Mat4): Mat4 {
  const out = new Array<number>(16).fill(0);
  for (let row = 0; row < 4; row += 1) {
    for (let col = 0; col < 4; col += 1) {
      let sum = 0;
      for (let k = 0; k < 4; k += 1) sum += a[row * 4 + k] * b[k * 4 + col];
      out[row * 4 + col] = sum;
    }
  }
  return out;
}

export const transpose = (m: Mat4): Mat4 => Array.from({ length: 16 }, (_unused, index) => m[(index % 4) * 4 + Math.floor(index / 4)]);

/** 3x3 部分的行列式，用于判断仿射变换是否可逆。 */
export function determinant3(m: Mat4): number {
  const [a, b, c] = [m[0], m[4], m[8]];
  const [d, e, f] = [m[1], m[5], m[9]];
  const [g, h, i] = [m[2], m[6], m[10]];
  return a * (e * i - f * h) - b * (d * i - f * g) + c * (d * h - e * g);
}

/** 4x4 行列式（沿第一行做拉普拉斯展开，够用且可读）。 */
export function determinant(m: Mat4): number {
  let sum = 0;
  for (let col = 0; col < 4; col += 1) sum += m[col] * cofactor(m, 0, col);
  return sum;
}

function cofactor(m: Mat4, row: number, col: number): number {
  const rows = [0, 1, 2, 3].filter((r) => r !== row);
  const cols = [0, 1, 2, 3].filter((c) => c !== col);
  const sub3 = rows.flatMap((r) => cols.map((c) => m[r * 4 + c]));
  const det3 =
    sub3[0] * (sub3[4] * sub3[8] - sub3[5] * sub3[7])
    - sub3[1] * (sub3[3] * sub3[8] - sub3[5] * sub3[6])
    + sub3[2] * (sub3[3] * sub3[7] - sub3[4] * sub3[6]);
  return ((row + col) % 2 === 0 ? 1 : -1) * det3;
}

/** 逆矩阵 = 伴随矩阵 / 行列式。奇异矩阵返回 null —— 用来演示“缩放因子为 0 就不可逆”。 */
export function inverse(m: Mat4): Mat4 | null {
  const det = determinant(m);
  if (Math.abs(det) < 1e-9) return null;
  const adjugate = new Array<number>(16);
  for (let row = 0; row < 4; row += 1) {
    for (let col = 0; col < 4; col += 1) adjugate[col * 4 + row] = cofactor(m, row, col);
  }
  return adjugate.map((value) => value / det);
}

// ---------------------------------------------------------------- 构造变换

export const scaling = (x: number, y: number, z: number): Mat4 =>
  [x, 0, 0, 0, 0, y, 0, 0, 0, 0, z, 0, 0, 0, 0, 1];

export const translation = (x: number, y: number, z: number): Mat4 =>
  [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, x, y, z, 1];

function rotationRows(radians: number, axis: 'x' | 'y' | 'z'): Mat4 {
  const c = Math.cos(radians);
  const s = Math.sin(radians);
  if (axis === 'x') return [1, 0, 0, 0, 0, c, s, 0, 0, -s, c, 0, 0, 0, 0, 1];
  if (axis === 'y') return [c, 0, -s, 0, 0, 1, 0, 0, s, 0, c, 0, 0, 0, 0, 1];
  return [c, s, 0, 0, -s, c, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
}

export const rotationX = (radians: number): Mat4 => rotationRows(radians, 'x');
export const rotationY = (radians: number): Mat4 => rotationRows(radians, 'y');
export const rotationZ = (radians: number): Mat4 => rotationRows(radians, 'z');

/** 绕任意轴旋转（罗德里格斯公式），轴会被归一化。 */
export function rotationAxis(axis: Vec3, radians: number): Mat4 {
  const n = normalize(axis);
  const [x, y, z] = n;
  const c = Math.cos(radians);
  const s = Math.sin(radians);
  const t = 1 - c;
  return [
    t * x * x + c, t * x * y + s * z, t * x * z - s * y, 0,
    t * x * y - s * z, t * y * y + c, t * y * z + s * x, 0,
    t * x * z + s * y, t * y * z - s * x, t * z * z + c, 0,
    0, 0, 0, 1,
  ];
}

/**
 * 视图矩阵（XMMatrixLookAtLH 的等价实现）。
 * 注意 D3D 的“前方向”是 +z：相机看向 +z，因此 z 轴取 focus − eye。
 */
export function lookAtLH(eye: Vec3, focus: Vec3, up: Vec3): Mat4 {
  const zAxis = normalize(sub(focus, eye));
  const xAxis = normalize(cross(up, zAxis));
  const yAxis = cross(zAxis, xAxis);
  return [
    xAxis[0], yAxis[0], zAxis[0], 0,
    xAxis[1], yAxis[1], zAxis[1], 0,
    xAxis[2], yAxis[2], zAxis[2], 0,
    -dot(xAxis, eye), -dot(yAxis, eye), -dot(zAxis, eye), 1,
  ];
}

/**
 * 透视投影（XMMatrixPerspectiveFovLH）。
 * 得到的裁剪空间满足 D3D12 的裁剪条件 0 ≤ z ≤ w，也就是归一化深度落在 [0, 1]。
 */
export function perspectiveFovLH(fovYRadians: number, aspect: number, nearZ: number, farZ: number): Mat4 {
  const sin = Math.sin(fovYRadians / 2);
  const cos = Math.cos(fovYRadians / 2);
  const height = cos / sin;
  const width = height / aspect;
  const range = farZ / (farZ - nearZ);
  return [
    width, 0, 0, 0,
    0, height, 0, 0,
    0, 0, range, 1,
    0, 0, -nearZ * range, 0,
  ];
}

/** 正交投影（XMMatrixOrthographicOffCenterLH 的对称版本），阴影贴图一章用得到。 */
export function orthographicLH(viewWidth: number, viewHeight: number, nearZ: number, farZ: number): Mat4 {
  const range = 1 / (farZ - nearZ);
  return [
    2 / viewWidth, 0, 0, 0,
    0, 2 / viewHeight, 0, 0,
    0, 0, range, 0,
    0, 0, -nearZ * range, 1,
  ];
}

/** 透视除法：裁剪空间 → NDC。w 为 0 时返回 null（该点位于相机平面上）。 */
export function toNdc(clip: Vec4): Vec3 | null {
  if (clip[3] === 0) return null;
  return [clip[0] / clip[3], clip[1] / clip[3], clip[2] / clip[3]];
}

/** D3D12 的裁剪判定：0 ≤ z ≤ w，另外 x、y 也要落在 [−w, w]。 */
export function isInsideClipVolume(clip: Vec4): boolean {
  const w = clip[3];
  return clip[2] >= 0 && clip[2] <= w
    && clip[0] >= -w && clip[0] <= w
    && clip[1] >= -w && clip[1] <= w;
}

// ---------------------------------------------------------------- 法线变换

/** 非均匀缩放会让法线偏离垂直方向，正确做法是用逆转置变换法线。 */
export function normalMatrix(world: Mat4): Mat4 | null {
  const inverted = inverse(world);
  return inverted ? transpose(inverted) : null;
}

/** 表面法线在两类变换下的差别：直接变换 vs 逆转置后归一化。 */
export function transformNormal(world: Mat4, normal: Vec3, useInverseTranspose: boolean): Vec3 {
  const matrix = useInverseTranspose ? (normalMatrix(world) ?? world) : world;
  const result = transformDirection(matrix, normal);
  return length(result) === 0 ? result : normalize(result);
}

// ---------------------------------------------------------------- 反射与拾取

/** 入射方向 d 关于法线 n 的反射：r = d − 2(d·n)n。 */
export const reflect = (d: Vec3, n: Vec3): Vec3 => sub(d, scale(n, 2 * dot(d, n)));

/** 射线与三角形求交（Möller–Trumbore）。返回命中距离 t，未命中返回 null。 */
export function rayTriangle(origin: Vec3, direction: Vec3, a: Vec3, b: Vec3, c: Vec3): number | null {
  const edge1 = sub(b, a);
  const edge2 = sub(c, a);
  const p = cross(direction, edge2);
  const det = dot(edge1, p);
  if (Math.abs(det) < 1e-8) return null;
  const inv = 1 / det;
  const t = sub(origin, a);
  const u = dot(t, p) * inv;
  if (u < 0 || u > 1) return null;
  const q = cross(t, edge1);
  const v = dot(direction, q) * inv;
  if (v < 0 || u + v > 1) return null;
  const distance = dot(edge2, q) * inv;
  return distance > 1e-8 ? distance : null;
}

/**
 * 屏幕点 → 视图空间射线（第 17 章的公式）。
 * 传入归一化设备坐标 ndcX / ndcY ∈ [−1, 1]，以及投影矩阵里对应的两个缩放项。
 */
export function pickRayViewSpace(ndcX: number, ndcY: number, projWidth: number, projHeight: number): Vec3 {
  return [ndcX / projWidth, ndcY / projHeight, 1];
}

/** 视锥的六个平面（内法线朝里），每个平面用 (n, d) 表示：n·p + d = 0。 */
export type Plane = { normal: Vec3; d: number };

export function frustumPlanes(viewProj: Mat4): Plane[] {
  const rows = transposeRows(viewProj);
  const w = [rows[0][3], rows[1][3], rows[2][3], rows[3][3]];
  // 行向量约定下 clip = p·VP，于是 clip.x = p·row0.xyz + row0.w。
  // 把 −w ≤ x, y ≤ w 与 0 ≤ z ≤ w 写成 p·n + d ≥ 0 的形式。
  const combos: Array<[Vec3, number]> = [
    [add(rows[3], rows[0]), w[3] + w[0]],   // 左：x + w ≥ 0
    [sub(rows[3], rows[0]), w[3] - w[0]],   // 右：w − x ≥ 0
    [add(rows[3], rows[1]), w[3] + w[1]],   // 下：y + w ≥ 0
    [sub(rows[3], rows[1]), w[3] - w[1]],   // 上：w − y ≥ 0
    [xyz(rows[2]), w[2]],                   // 近：D3D 的裁剪条件是 z ≥ 0
    [sub(rows[3], rows[2]), w[3] - w[2]],   // 远：w − z ≥ 0
  ];
  return combos.map(([normal, d]) => {
    const len = length(normal) || 1;
    return { normal: scale(normal, 1 / len), d: d / len };
  });
}

function transposeRows(m: Mat4): Vec4[] {
  return [0, 1, 2, 3].map((row) => [m[row], m[row + 4], m[row + 8], m[row + 12]] as Vec4);
}

/** 球心到平面的有符号距离；≥ −radius 表示球与视锥相交或在其内部。 */
export const planeSphere = (plane: Plane, center: Vec3, radius: number): number =>
  dot(plane.normal, center) + plane.d + radius;

/** 轴对齐包围盒与平面的关系：返回 true 表示“至少有一部分在平面内侧”。 */
export function planeAabb(plane: Plane, min: Vec3, max: Vec3): boolean {
  const [nx, ny, nz] = plane.normal;
  const px = nx >= 0 ? max[0] : min[0];
  const py = ny >= 0 ? max[1] : min[1];
  const pz = nz >= 0 ? max[2] : min[2];
  return dot(plane.normal, [px, py, pz]) + plane.d >= 0;
}

/** 六个平面全部通过才算可见（保守：相交即保留）。 */
export function isVisible(planes: Plane[], center: Vec3, radius: number): boolean {
  return planes.every((plane) => planeSphere(plane, center, radius) >= 0);
}

// ---------------------------------------------------------------- 四元数

export type Quat = readonly [number, number, number, number]; // (x, y, z, w)

/** 由旋转轴与角度构造单位四元数。 */
export function quatFromAxisAngle(axis: Vec3, radians: number): Quat {
  const n = normalize(axis);
  const s = Math.sin(radians / 2);
  return [n[0] * s, n[1] * s, n[2] * s, Math.cos(radians / 2)];
}

export function quatMultiply(a: Quat, b: Quat): Quat {
  return [
    a[3] * b[0] + a[0] * b[3] + a[1] * b[2] - a[2] * b[1],
    a[3] * b[1] - a[0] * b[2] + a[1] * b[3] + a[2] * b[0],
    a[3] * b[2] + a[0] * b[1] - a[1] * b[0] + a[2] * b[3],
    a[3] * b[3] - a[0] * b[0] - a[1] * b[1] - a[2] * b[2],
  ];
}

export const quatConjugate = (q: Quat): Quat => [-q[0], -q[1], -q[2], q[3]];
export const quatDot = (a: Quat, b: Quat): number => a[0] * b[0] + a[1] * b[1] + a[2] * b[2] + a[3] * b[3];

/**
 * 球面线性插值。当 q0·q1 < 0 时先把其中一个取反，这样走的是短弧 —— 教材第 22 章的重点。
 */
export function quatSlerp(a: Quat, b: Quat, t: number, shortArc = true): Quat {
  let target = b;
  let cosTheta = quatDot(a, target);
  if (shortArc && cosTheta < 0) {
    target = negateQuat(target);
    cosTheta = -cosTheta;
  }
  const lerp = (index: number): number => a[index] + (target[index] - a[index]) * t;
  if (cosTheta > 0.9995) return normalizeQuat([lerp(0), lerp(1), lerp(2), lerp(3)]);
  const theta = Math.acos(Math.min(1, Math.max(-1, cosTheta)));
  const sinTheta = Math.sin(theta);
  const wa = Math.sin((1 - t) * theta) / sinTheta;
  const wb = Math.sin(t * theta) / sinTheta;
  const slerp = (index: number): number => a[index] * wa + target[index] * wb;
  return normalizeQuat([slerp(0), slerp(1), slerp(2), slerp(3)]);
}

export const negateQuat = (q: Quat): Quat => [-q[0], -q[1], -q[2], -q[3]];

export function normalizeQuat(q: Quat): Quat {
  const n = Math.sqrt(quatDot(q, q));
  return n === 0 ? [0, 0, 0, 1] : [q[0] / n, q[1] / n, q[2] / n, q[3] / n];
}

/** 四元数 → 旋转矩阵（行主序、行向量、左手系）。 */
export function quatToMatrix(q: Quat): Mat4 {
  const [x, y, z, w] = q;
  return [
    1 - 2 * (y * y + z * z), 2 * (x * y + z * w), 2 * (x * z - y * w), 0,
    2 * (x * y - z * w), 1 - 2 * (x * x + z * z), 2 * (y * z + x * w), 0,
    2 * (x * z + y * w), 2 * (y * z - x * w), 1 - 2 * (x * x + y * y), 0,
    0, 0, 0, 1,
  ];
}

// ---------------------------------------------------------------- 光照与阴影

/** 朗伯余弦定律：漫反射强度 ∝ max(0, n·l)。 */
export const lambert = (normal: Vec3, toLight: Vec3): number => Math.max(0, dot(normal, toLight));

/** Blinn-Phong 高光项：((n·h)^p) / 8 · (m + 8)，m 为粗糙度（书中式 8.6 附近）。 */
export function specular(normal: Vec3, toLight: Vec3, toEye: Vec3, roughness: number): number {
  const half = normalize(add(toLight, toEye));
  const ndotH = Math.max(0, dot(normal, half));
  const m = Math.max(1, Math.min(256, roughness));
  return (Math.pow(ndotH, m) * (m + 8)) / 8;
}

/**
 * 阴影贴图判定：比较“从光源看”的深度与“从相机看的像素”在光源空间的深度。
 * bias 太小会出现阴影痤疮，太大会出现悬浮（peter-panning）。
 */
export const shadowFactor = (lightDepth: number, fragmentDepth: number, bias: number): number =>
  fragmentDepth - bias <= lightDepth ? 1 : 0;

/** 百分比渐近过滤：在核内取多个样本求平均，得到柔和的过渡带。 */
export function pcf(samples: number[], fragmentDepth: number, bias: number): number {
  if (samples.length === 0) return 1;
  const lit = samples.filter((depth) => shadowFactor(depth, fragmentDepth, bias) === 1).length;
  return lit / samples.length;
}

// ---------------------------------------------------------------- 计算着色器

/**
 * 由 Dispatch 参数与组内线程 ID 推出全局线程 ID 与组内线性索引（第 13 章）。
 * SV_GroupIndex 是线程在**自己组内**的一维编号，用来索引共享内存数组。
 */
export function threadIds(groupId: readonly [number, number, number], threadId: readonly [number, number, number],
  groupSize: readonly [number, number, number]): { group: Vec3; thread: Vec3; global: Vec3; index: number } {
  const global: Vec3 = [
    groupId[0] * groupSize[0] + threadId[0],
    groupId[1] * groupSize[1] + threadId[1],
    groupId[2] * groupSize[2] + threadId[2],
  ];
  return { group: groupId, thread: threadId, global, index: threadId[1] * groupSize[0] + threadId[0] };
}

/** 覆盖 size 宽的一维数据需要多少个线程组。 */
export const groupsFor = (size: number, groupSize: number): number => Math.ceil(size / groupSize);
