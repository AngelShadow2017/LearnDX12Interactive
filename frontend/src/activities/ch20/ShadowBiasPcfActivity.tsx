import { useState } from 'react';
import { ActivityFrame } from '@/activities/ActivityFrame';
import { Readout, Slider } from '@/activities/controls';
import { format, pcf } from '@/activities/math';

const TAPS = 9;

/** 20.5 后的推演：调偏移与 PCF 核，辨认痤疮、悬浮阴影与柔边。 */
export function ShadowBiasPcfActivity() {
  const [bias, setBias] = useState(0.004);
  const [spread, setSpread] = useState(1);
  const [depthNoise, setDepthNoise] = useState(0.03);

  // 构造一条阴影边界：左边是地面，右边被遮挡
  const buildSamples = (x: number): number[] => Array.from({ length: TAPS }, (_unused, index) => {
    const offset = (index - (TAPS - 1) / 2) * spread;
    // 阴影图深度在边界右侧变小（被遮挡物更近）
    const surfaceDepth = x + offset < 0 ? 0.45 + 0.2 * (x + offset) : 0.2;
    const stored = surfaceDepth - 0.12;
    return stored + (Math.sin((x + offset) * 37) * depthNoise);
  });

  const shade = (x: number): number => {
    const samples = buildSamples(x);
    const fragment = 0.45 + 0.2 * x;
    return pcf(samples, fragment, bias);
  };

  const acne = bias < 0.012 && spread < 1.5;
  const peterPanning = bias > 0.05;
  const aliased = spread < 1.5;

  function reset() {
    setBias(0.004);
    setSpread(1);
    setDepthNoise(0.03);
  }

  const cells = Array.from({ length: 40 }, (_unused, index) => {
    const x = (index / 39) * 1.2 - 0.6;
    return { x, value: shade(x) };
  });

  return (
    <ActivityFrame
      id="ch20-shadow-bias"
      chapterId="ch20"
      title="偏移太小长痤疮，太大会悬浮"
      prompt="把偏移从小往大拖，看阴影边缘从「长满黑点」变成「脱离物体」；再把 PCF 采样间距拉大，看锯齿怎么变成柔边。"
      predict={{
        question: '把深度偏移调得很大，会出现什么伪影？',
        options: ['阴影痤疮（表面布满黑点）', '悬浮阴影（阴影从物体底部脱离）', '阴影变硬', '阴影消失'],
        answer: 1,
        correctNote: '这就是 Peter-Panning：偏移让「本来该在自己身上的阴影」被判定成被照亮，于是阴影整体往后退。',
        wrongNote: '痤疮是偏移太小造成的（表面自遮挡）；偏移太大会造成 Peter-Panning——阴影从物体底部脱离。',
      }}
      onReset={reset}
      check={() => {
        if (bias === 0.004 && spread === 1) return { passed: false, feedback: '先拖动「深度偏移」或「PCF 采样间距」，观察伪影怎么变化，再检查。' };
        return {
          passed: true,
          feedback: `当前偏移 ${format(bias, 3)}${acne ? '（偏小：可能长痤疮）' : ''}${peterPanning ? '（偏大：会出现悬浮阴影）' : ''}，PCF 间距 ${format(spread)}${aliased ? '（偏小：边缘有锯齿）' : '（边缘柔和）'}。阴影痤疮靠偏移治，锯齿靠 PCF 治——两个问题要用两种手段。`,
        };
      }}
      explanation={<>
        <p>偏移必须存在，否则会出现<b>阴影痤疮</b>（图 20.7）：地面自遮挡，明暗交替成条纹。原因是有限分辨率的深度图里，一个纹素覆盖一块区域（图 20.8），这块区域里的深度可能比像素自身更近，于是像素被误判为被遮挡。</p>
        <p>但偏移不能太大：<b>Peter-Panning</b>（图 20.10）会让阴影从物体底部「脱离」甚至消失。</p>
        <p>实践中常用<b>斜率缩放偏移</b>（图 20.11）：表面相对光源越倾斜，需要的偏移越大——因为深度在纹素内的变化越剧烈。</p>
        <p>另一个问题是锯齿：阴影图分辨率有限，一个像素的判定覆盖的是一块区域，所以边界是阶梯状的（图 20.13 上）。<b>PCF</b>（Percentage Closer Filtering）在一个小核里取多个样本求平均（图 20.12），把阶梯抹平。</p>
        <p>书里还讨论了<b>大 PCF 核</b>的问题（图 20.16、20.17）：核太大时，被采样的样本已经不对应被遮挡的区域，比较深度会出错。解决办法之一是分两步：先按水平距离做一次校正，再采样。</p>
      </>}
      apply={<p>HLSL：<code>lerp(1.0f, 0.0f, pcfFactor)</code> 直接乘到光照上。偏移写在光栅器状态里：<code>DepthBias</code>、<code>SlopeScaledDepthBias</code>、<code>DepthBiasClamp</code>。</p>}
    >
      <svg className="svg-stage" viewBox="0 0 320 200" role="img"
        aria-label={`阴影边缘，偏移 ${format(bias, 3)}，PCF 间距 ${format(spread)}`}>
        <rect x={0} y={0} width={320} height={200} fill="#f4f7f0" />
        {cells.map((cell, index) => {
          const value = cell.value;
          const shadeValue = Math.round((0.28 + value * 0.62) * 255);
          return <rect key={index} x={20 + index * 7} y={40} width={7.2} height={110}
            fill={`rgb(${shadeValue}, ${shadeValue}, ${Math.round(shadeValue * 0.94)})`} />;
        })}
        <text x={20} y={28} style={{ fontSize: 10 }}>← 照亮区　|　阴影区 →</text>
        <text x={20} y={172} style={{ fontSize: 10 }}>
          {acne ? '痤疮伪影：偏移偏小、表面自遮挡' : peterPanning ? '悬浮阴影：偏移偏大' : aliased ? '阴影边界有阶梯锯齿' : '边界柔和，无明显伪影'}
        </text>
      </svg>

      <Slider label="深度偏移 bias" min={0} max={0.08} step={0.002} value={bias} onChange={setBias} format={(value) => format(value, 3)} />
      <Slider label="PCF 采样间距" min={0.5} max={6} step={0.25} value={spread} onChange={setSpread} />
      <Slider label="深度噪声（模拟自遮挡误差）" min={0} max={0.08} step={0.005} value={depthNoise} onChange={setDepthNoise} format={(value) => format(value, 3)} />

      <Readout items={[
        ['当前中心点阴影值', format(shade(0), 3)],
        ['痤疮风险', acne ? '高' : '低'],
        ['悬浮风险', peterPanning ? '高' : '低'],
        ['锯齿', aliased ? '明显' : '轻微'],
      ]} />
    </ActivityFrame>
  );
}
