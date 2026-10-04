import { useState } from 'react';
import { ActivityFrame } from '@/activities/ActivityFrame';
import { Readout, Slider, svgPoint } from '@/activities/controls';
import { format, multiply, rotationX, translation, transformPoint, type Mat4 } from '@/activities/math';

// 关键帧（时间 0—1）与对应的两骨角度
const keyframes = [
  { time: 0, boneA: 0, boneB: 0 },
  { time: 0.35, boneA: 70, boneB: 20 },
  { time: 0.7, boneA: 110, boneB: 45 },
  { time: 1, boneA: 140, boneB: 10 },
];

/** 23.3 后的推演：调整关节顶点的两骨权重，看蒙皮结果；并用时间轴定位关键帧。 */
export function SkinWeightActivity() {
  const [weightB, setWeightB] = useState(0.5);
  const [time, setTime] = useState(0.5);
  const [touched, setTouched] = useState(false);

  const sample = (timeValue: number) => {
    let index = 0;
    while (index < keyframes.length - 2 && timeValue > keyframes[index + 1].time) index += 1;
    const a = keyframes[index];
    const b = keyframes[index + 1];
    const span = b.time - a.time || 1;
    const u = Math.min(1, Math.max(0, (timeValue - a.time) / span));
    // 同轴旋转时，线性插值角度与四元数 SLERP 等价
    const blend = u;
    return { boneA: a.boneA + (b.boneA - a.boneA) * blend, boneB: a.boneB + (b.boneB - a.boneB) * blend, index, u };
  };

  const pose = sample(time);
  const matrixA: Mat4 = multiply(rotationX((pose.boneA * Math.PI) / 180), translation(0, 0, 0));
  const matrixB: Mat4 = multiply(rotationX((-pose.boneB * Math.PI) / 180), translation(0, 0, 0));

  // 关节附近的顶点：绑定空间里在两根骨骼之间
  const bind = [0, 2.4, 0] as const;
  const offsetFromA: [number, number, number] = [0, 1.1, 0];
  const offsetA = translation(offsetFromA[0], offsetFromA[1], offsetFromA[2]);
  const offsetB = translation(-offsetFromA[0], -offsetFromA[1], -offsetFromA[2]);
  const paletteA = multiply(offsetA, matrixA);
  const paletteB = multiply(offsetB, matrixB);
  const posA = transformPoint(paletteA, bind);
  const posB = transformPoint(paletteB, bind);
  const final = [0, 1, 2].map((index) => (1 - weightB) * posA[index] + weightB * posB[index]) as [number, number, number];

  const UNIT = 30;
  const base = svgPoint(0, 0, UNIT);
  const pA = svgPoint(posA[0], posA[1], UNIT);
  const pB = svgPoint(posB[0], posB[1], UNIT);
  const pF = svgPoint(final[0], final[1], UNIT);

  function reset() {
    setWeightB(0.5);
    setTime(0.5);
    setTouched(false);
  }

  return (
    <ActivityFrame
      id="ch23-skin-weight"
      chapterId="ch23"
      title="调整两骨权重，看关节顶点怎么被拉开"
      prompt="拖动权重滑块：权重 0 完全跟随骨 A，权重 1 完全跟随骨 B。中间值就是线性混合。拖时间轴看关键帧之间的插值。"
      predict={{
        question: '关节附近的顶点为什么要受两根骨骼影响？',
        options: ['为了减少顶点数', '因为骨骼之间必须连续过渡，否则关节处会出现裂缝或塌陷', '为了提高精度', '为了支持纹理贴图'],
        answer: 1,
        correctNote: '骨骼之间必须连续过渡，否则关节处会裂开或塌陷；所以关节顶点同时跟随两根骨骼。',
        wrongNote: '多骨骼影响是为了连续性，不是为了省顶点或提高精度；权重之和必须等于 1。',
      }}
      onReset={reset}
      check={() => {
        if (!touched) return { passed: false, feedback: '先拖动「骨 B 权重」，观察顶点从骨 A 位置滑向骨 B 位置，再检查。' };
        if (weightB !== 0.5) return { passed: false, feedback: '把权重调回 0.5，看顶点在两个位置中间，然后再检查。' };
        return {
          passed: true,
          feedback: `权重 0.5 时顶点在 (${format(final[0])}, ${format(final[1])})，正好是两骨结果的平均。权重必须加起来等于 1，否则顶点的位置会随姿势漂移。`,
        };
      }}
      explanation={<>
        <p>角色网格跨在骨骼上，关节附近的顶点同时受多根骨骼影响（图 23.8）。原书每个顶点至多关联 4 个骨骼；权重之和为 1。</p>
        <p>网格顶点在绑定空间中。<b>偏移变换</b>（图 23.7）先把它变到骨骼局部空间，再乘当前 <code>toRoot</code> 得到根空间位置。按 DirectXMath 的行向量顺序：</p>
        <div className="math-block">p<sub>skinned</sub> = Σ<sub>i</sub> w<sub>i</sub> · p<sub>bind</sub> · offsetTransform<sub>i</sub> · toRoot<sub>i</sub></div>
        <p>「矩阵调色板」（图 23.9）存每根骨骼的 <code>offsetTransform · toRoot</code>，顶点按索引查表加权即可。</p>
        <p>第 23.5 节把这些结果按时间播放：关键帧定义「关键姿势」（图 23.11），帧间用插值得到每一帧的骨骼姿态。</p>
      </>}
      apply={<p>HLSL 片段按行向量顺序执行：<code>for (i in 0..3) skinned += w[i] * mul(pBind, palette[i]);</code>，其中 <code>palette[i] = offset[i] * toRoot[i]</code>；最后再乘世界矩阵。</p>}
    >
      <svg className="svg-stage" viewBox="0 0 320 320" role="img"
        aria-label={`蒙皮结果：骨 A 角度 ${format(pose.boneA, 0)} 度，权重 B ${format(weightB, 2)}`}>
        <rect x={0} y={0} width={320} height={320} fill="#f4f7f0" />
        <line className="axis" x1={20} y1={160} x2={300} y2={160} />
        <line className="axis" x1={160} y1={300} x2={160} y2={20} />

        <line className="vec vec--u" x1={base.x} y1={base.y} x2={pA.x} y2={pA.y} />
        <text x={pA.x + 6} y={pA.y - 6} style={{ fill: '#2f6b8f' }}>跟随骨 A（权重 {format(1 - weightB, 2)}）</text>
        <line className="vec vec--v" x1={base.x} y1={base.y} x2={pB.x} y2={pB.y} />
        <text x={pB.x + 6} y={pB.y + 16} style={{ fill: '#b1712f' }}>跟随骨 B（权重 {format(weightB, 2)}）</text>
        <line className="vec vec--w" x1={base.x} y1={base.y} x2={pF.x} y2={pF.y} strokeWidth={3} />
        <text x={pF.x + 8} y={pF.y + 4} style={{ fill: '#3f7d52' }}>实际蒙皮结果</text>
        <circle cx={base.x} cy={base.y} r={4} fill="#5b6c60" />

        <text x={12} y={286} style={{ fontSize: 10 }}>时间轴</text>
        <line x1={80} y1={282} x2={300} y2={282} stroke="#b6c2b4" strokeWidth={2} />
        {keyframes.map((key) => <g key={key.time}>
          <rect x={80 + key.time * 220 - 4} y={276} width={8} height={12} fill="#8c6f45" />
          <text x={80 + key.time * 220 - 8} y={304} style={{ fontSize: 9 }}>{key.time}</text>
        </g>)}
        <rect x={80 + time * 220 - 3} y={274} width={6} height={16} fill="#2f6b8f" />
        <text x={12} y={314} style={{ fontSize: 9 }}>当前落在第 {pose.index + 1}—{pose.index + 2} 个关键帧之间（插值 {format(pose.u, 2)}）</text>
      </svg>

      <Slider label="骨 B 权重（骨 A = 1 − w）" min={0} max={1} step={0.05} value={weightB} onChange={(value) => { setWeightB(value); setTouched(true); }} />
      <Slider label="动画时间" min={0} max={1} step={0.01} value={time} onChange={(value) => { setTime(value); setTouched(true); }} />

      <Readout items={[
        ['骨 A 角度', `${format(pose.boneA, 1)}°`],
        ['骨 B 角度', `${format(pose.boneB, 1)}°`],
        ['蒙皮后位置', `(${format(final[0])}, ${format(final[1])}, ${format(final[2])})`],
        ['权重和', format(1, 1)],
        ['所在关键帧区间', `${pose.index + 1} → ${pose.index + 2}`],
      ]} />
      <p className="draggable-note">矩阵调色板存每根骨骼的 offsetTransform · toRoot；这里只演示两根骨骼的简化版。</p>
    </ActivityFrame>
  );
}
