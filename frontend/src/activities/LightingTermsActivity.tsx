import { useMemo, useState } from 'react';
import { ActivityFrame } from '@/activities/ActivityFrame';
import { Readout, Slider, Toggle } from '@/activities/controls';
import { add, format, lambert, normalize, specular, vec3 } from '@/activities/math';

const GRID = 30;
const CELL = 320 / GRID;

/** 8.4–8.10 后的推演：拖动光源、法线、粗糙度，分别开关环境光、漫反射、高光。 */
export function LightingTermsActivity() {
  const [azimuth, setAzimuth] = useState(35);
  const [elevation, setElevation] = useState(30);
  const [roughness, setRoughness] = useState(24);
  const [ambient, setAmbient] = useState(true);
  const [diffuse, setDiffuse] = useState(true);
  const [specularOn, setSpecularOn] = useState(true);
  const [tilt, setTilt] = useState(0);

  const light = useMemo(() => {
    const a = (azimuth * Math.PI) / 180;
    const e = (elevation * Math.PI) / 180;
    return normalize(vec3(Math.cos(e) * Math.sin(a), Math.cos(e) * Math.cos(a), Math.sin(e)));
  }, [azimuth, elevation]);

  const toEye = vec3(0, 0, 1);
  const albedo: [number, number, number] = [0.72, 0.45, 0.28];
  const ambientStrength = 0.22;
  const lightColor: [number, number, number] = [1, 0.96, 0.86];

  const cells = useMemo(() => {
    const tiltRadians = (tilt * Math.PI) / 180;
    const result: Array<{ x: number; y: number; color: string }> = [];
    for (let j = 0; j < GRID; j += 1) {
      for (let i = 0; i < GRID; i += 1) {
        const px = ((i + 0.5) / GRID) * 2 - 1;
        const py = 1 - ((j + 0.5) / GRID) * 2;
        const r2 = px * px + py * py;
        if (r2 > 1) continue;
        let n = vec3(px, py, Math.sqrt(1 - r2));
        // 把球“倾斜”一点，让法线分布更明显
        const c = Math.cos(tiltRadians);
        const s = Math.sin(tiltRadians);
        n = vec3(n[0], n[1] * c - n[2] * s, n[1] * s + n[2] * c);
        n = normalize(n);

        const diffuseTerm = diffuse ? lambert(n, light) : 0;
        const specTerm = specularOn ? specular(n, light, toEye, roughness) : 0;
        const rgb = [0, 1, 2].map((channel) => {
          const value = (ambient ? ambientStrength * albedo[channel] : 0)
            + diffuseTerm * albedo[channel] * lightColor[channel]
            + specTerm * lightColor[channel];
          return Math.round(Math.min(1, Math.max(0, value)) * 255);
        });
        result.push({ x: i * CELL, y: j * CELL, color: `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})` });
      }
    }
    return result;
  }, [light, roughness, ambient, diffuse, specularOn, tilt]);

  const centerNormal = normalize(vec3(0, 0, 1));
  const centerDiffuse = lambert(centerNormal, light);
  const centerSpec = specular(centerNormal, light, toEye, roughness);
  const half = normalize(add(light, toEye));

  function reset() {
    setAzimuth(35);
    setElevation(30);
    setRoughness(24);
    setAmbient(true);
    setDiffuse(true);
    setSpecularOn(true);
    setTilt(0);
  }

  const onlyAmbient = ambient && !diffuse && !specularOn;

  return (
    <ActivityFrame
      id="ch08-lighting-terms"
      chapterId="ch08"
      title="把光照拆成环境光、漫反射、高光三项"
      prompt="目标是重现图 8.21 (a)：只留环境光，让球变成没有明暗变化的均匀亮度。用下面三个开关做。"
      predict={{
        question: '只保留环境光（关掉漫反射与高光）时，球看起来是什么样？',
        options: ['只有一小块高光', '整体均匀提亮，看不出明暗与立体感', '一半亮一半黑', '完全变黑'],
        answer: 1,
        hint: '环境光是一个与法线、位置都无关的常数项。',
        correctNote: '环境光是常数项，不看方向，所以只用它时球是均匀亮度、完全没有立体感。',
        wrongNote: '环境光是常量：A = la ⊗ ma，与法线和光源方向都无关。只用它时整个球一样亮。',
      }}
      onReset={reset}
      check={() => {
        if (!onlyAmbient) return { passed: false, feedback: '现在还不止一项。请打开环境光、关掉漫反射和高光，让球变成均匀亮度，再检查。' };
        return {
          passed: true,
          feedback: '这正是图 8.21 (a)：只有环境光时球是均匀的亮度，看不出立体感。立体感来自漫反射（朗伯余弦定律），而高光只贡献那一小块亮点。',
        };
      }}
      explanation={<>
        <p>书上的光照模型由三项相加：</p>
        <div className="math-block">LitColor = A + D + S<small>A：环境光（常数项）；D：漫反射；S：镜面高光</small></div>
        <p><b>环境光</b>模拟间接光，是一个常数：<code>A = la ⊗ ma</code>，与法线、光源方向都无关。它负责「把阴影处提亮一点」，单独用会失去全部立体感。</p>
        <p><b>漫反射</b>遵循朗伯余弦定律（图 8.10）：同样一束光斜照时摊到更大面积，单位面积收到的能量按 cos θ 衰减，也就是 <code>max(L · n, 0)</code>（图 8.11）。</p>
        <p><b>高光</b>来自微表面模型：只有法线恰好等于半程向量 h = normalize(L + v) 的微面元把光反射进眼睛（图 8.18）。粗糙度越大，高光越散越暗（图 8.19、8.20）。</p>
        <p>图 8.21 把三种组合的效果排在一起对比，是本节能一眼看懂的一张图。</p>
      </>}
      apply={<p>HLSL 里对应 <code>LitColor = ambient + diffuse + spec;</code>，其中漫反射项是 <code>max(dot(n, L), 0.0f)</code>，高光项用半程向量 <code>h</code> 与粗糙度 <code>shininess</code>。</p>}
    >
      <svg className="svg-stage" viewBox="0 0 320 320" role="img"
        aria-label={`光照球体预览：光源方位角 ${azimuth} 度、仰角 ${elevation} 度，粗糙度 ${roughness}，环境光 ${ambient ? '开' : '关'}、漫反射 ${diffuse ? '开' : '关'}、高光 ${specularOn ? '开' : '关'}`}>
        <rect x={0} y={0} width={320} height={320} fill="#fffdf6" />
        {cells.map((cell) => <rect key={`${cell.x}-${cell.y}`} x={cell.x} y={cell.y} width={CELL + 0.6} height={CELL + 0.6} fill={cell.color} />)}
        <text x={12} y={312}>环境光 {ambient ? '✓' : '✕'}　漫反射 {diffuse ? '✓' : '✕'}　高光 {specularOn ? '✓' : '✕'}</text>
      </svg>

      <Slider label="光源方位角" min={-180} max={180} step={2} value={azimuth} onChange={setAzimuth} format={(value) => `${value}°`} />
      <Slider label="光源仰角" min={-80} max={80} step={2} value={elevation} onChange={setElevation} format={(value) => `${value}°`} />
      <Slider label="粗糙度 shininess" min={1} max={128} step={1} value={roughness} onChange={setRoughness} />
      <Slider label="法线倾斜（演示用）" min={-60} max={60} step={2} value={tilt} onChange={setTilt} format={(value) => `${value}°`} />

      <Toggle label="环境光 A" checked={ambient} onChange={setAmbient} />
      <Toggle label="漫反射 D" checked={diffuse} onChange={setDiffuse} />
      <Toggle label="镜面高光 S" checked={specularOn} onChange={setSpecularOn} />

      <Readout items={[
        ['光源方向 L', `(${format(light[0])}, ${format(light[1])}, ${format(light[2])})`],
        ['半程向量 h', `(${format(half[0])}, ${format(half[1])}, ${format(half[2])})`],
        ['球心处 max(n·L, 0)', format(centerDiffuse)],
        ['球心处高光项', format(centerSpec)],
      ]} />
    </ActivityFrame>
  );
}
