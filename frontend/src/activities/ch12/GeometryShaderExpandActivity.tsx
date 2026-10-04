import { useState } from 'react';
import { ActivityFrame } from '@/activities/ActivityFrame';
import { Readout, Slider, svgPoint } from '@/activities/controls';
import { format } from '@/activities/math';

const UNIT = 46;

/** 12.1 后的推演：逐步把一个输入点扩成四边形，显示几何着色器输出的顶点。 */
export function GeometryShaderExpandActivity() {
  const [step, setStep] = useState(0);
  const [width, setWidth] = useState(2);
  const [height, setHeight] = useState(3);

  const hw = width / 2;
  const hh = height / 2;
  const corners: Array<[number, number]> = [[-hw, -hh], [hw, -hh], [-hw, hh], [hw, hh]];

  const steps = [
    { title: '第 1 步：输入是一个点', text: 'VS 输出一个顶点（这里是点 P，世界坐标 (0, 0, 0)）。GS 拿到的输入图元是「一个点」。' },
    { title: '第 2 步：建立局部坐标系', text: 'GS 用相机的 right / up / look 三个轴构造广告牌的局部坐标系，这样 quad 才能正对相机。' },
    { title: '第 3 步：算出 4 个输出顶点', text: `按局部坐标系 ±right·w/2 ± up·h/2 得到 4 个顶点，再用世界矩阵变换到世界空间。这是 GS 的「扩顶点」。` },
    { title: '第 4 步：以三角形条带输出', text: '4 个顶点按条带顺序 (0,1,2,3) 送出，被组装成 2 个三角形。一次 Append 一个顶点，RestartStrip 可以开始新的条带。' },
  ];

  function reset() {
    setStep(0);
    setWidth(2);
    setHeight(3);
  }

  return (
    <ActivityFrame
      id="ch12-gs-expand"
      chapterId="ch12"
      title="把一个点扩成四边形"
      prompt="点「下一步」逐步展开几何着色器做的事；也可以随时改宽高，看 4 个输出顶点的坐标怎么变。"
      predict={{
        question: '几何着色器输入一个点、输出一个四边形，它一共要 Append 几个顶点？',
        options: ['1 个', '2 个', '4 个', '取决于索引缓冲'],
        answer: 2,
        hint: '四边形有 4 个角；以三角形条带输出时条带里的顶点数就是 4。',
        correctNote: '4 个角 = 4 个顶点，按条带顺序输出后被组装成 2 个三角形。',
        wrongNote: '四边形四个角各需要一个顶点，条带输出共 4 个顶点，硬件再拆成 2 个三角形。',
      }}
      onReset={reset}
      check={() => {
        if (step < steps.length - 1) return { passed: false, feedback: '还有步骤没走完。点「下一步」一直到第 4 步，再检查。' };
        return {
          passed: true,
          feedback: `输出顶点：${corners.map(([x, y]) => `(${format(x)}, ${format(y)})`).join('、')}。GS 一次调用最多能输出的顶点数是有限制的（maxvertexcount），输出过多会被截断。`,
        };
      }}
      explanation={<>
        <p>几何着色器以<b>整个图元</b>为输入，可以增删顶点（图 12.6）。这是它和顶点着色器最本质的区别。</p>
        <p>声明形如 <code>[maxvertexcount(4)] void GS(point VertexOut gin[1], inout TriangleStream&lt;GeoOut&gt; stream)</code>：<code>maxvertexcount</code> 必须给出，它决定这一次调用最多能输出多少顶点。</p>
        <p>输出用 <code>stream.Append(...)</code> 逐个追加，用 <code>stream.RestartStrip()</code> 开始新的条带。</p>
        <p>要注意性能：GS 会打破顶点的后变换缓存复用，在多数硬件上并不便宜。能用实例化或预生成网格解决的场景，通常不该用 GS。</p>
      </>}
      apply={<p>广告牌这一节就是典型用法：CPU 只提交一个点（树的位置），GS 在 GPU 上把它扩成朝向相机的 quad，省掉了每帧更新顶点缓冲。</p>}
    >
      <svg className="svg-stage" viewBox="0 0 320 320" role="img"
        aria-label={`几何着色器展开步骤 ${step + 1}：${steps[step].title}`}>
        <g className="plane-grid">
          {Array.from({ length: 15 }, (_unused, index) => index - 7).map((index) => <g key={index}>
            <line x1={160 + index * UNIT} y1={0} x2={160 + index * UNIT} y2={320} />
            <line x1={0} y1={160 - index * UNIT} x2={320} y2={160 - index * UNIT} />
          </g>)}
        </g>
        <line className="axis" x1={20} y1={160} x2={300} y2={160} />
        <line className="axis" x1={160} y1={300} x2={160} y2={20} />

        {step >= 0 && <circle cx={svgPoint(0, 0, UNIT).x} cy={svgPoint(0, 0, UNIT).y} r={5} fill="#2f6b8f" />}
        {step >= 1 && <>
          <line stroke="#8fa8bf" strokeWidth={1.6} x1={svgPoint(0, 0, UNIT).x} y1={svgPoint(0, 0, UNIT).y} x2={svgPoint(hw + 0.6, 0, UNIT).x} y2={svgPoint(hw + 0.6, 0, UNIT).y} />
          <line stroke="#c39a63" strokeWidth={1.6} x1={svgPoint(0, 0, UNIT).x} y1={svgPoint(0, 0, UNIT).y} x2={svgPoint(0, hh + 0.6, UNIT).x} y2={svgPoint(0, hh + 0.6, UNIT).y} />
          <text x={svgPoint(hw + 0.7, 0, UNIT).x} y={svgPoint(hw + 0.7, 0, UNIT).y - 6}>right</text>
          <text x={svgPoint(0, hh + 0.7, UNIT).x + 6} y={svgPoint(0, hh + 0.7, UNIT).y}>up</text>
        </>}
        {step >= 2 && corners.map(([x, y], index) => {
          const p = svgPoint(x, y, UNIT);
          return <g key={index}><circle cx={p.x} cy={p.y} r={5} fill="#fff" stroke="#3f7d52" strokeWidth={2} /><text x={p.x + 7} y={p.y - 6}>v{index}</text></g>;
        })}
        {step >= 3 && <polygon points={corners.map(([x, y]) => { const p = svgPoint(x, y, UNIT); return `${p.x},${p.y}`; }).join(' ')}
          fill="rgba(63,125,82,.16)" stroke="#3f7d52" strokeWidth={2} />}
      </svg>

      <div className="ctl-panel">
        <span className="ctl-panel__title">{steps[step].title}</span>
        <p style={{ margin: 0, fontSize: 12, lineHeight: 1.8, color: '#4d5f54' }}>{steps[step].text}</p>
        <div className="activity__actions">
          <button className="button button--quiet" type="button" disabled={step === 0} onClick={() => setStep((value) => value - 1)}>← 上一步</button>
          <button className="button button--outline" type="button" disabled={step === steps.length - 1} onClick={() => setStep((value) => value + 1)}>下一步 →</button>
        </div>
      </div>

      <Slider label="quad 宽度" min={0.5} max={4} step={0.1} value={width} onChange={setWidth} />
      <Slider label="quad 高度" min={0.5} max={4} step={0.1} value={height} onChange={setHeight} />

      <Readout items={[
        ['输出顶点数', step >= 2 ? '4' : '0'],
        ['组装出的三角形', step >= 3 ? '2' : '0'],
        ['输出图元类型', 'TriangleStream'],
        ...corners.map(([x, y], index) => [`v${index}`, `(${format(x)}, ${format(y)})`] as [string, string]),
      ]} />
    </ActivityFrame>
  );
}
