import { useMemo, useState } from 'react';
import { ActivityFrame } from '@/activities/ActivityFrame';
import { Readout, Slider } from '@/activities/controls';

type Uv = { u: number; v: number };

/** 屏幕三角形的三个顶点（SVG 坐标）。 */
const screen: Array<[number, number]> = [[70, 60], [255, 90], [150, 250]];

/**
 * 9.2 后的推演：拖动三角形顶点的 UV，观察贴到三角形上的是纹理的哪一块。
 * 三角形 → 三角形的映射是仿射的，所以这里可以直接求一个 2×3 矩阵。
 */
export function UvMappingActivity() {
  const [uvs, setUvs] = useState<Uv[]>([{ u: 0, v: 0 }, { u: 1, v: 0 }, { u: 0.5, v: 1 }]);
  const [touched, setTouched] = useState(false);

  const matrix = useMemo(() => {
    // 以顶点 0 为基准，把 (u,v) 的位移映射到屏幕位移
    const [p0, p1, p2] = screen;
    const e1 = { u: uvs[1].u - uvs[0].u, v: uvs[1].v - uvs[0].v };
    const e2 = { u: uvs[2].u - uvs[0].u, v: uvs[2].v - uvs[0].v };
    const d1 = { x: p1[0] - p0[0], y: p1[1] - p0[1] };
    const d2 = { x: p2[0] - p0[0], y: p2[1] - p0[1] };
    const det = e1.u * e2.v - e2.u * e1.v;
    if (Math.abs(det) < 1e-6) return null;
    const a = (d1.x * e2.v - d2.x * e1.v) / det;
    const c = (d2.x * e1.u - d1.x * e2.u) / det;
    const b = (d1.y * e2.v - d2.y * e1.v) / det;
    const d = (d2.y * e1.u - d1.y * e2.u) / det;
    // 平移项：让 uv 原点落在该去的位置
    const e = p0[0] - (a * uvs[0].u + c * uvs[0].v);
    const f = p0[1] - (b * uvs[0].u + d * uvs[0].v);
    return { a, b, c, d, e, f };
  }, [uvs]);

  const degenerate = matrix === null;
  const area = Math.abs(
    (uvs[1].u - uvs[0].u) * (uvs[2].v - uvs[0].v) - (uvs[2].u - uvs[0].u) * (uvs[1].v - uvs[0].v),
  ) / 2;

  function setUv(index: number, key: keyof Uv, value: number) {
    setUvs((current) => current.map((uv, at) => (at === index ? { ...uv, [key]: value } : uv)));
    setTouched(true);
  }

  function reset() {
    setUvs([{ u: 0, v: 0 }, { u: 1, v: 0 }, { u: 0.5, v: 1 }]);
    setTouched(false);
  }

  const points = screen.map(([x, y]) => `${x},${y}`).join(' ');

  return (
    <ActivityFrame
      id="ch09-uv-mapping"
      chapterId="ch09"
      title="拖动 UV，看贴的是纹理的哪一块"
      prompt="三个顶点各有一组 (u, v)。把 v2 的 u 拖到 0（默认是 0.5），看三角形左右两半的纹理怎么变。"
      predict={{
        question: '把某个顶点的 u 从 0.5 改成 0，三角形上的纹理会怎样？',
        options: ['完全不变', '纹理被拉扯变形：靠近该顶点的区域取到更左边的纹理内容', '纹理整体平移', '纹理消失'],
        answer: 1,
        hint: 'UV 是逐顶点给定的，三角形内部靠插值。改一个顶点的 UV 会改变整片插值结果。',
        correctNote: 'UV 逐顶点给定、三角形内插值，所以改一个顶点会连带改变整片区域的采样。',
        wrongNote: 'UV 不是「整体平移」的参数：它是逐顶点的属性，三角形内部由重心坐标插值得到。',
      }}
      onReset={reset}
      check={() => {
        if (!touched) return { passed: false, feedback: '先拖动三个 UV 滑块中的任意一个，观察三角形内的纹理变化，再检查。' };
        if (degenerate) return { passed: false, feedback: '现在三个 UV 共线（三角形面积为 0），映射退化成一条线。把某个 UV 拖开一点。' };
        return {
          passed: true,
          feedback: `当前 UV 三角形面积 ${area.toFixed(3)}，对应纹理上 ${(area * 100).toFixed(1)}% 的区域被贴到这个三角形上。UV 是逐顶点属性，三角形内由重心坐标插值——这就是纹理能随几何变形的原因。`,
        };
      }}
      explanation={<>
        <p>纹理坐标（图 9.2）也叫纹理空间：<b>u 沿右、v 沿下</b>，范围 [0, 1]²。给每个顶点一组 (u, v)，就指定了「这个顶点对应纹理上的哪个点」（图 9.3）。</p>
        <p>三角形内部的 UV 由三个顶点按重心坐标<b>插值</b>得到。所以改动一个顶点的 UV，整片三角形内的采样都会变。</p>
        <p>多个小纹理可以放进一张大图（图 9.4 的纹理图集），各顶点的 UV 指向自己那一块——这样可以避免切换纹理。</p>
        <p>注意 v 的方向：D3D 的纹理原点在左上角、v 向下，而很多建模工具约定相反。纹理上下颠倒时，先怀疑这里。</p>
      </>}
      apply={<p>代码里 UV 就是顶点结构里的一个 <code>XMFLOAT2 TexC</code> 字段，输入布局里给一个 <code>TEXCOORD</code> 语义；HLSL 顶点着色器把它原样传给像素着色器插值。</p>}
    >
      <svg className="svg-stage" viewBox="0 0 320 320" role="img"
        aria-label={`三角形三个顶点的 UV 分别是 ${uvs.map((uv) => `(${uv.u}, ${uv.v})`).join('、')}`}>
        <defs>
          <clipPath id="uv-triangle-clip"><polygon points={points} /></clipPath>
          <pattern id="uv-checker" width="0.25" height="0.25" patternUnits="userSpaceOnUse">
            <rect width="0.25" height="0.25" fill="#efe6cf" />
            <rect width="0.125" height="0.125" fill="#8a6a3e" />
            <rect x="0.125" y="0.125" width="0.125" height="0.125" fill="#8a6a3e" />
          </pattern>
        </defs>

        <rect x={0} y={0} width={320} height={320} fill="#fffdf6" />
        {matrix && <g clipPath="url(#uv-triangle-clip)">
          <g transform={`matrix(${matrix.a} ${matrix.b} ${matrix.c} ${matrix.d} ${matrix.e} ${matrix.f})`}>
            <rect x={-3} y={-3} width={6} height={6} fill="url(#uv-checker)" />
          </g>
        </g>}
        <polygon points={points} fill="none" stroke="#2f6b8f" strokeWidth={2} />
        {screen.map(([x, y], index) => <g key={index}>
          <circle cx={x} cy={y} r={5} fill="#fff" stroke="#2f6b8f" strokeWidth={2} />
          <text x={x + (x < 160 ? -46 : 10)} y={y + (y < 160 ? -10 : 18)}>v{index} ({uvs[index].u.toFixed(2)}, {uvs[index].v.toFixed(2)})</text>
        </g>)}
        {degenerate && <text x={160} y={300} textAnchor="middle">三个 UV 共线，映射退化</text>}
      </svg>

      {[0, 1, 2].map((index) => <div className="ctl-panel" key={index} style={{ marginBottom: 8 }}>
        <span className="ctl-panel__title">顶点 v{index}</span>
        <Slider label="u" min={-0.5} max={1.5} step={0.05} value={uvs[index].u} onChange={(value) => setUv(index, 'u', value)} />
        <Slider label="v" min={-0.5} max={1.5} step={0.05} value={uvs[index].v} onChange={(value) => setUv(index, 'v', value)} />
      </div>)}

      <Readout items={[
        ['UV 三角形面积', area.toFixed(3)],
        ['覆盖纹理比例', `${(area * 100).toFixed(1)}%`],
        ['映射是否退化', degenerate ? '是' : '否'],
      ]} />
    </ActivityFrame>
  );
}
