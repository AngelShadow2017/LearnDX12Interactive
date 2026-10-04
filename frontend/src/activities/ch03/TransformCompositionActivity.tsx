import { useMemo, useState } from 'react';
import { ActivityFrame } from '@/activities/ActivityFrame';
import { Choice, MatrixGrid, Readout, Slider, svgPoint } from '@/activities/controls';
import { format, multiply, rotationZ, scaling, transformPoint, translation, vec3, type Mat4 } from '@/activities/math';

const UNIT = 34;

type Order = 'S·R·T' | 'R·S·T' | 'S·T·R' | 'T·S·R' | 'R·T·S' | 'T·R·S';

/** 棋子的简化轮廓（本地坐标），书里用它演示缩放 / 旋转 / 平移的组合。 */
const piece: Array<[number, number]> = [
  [-0.5, -1], [0.5, -1], [0.35, -0.2], [0.7, 0.15], [0.3, 0.35],
  [0.3, 0.7], [0.55, 0.95], [0, 1.25], [-0.55, 0.95], [-0.3, 0.7],
  [-0.3, 0.35], [-0.7, 0.15], [-0.35, -0.2],
];

const tipLocal = vec3(0, 1.25, 0);

/** 3.3 后的推演：调整缩放、旋转、平移的顺序，预测棋子的最终位置。 */
export function TransformCompositionActivity() {
  const [order, setOrder] = useState<Order>('S·R·T');
  const [scaleY, setScaleY] = useState(2);
  const [angle, setAngle] = useState(45);
  const [tx, setTx] = useState(3);
  const [ty, setTy] = useState(1);

  const S = useMemo(() => scaling(0.5, scaleY, 1), [scaleY]);
  const R = useMemo(() => rotationZ((angle * Math.PI) / 180), [angle]);
  const T = useMemo(() => translation(tx, ty, 0), [tx, ty]);

  const combined = useMemo(() => {
    const parts: Record<'S' | 'R' | 'T', Mat4> = { S, R, T };
    const sequence = order.split('·') as Array<'S' | 'R' | 'T'>;
    return sequence.reduce<Mat4>((acc, key) => multiply(acc, parts[key]), [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
  }, [order, S, R, T]);

  const tip = transformPoint(combined, tipLocal);
  const target = useMemo(() => transformPoint(multiply(multiply(scaling(0.5, scaleY, 1), rotationZ((angle * Math.PI) / 180)), translation(tx, ty, 0)), tipLocal), [scaleY, angle, tx, ty]);
  const distance = Math.hypot(tip[0] - target[0], tip[1] - target[1]);

  const shape = piece.map(([x, y]) => {
    const result = transformPoint(combined, vec3(x, y, 0));
    return [result[0], result[1]] as [number, number];
  });

  function reset() {
    setOrder('S·R·T');
    setScaleY(2);
    setAngle(45);
    setTx(3);
    setTy(1);
  }

  return (
    <ActivityFrame
      id="ch03-composition"
      chapterId="ch03"
      title="把棋子摆到目标圈里"
      prompt="虚线圆圈是「先缩放 → 再旋转 → 最后平移」应该落到的位置。改变相乘顺序，看棋子尖端跑到哪里去。"
      predict={{
        question: '把标准顺序 S · R · T（先缩放、再旋转、最后平移）换成 R · T · S，棋子的位置会怎样？',
        options: ['完全一样', '不一样：平移量会被缩放影响', '只差一个旋转角', '会跑出画面'],
        answer: 1,
        hint: '行向量下 v · S · R · T 表示先 S 后 R 最后 T。把 T 挪到 S 前面，平移量就会被后面的缩放再乘一次。',
        correctNote: '平移一旦排在缩放之前，就会被缩放继续作用，落点必然改变。',
        wrongNote: '矩阵乘法不交换。把 T 移到 S 前面，平移量还要再被 S 乘一次，落点会变。',
      }}
      onReset={reset}
      check={() => {
        if (distance > 0.12) return { passed: false, feedback: `尖端现在落在 (${format(tip[0])}, ${format(tip[1])})，离目标圈 ${format(distance)}。把顺序切回 S · R · T 再检查。` };
        return {
          passed: true,
          feedback: `尖端落在 (${format(tip[0])}, ${format(tip[1])})，正好在目标圈内。S · R · T 才是「先缩放、再旋转、最后平移」的标准顺序——把这三步预乘成一个矩阵 C，再去变换 20000 个顶点，只要 20000 次向量矩阵乘法加 2 次矩阵乘法。`,
        };
      }}
      explanation={<>
        <p>假设有 20000 个顶点要依次做缩放、旋转、平移。逐步做需要 20000 × 3 次向量矩阵乘法；利用结合律先把三个矩阵乘成 C = SRT，只需要 20000 次向量矩阵乘法外加 2 次矩阵乘法。<b>两次额外的矩阵乘法换来的节省非常划算</b>。</p>
        <p>但要注意：这种合并成立的前提是结合律，而<b>交换律不成立</b>。图 3.9 用几何方式展示了这一点——「先旋转再平移」和「先平移再旋转」得到的是两个不同的位置。</p>
      </>}
      apply={<p>实际代码里就是 <code>XMMATRIX world = S * R * T;</code>，然后每帧只更新这一个矩阵并上传常量缓冲。千万不要在顶点着色器里逐个顶点重算这三个矩阵。</p>}
    >
      <svg className="svg-stage" viewBox="0 0 320 320" role="img"
        aria-label={`棋子在当前顺序 ${order} 下的位置，尖端坐标 ${format(tip[0])} 逗号 ${format(tip[1])}`}>
        <g className="plane-grid">
          {Array.from({ length: 21 }, (_unused, index) => index - 10).map((index) => <g key={index}>
            <line x1={160 + index * UNIT} y1={0} x2={160 + index * UNIT} y2={320} />
            <line x1={0} y1={160 - index * UNIT} x2={320} y2={160 - index * UNIT} />
          </g>)}
        </g>
        <line className="axis" x1={20} y1={160} x2={300} y2={160} />
        <line className="axis" x1={160} y1={300} x2={160} y2={20} />

        <circle className="ghost" cx={svgPoint(target[0], target[1], UNIT).x} cy={svgPoint(target[0], target[1], UNIT).y} r={13}
          fill="none" stroke="#3f7d52" strokeWidth={2} />
        <polygon points={shape.map(([x, y]) => { const p = svgPoint(x, y, UNIT); return `${p.x},${p.y}`; }).join(' ')}
          fill="rgba(47,107,143,.18)" stroke="#2f6b8f" strokeWidth={2} />
        <circle cx={svgPoint(tip[0], tip[1], UNIT).x} cy={svgPoint(tip[0], tip[1], UNIT).y} r={4} fill="#2f6b8f" />
      </svg>
      <p className="draggable-note">绿色虚线圈 = S · R · T 的目标位置；实心点 = 当前尖端实际位置。</p>

      <Choice label="相乘顺序（v · 第一个 · 第二个 · 第三个）" options={[
        { value: 'S·R·T', label: 'S · R · T', hint: '标准顺序' },
        { value: 'R·S·T', label: 'R · S · T', hint: '缩放轴被转走' },
        { value: 'S·T·R', label: 'S · T · R', hint: '整体再转一次' },
        { value: 'T·S·R', label: 'T · S · R', hint: '平移被缩放' },
        { value: 'R·T·S', label: 'R · T · S', hint: '平移、旋转都被缩放' },
        { value: 'T·R·S', label: 'T · R · S', hint: '缩放最后作用' },
      ]} value={order} onChange={setOrder} />

      <Slider label="y 方向缩放" min={0.5} max={3} step={0.1} value={scaleY} onChange={setScaleY} />
      <Slider label="旋转角" min={-180} max={180} step={5} value={angle} onChange={setAngle} format={(value) => `${value}°`} />
      <Slider label="平移 x" min={-4} max={4} step={0.25} value={tx} onChange={setTx} />
      <Slider label="平移 y" min={-4} max={4} step={0.25} value={ty} onChange={setTy} />

      <Readout items={[
        ['尖端实际位置', `(${format(tip[0])}, ${format(tip[1])})`],
        ['目标位置', `(${format(target[0])}, ${format(target[1])})`],
        ['距离', format(distance)],
      ]} />

      <div className="ctl-panel">
        <span className="ctl-panel__title">组合矩阵 C（{order}）</span>
        <MatrixGrid matrix={combined} highlight={[12, 13]} />
      </div>
    </ActivityFrame>
  );
}
