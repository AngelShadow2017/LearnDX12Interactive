import { useState } from 'react';
import { ActivityFrame } from '@/activities/ActivityFrame';
import { Readout, Slider } from '@/activities/controls';

type Lane = { label: string; text: string };

/** 7.1 后的推演：移动三帧资源时间轴，解释什么时候可以复用缓冲。 */
export function FrameResourceActivity() {
  const [count, setCount] = useState(3);
  const [lead, setLead] = useState(2);
  const [cpuFrame, setCpuFrame] = useState(4);
  const [touched, setTouched] = useState(false);

  const gpuFrame = Math.max(0, cpuFrame - lead);
  const cpuSlot = cpuFrame % count;
  const gpuSlot = gpuFrame % count;
  const conflict = lead > 0 && cpuSlot === gpuSlot && gpuFrame !== cpuFrame;
  const stalls = lead === 0;

  const rows: Lane[] = Array.from({ length: Math.max(6, cpuFrame + 2) }, (_unused, index) => {
    const frame = index;
    const slot = frame % count;
    const byCpu = frame === cpuFrame;
    const byGpu = frame === gpuFrame;
    const status = byCpu && byGpu ? '同一帧资源被两边同时使用' : byCpu ? 'CPU 正在写入' : byGpu ? 'GPU 正在读取' : '空闲';
    return { label: `帧 ${frame} → FR${slot}`, text: status };
  });

  function reset() {
    setCount(3);
    setLead(2);
    setCpuFrame(4);
    setTouched(false);
  }

  return (
    <ActivityFrame
      id="ch07-frame-resources"
      chapterId="ch07"
      title="移动时间轴，看哪一块帧资源可以复用"
      prompt="调整帧资源数量和 CPU 允许的领先帧数，再把当前 CPU 帧往后推，观察 CPU 和 GPU 是否落在同一个帧资源上。"
      predict={{
        question: '如果只有 1 个帧资源，而 CPU 想领先 GPU 一帧，会发生什么？',
        options: ['完全没问题', '数据竞争：CPU 会改写 GPU 还在用的缓冲', '只是帧率略低', '驱动会自动插入同步'],
        answer: 1,
        hint: 'CPU 领先一帧意味着它要写「下一帧」的缓冲，而此时 GPU 还在用上一块——只剩一块时那就是同一块。',
        correctNote: '只剩一块缓冲时，领先一帧必然撞车；D3D12 不会替你插入同步。',
        wrongNote: 'D3D12 没有隐式同步。只有一块帧资源却要领先，就一定会改写 GPU 还在读的缓冲。',
      }}
      onReset={reset}
      check={() => {
        if (!touched) return { passed: false, feedback: '先调整「帧资源数量」或「CPU 允许的领先帧数」，再推动当前帧，观察时间轴变化后检查。' };
        if (conflict) return { passed: false, feedback: `冲突：CPU 在帧 ${cpuFrame} 用 FR${cpuSlot}，GPU 在帧 ${gpuFrame} 也用 FR${gpuSlot}。要让 CPU 领先 ${lead} 帧，帧资源数量必须大于 ${lead}。` };
        if (stalls) return { passed: false, feedback: '不冲突了，但领先 0 帧意味着 CPU 每帧都要等 GPU 完成，失去了并行度。把领先帧数调到 1 以上，同时保证帧资源数量更多。' };
        return {
          passed: true,
          feedback: `${count} 个帧资源 + 领先 ${lead} 帧：CPU 用 FR${cpuSlot}，GPU 用 FR${gpuSlot}，互不重叠。这就是示例框架用 3 个帧资源、CPU 最多领先 2 帧的原因。`,
        };
      }}
      explanation={<>
        <p>因为 CPU 和 GPU 并行执行，每帧的常量缓冲不能共用一份：CPU 准备第 n 帧数据时，GPU 可能还在读第 n−1 帧的。解决办法是给每帧准备<b>独立的帧资源</b>（<code>FrameResource</code>），轮转使用。</p>
        <p>每个帧资源自带命令分配器、常量缓冲上传堆和（第 7 章之后）动态顶点缓冲。每帧开始时先 <code>Wait</code> 该帧资源对应的 fence 值，确认 GPU 用完后再写入。</p>
        <p>帧资源数量决定了 CPU 最多能领先多少帧：数量必须<b>大于</b>领先帧数，否则必然撞车。</p>
      </>}
      apply={<p>框架里的 <code>mCurrFrameResource = mFrameResources[mCurrentFrame % 3]</code> 就是这个轮转；每帧 <code>Update</code> 前先等这个帧资源的 fence。</p>}
    >
      <div className="ctl-panel">
        <span className="ctl-panel__title">时间轴</span>
        <ol className="order-list">
          {rows.map((row) => <li key={row.label}>
            <span className="order-list__index" aria-hidden="true">·</span>
            <span className="order-list__text"><b>{row.label}</b>　{row.text}</span>
          </li>)}
        </ol>
      </div>

      <Slider label="帧资源数量" min={1} max={4} step={1} value={count} onChange={(value) => { setCount(value); setTouched(true); }} />
      <Slider label="CPU 允许的领先帧数" min={0} max={3} step={1} value={lead} onChange={(value) => { setLead(value); setTouched(true); }} />
      <Slider label="当前 CPU 帧号" min={0} max={12} step={1} value={cpuFrame} onChange={(value) => { setCpuFrame(value); setTouched(true); }} />

      <Readout items={[
        ['CPU 用的帧资源', `FR${cpuSlot}`],
        ['GPU 用的帧资源', `FR${gpuSlot}`],
        ['是否冲突', conflict ? '是（数据竞争）' : '否'],
        ['CPU 是否每帧停顿', stalls ? '是' : '否'],
      ]} />
    </ActivityFrame>
  );
}
