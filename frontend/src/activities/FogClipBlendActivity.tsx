import { useState } from 'react';
import { ActivityFrame } from '@/activities/ActivityFrame';
import { Choice, Readout, Slider } from '@/activities/controls';

type Mode = 'blend' | 'clip' | 'fog';

const posts = [
  { distance: 2, height: 96 },
  { distance: 6, height: 82 },
  { distance: 10, height: 70 },
  { distance: 14, height: 60 },
  { distance: 18, height: 52 },
];

const postColor = '#7a5a3a';
const fogColor = '#c9d6cf';

/** 10.7–10.8 后的推演：对比透明混合、alpha 裁剪与雾效各自解决什么问题。 */
export function FogClipBlendActivity() {
  const [mode, setMode] = useState<Mode>('blend');
  const [alpha, setAlpha] = useState(0.45);
  const [threshold, setThreshold] = useState(0.35);
  const [fogStart, setFogStart] = useState(4);
  const [fogRange, setFogRange] = useState(14);
  const [visited, setVisited] = useState<Mode[]>(['blend']);

  function choose(next: Mode) {
    setMode(next);
    setVisited((list) => (list.includes(next) ? list : [...list, next]));
  }

  function reset() {
    setMode('blend');
    setAlpha(0.45);
    setThreshold(0.35);
    setFogStart(4);
    setFogRange(14);
    setVisited(['blend']);
  }

  // 铁丝网的“alpha 图”：网格状，线条处 alpha 高、网孔处 alpha 低
  const fenceAlpha = (i: number, j: number): number => ((i % 2 === 0) || (j % 2 === 0)) ? 0.85 : 0.08;

  const fogFactor = (distance: number): number => {
    const s = Math.max(0, Math.min(1, (distance - fogStart) / Math.max(0.001, fogRange)));
    return s;
  };

  const hexLerp = (from: string, to: string, t: number): string => {
    const parse = (hex: string) => [1, 3, 5].map((index) => parseInt(hex.slice(index, index + 2), 16));
    const a = parse(from);
    const b = parse(to);
    return `rgb(${a.map((value, index) => Math.round(value + (b[index] - value) * t)).join(', ')})`;
  };

  return (
    <ActivityFrame
      id="ch10-fog-clip-blend"
      chapterId="ch10"
      title="透明混合、clip 与雾效各解决什么问题"
      prompt="三种模式都试一遍：看铁丝网后面的柱子分别怎么显示，以及远处的柱子怎么变化。"
      predict={{
        question: '要在一张带镂空的铁丝网纹理上做出「看得见网孔」的效果，最合适的做法是？',
        options: ['开启 alpha 混合', '在像素着色器里 clip(alpha < 阈值)', '用雾效', '提高纹理分辨率'],
        answer: 1,
        hint: 'clip 直接丢弃像素，不需要排序；混合需要按深度排序才正确，而铁丝网这种复杂镂空很难排序。',
        correctNote: 'clip 丢弃像素，镂空边缘干净且不需要排序，正是铁丝网这类纹理的首选。',
        wrongNote: 'alpha 混合对镂空纹理需要按深度排序，否则会出错；clip 直接丢弃像素，既不需要排序也没有排序错误。',
      }}
      onReset={reset}
      check={() => {
        if (visited.length < 3) return { passed: false, feedback: `现在只看了 ${visited.length} 种模式。三种都切一遍（透明混合 / alpha 裁剪 / 雾效），比较它们的差别，再检查。` };
        return {
          passed: true,
          feedback: '三种都试过了：alpha 混合解决「半透明叠加」但需要排序；clip 解决「镂空」且不需要排序；雾效解决「远处淡出」，它与混合是完全不同的机制（按距离插值到雾色）。',
        };
      }}
      explanation={<>
        <p><b>透明混合</b>（图 10.1）解决「半透明叠加」：把源色按 alpha 盖到目标色上。代价是<b>必须按深度从后往前绘制</b>，否则结果错误。所以混合物体通常在所有不透明物体之后单独画一遍。</p>
        <p><b>裁剪像素</b>（<code>clip</code>，图 10.6）解决「镂空」：在像素着色器里直接丢弃 alpha 低于阈值的像素。它不需要排序，也没有排序错误，是铁丝网、树叶这类纹理的首选。代价是边缘是硬边，没有半透明过渡。</p>
        <p><b>雾效</b>（图 10.8—10.10）与混合无关，它是按距离把颜色插值到雾色：</p>
        <div className="math-block">s = saturate((dist(p, E) − fogStart) / fogRange)<br />foggedColor = (1 − s)·litColor + s·fogColor</div>
        <p>它解决的是「远处淡出、增强纵深感」，并顺便隐藏远处物体的突然出现。</p>
      </>}
      apply={<p>混合在 PSO 的 <code>D3D12_BLEND_DESC</code> 里开启；<code>clip</code> 是 HLSL 里的一个语句；雾效通常写在像素着色器末尾，参数由 Pass 常量传入。</p>}
    >
      <svg className="svg-stage" viewBox="0 0 320 320" role="img"
        aria-label={`当前模式 ${mode}，显示柱子在铁丝网后/雾中的效果`}>
        <rect x={0} y={0} width={320} height={320} fill="#eef2ea" />
        <line x1={0} y1={250} x2={320} y2={250} stroke="#b6c2b4" strokeWidth={2} />

        {posts.map((post, index) => {
          const x = 24 + index * 66;
          const y = 250 - post.height;
          const fog = mode === 'fog' ? fogFactor(post.distance) : 0;
          const fill = mode === 'fog' ? hexLerp(postColor, fogColor, fog) : postColor;
          return <g key={index}>
            <rect x={x} y={y} width={38} height={post.height} fill={fill} />
            <text x={x + 4} y={y - 6}>d={post.distance}</text>
          </g>;
        })}

        {mode !== 'fog' && <g>
          {Array.from({ length: 10 }, (_unused, i) => Array.from({ length: 6 }, (_unused2, j) => {
            const a = fenceAlpha(i, j);
            if (mode === 'clip' && a < threshold) return null;
            const opacity = mode === 'blend' ? a * alpha : 1;
            return <rect key={`${i}-${j}`} x={i * 32} y={70 + j * 30} width={32} height={30}
              fill="#4c5c50" opacity={opacity} />;
          }))}
          <text x={12} y={62}>铁丝网纹理（网孔 alpha 低）</text>
        </g>}
        {mode === 'fog' && <text x={12} y={62}>雾：按距离插值到雾色</text>}
      </svg>

      <Choice label="模式" options={[
        { value: 'blend', label: '透明混合', hint: '需要排序' },
        { value: 'clip', label: 'alpha 裁剪', hint: '不需要排序' },
        { value: 'fog', label: '雾效', hint: '按距离淡出' },
      ]} value={mode} onChange={choose} />

      {mode === 'blend' && <Slider label="混合 alpha" min={0} max={1} step={0.05} value={alpha} onChange={setAlpha} />}
      {mode === 'clip' && <Slider label="clip 阈值" min={0} max={0.9} step={0.05} value={threshold} onChange={setThreshold} />}
      {mode === 'fog' && <>
        <Slider label="fogStart" min={0} max={14} step={0.5} value={fogStart} onChange={setFogStart} />
        <Slider label="fogRange" min={2} max={24} step={0.5} value={fogRange} onChange={setFogRange} />
      </>}

      <Readout items={[
        ['当前模式', mode === 'blend' ? '透明混合' : mode === 'clip' ? 'alpha 裁剪' : '雾效'],
        ['是否需要按深度排序', mode === 'blend' ? '是' : '否'],
        ['最远处雾化程度', mode === 'fog' ? fogFactor(posts[4].distance).toFixed(2) : '—'],
        ['已试过的模式', `${visited.length} / 3`],
      ]} />
    </ActivityFrame>
  );
}
