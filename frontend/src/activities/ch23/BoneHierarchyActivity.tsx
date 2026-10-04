import { useState } from 'react';
import { ActivityFrame } from '@/activities/ActivityFrame';
import { Readout, Slider, svgPoint } from '@/activities/controls';
import { format, multiply, rotationY, rotationZ, translation, type Mat4 } from '@/activities/math';

const UNIT = 26;

type Bone = { id: string; label: string; parent: string | null; length: number; offset: [number, number] };

const bones: Bone[] = [
  { id: 'root', label: 'root', parent: null, length: 0, offset: [0, 0] },
  { id: 'hip', label: 'hip', parent: 'root', length: 0, offset: [0, 0] },
  { id: 'spine', label: 'spine', parent: 'hip', length: 2, offset: [0, 0] },
  { id: 'head', label: 'head', parent: 'spine', length: 1.4, offset: [0, 2] },
  { id: 'armL', label: 'arm.L', parent: 'spine', length: 1.8, offset: [1.2, 1.7] },
  { id: 'armR', label: 'arm.R', parent: 'spine', length: 1.8, offset: [-1.2, 1.7] },
  { id: 'legL', label: 'leg.L', parent: 'hip', length: 2.2, offset: [0.7, 0] },
  { id: 'legR', label: 'leg.R', parent: 'hip', length: 2.2, offset: [-0.7, 0] },
];

const identity: Mat4 = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];

/** 23.1 后的推演：拖动父骨骼，观察子骨骼如何继承变换。 */
export function BoneHierarchyActivity() {
  const [spineAngle, setSpineAngle] = useState(0);
  const [armAngle, setArmAngle] = useState(0);
  const [legAngle, setLegAngle] = useState(0);
  const [selected, setSelected] = useState('spine');
  const [touched, setTouched] = useState(false);

  const local: Record<string, Mat4> = {
    root: identity,
    hip: translation(0, -2.2, 0),
    spine: multiply(rotationY((spineAngle * Math.PI) / 180), translation(0, 0.4, 0)),
    head: multiply(rotationY(0), translation(0, 2, 0)),
    armL: multiply(rotationY((armAngle * Math.PI) / 180), translation(1.2, 1.7, 0)),
    armR: multiply(rotationY((-armAngle * Math.PI) / 180), translation(-1.2, 1.7, 0)),
    legL: multiply(rotationZ((legAngle * Math.PI) / 180), translation(0.7, 0, 0)),
    legR: multiply(rotationZ((-legAngle * Math.PI) / 180), translation(-0.7, 0, 0)),
  };

  const toRoot: Record<string, Mat4> = {};
  for (const bone of bones) {
    toRoot[bone.id] = bone.parent ? multiply(local[bone.id], toRoot[bone.parent]) : local[bone.id];
  }

  const point = (boneId: string): [number, number] => {
    const m = toRoot[boneId];
    return [m[12], -m[13]];
  };

  function reset() {
    setSpineAngle(0);
    setArmAngle(0);
    setLegAngle(0);
    setTouched(false);
  }

  const inherited = selected === 'spine' ? 0 : selected === 'head' || selected === 'armL' || selected === 'armR' ? spineAngle : 0;

  return (
    <ActivityFrame
      id="ch23-bone-hierarchy"
      chapterId="ch23"
      title="拖动父骨骼，子骨骼跟着继承"
      prompt="拖动 spine 的旋转，再看 head / arm 是否一起转；然后只拖 arm，观察 leg 不受影响。"
      predict={{
        question: '子骨骼的世界变换是怎么算出来的？',
        options: ['只用父骨骼的旋转', '自己的局部变换 × 父骨骼的 toRoot 矩阵（行向量约定）', '所有兄弟骨骼的变换相乘', '直接用自己的世界矩阵'],
        answer: 1,
        correctNote: '行向量顺序是 toRoot(child) = local(child) × toRoot(parent)；局部变换包含从父骨骼原点出发的偏移。',
        wrongNote: '子骨骼的完整变换要先应用自己的 toParent 局部矩阵，再接上父骨骼的 toRoot 矩阵。',
      }}
      onReset={reset}
      check={() => {
        if (!touched) return { passed: false, feedback: '先拖动「spine 旋转」，观察 head 和 arm 一起转，再检查。' };
        return {
          passed: true,
          feedback: `spine 转了 ${spineAngle}°，它的子骨骼 head / arm.L / arm.R 都继承了这个角度——它们的局部变换相同，只是偏移不同。leg 不受影响，因为它的父骨骼是 hip。`,
        };
      }}
      explanation={<>
        <p>角色用一棵<b>骨骼树</b>描述：每根骨骼用「父骨骼 + 偏移 + 姿态」定义（图 23.1、23.2）。</p>
        <p>数学形式很直接（图 23.3、23.4）：每根骨骼的几何都在自己的<b>局部坐标系</b>里描述，于是</p>
        <div className="math-block">toRoot(child) = local(child) · toRoot(parent)<small>行向量约定：先应用子骨骼局部变换，再应用父骨骼的 toRoot</small></div>
        <p>因此拖动一根骨骼，所有子孙都会跟着动——这就是「层级框架」（图 23.1）的全部含义。各坐标系在同一空间中，所以可以相互转换（<code>toParent</code> / <code>toRoot</code>，图 23.5）。</p>
        <p>实现时通常做一次自顶向下的遍历，把结果存进「矩阵调色板」，供蒙皮阶段查表使用。</p>
      </>}
      apply={<p>DirectXMath 里就是 <code>XMMatrixMultiply(local, toRoot[parent])</code>；动画系统每帧更新局部矩阵，再按父先子后的顺序重算整棵树的 toRoot。</p>}
    >
      <svg className="svg-stage" viewBox="0 0 320 320" role="img"
        aria-label={`骨骼层级：spine 旋转 ${spineAngle} 度，arm ${armAngle} 度，leg ${legAngle} 度`}>
        <rect x={0} y={0} width={320} height={320} fill="#f4f7f0" />
        {bones.filter((bone) => bone.parent).map((bone) => {
          const parent = bone.parent as string;
          const [px, py] = point(parent);
          const [x, y] = point(bone.id);
          const isSelected = selected === bone.id;
          return <g key={bone.id} style={{ cursor: 'pointer' }} onClick={() => setSelected(bone.id)}>
            <line x1={svgPoint(px, py, UNIT).x} y1={svgPoint(px, py, UNIT).y}
              x2={svgPoint(x, y, UNIT).x} y2={svgPoint(x, y, UNIT).y}
              stroke={isSelected ? '#2f6b8f' : '#b6c2b4'} strokeWidth={isSelected ? 3.4 : 2.4} />
            <circle cx={svgPoint(x, y, UNIT).x} cy={svgPoint(x, y, UNIT).y} r={4.5}
              fill={isSelected ? '#2f6b8f' : '#fff'} stroke="#5b6c60" />
            <text x={svgPoint(x, y, UNIT).x + 6} y={svgPoint(x, y, UNIT).y - 5} style={{ fontSize: 9 }}>{bone.label}</text>
          </g>;
        })}
        <circle cx={svgPoint(0, 0, UNIT).x} cy={svgPoint(0, 0, UNIT).y} r={5} fill="#5b6c60" />
        <text x={12} y={300} style={{ fontSize: 10 }}>选中：{bones.find((bone) => bone.id === selected)?.label}　继承自父骨骼的旋转：{format(inherited)}°</text>
      </svg>

      <Slider label="spine 旋转" min={-60} max={60} step={1} value={spineAngle} onChange={(value) => { setSpineAngle(value); setTouched(true); }} format={(value) => `${value}°`} />
      <Slider label="arm 旋转" min={-90} max={90} step={1} value={armAngle} onChange={(value) => { setArmAngle(value); setTouched(true); }} format={(value) => `${value}°`} />
      <Slider label="leg 旋转" min={-60} max={60} step={1} value={legAngle} onChange={(value) => { setLegAngle(value); setTouched(true); }} format={(value) => `${value}°`} />

      <Readout items={[
        ['选中的骨骼', bones.find((bone) => bone.id === selected)?.label ?? ''],
        ['其父骨骼', bones.find((bone) => bone.id === selected)?.parent ?? '（无）'],
        ['继承到的旋转', `${format(inherited)}°`],
        ['骨骼数量', String(bones.length)],
      ]} />
    </ActivityFrame>
  );
}
