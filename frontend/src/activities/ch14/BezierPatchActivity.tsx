import { useState } from 'react';
import { ActivityFrame } from '@/activities/ActivityFrame';
import { Readout, Slider, svgToMath } from '@/activities/controls';
import { format } from '@/activities/math';

const UNIT = 46;

type Control = { id: number; x: number; y: number };

const initial: Control[] = [
  { id: 0, x: -2.2, y: -1.2 },
  { id: 1, x: -0.8, y: 1.4 },
  { id: 2, x: 0.8, y: 1.4 },
  { id: 3, x: 2.2, y: -1.2 },
];

const lerp = (a: { x: number; y: number }, b: { x: number; y: number }, t: number) => ({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t });

/** 14.6 后的推演：拖动贝塞尔控制点与参数 t，看曲线怎么形成。 */
export function BezierPatchActivity() {
  const [controls, setControls] = useState<Control[]>(initial);
  const [t, setT] = useState(0.5);
  const [dragging, setDragging] = useState<number | null>(null);
  const [moved, setMoved] = useState(false);

  // De Casteljau：三层递归插值
  const level1 = [0, 1, 2].map((index) => lerp(controls[index], controls[index + 1], t));
  const level2 = [0, 1].map((index) => lerp(level1[index], level1[index + 1], t));
  const point = lerp(level2[0], level2[1], t);

  const curve: Array<{ x: number; y: number }> = [];
  for (let index = 0; index <= 60; index += 1) {
    const s = index / 60;
    const a = [0, 1, 2].map((k) => lerp(controls[k], controls[k + 1], s));
    const b = [0, 1].map((k) => lerp(a[k], a[k + 1], s));
    curve.push(lerp(b[0], b[1], s));
  }

  function startDrag(control: Control) {
    return (event: React.PointerEvent<SVGCircleElement>) => {
      const svg = event.currentTarget.ownerSVGElement;
      if (!svg) return;
      setDragging(control.id);
      event.currentTarget.setPointerCapture(event.pointerId);
      const move = (moveEvent: PointerEvent) => {
        const next = svgToMath(moveEvent, svg, UNIT);
        setControls((current) => current.map((item) => (item.id === control.id
          ? { ...item, x: Math.max(-3, Math.min(3, next.x)), y: Math.max(-3, Math.min(3, next.y)) }
          : item)));
        setMoved(true);
      };
      const stop = () => { setDragging(null); window.removeEventListener('pointermove', move); };
      window.addEventListener('pointermove', move);
      window.addEventListener('pointerup', stop, { once: true });
    };
  }

  function reset() {
    setControls(initial);
    setT(0.5);
    setMoved(false);
  }

  const toSvg = (p: { x: number; y: number }) => ({ x: 160 + p.x * UNIT, y: 160 - p.y * UNIT });
  const path = curve.map((p) => { const s = toSvg(p); return `${s.x.toFixed(1)},${s.y.toFixed(1)}`; }).join(' ');

  return (
    <ActivityFrame
      id="ch14-bezier"
      chapterId="ch14"
      title="拖动控制点，看三次贝塞尔曲线怎么形成"
      prompt="拖动四个控制点（白色圆点），再把参数 t 拖到 0.5，读出曲线上那一点的坐标。"
      predict={{
        question: '三次贝塞尔曲线一定经过哪些点？',
        options: ['四个控制点都经过', '只经过首末两个控制点 P0 和 P3', '一个都不经过', '只经过中间两个'],
        answer: 1,
        hint: '中间两个控制点是「切线手柄」，它们决定曲线朝哪弯，但曲线一般不穿过它们。',
        correctNote: '曲线插值于首末控制点；中间两个只控制切线方向。',
        wrongNote: '贝塞尔曲线只保证经过 P0 与 P3；P1、P2 是控制切线形状的手柄，一般不在曲线上。',
      }}
      onReset={reset}
      check={() => {
        if (!moved) return { passed: false, feedback: '先拖动任意一个控制点，看曲线怎么跟着变形，再检查。' };
        if (Math.abs(t - 0.5) > 0.02) return { passed: false, feedback: `把参数 t 拖到 0.5（当前 ${t.toFixed(2)}），读出曲线中点的坐标，再检查。` };
        return {
          passed: true,
          feedback: `t = 0.5 时曲线上的点是 (${format(point.x)}, ${format(point.y)})。注意它不等于四个控制点的平均值——三次贝塞尔在 t = 0.5 处的权重是 1:3:3:1（伯恩斯坦基函数），中间两个控制点的影响更大。`,
        };
      }}
      explanation={<>
        <p>三次贝塞尔曲线由四个控制点定义，用伯恩斯坦基函数加权：</p>
        <div className="math-block">B(t) = (1−t)³P₀ + 3t(1−t)²P₁ + 3t²(1−t)P₂ + t³P₃</div>
        <p>图 14.6 展示了等价的 <b>De Casteljau</b> 递归插值：先在相邻控制点之间插值得到三个点，再在它们之间插值得到两个点，最后再插一次得到曲线上的点。这个形式更稳定，也更容易推广到曲面。</p>
        <p>把四个控制点换成 4 × 4 的控制点网格，就得到<b>三次贝塞尔曲面</b>（图 14.7、14.8）：先在 u 方向做四次曲线求值得到四个点，再在 v 方向求值一次。这正是曲面细分演示里 domain shader 做的事。</p>
      </>}
      apply={<p>域着色器里对应 <code>CubicBezierSum</code> 一类的辅助函数：用 4 × 4 控制点与伯恩斯坦基（或 De Casteljau）算出 (u, v) 处的顶点位置。</p>}
    >
      <svg className="svg-stage" viewBox="0 0 320 320" role="img"
        aria-label={`三次贝塞尔曲线，t 等于 ${t.toFixed(2)}，曲线上点为 ${format(point.x)} 逗号 ${format(point.y)}`}>
        <g className="plane-grid">
          {Array.from({ length: 15 }, (_unused, index) => index - 7).map((index) => <g key={index}>
            <line x1={160 + index * UNIT} y1={0} x2={160 + index * UNIT} y2={320} />
            <line x1={0} y1={160 - index * UNIT} x2={320} y2={160 - index * UNIT} />
          </g>)}
        </g>

        <polyline points={controls.map((c) => { const s = toSvg(c); return `${s.x},${s.y}`; }).join(' ')}
          fill="none" stroke="#c9b78e" strokeWidth={1.6} strokeDasharray="5 4" />
        <polyline points={level1.map((p) => { const s = toSvg(p); return `${s.x},${s.y}`; }).join(' ')} fill="none" stroke="#8fa8bf" strokeWidth={1.4} />
        <polyline points={level2.map((p) => { const s = toSvg(p); return `${s.x},${s.y}`; }).join(' ')} fill="none" stroke="#3f7d52" strokeWidth={1.4} />
        <polyline points={path} fill="none" stroke="#2f6b8f" strokeWidth={2.6} />

        {controls.map((control) => {
          const s = toSvg(control);
          return <g key={control.id}>
            <circle cx={s.x} cy={s.y} r={8} fill={dragging === control.id ? '#dff0e1' : '#fff'} stroke="#2f6b8f" strokeWidth={2}
              style={{ cursor: 'grab' }} onPointerDown={startDrag(control)} />
            <text x={s.x + 10} y={s.y - 8}>P{control.id}</text>
          </g>;
        })}
        {(() => { const s = toSvg(point); return <circle cx={s.x} cy={s.y} r={5} fill="#2f6b8f" />; })()}
      </svg>

      <Slider label="参数 t" min={0} max={1} step={0.01} value={t} onChange={setT} />

      <Readout items={[
        ['曲线上的点 B(t)', `(${format(point.x)}, ${format(point.y)})`],
        ['P0', `(${format(controls[0].x)}, ${format(controls[0].y)})`],
        ['P3', `(${format(controls[3].x)}, ${format(controls[3].y)})`],
        ['曲线经过 P0 / P3', '是（保证）'],
      ]} />
      <p className="draggable-note">灰色虚线 = 控制多边形；蓝/绿线 = De Casteljau 的两层中间插值。</p>
    </ActivityFrame>
  );
}
