import { useState } from 'react';
import { ActivityFrame } from '@/activities/ActivityFrame';
import { Readout, Slider } from '@/activities/controls';

/** 14.2 后的推演：调细分因子，数生成了多少三角形。 */
export function TessFactorActivity() {
  const [innerU, setInnerU] = useState(2);
  const [innerV, setInnerV] = useState(2);
  const [touched, setTouched] = useState(false);

  const cols = Math.max(1, Math.round(innerU));
  const rows = Math.max(1, Math.round(innerV));
  const quadCount = cols * rows;
  const triangleCount = quadCount * 2;
  const vertices = (cols + 1) * (rows + 1);

  const size = 200;
  const origin = { x: 60, y: 60 };
  const cellW = size / cols;
  const cellH = size / rows;

  function reset() {
    setInnerU(2);
    setInnerV(2);
    setTouched(false);
  }

  return (
    <ActivityFrame
      id="ch14-tess-factor"
      chapterId="ch14"
      title="把细分因子调成生成 32 个三角形"
      prompt={`三角形数 = 2 × 内部因子U × 内部因子V。目标是 32 个（也就是 4 × 4）。`}
      predict={{
        question: '把一个四边形 patch 的 U、V 两个方向均匀细分因子都从 2 提高到 4，三角形数量大致怎么变？',
        options: ['不变', '线性增长（×2）', '按平方增长（×4）', '反而变少'],
        answer: 2,
        hint: '两个方向都要细分，所以是二维增长。',
        correctNote: '两个方向同时细分，三角形数按因子乘积增长——这就是「LOD 要按距离小心控制」的原因。',
        wrongNote: '四边形 patch 在两个方向上同时细分，三角形数 ≈ 2 × U × V，是乘积关系而不是线性。',
      }}
      onReset={reset}
      check={() => {
        if (!touched) return { passed: false, feedback: '先拖动「内部细分因子 U / V」，观察网格与三角形数的变化，再检查。' };
        if (triangleCount !== 32) return { passed: false, feedback: `现在 ${triangleCount} 个三角形。要 32 个，需要 U × V = 16，试试 U = 4、V = 4。` };
        return {
          passed: true,
          feedback: `内部因子 (4, 4) 时，patch 被切成 ${quadCount} 个格子、${triangleCount} 个三角形、${vertices} 个顶点。图 14.5 用这个关系做距离 LOD：离相机越近因子越大。`,
        };
      }}
      explanation={<>
        <p>曲面细分分三个阶段：<b>外壳着色器</b>（HS）输出控制点与细分因子 → <b>镶嵌器</b>（固定功能）按因子把域切成小片 → <b>域着色器</b>（DS）为每个新顶点计算最终位置。</p>
        <p>细分因子分两组（图 14.2、14.3）：<b>边缘因子</b>控制各条边的切分，<b>内部因子</b>控制 patch 内部。相邻 patch 对同一条共享边必须给出一致的边缘因子；内部因子不必与边缘因子相等。本互动用规则整数网格简化显示，并假设相邻 patch 的共享边设置一致。</p>
        <p>图 14.5 展示了最有价值的应用：按到相机的距离动态改变因子，实现无级 LOD。</p>
        <p><b>关于计数：</b>真实镶嵌器依 partitioning mode 对因子作分段；非整数因子也会按规则处理。上面只针对统一的整数网格：U×V 个小格，每格 2 个三角形，用来理解两个方向同时细分时数量按乘积增长。</p>
      </>}
      apply={<p>代码里 HS 的 patch constant function 输出 <code>SV_TessFactor</code> 与 <code>SV_InsideTessFactor</code>；DS 用 <code>SV_DomainLocation</code> 给出的 (u, v) 计算顶点位置。</p>}
    >
      <svg className="svg-stage" viewBox="0 0 320 320" role="img"
        aria-label={`四边形 patch 细分成 ${cols} 乘 ${rows} 个格子，共 ${triangleCount} 个三角形`}>
        <rect x={0} y={0} width={320} height={320} fill="#f4f7f0" />
        <rect x={origin.x} y={origin.y} width={size} height={size} fill="none" stroke="#3f7d52" strokeWidth={2} />
        {Array.from({ length: rows }, (_unused, row) => Array.from({ length: cols }, (_u2, col) => <g key={`${row}-${col}`}>
          <line x1={origin.x + col * cellW} y1={origin.y + row * cellH} x2={origin.x + (col + 1) * cellW} y2={origin.y + (row + 1) * cellH}
            stroke="#8fa8bf" strokeWidth={1} />
        </g>))}
        {Array.from({ length: cols - 1 }, (_unused, index) => <line key={`v${index}`}
          x1={origin.x + (index + 1) * cellW} y1={origin.y} x2={origin.x + (index + 1) * cellW} y2={origin.y + size} stroke="#cfd8cb" />)}
        {Array.from({ length: rows - 1 }, (_unused, index) => <line key={`h${index}`}
          x1={origin.x} y1={origin.y + (index + 1) * cellH} x2={origin.x + size} y2={origin.y + (index + 1) * cellH} stroke="#cfd8cb" />)}
        <text x={origin.x} y={origin.y + size + 26}>每个格子 = 2 个三角形</text>
      </svg>

      <Slider label="内部细分因子 U" min={1} max={8} step={1} value={innerU} onChange={(value) => { setInnerU(value); setTouched(true); }} />
      <Slider label="内部细分因子 V" min={1} max={8} step={1} value={innerV} onChange={(value) => { setInnerV(value); setTouched(true); }} />
      <Readout items={[
        ['格子数 U × V', String(quadCount)],
        ['三角形数 2·U·V', String(triangleCount)],
        ['顶点数 (U+1)(V+1)', String(vertices)],
        ['本模型的方向细分', `U=${innerU}、V=${innerV}`],
      ]} />
    </ActivityFrame>
  );
}
