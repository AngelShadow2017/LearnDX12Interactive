import { useState } from 'react';
import { ActivityFrame } from '@/activities/ActivityFrame';
import { Choice, Readout, Slider, svgPoint } from '@/activities/controls';
import { cross, format, length, vec3 } from '@/activities/math';

const UNIT = 44;

type Order = 'u×v' | 'v×u';

/** 1.4 后的推演：交换叉积输入，预测法线方向。 */
export function CrossProductActivity() {
  const [angleU, setAngleU] = useState(0);
  const [angleV, setAngleV] = useState(60);
  const [order, setOrder] = useState<Order>('u×v');

  const radians = (degrees: number) => (degrees * Math.PI) / 180;
  const u = vec3(Math.cos(radians(angleU)) * 3, Math.sin(radians(angleU)) * 3, 0);
  const v = vec3(Math.cos(radians(angleV)) * 2.4, Math.sin(radians(angleV)) * 2.4, 0);
  const w = order === 'u×v' ? cross(u, v) : cross(v, u);

  // 左手系 +z 指向页面内部，所以 w_z > 0 表示指向页面内（⊗）。
  const direction = w[2] > 0.05 ? '指向页面内（⊗，+z）' : w[2] < -0.05 ? '指向页面外（⊙，−z）' : '落在页面内（w = 0）';
  const parallel = Math.abs(w[2]) < 0.05;
  const signedGap = ((angleV - angleU + 540) % 360) - 180;
  const gap = Math.abs(signedGap);

  const origin = svgPoint(0, 0, UNIT);
  const hu = svgPoint(u[0], u[1], UNIT);
  const hv = svgPoint(v[0], v[1], UNIT);

  function reset() {
    setAngleU(0);
    setAngleV(60);
    setOrder('u×v');
  }

  return (
    <ActivityFrame
      id="ch01-cross-product"
      chapterId="ch01"
      title="交换叉积的输入，法线就翻向"
      prompt="把「交换输入顺序」切成 v × u，看看 w 的 z 分量和方向文字怎么变；再把两个方向拖到共线，看叉积什么时候变成零。"
      predict={{
        question: '保持 u、v 不变，只把 u × v 换成 v × u，得到的 w 会怎样？',
        options: ['完全不变', '长度不变，方向相反', '长度减半', '变成零向量'],
        answer: 1,
        hint: '叉积满足反交换律：u × v = −(v × u)。长度 ‖u‖‖v‖ sin θ 与顺序无关。',
        correctNote: '反交换律成立：交换顺序只翻转方向，长度不变。',
        wrongNote: '‖u × v‖ = ‖u‖‖v‖ sin θ 与顺序无关，交换只改变方向：u × v = −(v × u)。',
      }}
      onReset={reset}
      check={() => {
        if (parallel) return { passed: false, feedback: '现在两个向量共线，叉积是零向量，看不出方向。把夹角调开一些再检查。' };
        if (order !== 'v×u') return { passed: false, feedback: '把输入顺序切到 v × u，观察 w 的 z 分量符号是否翻转，再检查。' };
        return {
          passed: true,
          feedback: `u × v 时 w = (${cross(u, v).map((value) => format(value)).join(', ')})；切成 v × u 后 w = (${format(w[0])}, ${format(w[1])}, ${format(w[2])})。z 分量正好取反，长度都是 ${format(length(cross(u, v)))}。`,
        };
      }}
      explanation={<>
        <p>叉积只对 3D 向量有意义，结果<b>不是数而是向量</b>：w = u × v 同时垂直于 u 和 v。</p>
        <div className="math-block">u × v = (u<sub>y</sub>v<sub>z</sub> − u<sub>z</sub>v<sub>y</sub>,  u<sub>z</sub>v<sub>x</sub> − u<sub>x</sub>v<sub>z</sub>,  u<sub>x</sub>v<sub>y</sub> − u<sub>y</sub>v<sub>x</sub>)</div>
        <p>长度满足 ‖u × v‖ = ‖u‖‖v‖ sin θ，正好等于 u、v 张成的平行四边形面积；夹角为 0 或 180° 时面积为零，叉积就是零向量——这就是「共线向量叉不出法线」。</p>
        <p>方向由<b>左手定则</b>确定（Direct3D 用左手系）：伸出左手，四指从 u 转向 v，拇指指向就是 w 的方向。交换顺序相当于把转向反过来，于是 w 取反。</p>
        <p>这条性质直接决定了三角形法线的朝向。绕序写反，法线就朝向背面，光照和背面剔除会同时出错。</p>
      </>}
      apply={<p>求三角形面法线的典型写法是 <code>XMVector3Cross(XMVectorSubtract(v1, v0), XMVectorSubtract(v2, v0))</code>。顶点顺序决定法线朝哪边，改了顶点顺序就要跟着改背面剔除设置。</p>}
    >
      <svg className="svg-stage" viewBox="0 0 320 320" role="img"
        aria-label={`u 与 v 在 xy 平面上，叉积结果 w 的 z 分量为 ${format(w[2])}，方向${direction}`}>
        <g className="plane-grid">
          {Array.from({ length: 15 }, (_unused, index) => index - 7).map((index) => <g key={index}>
            <line x1={160 + index * UNIT} y1={0} x2={160 + index * UNIT} y2={320} />
            <line x1={0} y1={160 - index * UNIT} x2={320} y2={160 - index * UNIT} />
          </g>)}
        </g>
        <line className="axis" x1={20} y1={160} x2={300} y2={160} />
        <line className="axis" x1={160} y1={300} x2={160} y2={20} />
        <line className="vec vec--u" x1={origin.x} y1={origin.y} x2={hu.x} y2={hu.y} />
        <line className="vec vec--v" x1={origin.x} y1={origin.y} x2={hv.x} y2={hv.y} />
        <text x={hu.x + 8} y={hu.y - 8} style={{ fill: '#2f6b8f' }}>u</text>
        <text x={hv.x + 8} y={hv.y - 8} style={{ fill: '#b1712f' }}>v</text>

        <g transform="translate(160 160)">
          {w[2] > 0.05
            ? <><circle r={17} fill="none" stroke="#3f7d52" strokeWidth={2} /><line x1={-12} y1={-12} x2={12} y2={12} stroke="#3f7d52" strokeWidth={2} /><line x1={-12} y1={12} x2={12} y2={-12} stroke="#3f7d52" strokeWidth={2} /></>
            : w[2] < -0.05
              ? <><circle r={17} fill="#3f7d52" /><circle r={5} fill="#fffdf6" /></>
              : <text textAnchor="middle" y={6}>w = 0</text>}
        </g>
        <text x={184} y={182} style={{ fill: '#3f7d52' }}>w</text>
      </svg>

      <Choice label="输入顺序" options={[{ value: 'u×v', label: 'u × v' }, { value: 'v×u', label: 'v × u', hint: '反交换律' }]} value={order} onChange={setOrder} />
      <Slider label="u 的方向角" min={-180} max={180} step={1} value={angleU} onChange={setAngleU} format={(value) => `${value}°`} />
      <Slider label="v 的方向角" min={-180} max={180} step={1} value={angleV} onChange={setAngleV} format={(value) => `${value}°`} />

      <Readout items={[
        ['w = ' + order, `(${format(w[0])}, ${format(w[1])}, ${format(w[2])})`],
        ['‖w‖', format(length(w))],
        ['w 的方向', direction],
        ['夹角', `${gap}°`],
      ]} />
    </ActivityFrame>
  );
}
