import { useState } from 'react';
import { ActivityFrame } from '@/activities/ActivityFrame';
import { Choice, Readout, Slider } from '@/activities/controls';

type FactorId = 'ZERO' | 'ONE' | 'SRC_ALPHA' | 'INV_SRC_ALPHA' | 'SRC_COLOR' | 'INV_SRC_COLOR';

const factors: Record<FactorId, { label: string; value: (src: number[], dst: number[], alpha: number, channel: number) => number }> = {
  ZERO: { label: 'ZERO（0）', value: () => 0 },
  ONE: { label: 'ONE（1）', value: () => 1 },
  SRC_ALPHA: { label: 'SRC_ALPHA（aₛ）', value: (_s, _d, alpha) => alpha },
  INV_SRC_ALPHA: { label: 'INV_SRC_ALPHA（1−aₛ）', value: (_s, _d, alpha) => 1 - alpha },
  SRC_COLOR: { label: 'SRC_COLOR（Cₛ）', value: (src, _d, _a, channel) => src[channel] },
  INV_SRC_COLOR: { label: 'INV_SRC_COLOR（1−Cₛ）', value: (src, _d, _a, channel) => 1 - src[channel] },
};

/** 10.1 后的推演：调源色、目标色、alpha 与混合因子，实时显示方程的每一项。 */
export function BlendEquationActivity() {
  const [src, setSrc] = useState<number[]>([0.9, 0.3, 0.2]);
  const [dst, setDst] = useState<number[]>([0.15, 0.35, 0.75]);
  const [alpha, setAlpha] = useState(0.6);
  const [srcFactor, setSrcFactor] = useState<FactorId>('SRC_ALPHA');
  const [dstFactor, setDstFactor] = useState<FactorId>('INV_SRC_ALPHA');
  const [touched, setTouched] = useState(false);

  const fs = factors[srcFactor];
  const fd = factors[dstFactor];

  const result = [0, 1, 2].map((channel) =>
    Math.min(1, fs.value(src, dst, alpha, channel) * src[channel] + fd.value(src, dst, alpha, channel) * dst[channel]));

  const toHex = (channels: number[]) => `rgb(${channels.map((value) => Math.round(value * 255)).join(', ')})`;

  function reset() {
    setSrc([0.9, 0.3, 0.2]);
    setDst([0.15, 0.35, 0.75]);
    setAlpha(0.6);
    setSrcFactor('SRC_ALPHA');
    setDstFactor('INV_SRC_ALPHA');
    setTouched(false);
  }

  // 标准 alpha 混合：C = a·Cs + (1−a)·Cd
  const isStandardAlpha = srcFactor === 'SRC_ALPHA' && dstFactor === 'INV_SRC_ALPHA';

  return (
    <ActivityFrame
      id="ch10-blend-equation"
      chapterId="ch10"
      title="把混合方程的每一项摆出来"
      prompt="目标：配出标准 alpha 混合 C = aₛ·Cₛ + (1−aₛ)·C_d。选好两个因子后再拖 alpha 看结果色怎么变。"
      predict={{
        question: '标准 alpha 混合（源因子 SRC_ALPHA、目标因子 INV_SRC_ALPHA）在 aₛ = 0 时会得到什么？',
        options: ['源色', '目标色（完全透明，看不出源色）', '黑色', '白色'],
        answer: 1,
        hint: 'C = a·Cs + (1−a)·Cd，把 a = 0 代进去看看。',
        correctNote: 'a = 0 时源色权重为 0，结果就是目标色，也就是「完全透明」。',
        wrongNote: '代入 a = 0：C = 0·Cs + 1·Cd = Cd，结果完全是目标色。',
      }}
      onReset={reset}
      check={() => {
        if (!touched) return { passed: false, feedback: '先改一下混合因子或 alpha，观察结果色与各项数值的变化，再检查。' };
        if (!isStandardAlpha) return { passed: false, feedback: '现在还不是标准 alpha 混合。把源因子设为 SRC_ALPHA、目标因子设为 INV_SRC_ALPHA 再检查。' };
        return {
          passed: true,
          feedback: `这就是标准 alpha 混合 C = aₛ·Cₛ + (1−aₛ)·C_d。当前 aₛ = ${alpha.toFixed(2)}，结果色 ${toHex(result)}，正好是源色与目标色按 alpha 加权平均。`,
        };
      }}
      explanation={<>
        <p>混合方程（图 10.1 附近）是逐通道做的：</p>
        <div className="math-block">C = F<sub>src</sub> ⊗ C<sub>src</sub> &nbsp;op&nbsp; F<sub>dst</sub> ⊗ C<sub>dst</sub><small>op 默认是加法；⊗ 表示逐分量相乘</small></div>
        <p>最常用的组合是 <code>SrcBlend = SRC_ALPHA</code>、<code>DestBlend = INV_SRC_ALPHA</code>、<code>BlendOp = ADD</code>，也就是标准的 alpha 混合：源色按 alpha 权重盖在目标色上。</p>
        <p>把 op 换成减法就得到图 10.3 的变暗效果，把因子设成 ONE/ONE 得到图 10.2 的加法混合（火焰、光效常用，图 10.5）。</p>
        <p>alpha 通道也可以单独用一套因子（<code>SrcBlendAlpha</code> / <code>DestBlendAlpha</code>），D3D12 允许 RGB 与 alpha 分开设置。</p>
      </>}
      apply={<p>写在 PSO 的 <code>D3D12_BLEND_DESC</code> 里：<code>RenderTarget[0].SrcBlend</code>、<code>DestBlend</code>、<code>BlendOp</code>，以及 <code>BlendEnable</code>。D3D12 里没有独立的「设置混合状态」调用。</p>}
    >
      <div className="ctl-panel">
        <span className="ctl-panel__title">结果预览</span>
        <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
          <div style={{ flex: 1 }}>
            <div style={{ height: 46, borderRadius: 7, background: toHex(src), border: '1px solid #e3e8dd' }} />
            <p className="draggable-note">源色 Cₛ</p>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ height: 46, borderRadius: 7, background: toHex(dst), border: '1px solid #e3e8dd' }} />
            <p className="draggable-note">目标色 C_d</p>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ height: 46, borderRadius: 7, background: toHex(result), border: '2px solid #3f7d52' }} />
            <p className="draggable-note">混合结果 C</p>
          </div>
        </div>
      </div>

      <Slider label="源色 R" min={0} max={1} step={0.05} value={src[0]} onChange={(value) => { setSrc([value, src[1], src[2]]); setTouched(true); }} />
      <Slider label="源色 G" min={0} max={1} step={0.05} value={src[1]} onChange={(value) => { setSrc([src[0], value, src[2]]); setTouched(true); }} />
      <Slider label="源色 B" min={0} max={1} step={0.05} value={src[2]} onChange={(value) => { setSrc([src[0], src[1], value]); setTouched(true); }} />
      <Slider label="目标色 R" min={0} max={1} step={0.05} value={dst[0]} onChange={(value) => { setDst([value, dst[1], dst[2]]); setTouched(true); }} />
      <Slider label="目标色 G" min={0} max={1} step={0.05} value={dst[1]} onChange={(value) => { setDst([dst[0], value, dst[2]]); setTouched(true); }} />
      <Slider label="目标色 B" min={0} max={1} step={0.05} value={dst[2]} onChange={(value) => { setDst([dst[0], dst[1], value]); setTouched(true); }} />
      <Slider label="源 alpha aₛ" min={0} max={1} step={0.05} value={alpha} onChange={(value) => { setAlpha(value); setTouched(true); }} />

      <Choice label="源因子 F_src" options={Object.entries(factors).map(([key, factor]) => ({ value: key, label: factor.label }))}
        value={srcFactor} onChange={(value) => { setSrcFactor(value as FactorId); setTouched(true); }} />
      <Choice label="目标因子 F_dst" options={Object.entries(factors).map(([key, factor]) => ({ value: key, label: factor.label }))}
        value={dstFactor} onChange={(value) => { setDstFactor(value as FactorId); setTouched(true); }} />

      <Readout items={[
        ['F_src ⊗ Cₛ (R)', (fs.value(src, dst, alpha, 0) * src[0]).toFixed(3)],
        ['F_dst ⊗ C_d (R)', (fd.value(src, dst, alpha, 0) * dst[0]).toFixed(3)],
        ['结果 R', result[0].toFixed(3)],
        ['标准 alpha 混合', isStandardAlpha ? '是' : '否'],
      ]} />
    </ActivityFrame>
  );
}
