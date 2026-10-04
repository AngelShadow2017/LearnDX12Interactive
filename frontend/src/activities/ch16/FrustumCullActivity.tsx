import { useMemo, useState } from 'react';
import { ActivityFrame } from '@/activities/ActivityFrame';
import { Choice, Readout, Slider, svgPoint } from '@/activities/controls';
import { frustumPlanes, isVisible, lookAtLH, multiply, perspectiveFovLH, planeAabb, planeSphere, vec3, type Vec3 } from '@/activities/math';

const UNIT = 30;
const COUNT = 125;

type Volume = 'sphere' | 'aabb';

function instancePosition(index: number): Vec3 {
  const columns = 5;
  const col = index % columns;
  const row = Math.floor(index / columns) % columns;
  const layer = Math.floor(index / (columns * columns));
  return vec3(-2 + col * 1, -1.6 + row * 1.2, -2.4 + layer * 2.4);
}

const HALF = 0.42;

/** 16.3 后的推演：移动视锥，实时统计「总实例 / 可见 / 剔除」，并查看球与 AABB 的判定。 */
export function FrustumCullActivity() {
  const [yaw, setYaw] = useState(0);
  const [volume, setVolume] = useState<Volume>('sphere');
  const [distance, setDistance] = useState(4);
  const [focusPlane, setFocusPlane] = useState(0);

  const radians = (yaw * Math.PI) / 180;
  const eye = vec3(Math.sin(radians) * distance, 0, Math.cos(radians) * distance);
  const focus = vec3(0, 0, 0);
  const view = lookAtLH(eye, focus, vec3(0, 1, 0));
  const proj = perspectiveFovLH((50 * Math.PI) / 180, 1.6, 0.1, 30);
  const planes = useMemo(() => frustumPlanes(multiply(view, proj)), [view, proj]);

  const results = useMemo(() => Array.from({ length: COUNT }, (_unused, index) => {
    const center = instancePosition(index);
    const min: Vec3 = [center[0] - HALF, center[1] - HALF, center[2] - HALF];
    const max: Vec3 = [center[0] + HALF, center[1] + HALF, center[2] + HALF];
    return {
      center,
      min,
      max,
      visible: isVisible(planes, center, HALF),
      sphereDistances: planes.map((plane) => planeSphere(plane, center, HALF)),
      aabbVisible: planes.every((plane) => planeAabb(plane, min, max)),
    };
  }), [planes]);

  const visibleCount = results.filter((result) => result.visible).length;
  const culledCount = COUNT - visibleCount;

  const plane = planes[focusPlane];
  const current = results[3];
  const signed = volume === 'sphere'
    ? planeSphere(plane, current.center, HALF)
    : planeAabb(plane, current.min, current.max) ? 1 : -1;

  function reset() {
    setYaw(0);
    setVolume('sphere');
    setDistance(4);
    setFocusPlane(0);
  }

  return (
    <ActivityFrame
      id="ch16-frustum-cull"
      chapterId="ch16"
      title="转动视锥，看可见实例数怎么变"
      prompt="拖动偏航角和相机距离，实时看「总数 / 可见 / 剔除」三个数字。切换包围球与 AABB，观察边缘处的判定差别。"
      predict={{
        question: '用包围球做视锥剔除时，什么情况下会「错误地剔除」一个其实可见的物体？',
        options: ['不会，包围球是精确的', '当物体有一部分伸出球外时，球完全在某个平面外就被剔掉了', '当物体完全在球内时', '当视锥很窄时'],
        answer: 1,
        correctNote: '包围球是保守近似：物体有一部分伸出球外时可能被误剔除，换来的是极快的判定。',
        wrongNote: '判定用的是「球心到平面的有符号距离与半径比较」，物体完全在球内反而一定通过。',
      }}
      onReset={reset}
      check={() => {
        if (yaw === 0 && distance === 4) return { passed: false, feedback: '先转动视锥（改变偏航角或相机距离），观察可见实例数的变化，再检查。' };
        return {
          passed: true,
          feedback: `当前 ${visibleCount} / ${COUNT} 个实例通过剔除，${culledCount} 个被剔除。判定标准是「六个平面全部通过」——图 16.7、16.8 分别是球与 AABB 的单平面测试。`,
        };
      }}
      explanation={<>
        <p>视锥由 6 个平面围成，它的体积就是这 6 个半空间的交集（图 16.6）。所以<b>只要有一个平面把物体完全排除在外，就可以剔除它</b>（图 16.10）。</p>
        <p>包围体有两种（图 16.1—16.5）：</p>
        <ul>
          <li><b>包围球</b>：一个中心 + 半径。球/平面测试只看球心到平面的有符号距离 k 与半径 r：k &gt; r 在正侧、k &lt; −r 可剔除（图 16.7）。</li>
          <li><b>AABB</b>：最小点 + 最大点（图 16.2、16.3）。测试时沿平面法线方向取「最不利」的那个对角点：法线第 i 轴分量为正就选 vMax[i]、为负选 vMin[i]（图 16.8、16.9）。</li>
        </ul>
        <p>两者都是<b>保守近似</b>：判定通过不代表物体真的可见，只是「有可能可见」。AABB 更紧（剔除更准），球更紧致（判定更便宜）。</p>
        <p>注意 AABB 的「轴对齐」是相对当前坐标系的：物体旋转后，世界的 AABB 会变大（图 16.4、16.5）。</p>
        <p>最后，图 16.12 给出了实际收益的量级——它<b>因场景而异</b>，不要承诺固定的加速比。</p>
      </>}
      apply={<p>代码对应 <code>Frustum::ConstructFrustum</code>（从视投影矩阵提取 6 个平面）与 <code>Frustum::IntersectsSphere / IntersectsBox</code>，按包围体类型调用不同的判定。</p>}
    >
      <svg className="svg-stage" viewBox="0 0 320 320" role="img"
        aria-label={`视锥俯视图，${visibleCount} 个实例可见，${culledCount} 个被剔除`}>
        <rect x={0} y={0} width={320} height={320} fill="#f7f9f3" />
        {results.map((result, index) => {
          const p = svgPoint(result.center[0], result.center[2], UNIT);
          const half = HALF * UNIT * 1.2;
          const box = result.min && result.max
            ? `${p.x - half},${p.y - half} ${p.x + half},${p.y - half} ${p.x + half},${p.y + half} ${p.x - half},${p.y + half}`
            : '';
          return <g key={index}>
            {volume === 'aabb' && <polygon points={box} fill="none" stroke={result.visible ? '#2f6b8f' : '#c6cec1'} strokeWidth={1} />}
            {volume === 'sphere' && <circle cx={p.x} cy={p.y} r={half} fill={result.visible ? 'rgba(47,107,143,.22)' : 'none'}
              stroke={result.visible ? '#2f6b8f' : '#c6cec1'} strokeWidth={1} />}
            {!result.visible && <circle cx={p.x} cy={p.y} r={2.4} fill="#b1712f" />}
          </g>;
        })}
        {(() => { const p = svgPoint(eye[0], eye[2], UNIT); return <g>
          <circle cx={p.x} cy={p.y} r={5} fill="#b1712f" />
          <text x={p.x + 8} y={p.y + 4}>相机</text>
        </g>; })()}
        <text x={12} y={306}>蓝色 = 通过剔除；橙色小点 = 被剔除；实心方 = 相机</text>
      </svg>

      <Slider label="视锥偏航角" min={-180} max={180} step={2} value={yaw} onChange={setYaw} format={(value) => `${value}°`} />
      <Slider label="相机距离" min={2} max={12} step={0.25} value={distance} onChange={setDistance} />
      <Choice label="包围体类型" options={[
        { value: 'sphere', label: '包围球', hint: '判定快、较松' },
        { value: 'aabb', label: 'AABB', hint: '较紧、更准' },
      ]} value={volume} onChange={setVolume} />
      <Slider label="查看第几个平面（0 左 1 右 2 下 3 上 4 近 5 远）" min={0} max={5} step={1} value={focusPlane} onChange={setFocusPlane} />

      <Readout items={[
        ['实例总数', String(COUNT)],
        ['可见', String(visibleCount)],
        ['剔除', String(culledCount)],
        ['第 4 个实例的判定值', volume === 'sphere' ? signed.toFixed(2) : (signed > 0 ? '通过' : '不通过')],
        ['半径 r', HALF.toFixed(2)],
      ]} />
    </ActivityFrame>
  );
}
