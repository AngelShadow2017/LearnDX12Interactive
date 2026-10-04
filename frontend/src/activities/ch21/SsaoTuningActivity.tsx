import { useState } from 'react';
import { ActivityFrame } from '@/activities/ActivityFrame';
import { Readout, Slider } from '@/activities/controls';
import { format } from '@/activities/math';

const W = 40;
const H = 24;

/** 21.2 后的推演：调 SSAO 半径、样本数与模糊，比较噪声、漏光与假遮挡。 */
export function SsaoTuningActivity() {
  const [radius, setRadius] = useState(0.6);
  const [samples, setSamples] = useState(8);
  const [blurRadius, setBlurRadius] = useState(1);
  const [touched, setTouched] = useState(false);

  // 一个确定性的「深度场」：中间有一道凹槽（缝隙）
  const depth = (x: number, y: number): number => {
    const wall = Math.abs(x) - 0.35;
    const groove = Math.exp(-(wall * wall) / 0.02) * 0.5;
    const bump = Math.sin(x * 5) * Math.cos(y * 4) * 0.05;
    return 1 - Math.max(groove, 0) + bump;
  };

  const aoRaw = (x: number, y: number): number => {
    let occludedCount = 0;
    let total = 0;
    for (let index = 0; index < samples; index += 1) {
      const angle = (index / samples) * Math.PI * 2;
      const ox = x + Math.cos(angle) * radius;
      const oy = y + Math.sin(angle) * radius;
      if (Math.abs(ox) > 1 || Math.abs(oy) > 1) continue;
      total += 1;
      if (depth(ox, oy) < depth(x, y) - 0.08) occludedCount += 1;
    }
    return total === 0 ? 1 : 1 - occludedCount / total;
  };

  const blur = (x: number, y: number): number => {
    let sum = 0;
    let count = 0;
    const reach = blurRadius;
    const centerDepth = depth(x, y);
    let totalWeight = 0;
    for (let dx = -reach; dx <= reach; dx += 1) {
      for (let dy = -reach; dy <= reach; dy += 1) {
        const sx = x + dx * 0.02;
        const sy = y + dy * 0.03;
        if (Math.abs(sx) > 1 || Math.abs(sy) > 1) continue;
        const spatialWeight = Math.exp(-(dx * dx + dy * dy) / 2);
        const depthDelta = depth(sx, sy) - centerDepth;
        const edgeWeight = Math.exp(-(depthDelta * depthDelta) / 0.01);
        const weight = spatialWeight * edgeWeight;
        sum += aoRaw(sx, sy) * weight;
        totalWeight += weight;
        count += 1;
      }
    }
    return count === 0 || totalWeight === 0 ? 1 : sum / totalWeight;
  };

  const cells: Array<{ x: number; y: number; raw: number; blurred: number; noisy: boolean }> = [];
  for (let j = 0; j < H; j += 1) {
    for (let i = 0; i < W; i += 1) {
      const x = (i / (W - 1)) * 2 - 1;
      const y = (j / (H - 1)) * 2 - 1;
      const raw = aoRaw(x, y);
      const blurred = blur(x, y);
      const noisy = Math.abs(raw - blurred) > 0.12;
      cells.push({ x, y, raw, blurred, noisy });
    }
  }

  const noisyCount = cells.filter((cell) => cell.noisy).length;

  function reset() {
    setRadius(0.6);
    setSamples(8);
    setBlurRadius(1);
    setTouched(false);
  }

  const cw = 300 / W;
  const ch = 150 / H;

  return (
    <ActivityFrame
      id="ch21-ssao-tuning"
      chapterId="ch21"
      title="调 SSAO 的半径、样本数与模糊"
      prompt="左图是原始 AO（未模糊），右图是模糊后的。样本数越少左图颗粒感越强（图 21.7）；半径太大则缝隙外也会变暗，出现假遮挡。"
      predict={{
        question: 'SSAO 的采样数太少时，最典型的症状是什么？',
        options: ['画面变暗', '结果出现明显颗粒/噪点', '阴影边界锯齿', '性能变差'],
        answer: 1,
        correctNote: '样本少 → 方差大 → 相邻像素结果剧烈跳变，形成噪点（图 21.7）。',
        wrongNote: '噪点来自采样数不足（方差大），不是半径或模糊的问题；提高采样数或做边缘保持模糊才能压下去。',
      }}
      onReset={reset}
      check={() => {
        if (!touched) return { passed: false, feedback: '先调整「样本数」或「半径」，观察噪点与漏光的变化，再检查。' };
        return {
          passed: true,
          feedback: `当前 ${samples} 个样本、模糊范围 ${blurRadius}：${noisyCount} / ${cells.length} 个像素的原始值与模糊值差异超过 0.12，也就是噪点明显的区域。样本少 → 噪点多；半径大 → 缝隙外出现假遮挡。`,
        };
      }}
      explanation={<>
        <p>书中的 SSAO pass 使用<b>视空间法线和深度</b>：先由深度重建当前像素位置 p，在法线半球和遮蔽半径内生成随机样本点 q，再投影 q 到屏幕，读取深度并重建该视线上的可见点 r。</p>
        <p>若 <code>|p.z − r.z|</code> 在有效范围内，再用 <code>dot(n, r − p)</code> 的方向关系评估遮挡贡献。仅看深度距离会把同一平面上的邻近点误认为遮挡，因此还要用法线方向测试（图 21.6）。</p>
        <p><b>互动模型说明：</b>下方用合成的二维深度场演示样本数、半径和边缘保持模糊带来的趋势；它不是原书完整的三维 SSAO 着色器实现。</p>
        <p>三个参数各自的问题（图 21.7、21.10）：</p>
        <ul>
          <li><b>采样数</b>太少 → 噪点（需要第 13 章的模糊来平滑）；</li>
          <li><b>半径</b>太大 → 漏光与假遮挡：本该照亮的缝隙外侧也变暗；</li>
          <li><b>模糊</b>要<b>边缘保持</b>（图 21.8），否则会把物体边界糊掉；本互动用深度差权重做简化的边缘保持。</li>
        </ul>
        <p>SSAO 只影响<b>环境光</b>项（图 21.9）——效果微妙，但能让缝隙、角落立刻变暗。</p>
      </>}
      apply={<p>第 21 章把视空间法线与深度作为 SRV 输入，用计算着色器生成 AO 图并做边缘保持模糊，再把 AO 乘到环境光项上。</p>}
    >
      <svg className="svg-stage" viewBox="0 0 320 320" role="img"
        aria-label={`SSAO 对比：左为原始值，右为模糊后，${samples} 个样本`}>
        <rect x={0} y={0} width={320} height={320} fill="#f4f7f0" />
        <text x={10} y={16} style={{ fontSize: 10 }}>原始 AO（未模糊）</text>
        <text x={162} y={16} style={{ fontSize: 10 }}>边缘保持模糊（范围 {blurRadius}）</text>
        {cells.map((cell, index) => {
          const i = index % W;
          const j = Math.floor(index / W);
          const rawShade = Math.round(255 * (0.25 + cell.raw * 0.7));
          const blurredShade = Math.round(255 * (0.25 + cell.blurred * 0.7));
          return <g key={index}>
            <rect x={10 + i * cw} y={22 + j * ch} width={cw + 0.5} height={ch + 0.5} fill={`rgb(${rawShade}, ${rawShade}, ${rawShade})`} />
            <rect x={162 + i * cw} y={22 + j * ch} width={cw + 0.5} height={ch + 0.5} fill={`rgb(${blurredShade}, ${blurredShade}, ${blurredShade})`} />
          </g>;
        })}
        <text x={10} y={192} style={{ fontSize: 10 }}>
          噪点像素 {noisyCount} / {cells.length}　|　半径 {format(radius)}　样本 {samples}　模糊范围 {blurRadius}
        </text>
      </svg>

      <Slider label="SSAO 半径" min={0.1} max={1.5} step={0.05} value={radius} onChange={(value) => { setRadius(value); setTouched(true); }} />
      <Slider label="采样数" min={2} max={24} step={2} value={samples} onChange={(value) => { setSamples(value); setTouched(true); }} />
      <Slider label="边缘保持模糊范围" min={0} max={3} step={1} value={blurRadius} onChange={(value) => { setBlurRadius(value); setTouched(true); }} />

      <Readout items={[
        ['噪点像素', `${noisyCount} / ${cells.length}`],
        ['中心缝隙 AO', format(blur(0, 0), 2)],
        ['边缘 AO', format(blur(0.8, 0), 2)],
        ['典型症状', samples < 8 ? '噪点明显' : radius > 1 ? '可能出现假遮挡' : '较干净'],
      ]} />
    </ActivityFrame>
  );
}
