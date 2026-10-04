import { useState } from 'react';
import { ActivityFrame } from '@/activities/ActivityFrame';
import { MatrixGrid, Readout, Slider, svgPoint } from '@/activities/controls';
import { format, lookAtLH, vec3 } from '@/activities/math';

const UNIT = 34;

/** 15.2 后的推演：用键盘/拖动相机，同时显示相机轴、世界轴与视图矩阵。 */
export function CameraAxesActivity() {
  const [posX, setPosX] = useState(0);
  const [posZ, setPosZ] = useState(0);
  const [yaw, setYaw] = useState(0);

  const radians = (yaw * Math.PI) / 180;
  const eye = vec3(posX, 0, posZ);
  // 左手系：相机看向 +z，yaw = 0 时朝世界 +z
  const forward: [number, number] = [Math.sin(radians), Math.cos(radians)];
  const focus = vec3(posX + forward[0], 0, posZ + forward[1]);
  const view = lookAtLH(eye, focus, vec3(0, 1, 0));

  // XMMatrixLookAtLH 的旋转块按行主序保存；列分别是 right/up/look 在世界空间的分量。
  const cameraRight: [number, number, number] = [view[0], view[4], view[8]];
  const cameraUp: [number, number, number] = [view[1], view[5], view[9]];
  const cameraForward: [number, number, number] = [view[2], view[6], view[10]];

  function move(strafe: number, walk: number, dyaw: number) {
    const dx = cameraRight[0] * strafe + cameraForward[0] * walk;
    const dz = cameraRight[2] * strafe + cameraForward[2] * walk;
    setPosX((current) => Math.max(-3, Math.min(3, current + dx)));
    setPosZ((current) => Math.max(-3, Math.min(3, current + dz)));
    setYaw((current) => ((current + dyaw + 540) % 360) - 180);
  }

  function reset() {
    setPosX(0);
    setPosZ(0);
    setYaw(0);
  }

  const onKeyDown = (event: React.KeyboardEvent) => {
    const step = 0.25;
    const key = event.key.toLowerCase();
    if (key === 'arrowleft' || key === 'a') { move(-step, 0, 0); event.preventDefault(); }
    if (key === 'arrowright' || key === 'd') { move(step, 0, 0); event.preventDefault(); }
    if (key === 'arrowup' || key === 'w') { move(0, step, 0); event.preventDefault(); }
    if (key === 'arrowdown' || key === 's') { move(0, -step, 0); event.preventDefault(); }
    if (key === 'q') { move(0, 0, -3); event.preventDefault(); }
    if (key === 'e') { move(0, 0, 3); event.preventDefault(); }
  };

  const facingPlusX = Math.abs(yaw - 90) <= 2;

  const origin = svgPoint(0, 0, UNIT);
  const eyePoint = svgPoint(posX, posZ, UNIT);
  const fTip = svgPoint(posX + cameraForward[0], posZ + cameraForward[2], UNIT);
  const rTip = svgPoint(posX + cameraRight[0], posZ + cameraRight[2], UNIT);

  return (
    <ActivityFrame
      id="ch15-camera-axes"
      chapterId="ch15"
      title="把相机转到面向世界 +x"
      prompt="用方向键（或下面的按钮）沿相机 right/look 轴移动和转向。俯视图里能看到世界轴（灰）与相机轴（蓝/绿），矩阵显示当前视图变换。"
      predict={{
        question: '在 D3D 的左手系里，视图空间中原点在哪里、相机的「前方向」是哪一边？',
        options: ['原点在世界原点，朝 −z', '原点在相机位置，朝 +z', '原点在目标点，朝 +z', '原点在相机位置，朝 −z'],
        answer: 1,
        correctNote: '视图变换把相机放到原点，并让它沿 +z 观察——这与 XMMatrixLookAtLH 里 z 轴取 focus − eye 一致。',
        wrongNote: 'D3D 左手系的相机朝 +z 看，所以「相机前方」是视图空间里 z 为正的方向。',
      }}
      onReset={reset}
      check={() => {
        if (!facingPlusX) return { passed: false, feedback: `当前偏航角 ${yaw}°，相机朝向 (${format(cameraForward[0])}, ${format(cameraForward[2])})。目标是面向世界 +x，也就是偏航角 90°。` };
        return {
          passed: true,
          feedback: `偏航角 90° 时相机看向世界 +x。此时相机右轴在世界里的读数是 (${format(cameraRight[0])}, ${format(cameraRight[1])}, ${format(cameraRight[2])})——矩阵的列向量就是相机各轴在世界坐标中的方向。`,
        };
      }}
      explanation={<>
        <p>视图变换把世界坐标变成「相机视角下的坐标」。在左手系里，相机被放到<b>原点</b>，并且沿 <b>+z</b> 方向观察（图 15.1）。</p>
        <p>在行向量约定下，<code>XMMatrixLookAtLH</code> 构造的视图矩阵，其左上角 3×3 旋转块的三列分别表示相机 right、up、look 轴在世界坐标中的方向；逆矩阵（相机世界矩阵）的对应三行直接存着这三条轴。</p>
        <p>书中的相机类维护位置和 right / up / look 三条基轴。<code>Walk</code> 沿 look 移动，<code>Strafe</code> 沿 right 移动；<code>Pitch</code> 绕相机 right 轴旋转 up/look，<code>RotateY</code> 绕世界 y 轴旋转整组基轴。多次旋转后，<code>UpdateViewMatrix</code> 会重新正交化并归一化基轴，再构造视图矩阵。</p>
      </>}
      apply={<p>游戏里 WASD 移动、鼠标环视、Shift 加速（图 15.2）都是基于同一套基轴：移动方向 = right × (a−d) + look × (w−s)。若同时按多个方向并希望速度不变，可先用 <code>XMVector3Normalize</code> 归一化合成方向；书中样例则按 <code>Walk</code>/<code>Strafe</code> 分别更新相机位置。</p>}
    >
      <svg className="svg-stage" viewBox="0 0 320 320" role="img"
        aria-label={`俯视图：相机位于 ${format(posX)} 逗号 ${format(posZ)}，偏航角 ${yaw} 度`}>
        <g className="plane-grid">
          {Array.from({ length: 19 }, (_unused, index) => index - 9).map((index) => <g key={index}>
            <line x1={160 + index * UNIT} y1={0} x2={160 + index * UNIT} y2={320} />
            <line x1={0} y1={160 - index * UNIT} x2={320} y2={160 - index * UNIT} />
          </g>)}
        </g>
        <line className="axis" x1={20} y1={160} x2={300} y2={160} />
        <line className="axis axis--z" x1={160} y1={300} x2={160} y2={20} />
        <text x={288} y={152}>世界 +x</text><text x={166} y={28}>世界 +z</text>

        <line className="vec vec--w" x1={origin.x} y1={origin.y} x2={svgPoint(1, 0, UNIT).x} y2={svgPoint(1, 0, UNIT).y} stroke="#2f6b8f" />
        <line className="vec vec--u" x1={origin.x} y1={origin.y} x2={svgPoint(0, 1, UNIT).x} y2={svgPoint(0, 1, UNIT).y} stroke="#3f7d52" />
        <text x={svgPoint(1, 0, UNIT).x} y={svgPoint(1, 0, UNIT).y + 14}>z</text>
        <text x={svgPoint(0, 1, UNIT).x - 12} y={svgPoint(0, 1, UNIT).y}>x</text>

        <line className="vec vec--v" x1={eyePoint.x} y1={eyePoint.y} x2={fTip.x} y2={fTip.y} />
        <line className="vec vec--w" x1={eyePoint.x} y1={eyePoint.y} x2={rTip.x} y2={rTip.y} strokeDasharray="5 4" />
        <circle cx={eyePoint.x} cy={eyePoint.y} r={6} fill="#b1712f" />
        <text x={eyePoint.x + 9} y={eyePoint.y + 16}>相机</text>
        <text x={fTip.x + 8} y={fTip.y - 6}>前 +z_view</text>
        <text x={rTip.x + 6} y={rTip.y + 14}>右 +x_view</text>
      </svg>

      <div className="ctl-panel" tabIndex={0} role="group" aria-label="相机键盘控制：方向键或 WASD 沿相机基轴移动，Q/E 转向" onKeyDown={onKeyDown}
        onFocus={(event) => (event.currentTarget.style.outline = '2px solid #559d7c')} style={{ marginBottom: 10 }}>
        <span className="ctl-panel__title">键盘控制（先点一下这个区域，然后按方向键 / WASD / Q、E；移动跟随相机朝向）</span>
        <div className="activity__actions">
          <button className="button button--quiet" type="button" onClick={() => move(0, 0, -3)}>← 左转</button>
          <button className="button button--quiet" type="button" onClick={() => move(0, 0, 3)}>右转 →</button>
        <button className="button button--quiet" type="button" onClick={() => move(0, 0.25, 0)}>前进 ↑</button>
        <button className="button button--quiet" type="button" onClick={() => move(0, -0.25, 0)}>后退 ↓</button>
          <button className="button button--quiet" type="button" onClick={() => move(-0.25, 0, 0)}>左移</button>
          <button className="button button--quiet" type="button" onClick={() => move(0.25, 0, 0)}>右移</button>
        </div>
      </div>

      <Slider label="相机位置 x" min={-3} max={3} step={0.25} value={posX} onChange={setPosX} />
      <Slider label="相机位置 z" min={-3} max={3} step={0.25} value={posZ} onChange={setPosZ} />
      <Slider label="偏航角 yaw" min={-180} max={180} step={1} value={yaw} onChange={setYaw} format={(value) => `${value}°`} />

      <Readout items={[
        ['相机前轴（世界）', `(${format(cameraForward[0])}, ${format(cameraForward[1])}, ${format(cameraForward[2])})`],
        ['相机右轴（世界）', `(${format(cameraRight[0])}, ${format(cameraRight[1])}, ${format(cameraRight[2])})`],
        ['相机上轴（世界）', `(${format(cameraUp[0])}, ${format(cameraUp[1])}, ${format(cameraUp[2])})`],
        ['是否面向世界 +x', facingPlusX ? '是' : '否'],
      ]} />

      <div className="ctl-panel">
        <span className="ctl-panel__title">视图矩阵 gView（平移行是 −dot(相机各轴, eye)）</span>
        <MatrixGrid matrix={view} />
      </div>
    </ActivityFrame>
  );
}
