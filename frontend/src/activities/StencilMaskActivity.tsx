import { useState } from 'react';
import { ActivityFrame } from '@/activities/ActivityFrame';
import { Choice, Readout } from '@/activities/controls';

const COLS = 8;
const ROWS = 6;
const CELL = 40;

type Mode = 'paint' | 'render';

/** 镜子在像素网格里的位置（列 3—5、行 2—4）。 */
const mirror = (col: number, row: number) => col >= 3 && col <= 5 && row >= 2 && row <= 4;

/** 11.2 后的推演：逐像素绘制模板掩码，看哪些反射像素能通过。 */
export function StencilMaskActivity() {
  const [stencil, setStencil] = useState<number[]>(() => Array.from({ length: COLS * ROWS }, () => 0));
  const [mode, setMode] = useState<Mode>('paint');
  const [reflectionDrawn, setReflectionDrawn] = useState(false);

  const painted = stencil.filter((value) => value === 1).length;

  function toggle(index: number) {
    if (mode !== 'paint') return;
    setStencil((current) => current.map((value, at) => (at === index ? (value === 1 ? 0 : 1) : value)));
    setReflectionDrawn(false);
  }

  function reset() {
    setStencil(Array.from({ length: COLS * ROWS }, () => 0));
    setMode('paint');
    setReflectionDrawn(false);
  }

  function fillMirror() {
    setStencil(Array.from({ length: COLS * ROWS }, (_unused, index) => (mirror(index % COLS, Math.floor(index / COLS)) ? 1 : 0)));
    setReflectionDrawn(false);
  }

  const matchesMirror = stencil.every((value, index) => value === (mirror(index % COLS, Math.floor(index / COLS)) ? 1 : 0));

  return (
    <ActivityFrame
      id="ch11-stencil-mask"
      chapterId="ch11"
      title="逐像素画模板掩码，看哪些倒影能画出来"
      prompt="先在「写掩码」模式里把镜面区域标成 1（也可以直接点「按镜面位置填充」），再切到「画倒影」模式，看倒影只出现在掩码为 1 的地方。"
      predict={{
        question: '把模板掩码写好后绘制倒影，不在掩码内的像素会怎样？',
        options: ['照常画出来', '被模板测试挡住，完全不写入', '变成半透明', '颜色被反转'],
        answer: 1,
        hint: '模板测试发生在深度测试之前；不通过的像素连后续阶段都不会进入。',
        correctNote: '模板测试不通过的像素会被直接丢弃，不会写入颜色或深度。这正是「倒影不穿墙」的实现方式。',
        wrongNote: '模板测试不通过 = 像素被丢弃，既不写颜色也不写深度。它不是「变半透明」。',
      }}
      onReset={reset}
      check={() => {
        if (!matchesMirror) return { passed: false, feedback: '掩码还没有正好覆盖镜面区域（第 3—5 列、第 2—4 行）。可以用「按镜面位置填充」，或手动点掉多余的格子。' };
        if (!reflectionDrawn) return { passed: false, feedback: '掩码对了。切到「画倒影」模式并点「绘制倒影」，看倒影落点，再检查。' };
        return {
          passed: true,
          feedback: `倒影只出现在 ${painted} 个掩码为 1 的像素上，其余像素被模板测试挡住——这就是图 11.1 里「骷髅倒影不会透过砖墙显示」的原理。`,
        };
      }}
      explanation={<>
        <p>模板缓冲和深度缓冲共享同一个资源（<code>DXGI_FORMAT_D24_UNORM_S8_UINT</code>：24 位深度 + 8 位模板）。清除时可以一次清两者，也可以只清其中一个。</p>
        <p>模板测试的形式是：</p>
        <div className="math-block">(StencilRef &amp; StencilReadMask) ⊴ (Value &amp; StencilReadMask)<small>⊴ 是比较函数（默认 ALWAYS 以外的某个）；不通过则丢弃像素</small></div>
        <p>图 11.4 展示了镜面渲染的关键一步：<b>只写模板、不写颜色</b>地把镜面覆盖的像素标记出来。之后绘制倒影时把比较函数设成 EQUAL、参考值设成 1，倒影就只会落在镜面像素上（图 11.1）。</p>
        <p>顺序上，模板测试在深度测试<b>之前</b>，所以不通过的像素连深度测试都不会做。</p>
      </>}
      apply={<p>写在 PSO 的 <code>D3D12_DEPTH_STENCIL_DESC</code> 里：<code>StencilEnable</code>、<code>FrontFace.StencilFunc</code>、<code>StencilPassOp</code>，再用 <code>OMSetStencilRef</code> 给参考值。</p>}
    >
      <svg className="svg-stage" viewBox={`0 0 ${COLS * CELL} ${ROWS * CELL + 26}`} role="img"
        aria-label={`${COLS} 乘 ${ROWS} 的像素网格，掩码为 1 的有 ${painted} 个，当前模式 ${mode === 'paint' ? '写掩码' : '画倒影'}`}>
        <rect x={0} y={0} width={COLS * CELL} height={ROWS * CELL} fill="#ecefe7" />
        {Array.from({ length: COLS * ROWS }, (_unused, index) => {
          const col = index % COLS;
          const row = Math.floor(index / COLS);
          const masked = stencil[index] === 1;
          const inMirror = mirror(col, row);
          const showReflection = mode === 'render' && reflectionDrawn && masked;
          return <g key={index}>
            <rect x={col * CELL} y={row * CELL} width={CELL - 2} height={CELL - 2}
              fill={showReflection ? '#2f6b8f' : masked ? '#d8e6d9' : inMirror ? '#f2f4ee' : '#d9dcd3'}
              stroke={inMirror ? '#3f7d52' : '#c4ccbe'}
              strokeWidth={inMirror ? 1.8 : 1}
              onClick={() => toggle(index)}
              style={{ cursor: mode === 'paint' ? 'pointer' : 'default' }} />
            <text x={col * CELL + 6} y={row * CELL + 24} style={{ fontSize: 10 }}>
              {masked ? '1' : '0'}
            </text>
          </g>;
        })}
        <text x={4} y={ROWS * CELL + 18}>绿框 = 镜面区域；白底 = 掩码 0；浅绿 = 掩码 1；蓝色 = 倒影已画</text>
      </svg>

      <Choice label="模式" options={[
        { value: 'paint', label: '写掩码（点格子切换 0/1）', hint: '只写模板不写颜色' },
        { value: 'render', label: '画倒影（模板测试 EQUAL 1）' },
      ]} value={mode} onChange={(next) => { setMode(next as Mode); setReflectionDrawn(false); }} />

      <div className="activity__actions">
        <button className="button button--outline" type="button" onClick={fillMirror}>按镜面位置填充</button>
        {mode === 'render' && <button className="button button--accent" type="button" onClick={() => setReflectionDrawn(true)}>绘制倒影</button>}
      </div>

      <Readout items={[
        ['掩码为 1 的像素', `${painted} 个`],
        ['镜面区域像素', '9 个'],
        ['掩码是否正好覆盖镜面', matchesMirror ? '是' : '否'],
        ['倒影是否已绘制', reflectionDrawn ? '是' : '否'],
      ]} />
    </ActivityFrame>
  );
}
