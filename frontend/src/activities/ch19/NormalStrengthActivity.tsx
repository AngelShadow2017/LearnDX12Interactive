import { useState } from 'react';
import { ActivityFrame } from '@/activities/ActivityFrame';
import { Readout, Slider, Toggle } from '@/activities/controls';
import { dot, format, normalize, specular, vec3 } from '@/activities/math';

const GRID = 28;
const CELL = 320 / GRID;

/** 19.6 后的推演：调法线强度和光方向，对比「几何未变、明暗变了」。 */
export function NormalStrengthActivity() {
  const [strength, setStrength] = useState(1);
  const [azimuth, setAzimuth] = useState(30);
  const [normalMap, setNormalMap] = useState(true);
  const [roughness, setRoughness] = useState(28);

  const light = useMemoLight(azimuth);
  const toEye = vec3(0, 0, 1);

  // 一张「高度场」：用正弦波模拟砖纹起伏，梯度即为法线扰动
  const bump = (x: number, y: number) => Math.sin(x * 6) * Math.cos(y * 6) * 0.35;

  const cells = [];
  for (let j = 0; j < GRID; j += 1) {
    for (let i = 0; i < GRID; i += 1) {
      const u = (i / GRID) * 2 - 1;
      const v = 1 - (j / GRID) * 2;
      const base = vec3(u, v, 1);
      const n = normalMap
        ? normalize(vec3(
          base[0] - strength * 0.35 * 6 * Math.cos(u * 6) * Math.cos(v * 6),
          base[1] + strength * 0.35 * 6 * Math.sin(u * 6) * Math.sin(v * 6),
          1,
        ))
        : normalize(base);
      const diffuse = Math.max(0, dot(n, light));
      const spec = specular(n, light, toEye, roughness);
      const value = Math.min(1, 0.12 + diffuse * 0.75 + spec * 0.6);
      const shade = Math.round(value * 255);
      cells.push({ x: i * CELL, y: j * CELL, color: `rgb(${shade}, ${shade}, ${Math.round(shade * 0.92)})` });
    }
  }
  void bump;

  function reset() {
    setStrength(1);
    setAzimuth(30);
    setNormalMap(true);
    setRoughness(28);
  }

  return (
    <ActivityFrame
      id="ch19-normal-strength"
      chapterId="ch19"
      title="几何一点没变，明暗却变了"
      prompt="关掉法线贴图再打开，对比画面：形状完全一样，只有明暗细节变了。再拖动光方向看高光怎么移动。"
      predict={{
        question: '法线贴图改变的是什么？',
        options: ['几何形状', '光照计算使用的法线方向', '顶点位置', '纹理的颜色'],
        answer: 1,
        hint: '网格一个顶点都没动。',
        correctNote: '法线贴图只改「光照用的法线」，几何完全没变——所以它能在不加顶点的情况下增加表面细节。',
        wrongNote: '法线贴图不移动任何顶点，它改变的是着色时使用的法线方向，因此几何完全不变。',
      }}
      onReset={reset}
      check={() => {
        if (!normalMap) return { passed: false, feedback: '把「使用法线贴图」打开，看凹凸细节出现，再检查。' };
        if (strength === 1 && azimuth === 30) return { passed: false, feedback: '先拖动「法线强度」或「光源方位角」，观察明暗变化，再检查。' };
        return {
          passed: true,
          feedback: `法线强度 ${format(strength)}，光源方位 ${azimuth}°。几何完全没变，但明暗出现了凹凸细节——这就是法线贴图的全部作用。注意强度过大时高光会「浮」在表面上、与真实几何对不上。`,
        };
      }}
      explanation={<>
        <p>法线贴图解决的是「高光太平滑」的问题（图 19.1 对比图 19.2）：光滑球面的高光是一个干净的圆盘，凹凸表面则碎得多。</p>
        <p>做法是<b>不移动任何顶点</b>，只把光照使用的法线按贴图扰动。这也是它的最大优点：加一张 2D 纹理就得到细节，代价只有一次纹理采样。</p>
        <p>代码里通常把法线强度（一个缩放系数）乘在 x、y 分量上：</p>
        <div className="math-block">packed.xy *= strength; n = normalize(T·packed.x + B·packed.y + N·packed.z)</div>
        <p>强度为 0 等于没开；过大时法线偏离真实几何太多，高光会显得「浮」在表面上。1—2 之间通常比较自然。</p>
      </>}
      apply={<p>像素着色器里：采样 → 解包（<code>2·c−1</code>）→ 缩放 → 组合 TBN → 归一化，然后照常用第 8 章的公式算光照。</p>}
    >
      <svg className="svg-stage" viewBox="0 0 320 320" role="img"
        aria-label={`法线强度 ${format(strength)}，光源方位 ${azimuth} 度，法线贴图${normalMap ? '开启' : '关闭'}`}>
        <rect x={0} y={0} width={320} height={320} fill="#fffdf6" />
        {cells.map((cell) => <rect key={`${cell.x}-${cell.y}`} x={cell.x} y={cell.y} width={CELL + 0.6} height={CELL + 0.6} fill={cell.color} />)}
        <text x={10} y={312} style={{ fontSize: 10 }}>平面（法线恒为 +z）· 法线贴图{normalMap ? '开' : '关'} · 强度 {format(strength)}</text>
      </svg>

      <Slider label="法线强度" min={0} max={3} step={0.1} value={strength} onChange={setStrength} />
      <Slider label="光源方位角" min={-180} max={180} step={2} value={azimuth} onChange={setAzimuth} format={(value) => `${value}°`} />
      <Slider label="粗糙度 shininess" min={1} max={96} step={1} value={roughness} onChange={setRoughness} />
      <Toggle label="使用法线贴图" checked={normalMap} onChange={setNormalMap} />

      <Readout items={[
        ['光源方向 L', `(${format(light[0])}, ${format(light[1])}, ${format(light[2])})`],
        ['平面法线（几何）', '(0, 0, 1)'],
        ['几何是否改变', '否'],
        ['当前粗糙度', String(roughness)],
      ]} />
    </ActivityFrame>
  );
}

function useMemoLight(azimuth: number) {
  const radians = (azimuth * Math.PI) / 180;
  return normalize(vec3(Math.sin(radians) * 0.6, 0.5, Math.cos(radians) * 0.8));
}
