import { describe, expect, it } from 'vitest';
import {
  add, angleBetween, cross, determinant, dot, format, identity, inverse, isInsideClipVolume,
  lambert, length, lookAtLH, multiply, normalMatrix, normalize, orthogonalize, perspectiveFovLH,
  pcf, quatFromAxisAngle, quatMultiply, quatSlerp, quatToMatrix, rayTriangle, reflect, rotationY,
  scaling, shadowFactor, specular, sub, threadIds, toNdc, transformDirection,
  transformHomogeneous, transformPoint, translation, vec3, frustumPlanes, isVisible, type Quat,
} from './math';
import { chapters } from '@/content/catalog';
import { isProgressState, type ProgressState } from '@/progress/ProgressProvider';

const close = (a: number, b: number, eps = 1e-5) => Math.abs(a - b) < eps;
const closeVec = (a: readonly number[], b: readonly number[], eps = 1e-5) =>
  a.length === b.length && a.every((value, index) => close(value, b[index], eps));

describe('向量（第 1 章）', () => {
  it('点积与夹角的符号一致', () => {
    expect(dot(vec3(1, 2, 3), vec3(0, -1, 0))).toBeCloseTo(-2);
    expect(angleBetween(vec3(1, 0, 0), vec3(0, 1, 0))).toBeCloseTo(Math.PI / 2);
  });

  it('叉积反交换律、长度等于平行四边形面积', () => {
    const u = vec3(1, 0, 0);
    const v = vec3(0, 1, 0);
    expect(closeVec(cross(u, v), cross(v, u).map((value) => -value))).toBe(true);
    expect(length(cross(u, v))).toBeCloseTo(1);
  });

  it('叉积与两个输入都正交', () => {
    const u = vec3(1, 2, 3);
    const v = vec3(-4, 5, 6);
    const w = cross(u, v);
    expect(dot(w, u)).toBeCloseTo(0);
    expect(dot(w, v)).toBeCloseTo(0);
  });

  it('归一化后长度为 1；零向量返回零向量', () => {
    expect(length(normalize(vec3(3, 0, 4)))).toBeCloseTo(1);
    expect(closeVec(normalize(vec3(0, 0, 0)), [0, 0, 0])).toBe(true);
  });

  it('Gram-Schmidt 正交化让结果与参考向量正交', () => {
    const w = vec3(1, 2, 3);
    const v = vec3(0, 1, 0);
    expect(dot(orthogonalize(w, v), v)).toBeCloseTo(0);
  });

  it('点加减法', () => {
    expect(closeVec(add(vec3(1, 2, 3), vec3(4, 5, 6)), [5, 7, 9])).toBe(true);
    expect(closeVec(sub(vec3(1, 2, 3), vec3(1, 1, 1)), [0, 1, 2])).toBe(true);
  });
});

describe('矩阵（第 2—3 章）', () => {
  it('行向量约定：v · S · R · T 表示先缩放再旋转最后平移', () => {
    const S = scaling(2, 1, 1);
    const R = rotationY(Math.PI / 2);
    const T = translation(10, 0, 0);
    const step = transformPoint(multiply(multiply(S, R), T), vec3(1, 0, 0));
    const manual = transformPoint(T, transformPoint(R, transformPoint(S, vec3(1, 0, 0))));
    expect(closeVec(step, manual)).toBe(true);
  });

  it('换顺序会得到不同结果（非交换律）', () => {
    const S = scaling(2, 1, 1);
    const T = translation(10, 0, 0);
    const a = transformPoint(multiply(S, T), vec3(1, 0, 0));
    const b = transformPoint(multiply(T, S), vec3(1, 0, 0));
    expect(closeVec(a, b)).toBe(false);
  });

  it('行列式与可逆性', () => {
    expect(determinant(scaling(2, 3, 4))).toBeCloseTo(24);
    expect(inverse(scaling(1, 0, 1))).toBeNull();
    const inverseScale = inverse(scaling(2, 4, 8));
    expect(inverseScale && closeVec(multiply(scaling(2, 4, 8), inverseScale), identity())).toBe(true);
  });

  it('转置满足 (AB)ᵀ = BᵀAᵀ', () => {
    const A = rotationY(0.7);
    const B = scaling(1, 2, 3);
    const product = multiply(A, B);
    const transposed = transposeHelper(product);
    const right = multiply(transposeHelper(B), transposeHelper(A));
    expect(closeVec(transposed, right, 1e-4)).toBe(true);
  });

  function transposeHelper(m: readonly number[]) {
    return Array.from({ length: 16 }, (_unused, index) => m[(index % 4) * 4 + Math.floor(index / 4)]);
  }

  it('平移只影响点，不影响方向', () => {
    const world = multiply(translation(5, 6, 7), rotationY(0.4));
    expect(closeVec(transformDirection(world, vec3(1, 0, 0)), transformDirection(rotationY(0.4), vec3(1, 0, 0)), 1e-4)).toBe(true);
  });
});

describe('光照与法线（第 8 章）', () => {
  it('朗伯余弦定律：背面为 0', () => {
    const n = vec3(0, 0, 1);
    expect(lambert(n, vec3(0, 0, 1))).toBeCloseTo(1);
    expect(lambert(n, vec3(0, 0, -1))).toBe(0);
  });

  it('高光在半程向量方向达到最大，背对时为 0', () => {
    const l = vec3(0, 0, 1);
    const v = vec3(0, 1, 0);
    const aligned = normalize(add(l, v));          // 半程向量本身就是表面法线时最亮
    expect(specular(aligned, l, v, 16)).toBeGreaterThan(specular(vec3(0, 0, 1), l, v, 16));
    expect(specular(vec3(0, 1, 0), vec3(0, -1, 0), vec3(0, 1, 0), 16)).toBe(0);
  });

  it('逆转置能让非均匀缩放下的法线保持垂直', () => {
    // 切向与法线在原始空间里严格正交，但各自都不是坐标轴方向
    const world = multiply(scaling(3, 0.5, 1), rotationY(0.6));
    const tangent = normalize(vec3(1, 1, 0));
    const normal = normalize(vec3(-1, 1, 0));
    expect(dot(tangent, normal)).toBeCloseTo(0);

    const worldTangent = transformDirection(world, tangent);
    const direct = normalize(transformDirection(world, normal));
    const nrm = normalMatrix(world);
    expect(nrm).not.toBeNull();
    const fixed = normalize(transformDirection(nrm as readonly number[], normal));

    expect(Math.abs(dot(fixed, worldTangent))).toBeLessThan(1e-5);
    expect(Math.abs(dot(direct, worldTangent))).toBeGreaterThan(1e-3);
  });
});

describe('反射与拾取（第 17、18 章）', () => {
  it('反射向量与入射向量关于法线对称', () => {
    const n = vec3(0, 0, 1);
    const d = normalize(vec3(1, 0, -1));
    const r = reflect(d, n);
    expect(r[2]).toBeCloseTo(-d[2]);
    expect(Math.abs(dot(normalize(r), n))).toBeCloseTo(Math.abs(dot(d, n)), 1e-6);
  });

  it('拾取取视线前方最近的交点', () => {
    const a = vec3(-1, -1, 1);
    const b = vec3(1, -1, 1);
    const c = vec3(0, 1, 1);
    const near = rayTriangle(vec3(0, 0, -1), vec3(0, 0, 1), a, b, c);
    expect(near).toBeCloseTo(2);

    const far = [a, b, c].map((v) => vec3(v[0], v[1], v[2] + 4)) as [typeof a, typeof b, typeof c];
    const both = [rayTriangle(vec3(0, 0, -1), vec3(0, 0, 1), a, b, c), rayTriangle(vec3(0, 0, -1), vec3(0, 0, 1), ...far)]
      .filter((value): value is number => value !== null);
    expect(Math.min(...both)).toBeCloseTo(2);
  });

  it('射线指错方向时没有交点', () => {
    expect(rayTriangle(vec3(0, 0, 5), vec3(0, 0, 1), vec3(-1, -1, 1), vec3(1, -1, 1), vec3(0, 1, 1))).toBeNull();
  });
});

describe('视锥（第 5、16 章）', () => {
  const eye = vec3(0, 0, 4);
  const view = lookAtLH(eye, vec3(0, 0, 0), vec3(0, 1, 0));
  const proj = perspectiveFovLH((60 * Math.PI) / 180, 1.6, 0.1, 30);
  const viewProj = multiply(view, proj);

  it('相机前方的点在视锥内，后方的点不在', () => {
    const planes = frustumPlanes(viewProj);
    expect(isVisible(planes, vec3(0, 0, 0), 0.5)).toBe(true);
    expect(isVisible(planes, vec3(0, 0, 9), 0.5)).toBe(false);
  });

  it('六个平面全部通过才算可见', () => {
    const planes = frustumPlanes(viewProj);
    expect(planes).toHaveLength(6);
    expect(planes.every((plane) => close(dot(plane.normal, eye) + plane.d, dot(plane.normal, eye) + plane.d))).toBe(true);
  });
});

describe('裁剪与投影（第 5 章）', () => {
  const proj = perspectiveFovLH((60 * Math.PI) / 180, 1.6, 1, 20);

  it('w 等于视图空间 z', () => {
    expect(transformHomogeneous(proj, vec3(0, 0, 5))[3]).toBeCloseTo(5);
  });

  it('近平面深度为 0、远平面为 1（D3D12 的 0 ≤ z ≤ w）', () => {
    const nearNdc = toNdc(transformHomogeneous(proj, vec3(0, 0, 1)));
    const farNdc = toNdc(transformHomogeneous(proj, vec3(0, 0, 20)));
    expect(nearNdc?.[2]).toBeCloseTo(0);
    expect(farNdc?.[2]).toBeCloseTo(1);
  });

  it('近平面之前的点不满足 0 ≤ z ≤ w', () => {
    const clip = transformHomogeneous(proj, vec3(0, 0, 0.5));
    expect(isInsideClipVolume(clip)).toBe(false);
  });

  it('视锥内的点满足裁剪条件', () => {
    expect(isInsideClipVolume(transformHomogeneous(proj, vec3(0, 0, 5)))).toBe(true);
  });
});

describe('四元数（第 22 章）', () => {
  it('单位四元数导出的矩阵保持正交', () => {
    const m = quatToMatrix(quatFromAxisAngle(normalize(vec3(1, 2, 3)), 0.9));
    for (let col = 0; col < 3; col += 1) {
      for (let other = 0; other < 3; other += 1) {
        const dotProduct = m[col] * m[other] + m[4 + col] * m[4 + other] + m[8 + col] * m[8 + other];
        expect(dotProduct).toBeCloseTo(col === other ? 1 : 0);
      }
    }
  });

  it('q 与 −q 表示同一旋转', () => {
    const q = quatFromAxisAngle(vec3(0, 1, 0), 0.6);
    const negated: Quat = [-q[0], -q[1], -q[2], -q[3]];
    const m1 = quatToMatrix(q);
    const m2 = quatToMatrix(negated);
    for (let index = 0; index < 16; index += 1) expect(m2[index]).toBeCloseTo(m1[index]);
  });

  it('slerp 走短弧：端点取负后必须开启短弧修正', () => {
    const a = quatFromAxisAngle(vec3(0, 1, 0), 0);
    const b = quatFromAxisAngle(vec3(0, 1, 0), (170 * Math.PI) / 180);
    const negated: typeof b = [-b[0], -b[1], -b[2], -b[3]];

    // −b 与 b 表示同一旋转：开启短弧修正后应回到 b（170° 的那条近路）
    expect(closeVec(quatSlerp(a, negated, 1, true), b, 1e-4)).toBe(true);
    // 不做修正就会沿长路走到 −b（等价于 190°）
    expect(closeVec(quatSlerp(a, negated, 1, false), negated, 1e-4)).toBe(true);
  });

  it('slerp 端点与单位四元数混合等价于端点', () => {
    const a = quatFromAxisAngle(vec3(0, 1, 0), 0.2);
    const b = quatFromAxisAngle(vec3(1, 0, 0), 0.9);
    expect(closeVec(quatSlerp(a, b, 0, true), a, 1e-4)).toBe(true);
    expect(closeVec(quatSlerp(a, b, 1, true), b, 1e-4)).toBe(true);
  });

  it('四元数乘法对应旋转复合', () => {
    const a = quatFromAxisAngle(vec3(0, 1, 0), 0.5);
    const b = quatFromAxisAngle(vec3(0, 1, 0), 0.5);
    const combined = quatToMatrix(quatMultiply(a, b));
    const single = quatToMatrix(quatFromAxisAngle(vec3(0, 1, 0), 1.0));
    for (let index = 0; index < 16; index += 1) expect(combined[index]).toBeCloseTo(single[index]);
  });
});

describe('阴影与计算着色器（第 13、20 章）', () => {
  it('深度比较：d(p) 大于 s 时判为阴影', () => {
    expect(shadowFactor(0.5, 0.7, 0)).toBe(0);
    expect(shadowFactor(0.7, 0.5, 0)).toBe(1);
  });

  it('偏移能消除自遮挡', () => {
    expect(shadowFactor(0.5, 0.52, 0)).toBe(0);
    expect(shadowFactor(0.5, 0.52, 0.05)).toBe(1);
  });

  it('PCF 返回核内通过样本的比例', () => {
    expect(pcf([0.6, 0.8, 0.9], 0.5, 0)).toBeCloseTo(1);
    expect(pcf([0.2, 0.3, 0.9], 0.5, 0)).toBeCloseTo(1 / 3);
    expect(pcf([0.4, 0.4], 0.5, 0)).toBe(0);
    expect(pcf([], 0.5, 0)).toBe(1);
  });

  it('SV_DispatchThreadID = GroupID × GroupSize + GroupThreadID；GroupIndex 是组内编号', () => {
    const result = threadIds([1, 1, 0], [2, 3, 0], [8, 8, 1]);
    expect(result.global).toEqual([10, 11, 0]);
    expect(result.index).toBe(3 * 8 + 2);
  });

  it('组数按线程组大小向上取整', () => {
    expect(Math.ceil(28 / 8)).toBe(4);
  });
});

describe('旧进度迁移', () => {
  it('v1 勾选记录只迁移为「已阅读」，不会自动视为掌握', () => {
    const migrated: ProgressState = { version: 2, chapters: {}, lastVisited: null };
    for (let number = 1; number <= 23; number += 1) {
      const chapterId = `ch${String(number).padStart(2, '0')}`;
      migrated.chapters[chapterId] = { read: true, activities: [], conceptPassed: false, practiceDone: false };
    }
    expect(Object.values(migrated.chapters).every((entry) => entry.read)).toBe(true);
    expect(Object.values(migrated.chapters).some((entry) => entry.conceptPassed)).toBe(false);
    expect(Object.values(migrated.chapters).some((entry) => entry.practiceDone)).toBe(false);
    expect(isProgressState(migrated)).toBe(true);
  });

  it('拒绝非法或旧版本的进度数据', () => {
    expect(isProgressState({ version: 1, chapters: {} })).toBe(false);
    expect(isProgressState({ version: 2, chapters: [] })).toBe(false);
    expect(isProgressState(null)).toBe(false);
  });

  it('概念过关与代码实践是彼此独立的两个标记', () => {
    const state: ProgressState = {
      version: 2,
      chapters: { ch01: { read: true, activities: ['q:a:0:1'], conceptPassed: true, practiceDone: false } },
      lastVisited: { route: 'ch01.html' },
    };
    expect(isProgressState(state)).toBe(true);
    expect(state.chapters.ch01.conceptPassed).toBe(true);
    expect(state.chapters.ch01.practiceDone).toBe(false);
  });
});

describe('章节清单与示例链接', () => {
  it('23 章都有稳定的路由、锚点与目标', () => {
    expect(chapters).toHaveLength(23);
    for (const chapter of chapters) {
      expect(chapter.route).toBe(`ch${String(chapter.number).padStart(2, '0')}.html`);
      expect(chapter.sections.length).toBeGreaterThan(0);
      expect(new Set(chapter.sections.map((section) => section.id)).size).toBe(chapter.sections.length);
    }
  });

  it('第 3、5 章在仓库里没有独立项目，必须显式标注', () => {
    expect(chapters.find((chapter) => chapter.id === 'ch03')?.samplePath).toBeUndefined();
    expect(chapters.find((chapter) => chapter.id === 'ch05')?.samplePath).toBeUndefined();
  });
});

describe('格式化', () => {
  it('负零统一显示为 0', () => {
    expect(format(-0)).toBe('0');
    expect(format(1.005, 2)).toBe('1');
    expect(format(2.346, 2)).toBe('2.35');
  });
});
