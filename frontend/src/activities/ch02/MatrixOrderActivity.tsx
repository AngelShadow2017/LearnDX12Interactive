import { useMemo, useState } from 'react';
import { ActivityFrame } from '@/activities/ActivityFrame';
import { Choice, MatrixGrid, Readout, Slider, svgPoint } from '@/activities/controls';
import { format, multiply, rotationZ, scaling, transformDirection, translation, vec3, type Mat4 } from '@/activities/math';

const UNIT = 40;

type Order = 'S·R' | 'R·S';
type Second = 'rotation' | 'translation';

/** 2.2 后的推演：矩阵乘法不满足交换律，顺序不同结果不同。 */
export function MatrixOrderActivity() {
  const [order, setOrder] = useState<Order>('S·R');
  const [second, setSecond] = useState<Second>('rotation');
  const [angle, setAngle] = useState(45);
  const [seen, setSeen] = useState<Order[]>(['S·R']);

  const scaleMatrix = useMemo(() => scaling(0.5, 2, 1), []);
  const other: Mat4 = useMemo(
    () => (second === 'rotation' ? rotationZ((angle * Math.PI) / 180) : translation(2, 1, 0)),
    [second, angle],
  );

  // 行向量约定：v · A · B 表示先施加 A 再施加 B。
  const combined = useMemo(() => (order === 'S·R' ? multiply(scaleMatrix, other) : multiply(other, scaleMatrix)), [order, scaleMatrix, other]);
  const swapped = useMemo(() => (order === 'S·R' ? multiply(other, scaleMatrix) : multiply(scaleMatrix, other)), [order, scaleMatrix, other]);

  const square: Array<[number, number]> = [[-1, -1], [1, -1], [1, 1], [-1, 1]];
  const shape = (matrix: Mat4) => square.map(([x, y]) => {
    const result = transformDirection(matrix, vec3(x, y, 0));
    return [result[0], result[1]] as [number, number];
  });

  const current = shape(combined);
  const alternative = shape(swapped);
  const probe = transformDirection(combined, vec3(1, 1, 0));

  function choose(next: Order) {
    setOrder(next);
    setSeen((list) => (list.includes(next) ? list : [...list, next]));
  }

  function reset() {
    setOrder('S·R');
    setSeen(['S·R']);
    setAngle(45);
    setSecond('rotation');
  }

  const label = second === 'rotation' ? `旋转 ${angle}°` : '平移 (2, 1)';

  return (
    <ActivityFrame
      id="ch02-matrix-order"
      chapterId="ch02"
      title="换一下相乘顺序，看看结果差在哪"
      prompt={`当前第二个变换是${label}。把顺序切成另一种，比较实线（当前顺序）和虚线（另一种顺序）的形状。`}
      predict={{
        question: '把「先缩放再旋转」换成「先旋转再缩放」，最终形状会怎样？',
        options: ['完全一样', '不一样：缩放会作用在被旋转过的方向上', '只差一个平移量', '只有旋转角大于 90° 时才不同'],
        answer: 1,
        hint: '矩阵乘法不满足交换律：AB ≠ BA。缩放不是各向同性时，先转再缩放会把缩放方向也转走。',
        correctNote: '缩放是各向异性的（x 缩一半、y 放大两倍），所以先旋转会让缩放轴跟着转，结果不同。',
        wrongNote: '矩阵乘法不满足交换律。书上明确写道：AB ≠ BA in general。这里的缩放各向异性，换顺序一定看得出差别。',
      }}
      onReset={reset}
      check={() => {
        if (seen.length < 2) return { passed: false, feedback: `现在只看了「${order}」这一种顺序。切成另一种，比较两种形状之后再检查。` };
        return {
          passed: true,
          feedback: `顶点 (1, 1) 在「${order}」下落到 (${format(probe[0])}, ${format(probe[1])})，换顺序后落点不同。这就是矩阵乘法不满足交换律的直接后果：v · A · B 与 v · B · A 一般是两个不同的向量。`,
        };
      }}
      explanation={<>
        <p>矩阵乘法有分配律和<b>结合律</b>：(AB)C = A(B + C) 这类性质成立，但<b>交换律不成立</b>——一般 AB ≠ BA。书上甚至举了一个连 BA 都无定义的例子（A 的列数与 B 的行数不等）。</p>
        <p>对图形编程来说，真正要记住的是这一条：因为 DirectXMath 用行向量，<code>v · S · R</code> 表示<b>先施加 S 再施加 R</b>。写反了顺序，物体会以另一种方式被摆放。</p>
        <p>一个特例值得记住：如果两个变换<b>同类</b>（比如两次平移、或两次绕同一轴的旋转、或各向同性缩放），顺序才不影响结果。</p>
      </>}
      apply={<p>在 HLSL 和 C++ 里都要小心：<code>XMMatrixMultiply(A, B)</code> 得到的是 A·B，配合行向量使用就是「先 A 后 B」。把世界矩阵写成 <code>Scale · Rotate · Translate</code> 才是标准的「先缩放、再旋转、最后平移」。</p>}
    >
      <svg className="svg-stage" viewBox="0 0 320 320" role="img"
        aria-label={`实线为当前顺序 ${order} 的结果，虚线为另一种顺序的结果`}>
        <g className="plane-grid">
          {Array.from({ length: 17 }, (_unused, index) => index - 8).map((index) => <g key={index}>
            <line x1={160 + index * UNIT} y1={0} x2={160 + index * UNIT} y2={320} />
            <line x1={0} y1={160 - index * UNIT} x2={320} y2={160 - index * UNIT} />
          </g>)}
        </g>
        <line className="axis" x1={20} y1={160} x2={300} y2={160} />
        <line className="axis" x1={160} y1={300} x2={160} y2={20} />

        <polygon className="ghost" points={alternative.map(([x, y]) => { const p = svgPoint(x, y, UNIT); return `${p.x},${p.y}`; }).join(' ')}
          fill="none" stroke="#b08a4a" strokeWidth={2} />
        <polygon points={current.map(([x, y]) => { const p = svgPoint(x, y, UNIT); return `${p.x},${p.y}`; }).join(' ')}
          fill="rgba(47,107,143,.16)" stroke="#2f6b8f" strokeWidth={2.4} />
        <circle cx={svgPoint(0, 0, UNIT).x} cy={svgPoint(0, 0, UNIT).y} r={3} fill="#5b6c60" />
      </svg>
      <p className="draggable-note">实线 = 当前顺序（{order}）；虚线 = 另一种顺序。单位正方形为原始形状。</p>

      <Choice label="第二个变换" options={[
        { value: 'rotation', label: '旋转', hint: '各向异性时差别明显' },
        { value: 'translation', label: '平移 (2, 1)', hint: '平移量也会被缩放' },
      ]} value={second} onChange={setSecond} />
      <Choice label="相乘顺序（v · 第一个 · 第二个）" options={[
        { value: 'S·R', label: `先缩放，再${second === 'rotation' ? '旋转' : '平移'}` },
        { value: 'R·S', label: `先${second === 'rotation' ? '旋转' : '平移'}，再缩放` },
      ]} value={order} onChange={choose} />
      {second === 'rotation' && <Slider label="旋转角" min={-180} max={180} step={5} value={angle} onChange={setAngle} format={(value) => `${value}°`} />}

      <Readout items={[
        ['当前顺序', order],
        ['顶点 (1,1) → ', `(${format(probe[0])}, ${format(probe[1])})`],
        ['已试过的顺序', `${seen.length} / 2`],
      ]} />

      <div className="ctl-panel">
        <span className="ctl-panel__title">组合后的矩阵（{order}）</span>
        <MatrixGrid matrix={combined} highlight={[12, 13, 14, 15]} />
      </div>
    </ActivityFrame>
  );
}
