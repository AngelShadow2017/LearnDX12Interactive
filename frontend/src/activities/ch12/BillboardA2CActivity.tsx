import { useState } from 'react';
import { ActivityFrame } from '@/activities/ActivityFrame';
import { Choice, Readout, Slider, Toggle } from '@/activities/controls';
import { format } from '@/activities/math';

type Facing = 'camera' | 'fixed';

/** 12.2–12.4 后的推演：移动相机并切换广告牌朝向与 A2C，比较树叶边缘。 */
export function BillboardA2CActivity() {
  const [azimuth, setAzimuth] = useState(0);
  const [facing, setFacing] = useState<Facing>('camera');
  const [a2c, setA2c] = useState(false);
  const [msaa, setMsaa] = useState(true);
  const [moved, setMoved] = useState(false);
  const [toggled, setToggled] = useState(false);

  const radians = (azimuth * Math.PI) / 180;
  const cameraDir: [number, number] = [Math.sin(radians), Math.cos(radians)];
  // 广告牌的朝向：面向相机时垂直于视线；固定朝向时始终沿 +z
  const quadAngle = facing === 'camera' ? azimuth : 0;
  const quadRadians = (quadAngle * Math.PI) / 180;
  const rightDir: [number, number] = [Math.cos(quadRadians), -Math.sin(quadRadians)];

  function reset() {
    setAzimuth(0);
    setFacing('camera');
    setA2c(false);
    setMsaa(true);
    setMoved(false);
    setToggled(false);
  }

  const center = { x: 150, y: 180 };
  const cameraTip = { x: center.x + cameraDir[0] * 92, y: center.y - cameraDir[1] * 92 };
  const quadHalf = 58;
  const quadA = { x: center.x - rightDir[0] * quadHalf, y: center.y - rightDir[1] * quadHalf };
  const quadB = { x: center.x + rightDir[0] * quadHalf, y: center.y + rightDir[1] * quadHalf };

  const edgeQuality = !msaa ? '无 MSAA：边缘锯齿明显'
    : a2c ? '开启 A2C + MSAA：alpha 转成覆盖率，边缘平滑'
      : '仅 alpha 混合/裁剪：镂空边缘靠像素级判定，容易出现硬边或排序问题';

  return (
    <ActivityFrame
      id="ch12-billboard-a2c"
      chapterId="ch12"
      title="移动相机，比较广告牌朝向与 A2C"
      prompt="拖动相机方位角，先把朝向切成「固定沿 +z」看广告牌怎么露馅，再打开 A2C 看树叶边缘的变化。"
      predict={{
        question: 'Alpha-to-Coverage（A2C）想要生效，必须同时满足什么条件？',
        options: ['只需要开启 A2C 就行', '开启 A2C 并且启用多重采样（MSAA）', '只需要启用 MSAA', '需要关闭深度测试'],
        answer: 1,
        hint: 'A2C 把 alpha 转换成「子采样覆盖率」，没有多个子采样点就没有覆盖率可言。',
        correctNote: 'A2C 依赖 MSAA：alpha 决定这个像素有多少个子样本被覆盖。',
        wrongNote: 'A2C 的原理是把 alpha 映射到 MSAA 的子采样覆盖率，所以必须同时启用 MSAA，单独开 A2C 没有任何效果。',
      }}
      onReset={reset}
      check={() => {
        if (!moved) return { passed: false, feedback: '先拖动「相机方位角」，观察广告牌与相机的相对关系，再检查。' };
        if (!toggled) return { passed: false, feedback: '再切换一次「Alpha-to-Coverage」开关（配合 MSAA），比较树叶边缘，然后检查。' };
        return {
          passed: true,
          feedback: `相机方位角 ${azimuth}°。${facing === 'camera' ? '广告牌始终垂直于视线，正面朝向相机' : '广告牌固定沿 +z，相机转到侧面时会看到它的侧边（露馅）'}。当前：${edgeQuality}。`,
        };
      }}
      explanation={<>
        <p>广告牌（billboard）是一张始终朝向相机的 quad（图 12.3）。GS 用相机的 right / up / look 三个轴构造它的局部坐标系，再用世界尺寸算出四个角（图 12.4）。</p>
        <p>图 12.2 的树纹理带 alpha 通道，树叶镂空部分的处理有两个选择：</p>
        <ul>
          <li><b>alpha 混合</b>：需要按深度排序，大量树重叠时排序成本很高。</li>
          <li><b>alpha 裁剪 + A2C</b>：不需要排序。A2C 把 alpha 值映射成 MSAA 的子采样覆盖率，让镂空边缘获得抗锯齿，代价是必须启用 MSAA。</li>
        </ul>
        <p>注意 A2C 单独开启<b>没有效果</b>——它依赖 MSAA 的子采样点。这是这一节最容易记错的一条。</p>
        <p>另外，树广告牌通常用<b>纹理数组</b>（图 12.7—12.9）存放多种树的贴图，GS 输出的顶点带一个 <code>PrimID</code> 或数组索引，就能一次绘制多种树。</p>
      </>}
      apply={<p>PSO 里 <code>AlphaToCoverageEnable = TRUE</code>，同时 <code>SampleDesc.Count &gt; 1</code>；HLSL 里用 <code>Texture2DArray</code> 与 <code>Sample(sampler, float3(uv, index))</code> 按索引选树。</p>}
    >
      <svg className="svg-stage" viewBox="0 0 320 320" role="img"
        aria-label={`相机方位角 ${azimuth} 度，广告牌朝向 ${facing === 'camera' ? '面向相机' : '固定沿 +z'}，A2C ${a2c ? '开' : '关'}，MSAA ${msaa ? '开' : '关'}`}>
        <rect x={0} y={0} width={320} height={320} fill="#f4f7f0" />
        <text x={12} y={26}>俯视图：相机绕树移动</text>

        <line stroke="#8fa8bf" strokeWidth={1.4} strokeDasharray="4 3" x1={center.x} y1={center.y} x2={cameraTip.x} y2={cameraTip.y} />
        <circle cx={cameraTip.x} cy={cameraTip.y} r={7} fill="#2f6b8f" />
        <text x={cameraTip.x + 8} y={cameraTip.y + 4}>相机</text>

        <line stroke={facing === 'camera' ? '#3f7d52' : '#b1712f'} strokeWidth={5}
          x1={quadA.x} y1={quadA.y} x2={quadB.x} y2={quadB.y} />
        <circle cx={center.x} cy={center.y} r={4} fill="#5b6c60" />
        <text x={center.x - 20} y={center.y + 26}>树（广告牌）</text>

        {/* 边缘质量示意 */}
        <g transform="translate(20 236)">
          <rect x={0} y={0} width={120} height={54} fill="#fff" stroke="#e3e8dd" />
          <text x={6} y={16} style={{ fontSize: 10 }}>树叶边缘</text>
          {msaa && a2c
            ? Array.from({ length: 12 }, (_u, i) => <rect key={i} x={6 + i * 9} y={24} width={9} height={24} fill="#3f7d52" opacity={Math.max(0, Math.min(1, i / 11))} />)
            : Array.from({ length: 12 }, (_u, i) => <rect key={i} x={6 + i * 9} y={24} width={9} height={24} fill={i > 6 ? '#3f7d52' : '#fff'} />)}
        </g>
        <text x={148} y={262} style={{ fontSize: 10 }}>{edgeQuality}</text>
      </svg>

      <Slider label="相机方位角" min={-90} max={90} step={2} value={azimuth} onChange={(value) => { setAzimuth(value); setMoved(true); }} format={(value) => `${value}°`} />
      <Choice label="广告牌朝向" options={[
        { value: 'camera', label: '始终面向相机', hint: '标准做法' },
        { value: 'fixed', label: '固定沿 +z', hint: '对照：会露馅' },
      ]} value={facing} onChange={setFacing} />
      <Toggle label="启用 MSAA（多重采样）" checked={msaa} onChange={setMsaa} />
      <Toggle label="Alpha-to-Coverage" checked={a2c} onChange={(value) => { setA2c(value); setToggled(true); }} />

      <Readout items={[
        ['相机方向', `(${format(cameraDir[0])}, ${format(cameraDir[1])})`],
        ['广告牌朝向', facing === 'camera' ? `随相机（${azimuth}°）` : '固定 0°'],
        ['A2C 是否真的生效', a2c && msaa ? '是' : '否'],
        ['边缘质量', msaa && a2c ? '平滑' : '硬边/依赖排序'],
      ]} />
    </ActivityFrame>
  );
}
