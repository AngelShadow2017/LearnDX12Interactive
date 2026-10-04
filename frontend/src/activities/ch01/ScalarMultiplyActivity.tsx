import { useState } from 'react';
import { ActivityFrame } from '@/activities/ActivityFrame';
import { Readout, Slider } from '@/activities/controls';
import { format } from '@/activities/math';

const source: [number, number] = [2, 1];
const scale = 38;
const center = 160;

function point(vector: [number, number]) {
  return { x: center + vector[0] * scale, y: center - vector[1] * scale };
}

export function ScalarMultiplyActivity() {
  const [factor, setFactor] = useState(-0.5);
  const result: [number, number] = [source[0] * factor, source[1] * factor];
  const sourceTip = point(source);
  const resultTip = point(result);
  const sourceLength = Math.hypot(...source);
  const resultLength = Math.hypot(...result);

  return (
    <ActivityFrame
      id="ch01-scalar-multiply"
      chapterId="ch01"
      title="拖动标量，观察向量翻转与缩放"
      prompt="从书里的 v = (2, 1) 和 k = −½ 开始。把 k 调成正数、0 和绝对值大于 1 的负数，分别观察方向和长度。"
      predict={{
        question: 'k 从 −½ 改成 −1 时，结果向量会怎样？',
        options: ['方向反转，长度加倍', '方向不变，长度加倍', '方向反转，长度减半', '变成零向量'],
        answer: 0,
        hint: '标量的正负决定方向是否翻转，绝对值决定长度乘多少。',
        correctNote: '−1 的绝对值是 1，所以长度不变；相对 −½ 来说，长度是它的两倍。',
        wrongNote: '把符号和绝对值分开看：负号让方向翻转，|−1|=1 让长度保持为原长。',
      }}
      onReset={() => setFactor(-0.5)}
      check={() => ({
        passed: true,
        feedback: `现在 k=${format(factor)}，结果是 (${format(result[0])}, ${format(result[1])})，长度 ${format(resultLength)}。再试 k=0 和 k=1，对照「零向量」与「原向量」。`,
      })}
      explanation={<>
        <p>逐分量乘标量：k(x, y) = (kx, ky)。k &gt; 0 时方向保持；k &lt; 0 时整支向量翻转；|k| 决定长度缩放比例；k = 0 时结果是零向量。</p>
        <p>本例中 −½(2, 1) = (−1, −½)，所以箭头与原向量相反，长度是原来的 ½。注意负号同时作用于两个分量。</p>
      </>}
      apply={<p>DirectXMath 可用 <code>XMVectorScale(v, k)</code> 做标量乘法。若代码里只对一个分量取负，得到的会是镜像后的另一个方向，不是 −v。</p>}
    >
      <svg className="svg-stage" viewBox="0 0 320 320" role="img"
        aria-label={`原向量 (2, 1)，标量 ${format(factor)}，结果 (${format(result[0])}, ${format(result[1])})`}>
        <defs>
          <marker id="scalar-arrow-source" markerWidth="7" markerHeight="7" refX="5" refY="3.5" orient="auto">
            <path d="M0,0 L7,3.5 L0,7 Z" fill="#99a69c" />
          </marker>
          <marker id="scalar-arrow-result" markerWidth="7" markerHeight="7" refX="5" refY="3.5" orient="auto">
            <path d="M0,0 L7,3.5 L0,7 Z" fill="#3e9470" />
          </marker>
        </defs>
        <g className="plane-grid">
          {Array.from({ length: 9 }, (_unused, index) => index - 4).map((index) => <g key={index}>
            <line x1={center + index * scale} y1="0" x2={center + index * scale} y2="320" />
            <line x1="0" y1={center - index * scale} x2="320" y2={center - index * scale} />
          </g>)}
        </g>
        <line className="axis" x1="18" y1={center} x2="302" y2={center} />
        <line className="axis" x1={center} y1="302" x2={center} y2="18" />
        <text x="285" y={center - 7}>+x</text><text x={center + 7} y="27">+y</text>
        <line x1={center} y1={center} x2={sourceTip.x} y2={sourceTip.y} stroke="#99a69c" strokeWidth="3" strokeDasharray="6 5" markerEnd="url(#scalar-arrow-source)" />
        <line x1={center} y1={center} x2={resultTip.x} y2={resultTip.y} stroke="#3e9470" strokeWidth="4" markerEnd="url(#scalar-arrow-result)" />
        <circle cx={resultTip.x} cy={resultTip.y} r="4" fill="#3e9470" />
        <text x={sourceTip.x + 8} y={sourceTip.y - 7} style={{ fill: '#768379' }}>v</text>
        <text x={resultTip.x + (factor < 0 ? -18 : 8)} y={resultTip.y + (factor < 0 ? 16 : -7)} style={{ fill: '#27745b' }}>kv</text>
      </svg>
      <Slider label="标量 k" min={-2} max={2} step={0.25} value={factor} onChange={setFactor} format={(value) => format(value)} />
      <Readout items={[
        ['输入向量 v', '(2, 1)'],
        ['标量 k', format(factor)],
        ['结果 kv', `(${format(result[0])}, ${format(result[1])})`],
        ['结果长度', format(resultLength)],
        ['原长度', format(sourceLength)],
      ]} />
      <p className="draggable-note">灰色虚线是 v，绿色实线是 kv。试 k = −½、−1、0 和 2，分别对照翻转、等长、归零与拉长。</p>
    </ActivityFrame>
  );
}
