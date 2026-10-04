import { useRef, useState } from 'react';
import { ActivityFrame } from '@/activities/ActivityFrame';
import { Readout, Slider, svgPoint, svgToMath } from '@/activities/controls';
import { dot, format, length, vec3 } from '@/activities/math';

const UNIT = 42;
const initial = [2, 1] as const;

/**
 * 1.1 后的推演：几何向量不变，坐标值可变。
 * 读者拖动向量头部改变 v，旋转坐标系改变 frame，两个坐标读数会同时更新。
 */
export function VectorFrameActivity() {
  const svgRef = useRef<SVGSVGElement>(null);
  const [v, setV] = useState<[number, number]>([...initial]);
  const [theta, setTheta] = useState(0);

  const radians = (theta * Math.PI) / 180;
  const basisX: [number, number] = [Math.cos(radians), Math.sin(radians)];
  const basisY: [number, number] = [-Math.sin(radians), Math.cos(radians)];
  const world = vec3(v[0], v[1], 0);
  const coords: [number, number] = [dot(world, vec3(basisX[0], basisX[1], 0)), dot(world, vec3(basisY[0], basisY[1], 0))];
  const worldLength = length(world);
  const frameLength = Math.hypot(coords[0], coords[1]);

  const origin = svgPoint(0, 0, UNIT);
  const head = svgPoint(v[0], v[1], UNIT);
  const bx = svgPoint(basisX[0], basisX[1], UNIT);
  const by = svgPoint(basisY[0], basisY[1], UNIT);

  function startDrag(event: React.PointerEvent<SVGCircleElement>) {
    const svg = svgRef.current;
    if (!svg) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    const move = (moveEvent: PointerEvent) => {
      const next = svgToMath(moveEvent, svg, UNIT);
      setV([Math.max(-6, Math.min(6, next.x)), Math.max(-6, Math.min(6, next.y))]);
    };
    const stop = () => window.removeEventListener('pointermove', move);
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', stop, { once: true });
  }

  function nudge(dx: number, dy: number) {
    setV((current) => [Math.max(-6, Math.min(6, current[0] + dx)), Math.max(-6, Math.min(6, current[1] + dy))]);
  }

  function reset() {
    setV([...initial]);
    setTheta(0);
  }

  return (
    <ActivityFrame
      id="ch01-vector-frame"
      chapterId="ch01"
      title="几何向量不变，坐标值可变"
      prompt="拖动箭头端点改变 v，再旋转坐标系。观察右侧两组坐标读数：哪一列在变，哪一列不变？"
      predict={{
        question: '把坐标系旋转 40°（向量本身不动），v 的坐标和长度会怎样？',
        options: ['坐标和长度都会变', '坐标会变，长度不变', '坐标不变，长度会变', '两者都不变'],
        answer: 1,
        hint: '坐标是「相对某个坐标系的读数」，长度是向量自己的属性（两次勾股定理）。',
        correctNote: '坐标是相对 frame 的读数，frame 变了读数就变；长度由向量自身决定，与 frame 无关。',
        wrongNote: '长度只由向量自己决定：‖v‖ = √(x² + y²)，它和坐标系怎么摆没关系。会跟着变的是坐标读数。',
      }}
      onReset={reset}
      check={() => {
        if (Math.abs(theta) < 8) return { passed: false, feedback: '把「坐标系旋转角」调到 8° 以上再检查 —— 不旋转就看不出坐标变化。' };
        return {
          passed: true,
          feedback: `世界坐标 (${format(v[0])}, ${format(v[1])}) 长度 ${format(worldLength)}；旋转 ${theta}° 后的坐标系里，v 读作 (${format(coords[0])}, ${format(coords[1])})，长度 ${format(frameLength)}。两个长度一致：坐标系变了，几何向量没变。`,
        };
      }}
      explanation={<>
        <p>向量在几何上就是一段有方向的线段：长度是大小，箭头指向是方向。它<b>不记录自己在哪</b>。</p>
        <p>计算机没法直接处理「一段有方向的线段」，所以要引入坐标系。做法是平移向量，让它的<b>尾部对齐原点</b>（这叫标准位置），此时头部坐标就是它的数值表示。</p>
        <p>因此同一个向量在不同 frame 下坐标不同。这里旋转坐标系 40° 后，世界坐标 (x, y) 变成新坐标系下的读数，但 √(x² + y²) 不变——这正是后面判断变换是否正确的第一道检查。</p>
      </>}
      apply={<p>在 DirectXMath 里 <code>XMVECTOR</code> 存的就是「某个坐标系下的读数」。你不会在 <code>XMVECTOR</code> 里看到它属于哪个 frame，所以每次做变换都要自己清楚当前在哪个空间里。</p>}
    >
      <svg ref={svgRef} className="svg-stage" viewBox="0 0 320 320" role="img"
        aria-label={`向量 v 世界坐标 (${format(v[0])}, ${format(v[1])})，坐标系旋转 ${theta} 度，当前坐标系下读数 (${format(coords[0])}, ${format(coords[1])})`}>
        <g className="plane-grid">
          {Array.from({ length: 15 }, (_unused, index) => index - 7).map((index) => <g key={index}>
            <line x1={160 + index * UNIT} y1={0} x2={160 + index * UNIT} y2={320} />
            <line x1={0} y1={160 - index * UNIT} x2={320} y2={160 - index * UNIT} />
          </g>)}
        </g>
        <line className="axis" x1={20} y1={160} x2={300} y2={160} />
        <line className="axis" x1={160} y1={300} x2={160} y2={20} />
        <text x={286} y={152}>+x</text><text x={166} y={28}>+y</text>

        <line className="axis" style={{ stroke: '#8fa8bf' }} x1={origin.x} y1={origin.y} x2={bx.x} y2={bx.y} />
        <line className="axis" style={{ stroke: '#c39a63' }} x1={origin.x} y1={origin.y} x2={by.x} y2={by.y} />
        <text x={bx.x + 4} y={bx.y - 4} style={{ fill: '#3d6f96' }}>u</text>
        <text x={by.x + 4} y={by.y - 4} style={{ fill: '#96682f' }}>w</text>

        <line className="vec vec--u" x1={origin.x} y1={origin.y} x2={head.x} y2={head.y} />
        <circle className="handle" cx={head.x} cy={head.y} r={8} tabIndex={0} role="slider"
          aria-label="拖动改变向量 v" aria-valuetext={`x ${format(v[0])}，y ${format(v[1])}`}
          onPointerDown={startDrag}
          onKeyDown={(event) => {
            const stepSize = event.shiftKey ? 0.5 : 0.25;
            if (event.key === 'ArrowRight') { nudge(stepSize, 0); event.preventDefault(); }
            if (event.key === 'ArrowLeft') { nudge(-stepSize, 0); event.preventDefault(); }
            if (event.key === 'ArrowUp') { nudge(0, stepSize); event.preventDefault(); }
            if (event.key === 'ArrowDown') { nudge(0, -stepSize); event.preventDefault(); }
          }} />
        <text x={head.x + 10} y={head.y - 8}>v</text>
      </svg>

      <Slider label="坐标系旋转角" min={-180} max={180} step={1} value={theta} onChange={setTheta} format={(value) => `${value}°`} />
      <p className="draggable-note">拖动白色圆点改变 v；圆点获得焦点后可用方向键微调（按住 Shift 加大步长）。</p>

      <Readout items={[
        ['世界坐标 v', `(${format(v[0])}, ${format(v[1])})`],
        ['当前 frame 下的 v', `(${format(coords[0])}, ${format(coords[1])})`],
        ['‖v‖（世界）', format(worldLength)],
        ['‖v‖（frame 读数）', format(frameLength)],
      ]} />
    </ActivityFrame>
  );
}
