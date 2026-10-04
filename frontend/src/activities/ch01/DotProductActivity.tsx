import { useRef, useState } from 'react';
import { ActivityFrame } from '@/activities/ActivityFrame';
import { Readout, Slider, svgPoint, svgToMath } from '@/activities/controls';
import { angleBetween, dot, format, length, vec3 } from '@/activities/math';

const UNIT = 42;
const initialU: [number, number] = [3, 0];
const initialV: [number, number] = [1.5, 2.5];

/** 1.3 后的推演：先猜点积正负，再拖动夹角验证。 */
export function DotProductActivity() {
  const svgRef = useRef<SVGSVGElement>(null);
  const [u, setU] = useState<[number, number]>([...initialU]);
  const [v, setV] = useState<[number, number]>([...initialV]);
  const [dragTarget, setDragTarget] = useState<'u' | 'v' | null>(null);

  const u3 = vec3(u[0], u[1], 0);
  const v3 = vec3(v[0], v[1], 0);
  const product = dot(u3, v3);
  const theta = angleBetween(u3, v3);
  const sign = product > 0.05 ? '正' : product < -0.05 ? '负' : '零';

  const origin = svgPoint(0, 0, UNIT);
  const hu = svgPoint(u[0], u[1], UNIT);
  const hv = svgPoint(v[0], v[1], UNIT);

  function startDrag(target: 'u' | 'v') {
    return (event: React.PointerEvent<SVGCircleElement>) => {
      const svg = svgRef.current;
      if (!svg) return;
      setDragTarget(target);
      event.currentTarget.setPointerCapture(event.pointerId);
      const move = (moveEvent: PointerEvent) => {
        const next = svgToMath(moveEvent, svg, UNIT);
        const clamped: [number, number] = [Math.max(-6, Math.min(6, next.x)), Math.max(-6, Math.min(6, next.y))];
        if (target === 'u') setU(clamped); else setV(clamped);
      };
      const stop = () => { setDragTarget(null); window.removeEventListener('pointermove', move); };
      window.addEventListener('pointermove', move);
      window.addEventListener('pointerup', stop, { once: true });
    };
  }

  function nudge(target: 'u' | 'v', dx: number, dy: number) {
    const update = (current: [number, number]): [number, number] =>
      [Math.max(-6, Math.min(6, current[0] + dx)), Math.max(-6, Math.min(6, current[1] + dy))];
    if (target === 'u') setU(update); else setV(update);
  }

  const reset = () => { setU([...initialU]); setV([...initialV]); };

  return (
    <ActivityFrame
      id="ch01-dot-product"
      chapterId="ch01"
      title="点积的符号说的是夹角"
      prompt="拖动 u 或 v 的端点改变夹角。先把夹角拖到明显大于 90°，让点积变成负数，再检查。"
      predict={{
        question: '把两向量夹角从 60° 拖到 120°，u · v 的符号会怎么变？',
        options: ['一直是正数', '由正变负', '由负变正', '先变成 0，再变正'],
        answer: 1,
        hint: 'u · v = ‖u‖‖v‖cos θ。‖u‖‖v‖ 恒为正，所以符号完全由 cos θ 决定。',
        correctNote: 'cos θ 在 θ = 90° 处过零：锐角为正、直角为零、钝角为负。',
        wrongNote: '点积符号只由 cos θ 决定，与两个向量的长度无关。θ < 90° 为正，θ = 90° 为零，θ > 90° 为负。',
      }}
      onReset={reset}
      check={() => {
        if (product >= -0.05) return { passed: false, feedback: `现在点积是 ${format(product)}（${sign}），夹角 ${format((theta * 180) / Math.PI, 1)}°。继续拖动，让夹角超过 90° 再检查。` };
        return {
          passed: true,
          feedback: `点积 ${format(product)}，夹角 ${format((theta * 180) / Math.PI, 1)}°，cos θ = ${format(Math.cos(theta))}。‖u‖‖v‖ = ${format(length(u3) * length(v3))}，乘上负的 cos θ 就得到负点积。`,
        };
      }}
      explanation={<>
        <p>点积（内积）定义为对应分量乘积之和：u · v = u<sub>x</sub>v<sub>x</sub> + u<sub>y</sub>v<sub>y</sub> + u<sub>z</sub>v<sub>z</sub>。它同时有一个几何关系：</p>
        <div className="math-block">u · v = ‖u‖ ‖v‖ cos θ<small>θ 是两个向量之间最小的夹角，0 ≤ θ ≤ π</small></div>
        <p>因为 ‖u‖‖v‖ 恒为正，所以点积的符号就是 cos θ 的符号，也就是「两个方向大致相同还是大致相反」。游戏里判断敌人是否在你面前，用的就是这条：拿你的朝向和「你到它」的向量做点积，看正负与阈值。</p>
        <p>夹角正好 90° 时点积为 0，这就是正交判定。3D 里构造正交基（相机坐标系、切线空间）时反复用到它。</p>
      </>}
      apply={<p>在 HLSL / DirectXMath 里点积写作 <code>dot(u, v)</code> / <code>XMVector3Dot</code>。注意参与比较的方向向量必须先归一化，否则你比较的其实是「‖u‖‖v‖cos θ」，阈值会失效。</p>}
    >
      <svg ref={svgRef} className="svg-stage" viewBox="0 0 320 320" role="img"
        aria-label={`u 等于 ${format(u[0])} 逗号 ${format(u[1])}，v 等于 ${format(v[0])} 逗号 ${format(v[1])}，点积 ${format(product)}，夹角 ${format((theta * 180) / Math.PI, 1)} 度`}>
        <g className="plane-grid">
          {Array.from({ length: 15 }, (_unused, index) => index - 7).map((index) => <g key={index}>
            <line x1={160 + index * UNIT} y1={0} x2={160 + index * UNIT} y2={320} />
            <line x1={0} y1={160 - index * UNIT} x2={320} y2={160 - index * UNIT} />
          </g>)}
        </g>
        <line className="axis" x1={20} y1={160} x2={300} y2={160} />
        <line className="axis" x1={160} y1={300} x2={160} y2={20} />

        <circle cx={origin.x} cy={origin.y} r={46} fill="none" stroke="#cfd8cb" strokeDasharray="3 3" />
        <line className="vec vec--u" x1={origin.x} y1={origin.y} x2={hu.x} y2={hu.y} />
        <line className="vec vec--v" x1={origin.x} y1={origin.y} x2={hv.x} y2={hv.y} />
        <circle className="handle" cx={hu.x} cy={hu.y} r={8} tabIndex={0} role="slider"
          aria-label="拖动改变 u" aria-valuetext={`u x ${format(u[0])}，y ${format(u[1])}`}
          onPointerDown={startDrag('u')}
          onKeyDown={(event) => {
            const stepSize = event.shiftKey ? 0.5 : 0.25;
            if (event.key === 'ArrowRight') { nudge('u', stepSize, 0); event.preventDefault(); }
            if (event.key === 'ArrowLeft') { nudge('u', -stepSize, 0); event.preventDefault(); }
            if (event.key === 'ArrowUp') { nudge('u', 0, stepSize); event.preventDefault(); }
            if (event.key === 'ArrowDown') { nudge('u', 0, -stepSize); event.preventDefault(); }
          }} />
        <circle className="handle" cx={hv.x} cy={hv.y} r={8} tabIndex={0} role="slider"
          aria-label="拖动改变 v" aria-valuetext={`v x ${format(v[0])}，y ${format(v[1])}`}
          onPointerDown={startDrag('v')}
          onKeyDown={(event) => {
            const stepSize = event.shiftKey ? 0.5 : 0.25;
            if (event.key === 'ArrowRight') { nudge('v', stepSize, 0); event.preventDefault(); }
            if (event.key === 'ArrowLeft') { nudge('v', -stepSize, 0); event.preventDefault(); }
            if (event.key === 'ArrowUp') { nudge('v', 0, stepSize); event.preventDefault(); }
            if (event.key === 'ArrowDown') { nudge('v', 0, -stepSize); event.preventDefault(); }
          }} />
        <text x={hu.x + 8} y={hu.y - 8} style={{ fill: '#2f6b8f' }}>u</text>
        <text x={hv.x + 8} y={hv.y - 8} style={{ fill: '#b1712f' }}>v</text>
      </svg>

      <Slider label="u 的方向角" min={-180} max={180} step={1}
        value={Math.round((Math.atan2(u[1], u[0]) * 180) / Math.PI)}
        onChange={(degrees) => {
          const radians = (degrees * Math.PI) / 180;
          const magnitude = length(u3) || 3;
          setU([Math.cos(radians) * magnitude, Math.sin(radians) * magnitude]);
        }}
        format={(value) => `${value}°`} />
      <p className="draggable-note">当前拖动的是 {dragTarget ?? '（未拖动）'}。也可以直接拖圆点，或用滑块只改 u 的方向。</p>

      <Readout items={[
        ['u · v', format(product)],
        ['符号', sign],
        ['夹角 θ', `${format((theta * 180) / Math.PI, 1)}°`],
        ['cos θ', format(Math.cos(theta))],
        ['‖u‖ · ‖v‖', format(length(u3) * length(v3))],
      ]} />
    </ActivityFrame>
  );
}
