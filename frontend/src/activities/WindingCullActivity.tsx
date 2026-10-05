import { useState } from 'react';
import { ActivityFrame } from '@/activities/ActivityFrame';
import { Choice, Readout, svgPoint } from '@/activities/controls';

const UNIT = 58;

type Cull = 'none' | 'back' | 'front';
type Winding = 'cw' | 'ccw';

const vertices: Array<[number, number]> = [[-1, -0.8], [1.2, -0.6], [0.2, 1.1]];

/** 5.10 后的推演：翻转三角形绕序，预测背面剔除的结果。 */
export function WindingCullActivity() {
  const [winding, setWinding] = useState<Winding>('cw');
  const [cull, setCull] = useState<Cull>('back');
  const [flipped, setFlipped] = useState(false);

  const order = winding === 'cw' ? [vertices[2], vertices[1], vertices[0]] : vertices;

  // 屏幕空间有向面积：正值对应绘制目标上的顺时针绕序。
  const signedArea = (a: [number, number], b: [number, number], c: [number, number]) =>
    (b[0] - a[0]) * (c[1] - a[1]) - (c[0] - a[0]) * (b[1] - a[1]);

  const area = signedArea(order[0], order[1], order[2]);
  // FrontCounterClockwise = false：绘制目标上的顺时针绕序是正面。
  const isFrontFace = area > 0;

  let visible = true;
  if (cull === 'back' && !isFrontFace) visible = false;
  if (cull === 'front' && isFrontFace) visible = false;

  function reset() {
    setWinding('cw');
    setCull('back');
    setFlipped(false);
  }

  const points = order.map(([x, y]) => { const p = svgPoint(x, y, UNIT); return `${p.x},${p.y}`; }).join(' ');

  return (
    <ActivityFrame
      id="ch05-winding-cull"
      chapterId="ch05"
      title="翻转绕序，看三角形什么时候消失"
      prompt="先把绕序翻成「逆时针」，三角形会在默认剔除设置下消失。再用剔除模式让它重新出现。"
      predict={{
        question: '默认剔除背面（CullMode = BACK）时，把三角形的顶点顺序翻转，会发生什么？',
        options: ['画面不变', '三角形消失', '三角形颜色变暗', '只有一半三角形被画出来'],
        answer: 1,
        hint: '背面剔除是在光栅化阶段按绕序判定的，改矩阵或改相机不会改变绕序本身。',
        correctNote: '绕序翻转后这个三角形被判为背面，于是被整片剔除。',
        wrongNote: '绕序决定正/背面，背面被剔除时整片三角形都不会被光栅化。',
      }}
      onReset={reset}
      check={() => {
        if (!flipped) return { passed: false, feedback: '先把「顶点绕序」切成逆时针（相当于翻转顶点顺序），观察三角形是否消失，再检查。' };
        if (!visible) return { passed: false, feedback: '现在三角形被剔除了。把剔除模式改成「不剔除」或「剔除正面」，让它重新显示出来再检查。' };
        return {
          passed: true,
          feedback: `翻转绕序后它变成了${isFrontFace ? '正面' : '背面'}，把剔除模式设为「${cull === 'none' ? '不剔除' : '剔除正面'}」就又画出来了。这解释了「改了顶点顺序，物体就消失」这类问题。`,
        };
      }}
      explanation={<>
        <p>绕序（winding）是<b>在光栅化阶段</b>判定的：把三角形三个顶点按屏幕空间顺序算有向面积，符号决定它是正面还是背面。</p>
        <p>D3D12 默认是 <code>CullMode = BACK</code> 且 <code>FrontCounterClockwise = FALSE</code>，也就是<b>顺时针为正面</b>（从相机看）。图 5.30 直观展示了正面与背面三角形的区别。</p>
        <p>关键的一点：<b>改矩阵或改相机不会改变绕序本身</b>。绕序是顶点顺序的固有属性，只有换顶点顺序、改 <code>FrontCounterClockwise</code> 或关闭剔除才能改变判定结果。</p>
        <p>图 5.32 说明了为什么实心物体只画正面：省掉一半光栅化和像素着色开销。</p>
      </>}
      apply={<p>PSO 里的 <code>D3D12_RASTERIZER_DESC</code> 控制它：<code>CullMode</code> 与 <code>FrontCounterClockwise</code>。改了顶点顺序却没改这两项，物体就会莫名消失——这是排查「物体不见了」的第一步。</p>}
    >
      <svg className="svg-stage" viewBox="0 0 320 320" role="img"
        aria-label={`三角形绕序 ${winding}，剔除模式 ${cull}，当前${visible ? '可见' : '被剔除'}`}>
        <g className="plane-grid">
          {Array.from({ length: 13 }, (_unused, index) => index - 6).map((index) => <g key={index}>
            <line x1={160 + index * UNIT} y1={0} x2={160 + index * UNIT} y2={320} />
            <line x1={0} y1={160 - index * UNIT} x2={320} y2={160 - index * UNIT} />
          </g>)}
        </g>
        <polygon points={points}
          fill={visible ? 'rgba(47,107,143,.2)' : 'none'}
          stroke={visible ? '#2f6b8f' : '#b9c2b6'}
          strokeWidth={2}
          strokeDasharray={visible ? undefined : '5 4'} />
        {order.map(([x, y], index) => {
          const p = svgPoint(x, y, UNIT);
          return <g key={index}>
            <circle cx={p.x} cy={p.y} r={5} fill={visible ? '#2f6b8f' : '#c3ccc2'} />
            <text x={p.x + 8} y={p.y + 4}>v{index}</text>
          </g>;
        })}
        {!visible && <text x={160} y={300} textAnchor="middle">整片三角形被剔除，不会进入像素着色器</text>}
      </svg>

      <Choice label="顶点绕序" options={[
        { value: 'cw', label: 'v2 → v1 → v0（顺时针）' },
        { value: 'ccw', label: 'v0 → v1 → v2（逆时针）' },
      ]} value={winding} onChange={(next) => { setWinding(next); setFlipped(next === 'ccw'); }} />
      <Choice label="剔除模式（CullMode）" options={[
        { value: 'back', label: '剔除背面', hint: 'D3D12 默认值' },
        { value: 'front', label: '剔除正面' },
        { value: 'none', label: '不剔除' },
      ]} value={cull} onChange={setCull} />

      <Readout items={[
        ['有向面积符号', area > 0 ? '正' : '负'],
        ['判定为', isFrontFace ? '正面' : '背面'],
        ['是否可见', visible ? '可见' : '被剔除'],
      ]} />
      <p className="draggable-note">这里按 SVG 坐标系（y 向下）计算有向面积，并已换算成 D3D12 默认的「顺时针为正面」约定。</p>
    </ActivityFrame>
  );
}
