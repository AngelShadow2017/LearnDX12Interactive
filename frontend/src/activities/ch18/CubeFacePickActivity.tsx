import { useState } from 'react';
import { ActivityFrame } from '@/activities/ActivityFrame';
import { Readout, Slider, svgPoint } from '@/activities/controls';
import { format, normalize, vec3 } from '@/activities/math';

/** 返回方向 d 命中的立方体面，以及 [-1, 1] 范围内的简化面内比例坐标。 */
export function cubeFace(direction: readonly [number, number, number]): { face: number; faceCoord: [number, number] } {
  const d = normalize(direction);
  const ax = Math.abs(d[0]);
  const ay = Math.abs(d[1]);
  const az = Math.abs(d[2]);
  if (ax >= ay && ax >= az) {
    return d[0] > 0
      ? { face: 0, faceCoord: [-d[2] / ax, -d[1] / ax] }
      : { face: 1, faceCoord: [d[2] / ax, -d[1] / ax] };
  }
  if (ay >= az) {
    return d[1] > 0
      ? { face: 2, faceCoord: [d[0] / ay, d[2] / ay] }
      : { face: 3, faceCoord: [d[0] / ay, -d[2] / ay] };
  }
  return d[2] > 0
    ? { face: 4, faceCoord: [d[0] / az, -d[1] / az] }
    : { face: 5, faceCoord: [-d[0] / az, -d[1] / az] };
}

export const faceNames = ['+x（向右）', '−x（向左）', '+y（向上）', '−y（向下）', '+z（向前）', '−z（向后）'];

/** 18.1 后的推演：旋转采样方向，观察选中的立方体面及简化的面内坐标。 */
export function CubeFacePickActivity() {
  const [azimuth, setAzimuth] = useState(35);
  const [elevation, setElevation] = useState(20);

  const radians = (azimuth * Math.PI) / 180;
  const direction = normalize(vec3(
    Math.cos(elevation * Math.PI / 180) * Math.sin(radians),
    Math.sin(elevation * Math.PI / 180),
    Math.cos(elevation * Math.PI / 180) * Math.cos(radians),
  ));
  const { face, faceCoord } = cubeFace(direction);

  const center = svgPoint(0, 0, 52);
  const tip = svgPoint(direction[0] * 1.25, direction[1] * 1.25, 52);

  return (
    <ActivityFrame
      id="ch18-cube-face"
      chapterId="ch18"
      title="旋转采样方向，看它落到立方体的哪一面"
      prompt="拖动方位角与仰角。观察：方向的最大分量决定命中面；面内比例坐标范围为 −1 到 1，实际纹素映射由采样器完成。"
      predict={{
        question: '立方体贴图用 3D 方向选择面，那么「命中哪一面」由什么决定？',
        options: ['由方向的 x 分量符号决定', '由方向各分量绝对值中最大的那个决定，再用它的符号区分正负面', '由方向的模决定', '由视线与法线的点积决定'],
        answer: 1,
        hint: '想象从立方体中心沿这个方向射出，它会先撞到哪一面。',
        correctNote: '绝对值最大的分量决定撞到哪一面（主轴），它的符号决定正面还是反面。',
        wrongNote: '不是看单个分量，而是看哪个分量的绝对值最大——方向越接近某个轴，就撞到那一面。',
      }}
      onReset={() => { setAzimuth(35); setElevation(20); }}
      check={() => {
        if (azimuth === 35 && elevation === 20) return { passed: false, feedback: '先拖动方位角或仰角，观察命中面的变化，再检查。' };
        return {
          passed: true,
          feedback: `方向 (${format(direction[0])}, ${format(direction[1])}, ${format(direction[2])}) 命中「${faceNames[face]}」，该面内比例坐标约为 (${format(faceCoord[0])}, ${format(faceCoord[1])})。实际 texel 映射由立方体贴图采样器处理。`,
        };
      }}
      explanation={<>
        <p>立方体贴图用<b>方向</b>而不是坐标来寻址：给定一个 3D 方向 r，从立方体中心沿 r 射出，先撞到哪一面就用那一面的纹素（图 18.1）。</p>
        <p>命中哪一面由方向各分量<b>绝对值最大的那个</b>决定（主轴规则），它的符号区分正负面。图中的面内比例坐标是简化的几何说明，范围为 [−1, 1]；转换成纹理坐标时还要按具体面的方向约定映射。应用代码通常不手算这一步。</p>
        <p>立方体贴图采样器会按方向完成选面、坐标映射和过滤；HLSL 中声明 <code>TextureCube</code>，通过 <code>gCubeMap.Sample(samp, r)</code> 采样。</p>
        <p>图 18.2 是把六面「展开」平铺的样子，读起来更直观。</p>
      </>}
      apply={<p>HLSL：<code>TextureCube gCubeMap : register(t0);</code>，采样用 <code>gCubeMap.Sample(samp, r)</code>；C++ 侧用 <code>D3D12_SRV_DIMENSION_TEXTURECUBE</code> 建视图，6 个面必须尺寸相同。</p>}
    >
      <svg className="svg-stage" viewBox="0 0 320 320" role="img"
        aria-label={`采样方向 (${format(direction[0])}, ${format(direction[1])}, ${format(direction[2])}) 命中 ${faceNames[face]}`}>
        <rect x={0} y={0} width={320} height={320} fill="#f4f7f0" />
        {faceNames.map((_name, index) => {
          const row = Math.floor(index / 3);
          const col = index % 3;
          return <g key={index}>
            <rect x={16 + col * 62} y={232 + row * 34} width={56} height={28}
              fill={index === face ? '#2f6b8f' : '#dfe8e1'} stroke="#9fb0a2" />
            <text x={20 + col * 62} y={250 + row * 34} style={{ fontSize: 10, fill: index === face ? '#fff' : '#4a5c50' }}>
              {['+x', '−x', '+y', '−y', '+z', '−z'][index]}
            </text>
          </g>;
        })}
        <circle cx={center.x} cy={center.y} r={46} fill="none" stroke="#9fb0a2" strokeWidth={1.4} />
        <line className="axis" x1={20} y1={160} x2={300} y2={160} />
        <line className="axis" x1={160} y1={300} x2={160} y2={20} />
        <text x={286} y={152}>+x</text><text x={166} y={28}>+y</text>
        <text x={112} y={312}>+z 朝向观察者</text>
        <line className="vec vec--v" x1={center.x} y1={center.y} x2={tip.x} y2={tip.y} />
        <circle cx={center.x} cy={center.y} r={4} fill="#5b6c60" />
        <text x={tip.x + 8} y={tip.y - 8}>r</text>
      </svg>

      <Slider label="方位角" min={-180} max={180} step={1} value={azimuth} onChange={setAzimuth} format={(value) => `${value}°`} />
      <Slider label="仰角" min={-90} max={90} step={1} value={elevation} onChange={setElevation} format={(value) => `${value}°`} />

      <Readout items={[
        ['采样方向 r', `(${format(direction[0])}, ${format(direction[1])}, ${format(direction[2])})`],
        ['命中面', faceNames[face]],
        ['该面内比例坐标（−1 到 1）', `(${format(faceCoord[0])}, ${format(faceCoord[1])})`],
      ]} />
    </ActivityFrame>
  );
}
