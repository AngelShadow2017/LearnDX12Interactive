import { useState } from 'react';
import { ActivityFrame } from '@/activities/ActivityFrame';
import { Readout, Slider, svgPoint } from '@/activities/controls';
import { format, normalize, quatFromAxisAngle, quatToMatrix, transformDirection, vec3 } from '@/activities/math';

const UNIT = 46;

/** 22.2–22.3 后的推演：拖动旋转轴和角度，观察四元数与物体朝向。 */
export function QuaternionRotationActivity() {
  const [axisAngle, setAxisAngle] = useState(35);
  const [tilt, setTilt] = useState(20);
  const [useAxis, setUseAxis] = useState(true);
  const [touched, setTouched] = useState(false);

  const radians = (axisAngle * Math.PI) / 180;
  const tiltRadians = (tilt * Math.PI) / 180;
  const axis = useAxis
    ? normalize(vec3(Math.sin(tiltRadians) * Math.cos(radians), Math.sin(tiltRadians) * Math.sin(radians), Math.cos(tiltRadians)))
    : vec3(0, 0, 1);
  const q = quatFromAxisAngle(axis, radians);
  const rotation = quatToMatrix(q);

  const basis = [vec3(1, 0, 0), vec3(0, 1, 0), vec3(0, 0, 1)].map((v) => transformDirection(rotation, v));
  const center = svgPoint(0, 0, UNIT);
  const tips = basis.map((v) => svgPoint(v[0] * 1.2, v[1] * 1.2, UNIT));
  const axisTip = svgPoint(axis[0] * 1.35, axis[1] * 1.35, UNIT);

  function reset() {
    setAxisAngle(35);
    setTilt(20);
    setUseAxis(true);
    setTouched(false);
  }

  return (
    <ActivityFrame
      id="ch22-quat-rotation"
      chapterId="ch22"
      title="拖动旋转轴和角度"
      prompt="拖动角度和轴的倾角。红/绿/蓝三条线是物体旋转后的三条基轴——它们始终两两正交，这就是四元数保持旋转性质的原因。"
      predict={{
        question: '为什么用四元数表示旋转不会像欧拉角那样出现「万向锁」？',
        options: ['因为四元数有六个自由度', '因为四元数始终保持单位长度，旋转矩阵由它导出时不会出现矩阵退化', '因为四元数不能插值', '因为四元数只表示旋转不表示缩放'],
        answer: 1,
        correctNote: '单位四元数构成一个流形，绕任意轴旋转都良定义，不会出现矩阵退化。',
        wrongNote: '万向锁来自欧拉角的参数化（两个旋转轴重合）。四元数只有 3 个自由度且始终保持单位长度，所以没有这个问题。',
      }}
      onReset={reset}
      check={() => {
        if (!touched) return { passed: false, feedback: '先拖动角度或轴的倾角，观察三条基轴怎么转，再检查。' };
        return {
          passed: true,
          feedback: `旋转轴 (${format(axis[0])}, ${format(axis[1])}, ${format(axis[2])})，角度 ${axisAngle}°，四元数 (x, y, z, w) = (${format(q[0])}, ${format(q[1])}, ${format(q[2])}, ${format(q[3])})。导出矩阵的三个列向量仍两两正交、长度为 1。`,
        };
      }}
      explanation={<>
        <p>复数乘法等价于「旋转 + 缩放」（图 22.4），所以它只能表达平面内的旋转。要表达 3D 旋转，需要推广到四元数。</p>
        <p>单位四元数 <b>q = (x, y, z, w)</b> 与「绕单位轴 n 转 θ」的对应关系是：</p>
        <div className="math-block">q = (n·sin(θ/2), cos(θ/2))<small>前三个分量是 (x, y, z)，第四个是 w；n 必须是单位向量</small></div>
        <p>关键性质：<code>‖q‖ = 1</code>。在精确算术中，单位四元数相乘仍保持单位长度；实际浮点误差会累积，长时间复合旋转时仍可能需要重新归一化。四元数不会遇到欧拉角参数化的万向锁。</p>
        <p>四元数乘法可交换吗？不能：<code>q₁·q₂ ≠ q₂·q₁</code>（对应旋转的复合顺序）。但它满足结合律，因此可以像矩阵一样预乘。</p>
      </>}
      apply={<p>DirectXMath：<code>XMQuaternionRotationAxis</code> 构造、<code>XMQuaternionMultiply</code> 复合、<code>XMQuaternionRotationMatrix</code> 转成矩阵、<code>XMQuaternionNormalize</code> 归一化。</p>}
    >
      <svg className="svg-stage" viewBox="0 0 320 320" role="img"
        aria-label={`绕轴 (${format(axis[0])}, ${format(axis[1])}, ${format(axis[2])}) 旋转 ${axisAngle} 度`}>
        <rect x={0} y={0} width={320} height={320} fill="#f4f7f0" />
        <g className="plane-grid">
          {Array.from({ length: 15 }, (_unused, index) => index - 7).map((index) => <g key={index}>
            <line x1={160 + index * UNIT} y1={0} x2={160 + index * UNIT} y2={320} />
            <line x1={0} y1={160 - index * UNIT} x2={320} y2={160 - index * UNIT} />
          </g>)}
        </g>
        <line className="axis" x1={20} y1={160} x2={300} y2={160} />
        <line className="axis" x1={160} y1={300} x2={160} y2={20} />

        <line stroke="#ba9148" strokeWidth={2} strokeDasharray="6 3" x1={center.x} y1={center.y} x2={axisTip.x} y2={axisTip.y} />
        <text x={axisTip.x + 6} y={axisTip.y - 6} style={{ fill: '#ba9148' }}>n</text>

        {tips.map((tip, index) => <g key={index}>
          <line x1={center.x} y1={center.y} x2={tip.x} y2={tip.y}
            stroke={['#c0392b', '#3f7d52', '#2f6b8f'][index]} strokeWidth={2.6} />
          <text x={tip.x + 6} y={tip.y - 6} style={{ fill: ['#c0392b', '#3f7d52', '#2f6b8f'][index] }}>
            {['x′', 'y′', 'z′'][index]}
          </text>
        </g>)}
        <circle cx={center.x} cy={center.y} r={4} fill="#5b6c60" />
      </svg>

      <Slider label="旋转角度" min={-180} max={180} step={1} value={axisAngle} onChange={(value) => { setAxisAngle(value); setTouched(true); }} format={(value) => `${value}°`} />
      <Slider label="旋转轴倾角" min={0} max={180} step={1} value={tilt} onChange={(value) => { setTilt(value); setTouched(true); }} format={(value) => `${value}°`} />
      <div className="activity__actions">
        <button className={`button ${useAxis ? 'button--accent' : 'button--outline'}`} type="button"
          onClick={() => { setUseAxis(true); setTilt(20); setTouched(true); }}>绕任意轴</button>
        <button className={`button ${!useAxis ? 'button--accent' : 'button--outline'}`} type="button"
          onClick={() => { setUseAxis(false); setTouched(true); }}>只绕 +z</button>
      </div>

      <Readout items={[
        ['旋转轴 n', `(${format(axis[0])}, ${format(axis[1])}, ${format(axis[2])})`],
        ['四元数 (x, y, z, w)', `(${format(q[0])}, ${format(q[1])}, ${format(q[2])}, ${format(q[3])})`],
        ['‖q‖', format(Math.hypot(q[0], q[1], q[2], q[3]), 3)],
        ['旋转后 x′', `(${format(basis[0][0])}, ${format(basis[0][1])}, ${format(basis[0][2])})`],
      ]} />
    </ActivityFrame>
  );
}
