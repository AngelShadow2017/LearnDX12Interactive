import { useEffect, useState } from 'react';
import { ActivityFrame } from '@/activities/ActivityFrame';
import { Choice, Readout, Slider, Toggle } from '@/activities/controls';
import { format, quatDot, quatFromAxisAngle, quatSlerp, quatToMatrix, transformDirection, vec3, type Quat } from '@/activities/math';

const clampUnit = (value: number) => Math.min(1, Math.max(-1, value));

/** 22.4 后的推演：切换 q / −q 和短弧修正，直观看到 10° 与 350° 的路径差异。 */
export function SlerpShortArcActivity() {
  const [target, setTarget] = useState<'q' | '-q'>('-q');
  const [shortArc, setShortArc] = useState(true);
  const [t, setT] = useState(0.5);
  const [playing, setPlaying] = useState(false);
  const [runId, setRunId] = useState(0);

  const from = quatFromAxisAngle(vec3(0, 1, 0), 0);
  const base = quatFromAxisAngle(vec3(0, 1, 0), (10 * Math.PI) / 180);
  const end: Quat = target === 'q' ? base : [-base[0], -base[1], -base[2], -base[3]];
  const dot = quatDot(from, end);
  const effectiveDot = shortArc && dot < 0 ? -dot : dot;
  const pathAngle = (2 * Math.acos(clampUnit(effectiveDot)) * 180) / Math.PI;
  const current = quatSlerp(from, end, t, shortArc);
  const currentAngle = (2 * Math.acos(clampUnit(quatDot(from, current))) * 180) / Math.PI;
  const currentPathRadians = (currentAngle * Math.PI) / 360;
  const forward = transformDirection(quatToMatrix(current), vec3(0, 0, 1));

  useEffect(() => {
    if (!playing) return;
    const startingT = t;
    const startedAt = performance.now();
    const duration = Math.max(1, 2200 * (1 - startingT));
    let frame = 0;
    const advance = (now: number) => {
      const progress = Math.min(1, (now - startedAt) / duration);
      setT(startingT + (1 - startingT) * progress);
      if (progress < 1) frame = requestAnimationFrame(advance);
      else setPlaying(false);
    };
    frame = requestAnimationFrame(advance);
    return () => cancelAnimationFrame(frame);
  }, [playing, runId]);

  function reset() {
    setTarget('-q');
    setShortArc(true);
    setT(0.5);
    setPlaying(false);
    setRunId((value) => value + 1);
  }

  return (
    <ActivityFrame
      id="ch22-slerp-short-arc"
      chapterId="ch22"
      title="q 与 −q 表示同一旋转，但插值路径不同"
      prompt="目标：选 −q 并启用短弧修正，让同一个终点从 350° 长路改走 10° 短路；再拖动 t 或播放动画观察变化。"
      predict={{
        question: '为什么从 a 插值到 b 时要先判断 a·b < 0 并把其中一个取反？',
        options: ['为了提高精度', '因为 −b 与 b 表示同一旋转，取反能让路径走短弧', '为了避免除零', '为了让结果归一化'],
        answer: 1,
        correctNote: 'q 与 −q 表示同一旋转；点积为负时取反，把长弧改成短弧。',
        wrongNote: '这一步是为了选路径：−b 与 b 表示同一旋转，取反不会改变终点姿态，却能把长弧改成短弧。',
      }}
      onReset={reset}
      check={() => {
        if (target !== '-q') return { passed: false, feedback: '先选 −q：它与 q 表示同一个 10° 旋转，但四元数点积为负。' };
        if (!shortArc || pathAngle > 30) return { passed: false, feedback: `现在的插值路径约 ${format(pathAngle, 0)}°。启用短弧修正后应从 350° 降到 10°。` };
        return { passed: true, feedback: `正确：−q 与 q 表示相同终点；点积为负时取反，路径从约 350° 缩短到 ${format(pathAngle, 0)}°。` };
      }}
      explanation={<>
        <p>四元数插值有三种常见做法（图 22.6—22.8）：</p>
        <ul>
          <li><b>线性插值（LERP）+ 归一化</b>：简单，但球面上并非匀速。</li>
          <li><b>球面插值（SLERP）</b>：沿单位球面的大圆匀速走。</li>
          <li><b>平方三次插值（SQUAD）</b>：需要控制点，能保证角速度连续，代价更高。</li>
        </ul>
        <p>四元数 <b>q 与 −q 表示同一个旋转</b>。但从单位四元数插值到 10° 旋转的 −q，如果不修正，会沿长路转约 350°；先把点积为负的一端取反，就会沿 10° 短路到达相同姿态。</p>
        <div className="math-block">if (a·b &lt; 0) b = −b;   // 选等价表示，走短弧</div>
        <p>DirectXMath 的 <code>XMQuaternionSlerp</code> 对单位四元数插值时会处理短弧选择；自己实现插值时要保留这一步。</p>
      </>}
      apply={<p>关键帧动画逐帧对相邻关键帧做 SLERP。DirectXMath 的 <code>XMQuaternionSlerp</code> 要求输入为单位四元数；浮点运算较多时应按需要重新归一化。</p>}
    >
      <svg className="svg-stage" viewBox="0 0 320 320" role="img"
        aria-label={`插值路径约 ${format(pathAngle, 0)} 度，当前转过 ${format(currentAngle, 0)} 度，前向量 (${format(forward[0])}, ${format(forward[1])}, ${format(forward[2])})`}>
        <rect x={0} y={0} width={320} height={320} fill="#f4f7f0" />
        <circle cx={160} cy={160} r={110} fill="none" stroke="#cfd8cb" strokeWidth={1.4} />
        <text x={160} y={44} textAnchor="middle" style={{ fontSize: 10 }}>四元数路径投影示意</text>

        {[0, 0.25, 0.5, 0.75, 1].map((step) => {
          const q = quatSlerp(from, end, step, shortArc);
          const sphereAngle = Math.acos(clampUnit(quatDot(from, q)));
          return <circle key={step}
            cx={160 + Math.sin(sphereAngle) * 110}
            cy={160 - Math.cos(sphereAngle) * 110}
            r={Math.abs(step - t) < 0.005 ? 7 : 3.5}
            fill={Math.abs(step - t) < 0.005 ? '#2f6b8f' : '#9fb0a2'} />;
        })}

        <line x1={160} y1={160}
          x2={160 + Math.sin(currentPathRadians) * 110}
          y2={160 - Math.cos(currentPathRadians) * 110}
          stroke="#2f6b8f" strokeWidth={2.6} />
        <circle cx={160} cy={50} r={4} fill="#3f7d52" />
        <text x={170} y={44} style={{ fontSize: 10, fill: '#3f7d52' }}>起点 a</text>
        <text x={16} y={300} style={{ fontSize: 10 }}>本帧约转过 {format(currentAngle, 1)}°（路径共 {format(pathAngle, 1)}°）</text>
      </svg>

      <Choice label="终点用哪个表示" options={[
        { value: 'q', label: 'b（与 a 同号）', hint: '与起点点积为正' },
        { value: '-q', label: '−b（与 a 异号）', hint: '同一姿态，点积为负' },
      ]} value={target} onChange={setTarget} />
      <Toggle label="启用短弧修正（点积为负时取反）" checked={shortArc} onChange={setShortArc} />
      <Slider label="插值参数 t" min={0} max={1} step={0.01} value={t} onChange={setT} />
      <div className="activity__actions">
        <button className={`button ${playing ? 'button--done' : 'button--outline'}`} type="button" onClick={() => setPlaying((value) => !value)}>
          {playing ? '暂停播放' : '继续播放'}
        </button>
        <button className="button button--quiet" type="button" onClick={() => { setT(0); setRunId((value) => value + 1); setPlaying(true); }}>从头播放</button>
      </div>

      <Readout items={[
        ['四元数点积 a·b', format(dot, 3)],
        ['插值路径角度', `${format(pathAngle, 1)}°`],
        ['当前角度', `${format(currentAngle, 1)}°`],
        ['t', format(t)],
        ['当前前向量', `(${format(forward[0])}, ${format(forward[1])}, ${format(forward[2])})`],
        ['短弧修正', shortArc ? '已启用' : '关闭'],
      ]} />
    </ActivityFrame>
  );
}
