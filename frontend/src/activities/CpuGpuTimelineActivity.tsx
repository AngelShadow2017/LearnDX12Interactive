import { useState } from 'react';
import { ActivityFrame } from '@/activities/ActivityFrame';
import { OrderList, Readout } from '@/activities/controls';

type Step = { id: string; text: string };

const correctOrder: Step[] = [
  { id: 'wait', text: 'Wait(fence, n−1)：等到 GPU 用完上一帧的资源' },
  { id: 'update', text: 'CPU 更新第 n 帧的常量缓冲（写 R）' },
  { id: 'execute', text: '记录并 ExecuteCommandList：命令引用 R' },
  { id: 'signal', text: 'Signal(fence, n)：在命令流里插入路标' },
];

const shuffled: Step[] = [
  correctOrder[1], correctOrder[3], correctOrder[0], correctOrder[2],
];

/** 4.2 后的推演：在 CPU/GPU 时间线上安排命令、Fence 和资源更新，找出数据竞争。 */
export function CpuGpuTimelineActivity() {
  const [items, setItems] = useState<Step[]>(shuffled);
  const [checked, setChecked] = useState(false);

  const updateIndex = items.findIndex((item) => item.id === 'update');
  const waitIndex = items.findIndex((item) => item.id === 'wait');
  const executeIndex = items.findIndex((item) => item.id === 'execute');
  const signalIndex = items.findIndex((item) => item.id === 'signal');

  const race = updateIndex < waitIndex;
  const signalLast = signalIndex === items.length - 1;
  const executeAfterUpdate = executeIndex > updateIndex;

  function reset() {
    setItems(shuffled);
    setChecked(false);
  }

  const verdict = race
    ? '数据竞争：CPU 在 GPU 读完之前就改写了 R，画面会随机出错。'
    : signalLast && executeAfterUpdate
      ? '顺序正确：先等 Fence、再更新、再提交、最后插路标。'
      : '没有竞争，但顺序还不够稳妥：Signal 应该在提交命令之后再插入，否则路标不能代表这批命令已完成。';

  return (
    <ActivityFrame
      id="ch04-cpu-gpu-timeline"
      chapterId="ch04"
      title="给 CPU 这一排动作排出正确顺序"
      prompt="GPU 那一排是固定的：它还在执行第 n−1 帧的命令。你要安排的是 CPU 这一排的四个动作，用 ↑ ↓ 调整顺序。"
      predict={{
        question: 'CPU 想在 GPU 还在读取资源 R 的时候改写 R，会发生什么？',
        options: ['没有影响，GPU 会读到新数据', '没有影响，GPU 会读到旧数据', '结果不确定：可能出现 tearing、闪烁或读到半新半旧的数据', '驱动会抛异常并中断程序'],
        answer: 2,
        hint: 'CPU 和 GPU 是并行执行的，改写时机决定了 GPU 读到什么——书里图 4.7 就是这种情况。',
        correctNote: '这就是典型的数据竞争：现象随机，靠「多跑几次」是调不出来的。',
        wrongNote: 'CPU 与 GPU 并行执行，没有隐式同步。GPU 读到什么取决于时序，结果不确定。',
      }}
      onReset={reset}
      check={() => {
        if (race) return { passed: false, feedback: `现在是数据竞争：CPU 更新 R 排在第 ${updateIndex + 1} 步，而等待 Fence 排在第 ${waitIndex + 1} 步。必须先用 Wait 确认 GPU 已经用完上一帧，再改写资源。` };
        if (!signalLast) return { passed: false, feedback: '没有竞争了，但 Signal 应该在提交命令之后再插入——否则这个 fence 值不代表刚才那批命令已经跑完。' };
        return { passed: true, feedback: '顺序正确：Wait → 更新 → 提交 → Signal。这样 CPU 改写资源时，GPU 一定已经不再引用它了。' };
      }}
      explanation={<>
        <p>命令队列（图 4.6）让 CPU 提交命令、GPU 按序执行。两边是<b>并行</b>的：CPU 提交完不会等 GPU 跑完，而是继续干自己的事。</p>
        <p>问题就出在这里。图 4.7 是错误示范：GPU 正在执行命令 C（引用资源 p2 / R）时，CPU 已经开始更新 R 了。GPU 读到什么完全取决于时序，于是出现随机闪烁、撕裂这类「重跑一次又好了」的怪现象。</p>
        <p>解决办法是 Fence（图 4.8）：CPU 调用 Signal 在命令流里插入一个路标值，GPU 执行到那个位置就把 fence 值写进去；CPU 用 Wait 阻塞等待某个 fence 值被达到。</p>
        <p>书上给的规则很实用：<b>不要向前推进得太远</b>——通常用 3 个帧资源轮转，CPU 最多比 GPU 领先两帧。</p>
      </>}
      apply={<p>示例框架里的 <code>FlushCommandQueue()</code> 就是「Signal 后 Wait 同一个值」，用来强制 CPU/GPU 同步；每帧正常流程则是「Wait 上一帧的 fence → 更新帧资源 → 提交 → Signal 本帧」。</p>}
    >
      <div className="ctl-panel">
        <span className="ctl-panel__title">GPU 时间线（固定，不受你控制）</span>
        <ol className="order-list order-list--fixed">
          <li><span className="order-list__index" aria-hidden="true">G1</span><span className="order-list__text">执行第 n−1 帧命令（仍在读取帧资源 R）</span></li>
          <li><span className="order-list__index" aria-hidden="true">G2</span><span className="order-list__text">到达 fence 路标 n−1，写入 fence 值</span></li>
        </ol>
      </div>

      <div className="ctl-panel">
        <span className="ctl-panel__title">CPU 时间线（用 ↑ ↓ 调整顺序）</span>
        <OrderList label="CPU 动作顺序" items={items} onChange={(next) => { setItems(next); setChecked(false); }} />
      </div>

      <div className="activity__actions">
        <button className="button button--outline" type="button" onClick={() => setChecked(true)}>判断有没有竞争</button>
      </div>

      {checked && <p className={`activity__feedback ${race ? 'is-incorrect' : 'is-correct'}`} role="status">{verdict}</p>}

      <Readout items={[
        ['等待 Fence 的位置', `第 ${waitIndex + 1} 步`],
        ['更新资源的位置', `第 ${updateIndex + 1} 步`],
        ['提交命令的位置', `第 ${executeIndex + 1} 步`],
        ['是否存在竞争', race ? '是' : '否'],
      ]} />
    </ActivityFrame>
  );
}
