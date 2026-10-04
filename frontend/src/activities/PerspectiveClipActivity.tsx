import { useState } from 'react';
import { ActivityFrame } from '@/activities/ActivityFrame';
import { Readout, Slider, svgPoint } from '@/activities/controls';
import { format, isInsideClipVolume, perspectiveFovLH, toNdc, transformHomogeneous, vec3 } from '@/activities/math';

const UNIT = 46;

/** 5.6 后的推演：调 FOV 与近平面，看透视投影和 D3D12 的裁剪条件 0 ≤ z ≤ w。 */
export function PerspectiveClipActivity() {
  const [fov, setFov] = useState(60);
  const [nearZ, setNearZ] = useState(1);
  const [farZ, setFarZ] = useState(20);
  const [pointZ, setPointZ] = useState(6);
  const [pointY, setPointY] = useState(1);
  const [touched, setTouched] = useState(false);

  const aspect = 1.6;
  const proj = perspectiveFovLH((fov * Math.PI) / 180, aspect, nearZ, farZ);
  // 视图空间：左手系，相机看向 +z
  const view = vec3(0, pointY, pointZ);
  const clip = transformHomogeneous(proj, view);
  const ndc = toNdc(clip);
  const inside = isInsideClipVolume(clip);
  const onNear = Math.abs(pointZ - nearZ) < 0.06;

  const halfHeightNear = nearZ * Math.tan((fov * Math.PI) / 180 / 2);

  function reset() {
    setFov(60);
    setNearZ(1);
    setFarZ(20);
    setPointZ(6);
    setPointY(1);
    setTouched(false);
  }

  // 侧视图：横轴是视图空间 z，纵轴是 y
  const toSide = (z: number, y: number) => svgPoint((z - 8) * 0.55, y * 0.55, UNIT);
  const nearTop = toSide(nearZ, halfHeightNear);
  const nearBottom = toSide(nearZ, -halfHeightNear);
  const farHalf = farZ * Math.tan((fov * Math.PI) / 180 / 2);
  const farTop = toSide(farZ, farHalf);
  const farBottom = toSide(farZ, -farHalf);
  const eye = toSide(0, 0);
  const point = toSide(pointZ, pointY);

  return (
    <ActivityFrame
      id="ch05-perspective-clip"
      chapterId="ch05"
      title="D3D12 的裁剪条件是 0 ≤ z ≤ w"
      prompt="拖动点的深度，让它正好落在近平面上（读出归一化深度），再把它拖到近平面之前，看裁剪判定怎么变。"
      predict={{
        question: '在 D3D12（左手系、行向量）里，正好位于近平面上的点，透视除法后的归一化深度是多少？',
        options: ['−1', '0', '0.5', '1'],
        answer: 1,
        hint: 'D3D12 的裁剪条件是 0 ≤ z ≤ w，除以 w 之后深度落在 [0, 1]。这和 OpenGL 的 [−1, 1] 不同。',
        correctNote: 'D3D12 归一化深度范围是 [0, 1]，近平面是 0、远平面是 1。',
        wrongNote: 'D3D12 的裁剪条件是 0 ≤ z ≤ w（不是 −w ≤ z ≤ w），所以除以 w 后深度范围是 [0, 1]；−1 是 OpenGL 的约定。',
      }}
      onReset={reset}
      check={() => {
        if (!touched) return { passed: false, feedback: '先拖动「点的深度 z」或「近平面」，观察裁剪判定与归一化深度的变化，再检查。' };
        if (!onNear) return { passed: false, feedback: `现在点的 z 是 ${format(pointZ)}，近平面是 ${format(nearZ)}，还没对齐。把点的深度调到正好等于近平面（差 < 0.06）再检查。` };
        return {
          passed: true,
          feedback: `点在近平面上：clip = (${clip.map((value) => format(value)).join(', ')})，w = ${format(clip[3])}，归一化深度 = ${ndc ? format(ndc[2]) : '—'}。D3D12 的深度范围是 [0, 1]，近平面是 0。`,
        };
      }}
      explanation={<>
        <p>投影之后我们得到齐次裁剪空间坐标 (x, y, z, w)。<b>D3D12 的裁剪条件是 0 ≤ z ≤ w</b>（另外还有 −w ≤ x, y ≤ w）。</p>
        <p>透视除法之后归一化设备坐标的深度落在 <b>[0, 1]</b>：近平面处是 0，远平面处是 1。这一点与 OpenGL 的 [−1, 1] 不同，移植代码时最容易在这里出错。</p>
        <p>用 <code>XMMatrixPerspectiveFovLH</code> 得到的矩阵里，w 分量就等于视图空间的 z（左手系下相机看向 +z）。所以「z 是不是在近平面前」和「w 是多少」是同一个量。</p>
        <p>图 5.25 展示了不同近平面取值下 g(z) 的曲线：近平面越靠近相机，深度精度越集中，但远处精度损失越大。</p>
      </>}
      apply={<p>代码里对应 <code>XMMatrixPerspectiveFovLH(fovY, aspect, nearZ, farZ)</code>。别把 nearZ 设成 0——那会让除法失去意义，深度精度也会崩掉。</p>}
    >
      <svg className="svg-stage" viewBox="0 0 320 320" role="img"
        aria-label={`视锥侧视图：视场角 ${fov} 度，近平面 ${format(nearZ)}，远平面 ${format(farZ)}，点位于 z ${format(pointZ)}`}>
        <line className="axis" x1={20} y1={160} x2={300} y2={160} />
        <text x={286} y={152}>+z（相机朝向）</text>
        <polygon points={`${nearTop.x},${nearTop.y} ${farTop.x},${farTop.y} ${farBottom.x},${farBottom.y} ${nearBottom.x},${nearBottom.y}`}
          fill="rgba(63,125,82,.1)" stroke="#3f7d52" strokeWidth={1.6} />
        <line stroke="#3f7d52" strokeWidth={1.4} x1={nearTop.x} y1={nearTop.y} x2={nearBottom.x} y2={nearBottom.y} />
        <line stroke="#3f7d52" strokeWidth={1.4} x1={farTop.x} y1={farTop.y} x2={farBottom.x} y2={farBottom.y} />
        <circle cx={eye.x} cy={eye.y} r={4} fill="#5b6c60" />
        <text x={eye.x - 26} y={eye.y + 4}>相机</text>
        <circle cx={point.x} cy={point.y} r={5.5} fill={inside ? '#2f6b8f' : '#b1712f'} />
        <text x={point.x + 9} y={point.y - 6}>{inside ? '在视锥内' : '被裁剪'}</text>
      </svg>

      <Slider label="视场角（垂直）" min={20} max={120} step={1} value={fov} onChange={(value) => { setFov(value); setTouched(true); }} format={(value) => `${value}°`} />
      <Slider label="近平面 nearZ" min={0.5} max={8} step={0.1} value={nearZ} onChange={(value) => { setNearZ(Math.min(value, farZ - 1)); setTouched(true); }} />
      <Slider label="远平面 farZ" min={5} max={40} step={1} value={farZ} onChange={setFarZ} />
      <Slider label="点的深度 z（视图空间）" min={0} max={24} step={0.1} value={pointZ} onChange={(value) => { setPointZ(value); setTouched(true); }} />
      <Slider label="点的高度 y" min={-6} max={6} step={0.1} value={pointY} onChange={(value) => { setPointY(value); setTouched(true); }} />

      <Readout items={[
        ['clip x, y', `${format(clip[0])}, ${format(clip[1])}`],
        ['clip z', format(clip[2])],
        ['clip w（= 视图 z）', format(clip[3])],
        ['归一化深度 z/w', ndc ? format(ndc[2]) : '—'],
        ['0 ≤ z ≤ w', inside ? '满足' : '不满足'],
      ]} />
    </ActivityFrame>
  );
}
