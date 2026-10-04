import { useState } from 'react';
import { ActivityFrame } from '@/activities/ActivityFrame';
import { Choice, Readout, Slider } from '@/activities/controls';

type Mode = 'wrap' | 'clamp' | 'mirror' | 'border';
type Filter = 'point' | 'linear';

const WIDTH = 4;
const TEXELS = ['#2f6b8f', '#3f7d52', '#b1712f', '#8a5a8f'];
const BORDER = '#9aa29b';

function address(mode: Mode, u: number): { texel: number; outOfRange: boolean } {
  const t = u * WIDTH - 0.5; // 纹素中心的连续坐标
  if (mode === 'wrap') {
    const wrapped = ((t % WIDTH) + WIDTH) % WIDTH;
    return { texel: Math.floor(wrapped), outOfRange: false };
  }
  if (mode === 'clamp') {
    const clamped = Math.min(WIDTH - 1, Math.max(0, t));
    return { texel: Math.floor(clamped), outOfRange: t < 0 || t > WIDTH - 1 };
  }
  if (mode === 'mirror') {
    const period = WIDTH * 2;
    const wrapped = ((t % period) + period) % period;
    const folded = wrapped < WIDTH ? wrapped : period - 1 - wrapped;
    return { texel: Math.floor(Math.min(WIDTH - 1, Math.max(0, folded))), outOfRange: false };
  }
  return { texel: Math.floor(t), outOfRange: t < 0 || t > WIDTH - 1 };
}

/** 9.5–9.6 后的推演：切换过滤器与寻址模式，先猜边缘结果再验证。 */
export function FilterAddressActivity() {
  const [u, setU] = useState(0.62);
  const [mode, setMode] = useState<Mode>('wrap');
  const [filter, setFilter] = useState<Filter>('point');
  const [visited, setVisited] = useState<Mode[]>(['wrap']);

  const { texel, outOfRange } = address(mode, u);
  const border = mode === 'border' && outOfRange;
  const t = u * WIDTH - 0.5;
  const frac = t - Math.floor(t);
  const neighbors = [Math.floor(t), Math.floor(t) + 1];

  const stripStart = -1;
  const stripCount = 7;
  const cellWidth = 320 / stripCount;

  function choose(next: Mode) {
    setMode(next);
    setVisited((list) => (list.includes(next) ? list : [...list, next]));
  }

  function reset() {
    setU(0.62);
    setMode('wrap');
    setFilter('point');
    setVisited(['wrap']);
  }

  // 一条带上每个格子显示“按当前寻址模式取到的颜色”
  const cellColor = (index: number): string => {
    const slot = stripStart + index;
    const cellU = (slot + 0.5) / WIDTH;
    const result = address(mode, cellU);
    if (mode === 'border' && result.outOfRange) return BORDER;
    return TEXELS[Math.min(WIDTH - 1, Math.max(0, result.texel))] ?? BORDER;
  };

  return (
    <ActivityFrame
      id="ch09-filter-address"
      chapterId="ch09"
      title="u = 1.2 时会采到哪个纹素？"
      prompt="把 u 拖到 1.25（超出 [0, 1]），再在 Wrap / Clamp / Mirror / Border 之间切换，看采样结果怎么变。"
      predict={{
        question: '纹理宽度为 4，u = 1.2，Wrap 模式下会采样第几个纹素（从 0 开始）？',
        options: ['第 0 个', '第 1 个', '第 3 个', '超出范围，取边框色'],
        answer: 2,
        hint: 'Wrap 取小数部分：1.2 × 4 = 4.8，减去整数部分后是 0.8，再乘 4 落到第 3 个纹素。',
        correctNote: '1.2 × 4 = 4.8，取小数部分 0.8，落在第 3 个纹素（0 起）。',
        wrongNote: 'Wrap 是对 u 取小数部分：1.2 的小数部分是 0.2？不对——是对 u × width 取模。1.2 × 4 = 4.8，模 4 后是 0.8，对应第 3 个纹素。',
      }}
      onReset={reset}
      check={() => {
        if (visited.length < 3) return { passed: false, feedback: `现在只试过 ${visited.length} 种寻址模式。至少切换三种（比如 Wrap / Clamp / Mirror），比较它们在 u > 1 时的差别，再检查。` };
        if (u <= 1) return { passed: false, feedback: 'u 还在 [0, 1] 内，四种模式此时结果完全一样。把 u 拖到 1 以上（比如 1.25）再检查。' };
        return {
          passed: true,
          feedback: `u = ${u.toFixed(2)} 时：Wrap 取模后重复平铺、Clamp 钳到最后一个纹素、Mirror 镜像折回、Border 直接给边框色。连续坐标 t = ${t.toFixed(2)}，落在第 ${texel} 个纹素。`,
        };
      }}
      explanation={<>
        <p><b>过滤器</b>决定「纹理被放大时怎么取值」（图 9.5—9.7）：</p>
        <ul>
          <li><b>最近点（POINT）</b>：直接取最近的纹素，放大时会出现块状马赛克。</li>
          <li><b>双线性（LINEAR）</b>：取周围四个纹素做两次线性插值（图 9.6），放大时平滑得多。</li>
        </ul>
        <p><b>缩小</b>时的问题相反：一个像素覆盖多个纹素，直接采样会闪烁。解决办法是 mipmap——预先生成一条尺寸逐级减半的低细节链（图 9.8），按屏幕覆盖面积选合适的层级。图 9.9 对比了不加 mip 的摩尔纹和自动 mip 的干净结果。</p>
        <p><b>寻址模式</b>决定 uv 超出 [0, 1] 时怎么办（图 9.10—9.13）：Wrap 重复平铺、Clamp 钳到边缘、Mirror 镜像重复、Border 用边框色。图 9.14 展示了用无缝纹理平铺 2 × 3 次的效果。</p>
      </>}
      apply={<p>采样状态写在 <code>D3D12_SAMPLER_DESC</code> 里：<code>Filter</code>、<code>AddressU/V/W</code>、<code>MaxAnisotropy</code>、<code>BorderColor</code>。它绑定在根签名的描述符表里，与纹理分开设置。</p>}
    >
      <svg className="svg-stage" viewBox="0 0 320 320" role="img"
        aria-label={`纹理条带，u 等于 ${u.toFixed(2)}，寻址模式 ${mode}，采样到第 ${texel} 个纹素`}>
        <rect x={0} y={0} width={320} height={320} fill="#fffdf6" />
        {/* 超界区域底纹 */}
        <rect x={0} y={60} width={cellWidth} height={90} fill="#f0f0ea" />
        <rect x={cellWidth * (WIDTH + 1)} y={60} width={320 - cellWidth * (WIDTH + 1)} height={90} fill="#f0f0ea" />
        {Array.from({ length: stripCount }, (_unused, index) => <g key={index}>
          <rect x={index * cellWidth} y={60} width={cellWidth} height={90} fill={cellColor(index)} stroke="#fffdf6" />
          <text x={index * cellWidth + 4} y={80}>{((stripStart + index + 0.5) / WIDTH).toFixed(2)}</text>
        </g>)}
        <text x={12} y={52}>纹理条带（灰底为 u &lt; 0 或 u &gt; 1 的区域）</text>

        {/* 采样结果 */}
        <rect x={130} y={180} width={60} height={60} fill={border ? BORDER : TEXELS[Math.min(WIDTH - 1, Math.max(0, texel))]} stroke="#5b6c60" strokeWidth={2} />
        <text x={130} y={262}>采样结果（{filter === 'point' ? '最近点' : '双线性'}）</text>
        {filter === 'linear' && <text x={130} y={280}>与右邻纹素按 {frac.toFixed(2)} 混合</text>}
        {border && <text x={130} y={298}>超界 → 边框色</text>}

        {/* 采样位置指针 */}
        <line x1={((u * WIDTH + 1) / stripCount) * 320} y1={50} x2={((u * WIDTH + 1) / stripCount) * 320} y2={160} stroke="#2f6b8f" strokeWidth={2} />
        <text x={((u * WIDTH + 1) / stripCount) * 320 + 5} y={46}>u</text>
      </svg>

      <Slider label="纹理坐标 u" min={-0.3} max={1.6} step={0.01} value={u} onChange={setU} />
      <Choice label="寻址模式" options={[
        { value: 'wrap', label: 'Wrap', hint: '重复平铺' },
        { value: 'clamp', label: 'Clamp', hint: '钳到边缘' },
        { value: 'mirror', label: 'Mirror', hint: '镜像重复' },
        { value: 'border', label: 'Border', hint: '边框色' },
      ]} value={mode} onChange={choose} />
      <Choice label="过滤器" options={[
        { value: 'point', label: '最近点 POINT', hint: '块状' },
        { value: 'linear', label: '双线性 LINEAR', hint: '平滑' },
      ]} value={filter} onChange={setFilter} />

      <Readout items={[
        ['连续坐标 t = u·4 − 0.5', t.toFixed(2)],
        ['落在纹素', border ? '边框色' : `第 ${texel} 个`],
        ['小数部分（插值权重）', frac.toFixed(2)],
        ['相邻纹素', neighbors.join(' 与 ')],
        ['已试过的寻址模式', `${visited.length} / 4`],
      ]} />
    </ActivityFrame>
  );
}
