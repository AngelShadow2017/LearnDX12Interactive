import { useState } from 'react';
import { ActivityFrame } from '@/activities/ActivityFrame';
import { Choice, Readout, Slider } from '@/activities/controls';

type Mode = 'wrap' | 'clamp' | 'mirror' | 'border';
type Filter = 'point' | 'linear';

const WIDTH = 4;
const TEXELS = ['#2f6b8f', '#3f7d52', '#b1712f', '#8a5a8f'];
const BORDER = '#9aa29b';

function addressTap(mode: Mode, index: number): number | null {
  if (mode === 'wrap') return ((index % WIDTH) + WIDTH) % WIDTH;
  if (mode === 'clamp') return Math.min(WIDTH - 1, Math.max(0, index));
  if (mode === 'mirror') {
    const period = WIDTH * 2;
    const wrapped = ((index % period) + period) % period;
    return wrapped < WIDTH ? wrapped : period - 1 - wrapped;
  }
  return index < 0 || index >= WIDTH ? null : index;
}

function colorAt(index: number | null): string {
  return index === null ? BORDER : TEXELS[index] ?? BORDER;
}

function blendColors(a: string, b: string, t: number): string {
  const channels = (hex: string) => hex.match(/[\da-f]{2}/gi)!.map((part) => Number.parseInt(part, 16));
  const ca = channels(a);
  const cb = channels(b);
  return `#${ca.map((value, index) => Math.round(value + (cb[index] - value) * t).toString(16).padStart(2, '0')).join('')}`;
}

/** 9.5–9.6 后的推演：对比寻址模式，并用一维条带示意 POINT / LINEAR。 */
export function FilterAddressActivity() {
  const [u, setU] = useState(0.62);
  const [mode, setMode] = useState<Mode>('wrap');
  const [filter, setFilter] = useState<Filter>('point');
  const [visited, setVisited] = useState<Mode[]>(['wrap']);

  // POINT 选 floor(u*width)；LINEAR 在相邻纹素中心之间插值。
  const t = u * WIDTH - 0.5;
  const frac = t - Math.floor(t);
  const firstRawTap = filter === 'point' ? Math.floor(u * WIDTH) : Math.floor(t);
  const firstTap = addressTap(mode, firstRawTap);
  const secondTap = filter === 'point' ? firstTap : addressTap(mode, firstRawTap + 1);
  const border = firstTap === null || secondTap === null;
  const sampleColor = filter === 'point'
    ? colorAt(firstTap)
    : blendColors(colorAt(firstTap), colorAt(secondTap), frac);
  const sampledTexels = filter === 'point'
    ? [firstTap === null ? '边框' : String(firstTap)]
    : [firstTap, secondTap].map((index) => index === null ? '边框' : String(index));

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

  // 条带上的单元格是纹素中心；超界纹素按当前寻址模式映射。
  const cellColor = (index: number): string => {
    const slot = stripStart + index;
    return colorAt(addressTap(mode, slot));
  };

  const pointerX = ((u * WIDTH + 1) / stripCount) * 320;
  const outputTaps = sampledTexels.join(' 与 ');

  return (
    <ActivityFrame
      id="ch09-filter-address"
      chapterId="ch09"
      title="u = 1.2 时会采到哪个纹素？"
      prompt="把 u 拖到 1.2（超出 [0, 1]），再在 Wrap / Clamp / Mirror / Border 之间切换；也可切换 POINT / LINEAR 比较离散取样与相邻纹素插值。"
      predict={{
        question: '纹理宽度为 4，POINT 过滤下 u = 1.2，Wrap 模式会采样第几个纹素（从 0 开始）？',
        options: ['第 0 个', '第 1 个', '第 3 个', '超出范围，取边框色'],
        answer: 0,
        hint: 'Wrap 把 u = 1.2 折回 0.2；宽度为 4 时，POINT 取 floor(0.2 × 4)，索引是 0。',
        correctNote: 'u 折回 0.2，POINT 采样索引为 floor(0.2 × 4) = 0。',
        wrongNote: '先将 u 按 Wrap 折回 [0,1)：1.2 → 0.2，再用 floor(u × width) 算纹素索引：floor(0.8) = 0。',
      }}
      onReset={reset}
      check={() => {
        if (visited.length < 3) return { passed: false, feedback: `现在只试过 ${visited.length} 种寻址模式。至少切换三种（比如 Wrap / Clamp / Mirror），比较它们在 u > 1 时的差别，再检查。` };
        if (u <= 1) return { passed: false, feedback: 'u 还在 [0, 1] 内，四种模式此时结果相同。把 u 拖到 1 以上（比如 1.25）再检查。' };
        return {
          passed: true,
          feedback: `u = ${u.toFixed(2)} 时：Wrap 取模后重复平铺、Clamp 钳到边缘、Mirror 镜像折回、Border 对超界采样返回边框色。当前 ${filter === 'point' ? 'POINT 离散取样' : `LINEAR 在纹素 ${outputTaps} 间插值`}；连续纹素坐标 t = ${t.toFixed(2)}，插值权重 ${frac.toFixed(2)}。`,
        };
      }}
      explanation={<>
        <p><b>过滤器</b>决定「纹理被放大时怎么取值」（图 9.5—9.7）：最近点（POINT）取一个纹素；双线性（LINEAR）在二维纹理上取周围四个纹素做两次线性插值。这里的一维色条只演示水平方向的两个采样点。</p>
        <p><b>缩小</b>时，一个屏幕像素可能覆盖多个纹素，直接采样会闪烁。解决办法是 mipmap——预先生成一条尺寸逐级减半的低细节链（图 9.8），硬件根据纹理坐标在屏幕上的变化估算采样足迹并选择层级。图 9.9 对比了不加 mip 的摩尔纹和 mip 过滤后的结果。</p>
        <p><b>寻址模式</b>决定 uv 超出 [0, 1] 时怎么办（图 9.10—9.13）：Wrap 重复平铺、Clamp 钳到边缘、Mirror 镜像重复、Border 用边框色。图 9.14 展示了用无缝纹理平铺 2 × 3 次的效果。</p>
      </>}
      apply={<p>采样状态写在 <code>D3D12_SAMPLER_DESC</code> 里：<code>Filter</code>、<code>AddressU/V/W</code>、<code>MaxAnisotropy</code>、<code>BorderColor</code>。它绑定在根签名的描述符表里，与纹理分开设置。</p>}
    >
      <svg className="svg-stage" viewBox="0 0 320 320" role="img"
        aria-label={`纹理条带，u 等于 ${u.toFixed(2)}，寻址模式 ${mode}，${filter === 'point' ? `采样纹素 ${outputTaps}` : `线性插值纹素 ${outputTaps}`}`}>
        <rect x={0} y={0} width={320} height={320} fill="#fffdf6" />
        <rect x={0} y={60} width={cellWidth} height={90} fill="#f0f0ea" />
        <rect x={cellWidth * (WIDTH + 1)} y={60} width={320 - cellWidth * (WIDTH + 1)} height={90} fill="#f0f0ea" />
        {Array.from({ length: stripCount }, (_unused, index) => <g key={index}>
          <rect x={index * cellWidth} y={60} width={cellWidth} height={90} fill={cellColor(index)} stroke="#fffdf6" />
          <text x={index * cellWidth + 4} y={80}>{((stripStart + index + 0.5) / WIDTH).toFixed(2)}</text>
        </g>)}
        <text x={12} y={52}>纹理条带（灰底为 u &lt; 0 或 u &gt; 1 的区域）</text>

        <rect x={130} y={180} width={60} height={60} fill={sampleColor} stroke="#5b6c60" strokeWidth={2} />
        <text x={130} y={262}>采样结果（{filter === 'point' ? '最近点' : '双线性'}）</text>
        {filter === 'linear' && <text x={130} y={280}>纹素 {outputTaps}，权重 {frac.toFixed(2)}</text>}
        {border && <text x={130} y={298}>含边框色采样</text>}

        <line x1={pointerX} y1={50} x2={pointerX} y2={160} stroke="#2f6b8f" strokeWidth={2} />
        <text x={pointerX + 5} y={46}>u</text>
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
        ['连续纹素坐标 t = u·4 − 0.5', t.toFixed(2)],
        ['寻址后的采样纹素', outputTaps],
        ['LINEAR 插值权重', filter === 'linear' ? frac.toFixed(2) : '不适用'],
        ['已试过的寻址模式', `${visited.length} / 4`],
      ]} />
    </ActivityFrame>
  );
}
