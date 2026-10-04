import { useState } from 'react';
import { ActivityFrame } from '@/activities/ActivityFrame';
import { Choice, Readout, Slider } from '@/activities/controls';
import { format } from '@/activities/math';

const CAPTURED_ACTOR_X = -1.1;

/** Compare a fixed environment-map snapshot with a cubemap recaptured at runtime. */
export function DynamicCubeMapActivity() {
  const [mode, setMode] = useState<'static' | 'dynamic'>('static');
  const [actorX, setActorX] = useState(CAPTURED_ACTOR_X);
  const [moved, setMoved] = useState(false);
  const [seenModes, setSeenModes] = useState<Array<'static' | 'dynamic'>>(['static']);
  const capturedActorX = mode === 'static' ? CAPTURED_ACTOR_X : actorX;

  function chooseMode(next: 'static' | 'dynamic') {
    setMode(next);
    setSeenModes((current) => current.includes(next) ? current : [...current, next]);
  }

  function reset() {
    setMode('static');
    setActorX(CAPTURED_ACTOR_X);
    setMoved(false);
    setSeenModes(['static']);
  }

  const pointX = (x: number, left: number) => left + 12 + ((x + 2) / 4) * 104;

  return (
    <ActivityFrame
      id="ch18-dynamic-cube"
      chapterId="ch18"
      title="移动场景物体，比较静态与动态环境贴图"
      prompt="拖动场景物体 A，再切换两种环境贴图。观察固定快照和实时重绘分别记录了物体的哪个位置。"
      predict={{
        question: '动态立方体贴图相对预先生成的静态贴图，能额外反映什么？',
        options: ['之后移动或动画的场景物体', '相机改变视角', '表面法线参与反射方向计算', '立方体贴图的六个采样方向'],
        answer: 0,
        hint: '想想一张已经导出的图片，能不能自动显示之后才移动的角色。',
        correctNote: '动态贴图会重新渲染环境，因此能把当前场景物体的位置更新到反射中。',
        wrongNote: '静态贴图记录生成时的场景；之后才移动或动画的物体不会自动出现在里面。',
      }}
      onReset={reset}
      check={() => {
        if (!moved) return { passed: false, feedback: '先把物体 A 移到别的位置，再比较贴图记录。' };
        if (!seenModes.includes('dynamic')) return { passed: false, feedback: '再切换到动态贴图，比较它记录的位置与静态快照。' };
        return {
          passed: true,
          feedback: mode === 'static'
            ? `当前场景里 A 在 x = ${format(actorX)}，但静态贴图仍记录 x = ${format(CAPTURED_ACTOR_X)}。切到动态贴图会重新捕获当前位置。`
            : `当前场景里 A 在 x = ${format(actorX)}；动态贴图重绘后也记录 x = ${format(actorX)}。每次更新需要渲染立方体的 6 个面。`,
        };
      }}
      explanation={<>
        <p>静态环境贴图是预先生成的固定图像，不会记录生成之后移动或动画的物体。动态立方体贴图把相机放在反光物体中心，重新渲染周围 6 个方向，因此可以捕获当前环境；更新频率越高，开销越大。</p>
        <p>还有一个独立的近似误差：普通立方体贴图只用反射方向 r 查图，丢掉了反射射线的起点。平面上不同位置的射线可能方向相同、却会撞到环境中的不同位置（图 18.6）。若 d 是从眼睛指向表面点的单位入射方向，则 r = d − 2(d·n)n。对有界环境，可用包围盒与射线的交点改进采样方向（图 18.7）。</p>
      </>}
      apply={<p>动态方案为立方体贴图的 6 个面分别渲染场景，再绑定类型为 <code>D3D12_SRV_DIMENSION_TEXTURECUBE</code> 的着色器资源视图。只对少数重要反光物体高频更新，其他物体可以复用静态贴图或降低更新频率。</p>}
    >
      <svg className="svg-stage" viewBox="0 0 320 220" role="img"
        aria-label={`当前场景中 A 位于 x ${format(actorX)}；${mode === 'static' ? `静态贴图仍记录 x ${format(CAPTURED_ACTOR_X)}` : `动态贴图记录 x ${format(actorX)}`}`}>
        <rect x={0} y={0} width={320} height={220} fill="#eef2ea" />
        {[12, 164].map((left) => <g key={left}>
          <rect x={left} y={28} width={144} height={164} rx={8} fill="#f8f8f2" stroke="#bdc8b9" />
          <line x1={left + 12} y1={148} x2={left + 132} y2={148} stroke="#c5cdbf" strokeWidth={2} />
          {[-0.7, 0.7].map((x, index) => <circle key={x} cx={pointX(x, left)} cy={index === 0 ? 96 : 112} r={8} fill={index === 0 ? '#3f7d52' : '#2f6b8f'} />)}
        </g>)}
        <text x={84} y={19} textAnchor="middle">当前场景</text>
        <text x={236} y={19} textAnchor="middle">{mode === 'static' ? '静态贴图：生成时的快照' : '动态贴图：本次重绘'}</text>
        <text x={pointX(actorX, 12)} y={78} textAnchor="middle" style={{ fontSize: 10 }}>A</text>
        <circle cx={pointX(actorX, 12)} cy={96} r={10} fill="#c77a32" stroke="#80501f" strokeWidth={2} />
        {mode === 'static' && Math.abs(actorX - CAPTURED_ACTOR_X) > 0.04 && <>
          <circle cx={pointX(CAPTURED_ACTOR_X, 164)} cy={96} r={10} fill="none" stroke="#c77a32" strokeWidth={2} strokeDasharray="3 2" />
          <text x={pointX(CAPTURED_ACTOR_X, 164)} y={78} textAnchor="middle" style={{ fontSize: 10 }}>A 快照</text>
        </>}
        <circle cx={pointX(capturedActorX, 164)} cy={96} r={10} fill="#c77a32" stroke="#80501f" strokeWidth={2} />
        {mode === 'dynamic' && <text x={pointX(capturedActorX, 164)} y={78} textAnchor="middle" style={{ fontSize: 10 }}>A 当前</text>}
        <text x={160} y={211} textAnchor="middle" style={{ fontSize: 10 }}>左侧是现场，右侧是环境贴图里记录的场景</text>
      </svg>

      <Choice label="环境贴图类型" options={[
        { value: 'static', label: '静态快照', hint: '保留生成时的环境' },
        { value: 'dynamic', label: '动态立方体贴图', hint: '重新渲染当前环境的 6 个面' },
      ]} value={mode} onChange={(value) => chooseMode(value as 'static' | 'dynamic')} />
      <Slider label="场景物体 A 的 x 坐标" min={-1.8} max={1.8} step={0.05} value={actorX} onChange={(value) => { setActorX(value); setMoved(true); }} />

      <Readout items={[
        ['当前场景中的 A', `x = ${format(actorX)}`],
        ['选中贴图记录的 A', `x = ${format(capturedActorX)}`],
        ['场景位置是否已更新到贴图', mode === 'dynamic' ? '是，重新捕获' : '否，仍是生成时快照'],
        ['动态贴图每次更新', mode === 'dynamic' ? '渲染 6 个面' : '无额外渲染'],
      ]} />
    </ActivityFrame>
  );
}
