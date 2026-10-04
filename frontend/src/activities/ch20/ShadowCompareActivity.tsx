import { useState } from 'react';
import { ActivityFrame } from '@/activities/ActivityFrame';
import { Readout, Slider } from '@/activities/controls';
import { format, shadowFactor } from '@/activities/math';

const DEPTHS = [0.15, 0.35, 0.52, 0.68, 0.83, 0.95];

/** 20.4 后的推演：从光源视角保存深度，再从相机视角比较，逐点判阴影。 */
export function ShadowCompareActivity() {
  const [occluderY, setOccluderY] = useState(2);
  const [pointX, setPointX] = useState(0.2);

  const lightDepthAt = (worldX: number) => {
    // 沿光源方向看，遮挡物越高，深度越近
    return Math.max(0, Math.min(1, 0.3 + occluderY * 0.22 - worldX * 0.25));
  };

  const rows = DEPTHS.map((cameraDepth, index) => {
    const worldX = index / (DEPTHS.length - 1);
    const lightDepth = lightDepthAt(worldX);
    return { worldX, cameraDepth, lightDepth, shadowed: shadowFactor(lightDepth, cameraDepth, 0) === 0 };
  });

  const shadowedCount = rows.filter((row) => row.shadowed).length;
  const pDepth = cameraDepthAt(pointX);

  function cameraDepthAt(x: number) {
    const nearest = Math.max(0, Math.min(1, 0.3 + occluderY * 0.22 - x * 0.25));
    return Math.max(nearest, x * 0.18);
  }

  function reset() {
    setOccluderY(2);
    setPointX(0.2);
  }

  return (
    <ActivityFrame
      id="ch20-shadow-compare"
      chapterId="ch20"
      title="逐点比较：场景深度 vs 光源深度"
      prompt="调「遮挡物高度」改变光源深度图，再看每个像素的判定。d(p) 大于 s 就是被遮挡（图 20.6）。"
      predict={{
        question: '判断一个像素是否在阴影里，比较的是什么？',
        options: ['像素在相机空间的 z 与光源的 z', '该像素沿光线方向的深度 d(p) 与阴影图中同一位置的深度 s', '两个物体的距离', '法线与光线的夹角'],
        answer: 1,
        hint: '阴影图存的是「从光源看过去，最近表面有多远」。',
        correctNote: '如果这个像素比阴影图记录的「最近表面」还要远，说明中间有东西挡住了光。',
        wrongNote: '比较的是同一像素的两种深度：d(p)（沿光线方向的深度）与阴影图里的 s（最近表面深度）。',
      }}
      onReset={reset}
      check={() => {
        if (occluderY === 2 && pointX === 0.2) return { passed: false, feedback: '先拖动「遮挡物高度」或「观察点位置」，让阴影判定发生变化，再检查。' };
        return {
          passed: true,
          feedback: `当前 ${shadowedCount} / ${rows.length} 个采样点被判为阴影。观察点 x = ${format(pointX)} 处：d(p) = ${format(pDepth)}，s = ${format(lightDepthAt(pointX))}，d(p) ${pDepth > lightDepthAt(pointX) ? '大于' : '不大于'} s，所以${pDepth > lightDepthAt(pointX) ? '在阴影里' : '被照亮'}。`,
        };
      }}
      explanation={<>
        <p><b>这是沿一条剖面的简化示意</b>：用数值关系展示深度比较，不是在浏览器里真实渲染一盏灯和完整场景。</p>
        <p>阴影贴图的流程只有两步：</p>
        <ol>
          <li><b>从光源视角渲染一遍深度</b>，只写深度不写颜色（平行光用正交投影，图 20.1、20.2）；</li>
          <li><b>从相机视角正常渲染</b>，把每个像素变换到光源的投影纹理坐标，查阴影图里的深度并比较。</li>
        </ol>
        <p>图 20.5 说明光源前面还有一个<b>光盒</b>（light volume）：只有盒内的场景接收这束光。盒子之外直接判为阴影，省掉大量无用计算。</p>
        <p>图 20.6 是判定的核心：如果像素 p 沿光线方向的深度 d(p) <b>大于</b>阴影图中同位置的深度 s，说明中间有东西挡住了光，p 在阴影里。</p>
        <p>投影纹理坐标（图 20.3、20.4）由光源的视投影矩阵给出：把 p 变换到光源裁剪空间，除以 w 得到 NDC，再映射到 [0, 1] 的纹素坐标。</p>
      </>}
      apply={<p>实现要点：先做一次「光源深度 pass」（PSO 用深度格式的 RTV，不写颜色），再在主 pass 里用 <code>gShadowMap</code> 的 SRV 采样比较。偏移与 PCF 见下一节互动。</p>}
    >
      <svg className="svg-stage" viewBox="0 0 320 240" role="img"
        aria-label={`阴影图深度与相机深度的逐点比较，${shadowedCount} 个点在阴影里`}>
        <rect x={0} y={0} width={320} height={240} fill="#f4f7f0" />
        {rows.map((row, index) => {
          const x = 20 + index * 48;
          const sY = 210 - row.lightDepth * 170;
          const dY = 210 - row.cameraDepth * 170;
          return <g key={index}>
            <line x1={x} y1={30} x2={x} y2={210} stroke="#e0e6dc" />
            <text x={x + 2} y={24} style={{ fontSize: 9 }}>x={format(row.worldX, 1)}</text>
            <rect x={x + 6} y={sY} width={26} height={Math.max(2, 210 - sY)} fill="#cfe0d2" stroke="#3f7d52" />
            <circle cx={x + 19} cy={dY} r={5} fill={row.shadowed ? '#2f6b8f' : '#b1712f'} />
            <text x={x + 2} y={228} style={{ fontSize: 9 }}>{row.shadowed ? '影' : '亮'}</text>
          </g>;
        })}
        <text x={12} y={16}>绿色柱 = 阴影图里的 s；圆点 = 像素深度 d(p)</text>
      </svg>

      <Slider label="遮挡物高度" min={0.5} max={3} step={0.05} value={occluderY} onChange={setOccluderY} />
      <Slider label="观察点位置 x" min={0} max={1} step={0.05} value={pointX} onChange={setPointX} />

      <Readout items={[
        ['阴影点数 / 总数', `${shadowedCount} / ${rows.length}`],
        ['观察点 d(p)', format(pDepth)],
        ['观察点 s', format(lightDepthAt(pointX))],
        ['判定', pDepth > lightDepthAt(pointX) ? '在阴影里' : '被照亮'],
      ]} />
    </ActivityFrame>
  );
}
