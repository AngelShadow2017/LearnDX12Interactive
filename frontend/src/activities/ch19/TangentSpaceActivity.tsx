import { useState } from 'react';
import { ActivityFrame } from '@/activities/ActivityFrame';
import { Readout, Slider, svgPoint } from '@/activities/controls';
import { cross, format, normalize, orthogonalize, vec3 } from '@/activities/math';

const UNIT = 46;

/** 19.3–19.5 后的推演：拖动切线、双切线、法线，把法线从切线空间变到世界空间。 */
export function TangentSpaceActivity() {
  const [normalAngle, setNormalAngle] = useState(90);
  const [flipBitangent, setFlipBitangent] = useState(false);
  const [usingWorld, setUsingWorld] = useState(false);
  const [touched, setTouched] = useState(false);

  const radians = (normalAngle * Math.PI) / 180;
  // 切线空间：u = T，v = B，n = N。这里让 T、B 在 xy 平面内，N 绕 T 轴旋转。
  const tangent = vec3(1, 0, 0);
  let normal = vec3(0, Math.cos(radians), Math.sin(radians));
  let bitangent = normalize(cross(normal, tangent));
  if (flipBitangent) bitangent = [-bitangent[0], -bitangent[1], -bitangent[2]];
  normal = normalize(cross(tangent, bitangent));

  // 法线贴图里存的一条法线：切线空间分量 (0.3, 0.2, 0.93) 归一化
  const packed = normalize(vec3(0.3, 0.2, 0.93));
  const world = normalize(vec3(
    tangent[0] * packed[0] + bitangent[0] * packed[1] + normal[0] * packed[2],
    tangent[1] * packed[0] + bitangent[1] * packed[1] + normal[1] * packed[2],
    tangent[2] * packed[0] + bitangent[2] * packed[1] + normal[2] * packed[2],
  ));
  const wrongOrthogonal = orthogonalize(vec3(0.3, 0.2, 0.93), tangent);
  void wrongOrthogonal;

  const center = svgPoint(0, 0, UNIT);
  const pT = svgPoint(tangent[0], tangent[1], UNIT);
  const pB = svgPoint(bitangent[0], bitangent[1], UNIT);
  const pN = svgPoint(normal[0], normal[1], UNIT);

  return (
    <ActivityFrame
      id="ch19-tangent-space"
      chapterId="ch19"
      title="把一条法线从切线空间搬到世界空间"
      prompt="拖动「法线绕切线轴的角度」，再看同一条贴图法线在世界空间里的朝向怎么变。勾选「用翻转的 B」观察手性变化。"
      predict={{
        question: '法线贴图里存的一条法线，要怎么用才能得到世界空间的法线？',
        options: ['直接乘世界矩阵', '与切线 T、双切线 B、法线 N 三个向量做线性组合：n = T·x + B·y + N·z', '只与世界坐标轴比较', '先归一化再乘逆矩阵'],
        answer: 1,
        hint: '贴图里存的是「相对表面」的三个分量，基就是 T、B、N。',
        correctNote: '贴图法线是 TBN 基下的坐标，组合回世界方向即可。',
        wrongNote: '贴图存的是切线空间分量，必须用 T、B、N 作为基还原；直接乘世界矩阵会完全错位。',
      }}
      onReset={() => { setNormalAngle(90); setFlipBitangent(false); setUsingWorld(false); setTouched(false); }}
      check={() => {
        if (!touched) return { passed: false, feedback: '先拖动角度或切换 B 的方向，观察世界空间法线怎么变，再检查。' };
        if (!usingWorld) return { passed: false, feedback: '把「显示世界空间法线」勾上，看蓝色箭头（在贴图空间里它是固定的）的世界朝向随角度变化。' };
        return {
          passed: true,
          feedback: `贴图法线分量 (${format(packed[0])}, ${format(packed[1])}, ${format(packed[2])}) 在世界空间里是 (${format(world[0])}, ${format(world[1])}, ${format(world[2])})。TBN 基随物体姿态一起变，所以同一条贴图法线能自动适配每个面的朝向。`,
        };
      }}
      explanation={<>
        <p>法线贴图里的每个像素存着一条法线，但这法线是<b>相对表面</b>的，而不是相对世界坐标系的（图 19.3）。所以贴图可以贴在任何一个面上而不用为每个面单独做一张图。</p>
        <p>为此每个顶点要带一组<b>切线空间</b>基向量：</p>
        <ul>
          <li><b>T（切线）</b>：沿纹理 u 方向（图 19.4）；</li>
          <li><b>B（双切线）</b>：沿纹理 v 方向，等于 <code>cross(N, T) × handedness</code>；</li>
          <li><b>N（法线）</b>：几何法线本身。</li>
        </ul>
        <p>盒子的每个面都需要自己的切线空间（图 19.5），所以法线通常是<b>逐顶点</b>属性。</p>
        <p>贴图法线 (x, y, z) 还原到世界空间就是线性组合：<b>n = T·x + B·y + N·z</b>，再归一化。图 19.6 说明 T 里平行于 N 的分量必须减掉（正交化），否则结果不严格垂直。</p>
        <p>「手性」标志位（handedness）用来处理 UV 翻转的镜像贴图：镜像会让 TBN 变成左手系，需要相应翻转 B 或整个基。</p>
      </>}
      apply={<p>HLSL 片段：<code>float3 n = normalize(T * packed.x + B * packed.y + N * packed.z);</code>。顶点着色器里用 <code>float3x3(T, B, N)</code> 打包传下来。</p>}
    >
      <svg className="svg-stage" viewBox="0 0 320 320" role="img"
        aria-label={`切线空间：T 沿 x、B 沿 ${format(bitangent[1])}、N 沿 ${format(normal[1])} 逗号 ${format(normal[2])}`}>
        <rect x={0} y={0} width={320} height={320} fill="#f4f7f0" />
        <line className="axis" x1={20} y1={160} x2={300} y2={160} />
        <line className="axis" x1={160} y1={300} x2={160} y2={20} />
        <text x={286} y={152}>+x</text><text x={166} y={28}>+y</text>

        <line className="vec vec--u" x1={center.x} y1={center.y} x2={pT.x} y2={pT.y} />
        <text x={pT.x + 6} y={pT.y - 6} style={{ fill: '#2f6b8f' }}>T (u)</text>

        <line className="vec vec--v" x1={center.x} y1={center.y} x2={pB.x} y2={pB.y} />
        <text x={pB.x + 6} y={pB.y - 6} style={{ fill: '#b1712f' }}>B (v)</text>

        <line className="vec vec--w" x1={center.x} y1={center.y} x2={pN.x} y2={pN.y} />
        <text x={pN.x + 6} y={pN.y - 6} style={{ fill: '#3f7d52' }}>N</text>

        {usingWorld && <g>
          <line stroke="#2f6b8f" strokeWidth={2.4} strokeDasharray="6 3"
            x1={center.x} y1={center.y} x2={center.x + packed[0] * UNIT} y2={center.y - packed[1] * UNIT} />
          <text x={center.x + packed[0] * UNIT + 8} y={center.y - packed[1] * UNIT} style={{ fill: '#2f6b8f' }}>贴图法线（切线空间）</text>
          <line stroke="#7a3f9d" strokeWidth={2.6}
            x1={center.x} y1={center.y} x2={center.x + world[0] * UNIT} y2={center.y - world[1] * UNIT} />
          <text x={center.x + world[0] * UNIT + 8} y={center.y - world[1] * UNIT + 14} style={{ fill: '#7a3f9d' }}>世界空间法线</text>
        </g>}
      </svg>

      <Slider label="法线绕切线轴的角度" min={-180} max={180} step={2} value={normalAngle} onChange={(value) => { setNormalAngle(value); setTouched(true); }} format={(value) => `${value}°`} />
      <div className="activity__actions">
        <label className="ctl ctl--toggle"><input type="checkbox" checked={flipBitangent} onChange={(event) => { setFlipBitangent(event.target.checked); setTouched(true); }} /><span>翻转 B（镜像 UV）</span></label>
        <label className="ctl ctl--toggle"><input type="checkbox" checked={usingWorld} onChange={(event) => { setUsingWorld(event.target.checked); setTouched(true); }} /><span>显示世界空间法线</span></label>
      </div>

      <Readout items={[
        ['贴图法线分量', `(${format(packed[0])}, ${format(packed[1])}, ${format(packed[2])})`],
        ['T', `(${format(tangent[0])}, ${format(tangent[1])}, ${format(tangent[2])})`],
        ['B', `(${format(bitangent[0])}, ${format(bitangent[1])}, ${format(bitangent[2])})`],
        ['N', `(${format(normal[0])}, ${format(normal[1])}, ${format(normal[2])})`],
        ['世界空间法线', usingWorld ? `(${format(world[0])}, ${format(world[1])}, ${format(world[2])})` : '—'],
      ]} />
    </ActivityFrame>
  );
}
