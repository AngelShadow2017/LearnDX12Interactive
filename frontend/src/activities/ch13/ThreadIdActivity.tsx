import { useMemo, useState } from 'react';
import { ActivityFrame } from '@/activities/ActivityFrame';
import { Readout, Slider } from '@/activities/controls';
import { threadIds } from '@/activities/math';

/** 13.4 后的推演：给定 Dispatch 与组内尺寸，点击线程求三种 ID。 */
export function ThreadIdActivity() {
  const [dispatch, setDispatch] = useState<[number, number]>([3, 2]);
  const [groupSize, setGroupSize] = useState<[number, number]>([8, 8]);
  const [picked, setPicked] = useState<[number, number] | null>(null);

  const totalX = dispatch[0] * groupSize[0];
  const totalY = dispatch[1] * groupSize[1];
  const cell = Math.min(26, Math.floor(300 / Math.max(totalX, totalY)));

  const target: [number, number] = [groupSize[0] * 1 + 2, groupSize[1] * 1 + 3];

  const info = useMemo(() => {
    if (!picked) return null;
    const groupId: [number, number, number] = [Math.floor(picked[0] / groupSize[0]), Math.floor(picked[1] / groupSize[1]), 0];
    const threadId: [number, number, number] = [picked[0] % groupSize[0], picked[1] % groupSize[1], 0];
    return threadIds(groupId, threadId, [groupSize[0], groupSize[1], 1]);
  }, [picked, groupSize]);

  function reset() {
    setDispatch([3, 2]);
    setGroupSize([8, 8]);
    setPicked(null);
  }

  const matched = picked !== null && picked[0] === target[0] && picked[1] === target[1];

  return (
    <ActivityFrame
      id="ch13-thread-ids"
      chapterId="ch13"
      title="点一个线程，读出它的三种 ID"
      prompt={`目标：找到并点中 GroupID = (1, 1, 0)、GroupThreadID = (2, 3, 0) 的那个线程（也就是全局第 ${target[0]}, ${target[1]} 个）。`}
      predict={{
        question: 'SV_DispatchThreadID（全局线程 ID）怎么由组 ID 与组内 ID 算出？',
        options: ['两者相加', 'GroupID × GroupSize + GroupThreadID', 'GroupThreadID × GroupSize + GroupID', '与组大小无关'],
        answer: 1,
        hint: '每个组有 GroupSize 个线程，所以要把组号换算成线程偏移。',
        correctNote: 'DispatchThreadID = GroupID × GroupSize + GroupThreadID。',
        wrongNote: '组号要先乘上每组线程数才能换算成线程偏移：DispatchThreadID = GroupID × GroupSize + GroupThreadID。',
      }}
      onReset={reset}
      check={() => {
        if (!picked) return { passed: false, feedback: '先在网格里点一个线程，看看它的三种 ID，再检查。' };
        if (!matched) return { passed: false, feedback: `你点的是全局 (${picked[0]}, ${picked[1]})，对应 GroupID (${info?.group[0]}, ${info?.group[1]}, 0)、GroupThreadID (${info?.thread[0]}, ${info?.thread[1]}, 0)。目标是 GroupID (1, 1, 0)、GroupThreadID (2, 3, 0)。` };
        return {
          passed: true,
          feedback: `GroupID (${info?.group[0]}, ${info?.group[1]}, ${info?.group[2]})、GroupThreadID (${info?.thread[0]}, ${info?.thread[1]}, ${info?.thread[2]})、DispatchThreadID (${info?.global[0]}, ${info?.global[1]}, ${info?.global[2]})，组内线性索引 GroupIndex = ${info?.index}。`,
        };
      }}
      explanation={<>
        <p>图 13.3 展示了 <code>Dispatch(3, 2, 1)</code> 启动 3 × 2 个线程组、每组 8 × 8 个线程。图 13.4 标记了其中一个线程 T。</p>
        <p>四个系统值：</p>
        <ul>
          <li><code>SV_GroupID</code>：当前线程组在 Dispatch 中的编号。</li>
          <li><code>SV_GroupThreadID</code>：线程在组内的编号。</li>
          <li><code>SV_DispatchThreadID</code>：全局线程编号 = GroupID × GroupSize + GroupThreadID。</li>
          <li><code>SV_GroupIndex</code>：组内的一维线性索引，用来索引共享内存数组。</li>
        </ul>
        <p>计算着色器不在渲染管线内（图 13.2），它独立地读写 GPU 资源。这也是它能用来做后处理、模糊、粒子模拟的原因。</p>
      </>}
      apply={<p>代码里是 <code>numthreads(X, Y, 1)</code> 声明组内尺寸，<code>Dispatch(dx, dy, 1)</code> 发起线程组；HLSL 里直接用 <code>uint3 DTid : SV_DispatchThreadID</code>。</p>}
    >
      <svg className="svg-stage" viewBox={`0 0 ${totalX * cell + 8} ${totalY * cell + 34}`} role="img"
        aria-label={`${dispatch[0]} 乘 ${dispatch[1]} 个线程组，每组 ${groupSize[0]} 乘 ${groupSize[1]} 个线程`}>
        <rect x={0} y={0} width={totalX * cell + 8} height={totalY * cell + 34} fill="#f4f7f0" />
        {Array.from({ length: totalY }, (_unused, y) => Array.from({ length: totalX }, (_u2, x) => {
          const inGroup = Math.floor(x / groupSize[0]) % 2 === 0 && Math.floor(y / groupSize[1]) % 2 === 0;
          const isPicked = picked?.[0] === x && picked?.[1] === y;
          const isTarget = target[0] === x && target[1] === y;
          return <rect key={`${x}-${y}`} x={4 + x * cell} y={30 + y * cell} width={cell - 1} height={cell - 1}
            fill={isPicked ? '#2f6b8f' : isTarget ? '#e8be68' : inGroup ? '#dfe8e1' : '#eef1ea'}
            stroke={isTarget ? '#b08a3a' : '#cfd8cb'} strokeWidth={isTarget ? 1.6 : 0.6}
            style={{ cursor: 'pointer' }}
            onClick={() => setPicked([x, y])} />;
        }))}
        <text x={4} y={20}>金色格子 = 目标线程；蓝色 = 你选中的线程</text>
      </svg>

      <Slider label="Dispatch 组数 X" min={2} max={5} step={1} value={dispatch[0]} onChange={(value) => { setDispatch([value, dispatch[1]]); setPicked(null); }} />
      <Slider label="Dispatch 组数 Y" min={2} max={4} step={1} value={dispatch[1]} onChange={(value) => { setDispatch([dispatch[0], value]); setPicked(null); }} />
      <Slider label="组内线程数 X" min={3} max={10} step={1} value={groupSize[0]} onChange={(value) => { setGroupSize([value, groupSize[1]]); setPicked(null); }} />
      <Slider label="组内线程数 Y" min={4} max={10} step={1} value={groupSize[1]} onChange={(value) => { setGroupSize([groupSize[0], value]); setPicked(null); }} />

      <Readout items={[
        ['SV_GroupID', info ? `(${info.group[0]}, ${info.group[1]}, ${info.group[2]})` : '—'],
        ['SV_GroupThreadID', info ? `(${info.thread[0]}, ${info.thread[1]}, ${info.thread[2]})` : '—'],
        ['SV_DispatchThreadID', info ? `(${info.global[0]}, ${info.global[1]}, ${info.global[2]})` : '—'],
        ['SV_GroupIndex', info ? String(info.index) : '—'],
        ['线程总数', `${totalX * totalY}`],
      ]} />
    </ActivityFrame>
  );
}
