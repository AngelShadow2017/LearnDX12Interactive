import { useState } from 'react';
import { ActivityFrame } from '@/activities/ActivityFrame';
import { Readout, Slider } from '@/activities/controls';
import { dot, format, normalize, sub, vec3, type Vec3 } from '@/activities/math';

const blockers: Array<{ center: Vec3; radius: number; color: string }> = [
  { center: vec3(0.9, 0.9, 0.2), radius: 0.55, color: '#b1712f' },
  { center: vec3(-0.8, 0.7, -0.3), radius: 0.45, color: '#3f7d52' },
  { center: vec3(0.1, 0.6, -1.1), radius: 0.5, color: '#2f6b8f' },
];

function occluded(point: Vec3, dir: Vec3): boolean {
  return blockers.some((blocker) => {
    const toCenter = sub(blocker.center, point);
    const distanceSquared = dot(toCenter, toCenter);
    if (distanceSquared <= blocker.radius * blocker.radius) return true;
    const alongRay = dot(toCenter, dir);
    if (alongRay <= 0) return false;
    const closestDistanceSquared = distanceSquared - alongRay * alongRay;
    return closestDistanceSquared <= blocker.radius * blocker.radius;
  });
}

/** 21.1 后的推演：向半球发射采样射线，显示被挡比例就是遮蔽度。 */
export function HemisphereOcclusionActivity() {
  const [samples, setSamples] = useState(16);
  const [pX, setPX] = useState(0);
  const [pY, setPY] = useState(0);
  const [pZ, setPZ] = useState(0);
  const [mode, setMode] = useState<'ao' | 'plain'>('ao');

  const point: Vec3 = [pX, pY, pZ];

  // 用黄金角在 +z 上半球生成可复现的均匀样本。
  const directions = Array.from({ length: samples }, (_unused, index) => {
    const z = (index + 0.5) / samples;
    const radius = Math.sqrt(1 - z * z);
    const theta = index * 2.399963; // 黄金角，避免方向聚集
    return normalize(vec3(Math.cos(theta) * radius, Math.sin(theta) * radius, z));
  });

  const used = directions;
  const blocked = used.filter((dir) => occluded(point, dir));
  const ao = used.length === 0 ? 1 : (used.length - blocked.length) / used.length;
  const plain = 1;

  function reset() {
    setSamples(16);
    setPX(0);
    setPY(0);
    setPZ(0);
    setMode('ao');
  }

  const originX = 170;
  const originY = 70;

  return (
    <ActivityFrame
      id="ch21-hemisphere-occlusion"
      chapterId="ch21"
      title="向半球发射采样射线，被挡比例就是遮蔽度"
      prompt="拖动点 p 靠近或远离遮挡球，看被挡射线数量怎么变。切换「只用环境光」与「叠加 AO」看画面差别。"
      predict={{
        question: '射线法估计环境光遮蔽时，遮蔽度是怎么算出来的？',
        options: ['被挡射线数 / 总射线数', '总射线数 / 被挡射线数', '最远那根射线的长度', '遮挡物的面积'],
        answer: 0,
        correctNote: '遮蔽率 = 被挡射线数 / 总射线数；环境可见度 = 1 − 遮蔽率。',
        wrongNote: '遮蔽度是被挡的比例（AO = 1 − 遮蔽度），不是反过来；采样只在上半球发射。',
      }}
      onReset={reset}
      check={() => {
        if (pX === 0 && pY === 0 && pZ === 0) return { passed: false, feedback: '先把点 p 拖到某个遮挡球附近，看遮蔽度明显升高，再检查。' };
        return {
          passed: true,
          feedback: `当前点被 ${blocked.length} / ${used.length} 根射线挡住，遮蔽度 = ${format(1 - ao, 2)}，可见环境光 = ${format(ao, 2)}。采样数越少，噪点越明显——这就是图 21.7 的颗粒感来源。`,
        };
      }}
      explanation={<>
        <p>局部光照模型用简化的环境光项近似间接光，但它不会随周围几何遮挡而变化；接触区域因此缺少「变暗」的线索，画面会显得很平（图 21.1）。</p>
        <p><b>射线法</b>的思路很直观（图 21.2、21.3）：从表面点 p 向<b>上半球</b>均匀发射 N 根射线，被其他几何挡住的那些对应「这里接收不到的环境光」。</p>
        <div className="math-block">遮蔽率(p) = 被挡射线数 / 总射线数；环境可见度(p) = 1 − 遮蔽率(p)</div>
        <p>只在<b>上半球</b>发射：下半球的表面本身挡着，没有意义。</p>
        <p>图 21.4 是只用遮蔽渲染的结果：没有任何灯光，仅靠遮蔽就足以让缝隙、角落变暗，立体感立刻出现。</p>
        <p>注意成本：要为每个像素发射 N 根射线，朴素实现在几何复杂时非常慢。实际做法要么做预计算（烘焙到贴图），要么用第 13 章的 GPU 计算（SSAO）。</p>
      </>}
      apply={<p>射线法主要用于<b>离线烘焙</b>（光照贴图里的 AO 项）；实时渲染走屏幕空间近似，见下一节。</p>}
    >
      <svg className="svg-stage" viewBox="0 0 320 320" role="img"
        aria-label={`点 p 被 ${blocked.length} 根射线挡住，遮蔽度 ${format(1 - ao, 2)}`}>
        <rect x={0} y={0} width={320} height={320} fill="#f4f7f0" />
        {blockers.map((blocker, index) => {
          const cx = originX + blocker.center[0] * 52;
          const cy = originY + blocker.center[1] * 52;
          return <g key={index}>
            <circle cx={cx} cy={cy} r={blocker.radius * 52} fill={blocker.color} opacity={0.35} />
            <circle cx={cx} cy={cy} r={blocker.radius * 52} fill="none" stroke={blocker.color} strokeWidth={1.6} />
          </g>;
        })}
        {used.map((dir, index) => {
          const blockedOne = occluded(point, dir);
          const length = 96;
          return <line key={index}
            x1={originX + point[0] * 52} y1={originY + point[1] * 52}
            x2={originX + point[0] * 52 + dir[0] * length}
            y2={originY + point[1] * 52 - dir[2] * length}
            stroke={blockedOne ? '#b1712f' : '#8fbf9f'} strokeWidth={1.2} opacity={0.8} />;
        })}
        <circle cx={originX + point[0] * 52} cy={originY + point[1] * 52} r={5} fill="#2f6b8f" />
        <text x={12} y={300} style={{ fontSize: 10 }}>绿线 = 到达环境；橙线 = 被遮挡　|　可见环境光 = {format(mode === 'ao' ? ao : plain, 2)}</text>
      </svg>

      <Slider label="采样射线数" min={4} max={32} step={4} value={samples} onChange={setSamples} />
      <Slider label="点 p 的 x" min={-1.5} max={1.5} step={0.05} value={pX} onChange={setPX} />
      <Slider label="点 p 的 y" min={-1.5} max={1.5} step={0.05} value={pY} onChange={setPY} />
      <Slider label="点 p 的 z" min={-1.5} max={1.5} step={0.05} value={pZ} onChange={setPZ} />
      <div className="activity__actions">
        <button className={`button ${mode === 'plain' ? 'button--accent' : 'button--outline'}`} type="button" onClick={() => setMode('plain')}>只用环境光</button>
        <button className={`button ${mode === 'ao' ? 'button--accent' : 'button--outline'}`} type="button" onClick={() => setMode('ao')}>叠加 AO</button>
      </div>

      <Readout items={[
        ['采样射线数', String(used.length)],
        ['被挡射线数', String(blocked.length)],
        ['遮蔽度 1 − AO', format(1 - ao, 3)],
        ['可见环境光 AO', format(ao, 3)],
        ['当前显示', mode === 'ao' ? `环境光 × ${format(ao, 2)}` : '不叠加 AO'],
      ]} />
      <p className="draggable-note">法线固定为 +z，所以采样方向分布在 +z 半球。射线与球体按三维坐标求交；图形投影到 xz 平面显示。</p>
    </ActivityFrame>
  );
}
