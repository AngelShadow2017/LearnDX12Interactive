import { useState } from 'react';
import { ActivityFrame } from '@/activities/ActivityFrame';
import { Readout, svgPoint } from '@/activities/controls';

const UNIT = 62;
const quad: Array<[number, number]> = [[-1, -1], [1, -1], [1, 1], [-1, 1]];
const expected = [[0, 1, 2], [0, 2, 3]];

function screenArea(triangle: number[]) {
  const [a, b, c] = triangle.map((vertex) => svgPoint(quad[vertex][0], quad[vertex][1], UNIT));
  return (b.x - a.x) * (c.y - a.y) - (c.x - a.x) * (b.y - a.y);
}

/** 6.3 后的推演：用 4 个顶点和索引拼出两个三角形，并比较重复顶点的成本。 */
export function IndexBufferActivity() {
  const [picked, setPicked] = useState<number[]>([]);

  const triangles: number[][] = [];
  for (let i = 0; i + 2 < picked.length; i += 3) triangles.push([picked[i], picked[i + 1], picked[i + 2]]);

  const normalized = triangles.map((triangle) => [...triangle].sort((a, b) => a - b).join(','));
  const expectedNormalized = expected.map((triangle) => [...triangle].sort((a, b) => a - b).join(','));
  const complete = normalized.length === 2
    && expectedNormalized.every((key) => normalized.includes(key));
  // SVG's y axis points down: positive screen-space area is clockwise on the render target.
  // D3D12's default FrontCounterClockwise = FALSE treats clockwise triangles as front faces.
  const faces = triangles.map((triangle) => {
    const area = screenArea(triangle);
    return Math.abs(area) < 0.001 ? 'degenerate' : area > 0 ? 'front' : 'back';
  });
  const backFaceCount = faces.filter((face) => face === 'back').length;

  const vertexCount = picked.length;
  const uniqueVertices = new Set(picked).size;

  function reset() {
    setPicked([]);
  }

  return (
    <ActivityFrame
      id="ch06-index-buffer"
      chapterId="ch06"
      title="用 4 个顶点和索引拼出两个三角形"
      prompt="按顺序点顶点来组成三角形：每三个顶点组成一个三角形。目标是让两个三角形正好拼满这个四边形。"
      predict={{
        question: '一个四边形用「三角形列表」绘制，不使用索引时需要提交多少个顶点？使用索引呢？',
        options: ['都是 4 个', '不用索引 6 个，用索引 4 个顶点 + 6 个索引', '都是 6 个', '不用索引 4 个，用索引 6 个'],
        answer: 1,
        hint: '一个三角形要 3 个顶点，两个三角形就是 6 个位置；索引让两个三角形共用那两个对角顶点。',
        correctNote: '索引让共享顶点只存一份、顶点着色器也只跑一次，两个三角形共用 4 个顶点。',
        wrongNote: '两个三角形需要 6 个顶点位置；用索引后顶点数据只有 4 个，多出来的开销只是 6 个索引值。',
      }}
      onReset={reset}
      check={() => {
        if (picked.length < 6) return { passed: false, feedback: `现在只点了 ${picked.length} 个顶点位置，两个三角形需要 6 个。继续点。` };
        if (!complete) return { passed: false, feedback: `现在的两个三角形是 ${triangles.map((t) => `(${t.join(',')})`).join(' 和 ')}，没有正好拼满四边形。正确分法是 (0,1,2) 与 (0,2,3)（每个三角形内的顶点顺序可以互换）。调换同一组三个索引中的两个只会翻转正背面，不会改变它覆盖的区域。` };
        const windingNote = backFaceCount === 0
          ? '两片都按 D3D12 默认约定朝向正面。'
          : backFaceCount === 2
            ? '不过两片都画反了（背面）：CullMode=NONE 时仍会显示；CullMode=BACK 时两片都会被剔除。把每组三个索引的后两个交换，例如改成 (0,2,1) 与 (0,3,2)。'
            : `不过其中 ${backFaceCount} 片画反了（背面）：CullMode=NONE 时仍会显示；CullMode=BACK 时反向的面会被剔除。建议把两个三角形的绕序统一为正面。`;
        return {
          passed: true,
          feedback: `四边形已拼满，拓扑正确。不用索引要提交 6 个顶点（顶点着色器跑 6 次、其中 2 个是重复的）；用索引只提交 4 个顶点 + 6 个索引，顶点着色器只跑 4 次。${windingNote}`,
        };
      }}
      explanation={<>
        <p>一个四边形拆成两个三角形需要 6 个顶点位置，其中 v0 和 v2 各被用了两次。不用索引时这两个顶点会被<b>重复存储、重复送入顶点着色器</b>。</p>
        <p>索引缓冲把「顶点数据」和「顶点使用顺序」分开：顶点只存一份，索引里存 6 个整数指向它们。省下的不只是内存，还有顶点着色器的执行次数——复杂网格里这个差别非常大。</p>
        <p>同一组三个顶点换一下索引顺序，不会改变三角形覆盖的区域，却会翻转它的绕序，也就改变正面/背面判定。默认背面剔除时，背向相机的三角形会被丢弃；如果 <code>CullMode = NONE</code>，它仍然会画出来，所以反向属于需要留意的朝向问题，不代表索引拓扑拼错。</p>
        <p>绘制调用是 <code>DrawIndexedInstanced(indexCount, 1, startIndexLocation, baseVertexLocation, 0)</code>，图 6.2 说明了 <code>StartVertexLocation</code> 的含义，图 6.3 说明了多个小缓冲可以拼成一个大缓冲。</p>
      </>}
      apply={<p>代码里对应 <code>IASetIndexBuffer</code> + <code>DrawIndexedInstanced</code>。索引格式常用 <code>DXGI_FORMAT_R16_UINT</code>（65535 以内）或 <code>R32_UINT</code>。</p>}
    >
      <svg className="svg-stage" viewBox="0 0 320 320" role="img"
        aria-label={`四边形四个顶点，已点选 ${picked.length} 个顶点位置，组成 ${triangles.length} 个三角形`}>
        <g className="plane-grid">
          {Array.from({ length: 11 }, (_unused, index) => index - 5).map((index) => <g key={index}>
            <line x1={160 + index * UNIT} y1={0} x2={160 + index * UNIT} y2={320} />
            <line x1={0} y1={160 - index * UNIT} x2={320} y2={160 - index * UNIT} />
          </g>)}
        </g>
        {triangles.map((triangle, index) => {
          const points = triangle.map((vertex) => { const p = svgPoint(quad[vertex][0], quad[vertex][1], UNIT); return `${p.x},${p.y}`; }).join(' ');
          const face = faces[index];
          const center = triangle.reduce(([x, y], vertex) => [x + svgPoint(quad[vertex][0], quad[vertex][1], UNIT).x / 3, y + svgPoint(quad[vertex][0], quad[vertex][1], UNIT).y / 3], [0, 0]);
          const front = face === 'front';
          const color = face === 'degenerate' ? '#8a8175' : front ? '#2f6b8f' : '#b36b2e';
          return <g key={index}>
            <polygon points={points} fill={face === 'degenerate' ? 'rgba(138,129,117,.12)' : front ? 'rgba(47,107,143,.16)' : 'rgba(179,107,46,.16)'} stroke={color} strokeWidth={2} />
            <text className="index-buffer__face-label" x={center[0]} y={center[1]} fill={color} textAnchor="middle">{`T${index + 1} ${face === 'front' ? '正面' : face === 'back' ? '背面' : '退化'}`}</text>
          </g>;
        })}
        {quad.map(([x, y], index) => {
          const p = svgPoint(x, y, UNIT);
          return <g key={index}>
            <circle cx={p.x} cy={p.y} r={6} fill={picked.includes(index) ? '#3f7d52' : '#fff'} stroke="#5b6c60" strokeWidth={2} />
            <text x={p.x + (x < 0 ? -22 : 10)} y={p.y + (y < 0 ? 18 : -10)}>v{index}</text>
          </g>;
        })}
      </svg>

      <div className="activity__options">
        {quad.map((_vertex, index) => <button key={index} className="quiz-option" type="button"
          onClick={() => setPicked((current) => (current.length >= 6 ? current : [...current, index]))}
          disabled={picked.length >= 6}>
          <span>添加顶点 v{index}</span>
        </button>)}
      </div>
      <div className="activity__actions">
        <button className="button button--quiet" type="button" disabled={picked.length === 0} onClick={() => setPicked((current) => current.slice(0, -1))}>撤销最后一个</button>
      </div>
      <p className="draggable-note">当前序列：{picked.length === 0 ? '（空）' : picked.map((value) => `v${value}`).join(' → ')}</p>
      {complete && <p className={`index-buffer__winding-status ${backFaceCount === 0 ? 'is-front' : 'is-warning'}`} role="status">
        {backFaceCount === 0
          ? '绕序提示：两个三角形都朝向正面。'
          : backFaceCount === 2
            ? '绕序提示：四边形已经拼对，但两个三角形都画反了（背面）。这不算拼错；关闭背面剔除仍能看到它们。'
            : `绕序提示：四边形已经拼对，但有 ${backFaceCount} 个三角形画反了（背面）。这不算拼错；关闭背面剔除仍能看到它。`}
        {' '}D3D12 默认剔除背面；可以在每组索引中交换两个顶点来翻转朝向。
      </p>}

      <Readout items={[
        ['已提交的顶点位置', `${vertexCount} 个`],
        ['实际用到的顶点', `${uniqueVertices} 个`],
        ['不用索引需要', '6 个顶点'],
        ['三角形数', `${triangles.length} 个`],
      ]} />
    </ActivityFrame>
  );
}
