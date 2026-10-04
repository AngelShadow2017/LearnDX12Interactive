import { useState } from 'react';
import { ActivityFrame } from '@/activities/ActivityFrame';
import { Choice, Readout, Slider } from '@/activities/controls';

type HeightFn = 'flat' | 'sine' | 'hills';

const heights: Record<HeightFn, (x: number, z: number) => number> = {
  flat: () => 0,
  sine: (x, z) => Math.sin(x * 0.9) * Math.cos(z * 0.9),
  hills: (x, z) => 0.35 * (x * x - z * z) + 0.4 * Math.sin(x * 1.3),
};

/** 7.4 后的推演：调格网密度和高度函数，观察顶点数与地形。 */
export function GridMeshActivity() {
  const [m, setM] = useState(6);
  const [n, setN] = useState(6);
  const [fn, setFn] = useState<HeightFn>('sine');
  const [touched, setTouched] = useState(false);

  const vertexCount = (m + 1) * (n + 1);
  const quadCount = m * n;
  const indexCount = quadCount * 6;
  const triangleCount = quadCount * 2;

  const cell = 16;
  const originX = 160;
  const originY = 96;
  const heightScale = 22;

  const project = (i: number, j: number): { x: number; y: number } => {
    const u = (i / m) * 2 - 1;
    const v = (j / n) * 2 - 1;
    const h = heights[fn](u, v);
    return {
      x: originX + (i - j) * cell * 0.9,
      y: originY + (i + j) * cell * 0.45 - h * heightScale,
    };
  };

  const rowPaths: string[] = [];
  for (let j = 0; j <= n; j += 1) {
    const points: string[] = [];
    for (let i = 0; i <= m; i += 1) {
      const p = project(i, j);
      points.push(`${p.x.toFixed(1)},${p.y.toFixed(1)}`);
    }
    rowPaths.push(points.join(' '));
  }
  const colPaths: string[] = [];
  for (let i = 0; i <= m; i += 1) {
    const points: string[] = [];
    for (let j = 0; j <= n; j += 1) {
      const p = project(i, j);
      points.push(`${p.x.toFixed(1)},${p.y.toFixed(1)}`);
    }
    colPaths.push(points.join(' '));
  }

  function reset() {
    setM(6);
    setN(6);
    setFn('sine');
    setTouched(false);
  }

  return (
    <ActivityFrame
      id="ch07-grid-mesh"
      chapterId="ch07"
      title="把格网顶点数调成正好 100"
      prompt="顶点数 = (m + 1)(n + 1)，索引数 = 网格数 m·n × 6。调密度让顶点数正好等于 100，再换一个高度函数看地形变化。"
      predict={{
        question: '一个 m × n 的格网（m、n 指格子数）有多少个顶点、多少个索引？',
        options: ['m·n 个顶点，m·n·6 个索引', '(m+1)(n+1) 个顶点，m·n·6 个索引', '(m+1)(n+1) 个顶点，m·n·3 个索引', 'm·n·2 个顶点，(m+1)(n+1)·6 个索引'],
        answer: 1,
        hint: '格子数是 m·n，但顶点在格点上，所以行列各多一个。每个格子拆成两个三角形，需要 6 个索引。',
        correctNote: '顶点在格点上：(m+1)(n+1)；索引每格 6 个：m·n·6。',
        wrongNote: '顶点落在格点上而不是格子中心，所以行列都要 +1；每个格子两个三角形 = 6 个索引。',
      }}
      onReset={reset}
      check={() => {
        if (!touched) return { passed: false, feedback: '先调整格网密度，观察顶点数和索引数的变化，再检查。' };
        if (vertexCount !== 100) return { passed: false, feedback: `现在顶点数是 ${vertexCount}。目标是 100，也就是 (m+1)(n+1) = 100，试试 m = 9、n = 9。` };
        return {
          passed: true,
          feedback: `顶点数 ${vertexCount}，索引数 ${indexCount}（${quadCount} 个格子 × 6），三角形 ${triangleCount} 个。图 7.9、图 7.10 就是这套构建过程。`,
        };
      }}
      explanation={<>
        <p>生成地形分两步（图 7.8）：先在 xz 平面铺一张格网，再对每个格点代入高度函数 f(x, z) 得到 y。</p>
        <p>顶点落在<b>格点</b>上，所以 m × n 个格子需要 (m+1)(n+1) 个顶点。索引则是每格两个三角形、共 6 个索引。</p>
        <p>图 7.9 展示了格网顶点的构建顺序（逐行逐列），图 7.10 展示了第 ij 个格子的索引布局。</p>
        <p>顶点数随密度按平方增长，所以调高密度时开销上升很快——这也是第 14 章曲面细分存在的理由之一。</p>
      </>}
      apply={<p>代码里对应 <code>GeometryGenerator::CreateGrid(width, depth, m, n)</code>：它返回的 <code>MeshData</code> 里 <code>Vertices.size()</code> 就是 (m+1)(n+1)，<code>Indices32.size()</code> 是 m·n·6。</p>}
    >
      <svg className="svg-stage" viewBox="0 0 320 320" role="img"
        aria-label={`${m} 乘 ${n} 的格网，顶点数 ${vertexCount}，高度函数为 ${fn}`}>
        <g className="plane-grid">
          {Array.from({ length: 11 }, (_unused, index) => index).map((index) => <g key={index}>
            <line x1={20 + index * 28} y1={0} x2={20 + index * 28} y2={320} />
            <line x1={0} y1={20 + index * 28} x2={320} y2={20 + index * 28} />
          </g>)}
        </g>
        {rowPaths.map((path, index) => <polyline key={`r${index}`} points={path} fill="none" stroke="#2f6b8f" strokeWidth={1.1} />)}
        {colPaths.map((path, index) => <polyline key={`c${index}`} points={path} fill="none" stroke="#3f7d52" strokeWidth={1.1} />)}
        <text x={12} y={312}>xz 平面格网 + 高度函数 f(x, z)</text>
      </svg>

      <Slider label="行方向格子数 m" min={2} max={16} step={1} value={m} onChange={(value) => { setM(value); setTouched(true); }} />
      <Slider label="列方向格子数 n" min={2} max={16} step={1} value={n} onChange={(value) => { setN(value); setTouched(true); }} />
      <Choice label="高度函数" options={[
        { value: 'flat', label: '平面', hint: 'f = 0' },
        { value: 'sine', label: '正弦', hint: 'sin·cos' },
        { value: 'hills', label: '山丘', hint: '抛物面 + 波动' },
      ]} value={fn} onChange={(value) => { setFn(value); setTouched(true); }} />

      <Readout items={[
        ['格子数 m·n', String(quadCount)],
        ['顶点数 (m+1)(n+1)', String(vertexCount)],
        ['索引数 m·n·6', String(indexCount)],
        ['三角形数', String(triangleCount)],
      ]} />
    </ActivityFrame>
  );
}
