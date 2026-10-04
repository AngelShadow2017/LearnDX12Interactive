import { useState } from 'react';
import { ActivityFrame } from '@/activities/ActivityFrame';
import { Readout, Slider, svgPoint } from '@/activities/controls';
import { format, perspectiveFovLH, rayTriangle, vec3, type Vec3 } from '@/activities/math';

const UNIT = 42;

/** 三角形网格：几个盒子面，射线拾取用。 */
const triangles: Array<[Vec3, Vec3, Vec3]> = [
  [vec3(-1, -1, 0), vec3(1, -1, 0), vec3(1, 1, 0)],
  [vec3(-1, -1, 0), vec3(1, 1, 0), vec3(-1, 1, 0)],
  [vec3(-0.6, -0.6, 1.2), vec3(0.6, -0.6, 1.2), vec3(0.6, 0.6, 1.2)],
  [vec3(-0.6, -0.6, 1.2), vec3(0.6, 0.6, 1.2), vec3(-0.6, 0.6, 1.2)],
  [vec3(-0.8, -0.8, 2.6), vec3(0.8, -0.8, 2.6), vec3(0.8, 0.8, 2.6)],
];

/** 17.1 / 17.3 后的推演：屏幕点 → 视空间射线 → 命中最前面的三角形。 */
export function PickRayActivity() {
  const [ndcX, setNdcX] = useState(0.2);
  const [ndcY, setNdcY] = useState(0.1);
  const [autoPick, setAutoPick] = useState(false);

  const fov = (60 * Math.PI) / 180;
  const aspect = 1.6;
  const proj = perspectiveFovLH(fov, aspect, 0.1, 30);
  const height = proj[5];
  const width = proj[0];

  // 屏幕点 → 视空间射线（相机在原点，看向 +z）
  const viewDir: Vec3 = [ndcX / width, ndcY / height, 1];

  // 射线推进，判断是否穿出 z = 0（相机平面）
  const tPlane = ndcX === 0 && ndcY === 0 ? 0 : (() => {
    // 从原点沿 dir 前进到 z = -1（世界 xz 平面上的可视深度）用于画图
    return 1 / viewDir[2];
  })();
  const worldEnd: Vec3 = [viewDir[0] * tPlane, viewDir[1] * tPlane, tPlane];

  const hits = triangles
    .map((triangle, index) => ({ index, t: rayTriangle(vec3(0, 0, 0), viewDir, triangle[0], triangle[1], triangle[2]) }))
    .filter((hit) => hit.t !== null) as Array<{ index: number; t: number }>;
  const nearest = hits.length > 0 ? hits.reduce((a, b) => (a.t <= b.t ? a : b)) : null;
  const picked = autoPick ? nearest : null;

  function reset() {
    setNdcX(0.2);
    setNdcY(0.1);
    setAutoPick(false);
  }

  const origin = svgPoint(0, 0, UNIT);
  const end = svgPoint(worldEnd[0], worldEnd[1], UNIT);
  const hitPoint: Vec3 | null = picked ? [viewDir[0] * picked.t, viewDir[1] * picked.t, picked.t] : null;

  return (
    <ActivityFrame
      id="ch17-pick-ray"
      chapterId="ch17"
      title="把一次点击变成一条射线，再找到命中的三角形"
      prompt="拖动「屏幕点」改变点击位置，勾选「执行拾取」看射线穿过了哪些三角形、最前面的那个是哪个。"
      predict={{
        question: '射线同时穿过两个三角形时，拾取应该选哪一个？',
        options: ['第一个检测到的', '距离最近（t 最小、位于视线前方）的那一个', '面积更大的', '索引更小的'],
        answer: 1,
        correctNote: '拾取要选视线前方最近的那个，所以必须记录并比较 t。',
        wrongNote: '先检测到的未必是可见的那个；必须取 t 最小的交点，否则会选中被遮挡的物体。',
      }}
      onReset={reset}
      check={() => {
        if (!autoPick) return { passed: false, feedback: '先勾选「执行拾取」，看射线与哪些三角形相交，再检查。' };
        if (!nearest) return { passed: false, feedback: '当前射线没有命中任何三角形。把屏幕点移到图形中间（例如 ndcX = 0、ndcY = 0）再检查。' };
        return {
          passed: true,
          feedback: `射线命中 ${hits.length} 个三角形，最近的一个是第 ${nearest.index} 号，距离 t = ${format(nearest.t)}。拾取总是取 t 最小的那个——否则会选中被遮挡的物体。`,
        };
      }}
      explanation={<>
        <p>图 17.2 说明了拾取的本质：多个 3D 点会投影到投影窗口的同一点，所以「屏幕上的一点」不是 3D 位置，而是一条<b>射线</b>（图 17.3）。</p>
        <p>第 17.1 节的推导（图 17.4）：把 NDC 坐标除以投影矩阵里的两个缩放项，再令 z = 1，就得到视空间里射线的方向。</p>
        <div className="math-block">v<sub>view</sub> = (x<sub>ndc</sub> / p₀₀, y<sub>ndc</sub> / p₁₁, 1)<small>Direct3D 左手系：相机在原点、看向 +z</small></div>
        <p>把这条方向用<b>视图矩阵的逆</b>（即相机的世界矩阵）变换到世界空间，就得到世界空间的拾取射线。</p>
        <p>第 17.3 节用 Möller–Trumbore 算法求射线与三角形交点（图 17.5 给出了斜坐标系下的 (u, v) 重心坐标）：命中条件是 u ≥ 0、v ≥ 0、u + v ≤ 1 且 t &gt; 0。</p>
        <p>网格遍历时用「先求 t 最小」来挑出可见的那个三角形，选中后高亮（图 17.6）。</p>
      </>}
      apply={<p>实现要点：把鼠标坐标转成 NDC（y 要翻转），用 <code>XMVector3Transform</code> 配合相机的世界矩阵得到世界射线，再遍历网格。</p>}
    >
      <svg className="svg-stage" viewBox="0 0 320 320" role="img"
        aria-label={`拾取射线方向 (${format(viewDir[0])}, ${format(viewDir[1])}, 1)，命中 ${hits.length} 个三角形`}>
        <rect x={0} y={0} width={320} height={320} fill="#f7f9f3" />
        {triangles.map((triangle, index) => <polygon
          key={index}
          points={triangle.map((vertex) => { const p = svgPoint(vertex[0], vertex[1], UNIT); return `${p.x},${p.y}`; }).join(' ')}
          fill={picked?.index === index ? 'rgba(47,107,143,.3)' : 'rgba(120,150,130,.14)'}
          stroke={picked?.index === index ? '#2f6b8f' : '#9fb0a2'}
          strokeWidth={picked?.index === index ? 2.4 : 1} />)}

        <line className="axis" x1={20} y1={160} x2={300} y2={160} />
        <line className="axis" x1={160} y1={300} x2={160} y2={20} />
        <text x={286} y={152}>+x</text><text x={166} y={28}>+z（相机朝向）</text>

        <line className="vec vec--v" x1={origin.x} y1={origin.y} x2={end.x} y2={end.y} />
        {hits.map((hit) => <circle key={hit.index}
          cx={svgPoint(viewDir[0] * hit.t, viewDir[1] * hit.t, UNIT).x}
          cy={svgPoint(viewDir[0] * hit.t, viewDir[1] * hit.t, UNIT).y}
          r={3.5} fill="#b1712f" opacity={autoPick ? 0.8 : 0.25} />)}
        {hitPoint && <circle cx={svgPoint(hitPoint[0], hitPoint[1], UNIT).x} cy={svgPoint(hitPoint[0], hitPoint[1], UNIT).y} r={5.5} fill="#2f6b8f" />}
        <text x={origin.x + 8} y={origin.y - 8}>相机/射线原点</text>
      </svg>

      <Slider label="屏幕点 NDC x（−1 左 … 1 右）" min={-0.9} max={0.9} step={0.05} value={ndcX} onChange={setNdcX} />
      <Slider label="屏幕点 NDC y（−1 下 … 1 上）" min={-0.9} max={0.9} step={0.05} value={ndcY} onChange={setNdcY} />
      <div className="activity__actions">
        <label className="ctl ctl--toggle"><input type="checkbox" checked={autoPick} onChange={(event) => setAutoPick(event.target.checked)} /><span>执行拾取（求最近交点）</span></label>
      </div>

      <Readout items={[
        ['视空间射线方向', `(${format(viewDir[0])}, ${format(viewDir[1])}, ${format(viewDir[2])})`],
        ['命中三角形数', String(hits.length)],
        ['最近命中', nearest ? `第 ${nearest.index} 号，t = ${format(nearest.t)}` : '无'],
        ['已选中', picked ? `第 ${picked.index} 号` : '未拾取'],
      ]} />
      <p className="draggable-note">橙点 = 射线与各三角形的交点（按深度叠放）；蓝点 = 拾取选中的那个。</p>
    </ActivityFrame>
  );
}
