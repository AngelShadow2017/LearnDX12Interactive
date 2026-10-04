import { useState } from 'react';
import { ActivityFrame } from '@/activities/ActivityFrame';
import { NumberField, Readout, Slider, svgPoint } from '@/activities/controls';
import { dot, format, sub, vec3 } from '@/activities/math';

const UNIT = 40;

type FrameKey = 'A' | 'B';

/** 3.4 后的推演：切换坐标系，填写同一点在两个 frame 里的坐标。 */
export function CoordinateChangeActivity() {
  const [pA, setPA] = useState<[number, number]>([3, 1]);
  const [theta, setTheta] = useState(45);
  const [originB, setOriginB] = useState<[number, number]>([1, 1]);
  const [active, setActive] = useState<FrameKey>('B');
  const [guess, setGuess] = useState<[string, string]>(['', '']);

  const radians = (theta * Math.PI) / 180;
  // frame A 就是标准基
  const uA: [number, number] = [1, 0];
  const vA: [number, number] = [0, 1];
  // frame B 相对 A：先旋转 theta，原点在 originB
  const uB: [number, number] = [Math.cos(radians), Math.sin(radians)];
  const vB: [number, number] = [-Math.sin(radians), Math.cos(radians)];

  // p 在世界（也就是 A）下的坐标
  const pWorld: [number, number] = [pA[0] * uA[0] + pA[1] * vA[0], pA[0] * uA[1] + pA[1] * vA[1]];
  // p 相对 B：先把原点挪到 B，再投影到 B 的两个基向量上
  const relative = sub(vec3(pWorld[0], pWorld[1], 0), vec3(originB[0], originB[1], 0));
  const pB: [number, number] = [dot(relative, vec3(uB[0], uB[1], 0)), dot(relative, vec3(vB[0], vB[1], 0))];

  const actual: [number, number] = active === 'A' ? pA : pB;
  const guessX = Number(guess[0]);
  const guessY = Number(guess[1]);
  const hasGuess = guess[0] !== '' && guess[1] !== '';
  const error = hasGuess ? Math.hypot(guessX - actual[0], guessY - actual[1]) : Number.NaN;

  function reset() {
    setPA([3, 1]);
    setTheta(45);
    setOriginB([1, 1]);
    setGuess(['', '']);
  }

  const origin = svgPoint(0, 0, UNIT);
  const pointWorld = svgPoint(pWorld[0], pWorld[1], UNIT);
  const bOrigin = svgPoint(originB[0], originB[1], UNIT);
  const bu = svgPoint(originB[0] + uB[0], originB[1] + uB[1], UNIT);
  const bv = svgPoint(originB[0] + vB[0], originB[1] + vB[1], UNIT);

  return (
    <ActivityFrame
      id="ch03-change-of-coordinate"
      chapterId="ch03"
      title="同一个点，在两个坐标系里填两次坐标"
      prompt={`现在要填的是点 p 相对坐标系 ${active} 的坐标。先在右边切换 frame，再把算出的两个分量填进去检查。`}
      predict={{
        question: '把坐标系 B 旋转并平移之后，同一个点 p 在 B 下的坐标会怎样？',
        options: ['完全不变', '会变，但点本身没有移动', '点会跟着移动', '无法确定'],
        answer: 1,
        hint: '坐标系变换不改变几何，只改变「参考系」，从而改变坐标表示。',
        correctNote: '坐标系变换不改变几何本身，变的是描述它的参考系——所以只有坐标读数会变。',
        wrongNote: '书上强调：In a change of coordinate transformation, we do not think of the geometry as changing; rather, we are changing the frame of reference. 变的是读数，不是几何。',
      }}
      onReset={reset}
      check={() => {
        if (!hasGuess) return { passed: false, feedback: `先把点 p 相对坐标系 ${active} 的两个坐标填进输入框再检查。` };
        if (error > 0.05) return { passed: false, feedback: `你填的是 (${format(guessX)}, ${format(guessY)})，实际是 (${format(actual[0])}, ${format(actual[1])})，差 ${format(error)}。${active === 'B' ? '做法：先把 p 的世界坐标减去 B 的原点，再把结果分别投影到 B 的两个基向量上。' : '坐标系 A 就是标准基，p 相对 A 的坐标就是它的世界坐标。'}` };
        return {
          passed: true,
          feedback: `正确。p 相对 A 是 (${format(pA[0])}, ${format(pA[1])})，相对 B 是 (${format(pB[0])}, ${format(pB[1])})。同一个点，几何没动，读数变了。`,
        };
      }}
      explanation={<>
        <p>把 100°C 换算成华氏度，水温本身没变，只是换了一个刻度——坐标系变换是同一件事。</p>
        <p>书上强调：<b>坐标系变换中我们不认为几何发生了变化</b>，变的是参考系，于是坐标表示变了。这和「旋转、平移、缩放」那种真正移动几何的变换是两回事。</p>
        <p>求法是通用的：先把 p 相对 A 的坐标写成 p = x·u + y·v（u、v 是 A 的基向量），再把等式里每个向量都用 B 的坐标表示：</p>
        <div className="math-block">p<sub>B</sub> = x·u<sub>B</sub> + y·v<sub>B</sub> + z·w<sub>B</sub></div>
        <p>这里多了一步「减去 B 的原点」，因为点有位置而向量没有——这也是点和向量的坐标系变换公式不同的原因。</p>
      </>}
      apply={<p>代码里对应 <code>XMMatrixInverse(nullptr, world)</code>：世界矩阵把本地坐标送到世界，它的逆把世界坐标送回本地。视图矩阵就是相机世界矩阵的逆。</p>}
    >
      <svg className="svg-stage" viewBox="0 0 320 320" role="img"
        aria-label={`点 p 世界坐标 ${format(pWorld[0])} 逗号 ${format(pWorld[1])}，坐标系 B 原点在 ${format(originB[0])} 逗号 ${format(originB[1])}，旋转 ${theta} 度`}>
        <g className="plane-grid">
          {Array.from({ length: 17 }, (_unused, index) => index - 8).map((index) => <g key={index}>
            <line x1={160 + index * UNIT} y1={0} x2={160 + index * UNIT} y2={320} />
            <line x1={0} y1={160 - index * UNIT} x2={320} y2={160 - index * UNIT} />
          </g>)}
        </g>
        <line className="axis" x1={20} y1={160} x2={300} y2={160} />
        <line className="axis" x1={160} y1={300} x2={160} y2={20} />
        <text x={286} y={152}>A: +x</text><text x={166} y={28}>A: +y</text>

        <line className="axis" style={{ stroke: '#3d6f96' }} x1={bOrigin.x} y1={bOrigin.y} x2={bu.x} y2={bu.y} />
        <line className="axis" style={{ stroke: '#96682f' }} x1={bOrigin.x} y1={bOrigin.y} x2={bv.x} y2={bv.y} />
        <text x={bu.x + 4} y={bu.y - 4} style={{ fill: '#3d6f96' }}>B: u</text>
        <text x={bv.x + 4} y={bv.y - 4} style={{ fill: '#96682f' }}>B: v</text>
        <circle cx={bOrigin.x} cy={bOrigin.y} r={3.5} fill="#96682f" />
        <circle cx={origin.x} cy={origin.y} r={3.5} fill="#5b6c60" />
        <circle cx={pointWorld.x} cy={pointWorld.y} r={5.5} fill="#2f6b8f" />
        <text x={pointWorld.x + 9} y={pointWorld.y - 7}>p</text>
      </svg>

      <Slider label="p 相对 A 的 x" min={-5} max={5} step={0.25} value={pA[0]} onChange={(next) => setPA([next, pA[1]])} />
      <Slider label="p 相对 A 的 y" min={-5} max={5} step={0.25} value={pA[1]} onChange={(next) => setPA([pA[0], next])} />
      <Slider label="坐标系 B 的旋转角" min={-180} max={180} step={5} value={theta} onChange={setTheta} format={(value) => `${value}°`} />
      <Slider label="坐标系 B 的原点 x" min={-4} max={4} step={0.25} value={originB[0]} onChange={(next) => setOriginB([next, originB[1]])} />
      <Slider label="坐标系 B 的原点 y" min={-4} max={4} step={0.25} value={originB[1]} onChange={(next) => setOriginB([originB[0], next])} />

      <div className="ctl ctl--choice">
        <span className="ctl__label">要填写哪个坐标系</span>
        <div className="ctl__segments">
          {(['A', 'B'] as FrameKey[]).map((key) => <button key={key} type="button"
            className={`segment ${active === key ? 'is-active' : ''}`}
            onClick={() => setActive(key)}>
            <span>坐标系 {key}</span>
          </button>)}
        </div>
      </div>

      <NumberField label={`p 相对 ${active} 的 x′`} value={Number(guess[0])} onChange={(next) => setGuess([String(next), guess[1]])} />
      <NumberField label={`p 相对 ${active} 的 y′`} value={Number(guess[1])} onChange={(next) => setGuess([guess[0], String(next)])} />

      <Readout items={[
        ['p 相对 A', `(${format(pA[0])}, ${format(pA[1])})`],
        ['p 相对 B', `(${format(pB[0])}, ${format(pB[1])})`],
        ['p 的世界坐标', `(${format(pWorld[0])}, ${format(pWorld[1])})`],
      ]} />
      <p className="draggable-note">B 的基向量 u = (cos θ, sin θ)、v = (−sin θ, cos θ)；求 p<sub>B</sub> 时记得先减去 B 的原点。</p>
    </ActivityFrame>
  );
}
