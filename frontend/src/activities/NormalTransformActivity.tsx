import { useState } from 'react';
import { ActivityFrame } from '@/activities/ActivityFrame';
import { Choice, Readout, Slider, svgPoint } from '@/activities/controls';
import { angleBetween, dot, format, normalize, scaling, transformDirection, vec3 } from '@/activities/math';

const UNIT = 46;

type Mode = 'direct' | 'inverse';

/** 8.2 后的推演：非均匀缩放后，法线要用逆转置变换才仍然垂直于表面。 */
export function NormalTransformActivity() {
  const [sx, setSx] = useState(2);
  const [sy, setSy] = useState(0.5);
  const [mode, setMode] = useState<Mode>('direct');
  const [switched, setSwitched] = useState(false);

  const world = scaling(sx, sy, 1);
  // 表面切向与法线（变换前）：表面沿 (1, 0.6)，法线垂直于它
  const tangent = vec3(1, 0.6, 0);
  const normal = normalize(vec3(-0.6, 1, 0));

  const transformedTangent = transformDirection(world, tangent);
  const transformedNormalTrue = normalize(vec3(-transformedTangent[1], transformedTangent[0], 0));

  // 直接用法线乘以世界矩阵
  const direct = normalize(transformDirection(world, normal));
  // 用逆转置（normalMatrix）
  const inv = scaling(1 / sx, 1 / sy, 1);
  const inverseTranspose = normalize(transformDirection(inv, normal));

  const chosen = mode === 'direct' ? direct : inverseTranspose;
  const angle = (angleBetween(chosen, transformedNormalTrue) * 180) / Math.PI;
  const dotProduct = dot(chosen, transformedTangent);

  function reset() {
    setSx(2);
    setSy(0.5);
    setMode('direct');
    setSwitched(false);
  }

  const origin = svgPoint(0, 0, UNIT);
  const tip = svgPoint(transformedTangent[0] * 1.2, transformedTangent[1] * 1.2, UNIT);
  const trueTip = svgPoint(transformedNormalTrue[0], transformedNormalTrue[1], UNIT);
  const chosenTip = svgPoint(chosen[0], chosen[1], UNIT);

  return (
    <ActivityFrame
      id="ch08-normal-transform"
      chapterId="ch08"
      title="非均匀缩放之后，法线还算数吗"
      prompt="切换到「逆转置」模式，看蓝色法线是否重新落回与表面垂直的位置。也可以把两个缩放因子调成相等，观察差别消失。"
      predict={{
        question: '沿 x 轴放大 2 倍、沿 y 轴缩小一半之后，直接用世界矩阵变换法线会怎样？',
        options: ['完全正确', '法线不再垂直于表面，光照会错', '法线长度变了但方向没错', '只有旋转时才会错'],
        answer: 1,
        hint: '非均匀缩放会让切向和法线不再保持垂直；正确做法是用世界矩阵的逆转置。',
        correctNote: '非均匀缩放破坏垂直关系，必须用逆转置（normal matrix）变换法线。',
        wrongNote: '非均匀缩放会破坏切向与法线的垂直关系。均匀缩放只改变长度（归一化即可修复），非均匀缩放必须换矩阵。',
      }}
      onReset={reset}
      check={() => {
        if (!switched) return { passed: false, feedback: '把变换方式切到「逆转置」再检查，观察蓝色法线与绿色（真正垂直的方向）是否重合。' };
        return {
          passed: true,
          feedback: `逆转置下法线与真正垂直方向的夹角是 ${format(angle, 2)}°，n·t = ${format(dotProduct)}，已经恢复垂直。直接变换时夹角是 ${format((angleBetween(direct, transformedNormalTrue) * 180) / Math.PI, 2)}°，光照明显偏了。`,
        };
      }}
      explanation={<>
        <p>法线必须始终垂直于表面。均匀缩放只改变法线长度，归一化就修好了；但<b>非均匀缩放</b>会改变方向关系（图 8.7）。</p>
        <p>数学上的要求是：若切向 t 变换为 t′ = t·M，那么要让 n′·t′ = 0，法线必须按 <b>(M⁻¹)<sup>T</sup></b> 变换。这就是所谓的 normal matrix。</p>
        <p>在 DirectXMath 里对应 <code>XMMatrixInverse(nullptr, world)</code> 之后再 <code>XMMatrixTranspose</code>，或者直接用 <code>XMMatrixInverse</code> 的转置结果变换法线，最后别忘了归一化。</p>
        <p>如果变换里只有旋转和平移（没有非均匀缩放），可以省掉这一步——旋转矩阵的逆转置就是它自己。</p>
      </>}
      apply={<p>HLSL 里常见写法：<code>float3 n = normalize(mul((float3x3)worldInvTranspose, normal));</code>，其中 <code>worldInvTranspose</code> 是 CPU 端算好传进来的逆转置矩阵。</p>}
    >
      <svg className="svg-stage" viewBox="0 0 320 320" role="img"
        aria-label={`缩放 (${sx}, ${sy}) 后，${mode === 'direct' ? '直接变换' : '逆转置变换'}的法线与真正垂直方向夹角 ${format(angle, 1)} 度`}>
        <g className="plane-grid">
          {Array.from({ length: 15 }, (_unused, index) => index - 7).map((index) => <g key={index}>
            <line x1={160 + index * UNIT} y1={0} x2={160 + index * UNIT} y2={320} />
            <line x1={0} y1={160 - index * UNIT} x2={320} y2={160 - index * UNIT} />
          </g>)}
        </g>
        <line className="axis" x1={20} y1={160} x2={300} y2={160} />
        <line className="axis" x1={160} y1={300} x2={160} y2={20} />

        <line x1={origin.x} y1={origin.y} x2={tip.x} y2={tip.y} stroke="#5b6c60" strokeWidth={3} />
        <line className="vec vec--w" x1={origin.x} y1={origin.y} x2={trueTip.x} y2={trueTip.y} strokeDasharray="5 4" />
        <line className="vec vec--u" x1={origin.x} y1={origin.y} x2={chosenTip.x} y2={chosenTip.y} />
        <text x={tip.x + 8} y={tip.y + 14} style={{ fill: '#5b6c60' }}>表面切向</text>
        <text x={trueTip.x + 8} y={trueTip.y - 8} style={{ fill: '#3f7d52' }}>真正垂直</text>
        <text x={chosenTip.x + 8} y={chosenTip.y + 16} style={{ fill: '#2f6b8f' }}>变换后的法线</text>
      </svg>

      <Slider label="x 方向缩放" min={0.4} max={3} step={0.1} value={sx} onChange={setSx} />
      <Slider label="y 方向缩放" min={0.4} max={3} step={0.1} value={sy} onChange={setSy} />
      <Choice label="法线变换方式" options={[
        { value: 'direct', label: '直接乘世界矩阵', hint: 'n · M' },
        { value: 'inverse', label: '逆转置', hint: 'n · (M⁻¹)ᵀ' },
      ]} value={mode} onChange={(next) => { setMode(next); setSwitched(true); }} />

      <Readout items={[
        ['n · t（应为 0）', format(dotProduct)],
        ['与真正垂直的夹角', `${format(angle, 1)}°`],
        ['均匀缩放', Math.abs(sx - sy) < 0.01 ? '是（可直接归一化）' : '否'],
      ]} />
    </ActivityFrame>
  );
}
