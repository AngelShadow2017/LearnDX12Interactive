import { useState } from 'react';
import { ActivityFrame } from '@/activities/ActivityFrame';
import { Choice, Readout, Slider, svgPoint } from '@/activities/controls';
import { format, normalize, reflect, sub, vec3, type Vec3 } from '@/activities/math';

const objs: Array<{ name: string; pos: Vec3; color: string }> = [
  { name: 'A', pos: vec3(-1.1, 0.4, -0.6), color: '#b1712f' },
  { name: 'B', pos: vec3(1.0, 0.6, -0.4), color: '#3f7d52' },
  { name: 'C', pos: vec3(0.2, 1.1, 1.2), color: '#2f6b8f' },
  { name: 'D', pos: vec3(-0.4, -0.7, 1.0), color: '#8a5a8f' },
];

/** 18.4–18.5 后的推演：移动反射物与周围物体，对比静态与动态环境贴图。 */
export function DynamicCubeMapActivity() {
  const [mode, setMode] = useState<'static' | 'dynamic'>('static');
  const [sphereY, setSphereY] = useState(0.8);
  const [eyeZ, setEyeZ] = useState(1.6);
  const [moved, setMoved] = useState(false);

  const sphere: Vec3 = [0, sphereY, 0];
  const eye: Vec3 = [0, sphereY, eyeZ];
  const normal: Vec3 = [0, 0, 1];
  const viewDir = normalize(sub(eye, sphere));
  const reflection = reflect(viewDir, normal);

  function reset() {
    setMode('static');
    setSphereY(0.8);
    setEyeZ(1.6);
    setMoved(false);
  }

  return (
    <ActivityFrame
      id="ch18-dynamic-cube"
      chapterId="ch18"
      title="反射方向随相机移动，静态贴图跟不跟得上"
      prompt="拖动相机与反光球的位置。切到「静态环境贴图」时，贴图固定在原处不更新；切到「动态」时每次都重新渲染 6 个面。"
      predict={{
        question: '静态（预过滤）环境贴图在什么时候会「跟不上」？',
        options: ['物体运动时', '相机移动导致反射方向变化时', '改变粗糙度时', '永远不会'],
        answer: 1,
        hint: '静态贴图里的方向是按拍摄点固定下来的。',
        correctNote: '静态贴图的所有采样方向都相对同一个点；相机一动，反射方向就与贴图对不上。',
        wrongNote: '物体移动本身不影响环境贴图（贴图只记录远处环境）；真正的问题是相机移动改变了反射方向。',
      }}
      onReset={reset}
      check={() => {
        if (!moved) return { passed: false, feedback: '先拖动「相机 z」或「反光球高度」，观察反射方向怎么变，再检查。' };
        return {
          passed: true,
          feedback: `相机在 (${format(eye[0])}, ${format(eye[1])}, ${format(eye[2])})，反射方向 r = (${format(reflection[0])}, ${format(reflection[1])}, ${format(reflection[2])})。${mode === 'static' ? '静态贴图按旧方向取样，反射会「跟不上」。' : '动态立方体贴图每次重新渲染 6 个面，反射实时更新——代价是 6 次额外渲染。'}`,
        };
      }}
      explanation={<>
        <p>反射的采样方向由<b>反射向量</b>给出：r = d − 2(d·n)n，其中 d 是视线方向、n 是表面法线（图 18.5）。</p>
        <p>实际实现时不直接用 r，而是求<b>反射射线与立方体的交点</b> v = p + t₀·r，用 v 的方向去查贴图（图 18.7）——这样和立方体贴图的寻址方式一致。</p>
        <p>环境贴图（静态）是<b>预过滤</b>的：每个方向上存的是该方向上若干层粗糙度的模糊结果。相机移动时，反射方向变了，但贴图还是当初拍的那个点拍的，于是「跟不上」（图 18.6）。</p>
        <p>动态立方体贴图（图 18.8）把相机放到待反光物体的中心，<b>重新渲染周围环境 6 个面</b>，所以反射永远正确。代价是每帧（或每 N 帧）多 6 次渲染；图 18.9 里骷髅绕着中心球转，球面反射实时变化。</p>
        <p><b>折中做法：</b>实践中常按「反射贡献的重要程度」决定更新频率——金属球每帧更新，地板可以每几帧甚至只在相机大幅移动时更新。</p>
      </>}
      apply={<p>动态立方体贴图需要 6 个同尺寸的渲染目标、6 组视锥（第 16 章）与 6 次渲染循环；把结果合成的数组视图类型是 <code>D3D12_SRV_DIMENSION_CUBE</code>。</p>}
    >
      <svg className="svg-stage" viewBox="0 0 320 320" role="img"
        aria-label={`反光球在 ${format(sphereY)}，相机 z ${format(eyeZ)}，反射方向 ${format(reflection[0])} 逗号 ${format(reflection[1])} 逗号 ${format(reflection[2])}`}>
        <rect x={0} y={0} width={320} height={320} fill="#eef2ea" />
        <line x1={20} y1={200} x2={300} y2={200} stroke="#b6c2b4" strokeWidth={2} />

        {objs.map((obj) => {
          const p = svgPoint(obj.pos[0] * 34, obj.pos[1] * 34 + (1 - sphereY) * 34, 34);
          return <g key={obj.name}>
            <circle cx={p.x} cy={p.y} r={9} fill={obj.color} />
            <text x={p.x + 12} y={p.y + 4}>{obj.name}</text>
          </g>;
        })}

        {(() => { const p = svgPoint(0, (1 - sphereY) * 34, 34); return <g>
          <circle cx={160 + p.x - 160} cy={200 - p.y} r={26} fill="#7fa7c9" stroke="#4a6f8c" strokeWidth={2} />
          <text x={26} y={228} style={{ fontSize: 10 }}>反光球</text>
        </g>; })()}

        {(() => { const p = svgPoint(0, (1 - sphereY) * 34, 34); return <g>
          <circle cx={160} cy={200 - p.y - eyeZ * 34} r={7} fill="#2f6b8f" />
          <text x={168} y={200 - p.y - eyeZ * 34 + 4}>相机</text>
        </g>; })()}

        <line className="vec vec--w" x1={160} y1={200 - (1 - sphereY) * 34} x2={160 + reflection[0] * 96} y2={200 - (1 - sphereY) * 34 - reflection[1] * 96} />
        <text x={172} y={120} style={{ fontSize: 10 }}>反射方向 r</text>
        <text x={12} y={306} style={{ fontSize: 10 }}>{mode === 'static' ? '静态贴图：方向固定，不随相机更新' : '动态贴图：6 个面每帧重新渲染'}</text>
      </svg>

      <Choice label="环境贴图类型" options={[
        { value: 'static', label: '静态（预过滤）', hint: '一次烘焙，零运行时开销' },
        { value: 'dynamic', label: '动态立方体贴图', hint: '每帧 6 次渲染' },
      ]} value={mode} onChange={setMode} />
      <Slider label="反光球高度" min={0} max={1.6} step={0.05} value={sphereY} onChange={(value) => { setSphereY(value); setMoved(true); }} />
      <Slider label="相机 z" min={1} max={4} step={0.05} value={eyeZ} onChange={(value) => { setEyeZ(value); setMoved(true); }} />

      <Readout items={[
        ['视线方向 d', `(${format(viewDir[0])}, ${format(viewDir[1])}, ${format(viewDir[2])})`],
        ['反射方向 r', `(${format(reflection[0])}, ${format(reflection[1])}, ${format(reflection[2])})`],
        ['贴图是否跟随相机', mode === 'dynamic' ? '是' : '否'],
        ['动态贴图每帧额外渲染', mode === 'dynamic' ? '6 个面' : '0'],
      ]} />
    </ActivityFrame>
  );
}
