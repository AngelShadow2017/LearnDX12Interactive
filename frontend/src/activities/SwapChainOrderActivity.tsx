import { useState } from 'react';
import { ActivityFrame } from '@/activities/ActivityFrame';
import { OrderList, Readout } from '@/activities/controls';

type Step = { id: string; text: string; state: string };

const correct: Step[] = [
  { id: 'barrier-in', text: '资源屏障：后台缓冲 PRESENT → RENDER_TARGET', state: 'PRESENT → RENDER_TARGET' },
  { id: 'clear', text: '清除渲染目标与深度/模板缓冲', state: 'RENDER_TARGET' },
  { id: 'draw', text: '设置视口与剪裁矩形，绘制几何', state: 'RENDER_TARGET' },
  { id: 'barrier-out', text: '资源屏障：后台缓冲 RENDER_TARGET → PRESENT', state: 'RENDER_TARGET → PRESENT' },
  { id: 'present', text: 'Present：交换前后台缓冲', state: 'PRESENT' },
];

const shuffled: Step[] = [correct[2], correct[0], correct[4], correct[1], correct[3]];

/** 4.3 后的推演：把「准备后台缓冲 → 清除 → 绘制 → 呈现」排成正确顺序。 */
export function SwapChainOrderActivity() {
  const [items, setItems] = useState<Step[]>(shuffled);
  const [checked, setChecked] = useState(false);

  const stateById = new Map(correct.map((item) => [item.id, item.state]));
  const sequence = items.map((item) => item.id);
  const expected = correct.map((item) => item.id);
  const isCorrect = sequence.every((id, index) => id === expected[index]);

  // 状态机校验：从 PRESENT 出发，按顺序施加屏障，看最后是否回到 PRESENT。
  const trace: string[] = [];
  let state = 'PRESENT';
  for (const item of items) {
    if (item.id === 'barrier-in') state = 'RENDER_TARGET';
    if (item.id === 'barrier-out') state = 'PRESENT';
    trace.push(state);
  }
  const endsPresentable = state === 'PRESENT';
  const drewWhileTarget = items.findIndex((item) => item.id === 'draw') > items.findIndex((item) => item.id === 'barrier-in')
    && items.findIndex((item) => item.id === 'draw') < items.findIndex((item) => item.id === 'barrier-out');

  function reset() {
    setItems(shuffled);
    setChecked(false);
  }

  return (
    <ActivityFrame
      id="ch04-swapchain-order"
      chapterId="ch04"
      title="把一帧的渲染步骤排成正确顺序"
      prompt="五个步骤被打乱了。用 ↑ ↓ 排出「准备后台缓冲 → 清除 → 绘制 → 呈现」的顺序，注意每一步要求的资源状态。"
      predict={{
        question: '绘制命令执行时，后台缓冲必须处于哪个资源状态？',
        options: ['PRESENT', 'RENDER_TARGET', 'COPY_DEST', '任意状态都可以'],
        answer: 1,
        hint: 'D3D12 不做隐式状态转换。要往后台缓冲画东西，必须先把它屏障到 RENDER_TARGET。',
        correctNote: '绘制要求 RENDER_TARGET；画完要屏障回 PRESENT 才能呈现。',
        wrongNote: 'D3D12 的资源状态必须显式转换：写之前转到目标状态，写完转回呈现需要的状态。',
      }}
      onReset={reset}
      check={() => {
        if (!isCorrect) return { passed: false, feedback: '顺序还不对。正确的顺序是：屏障到 RENDER_TARGET → 清除 → 绘制 → 屏障回 PRESENT → Present。可以对照「当前状态」这一列来判断。' };
        return { passed: true, feedback: '正确。D3D12 每一步都要求资源处于明确的状态：绘制前必须是 RENDER_TARGET，Present 前必须是 PRESENT。少了任何一个屏障，调试层都会报状态不匹配。' };
      }}
      explanation={<>
        <p>D3D12 与旧版最大的差别之一：<b>资源状态必须由开发者显式转换</b>。后台缓冲在呈现时是 PRESENT 状态，要用它做渲染目标就必须先用资源屏障转到 RENDER_TARGET；画完还要转回去才能 Present。</p>
        <p>忘记屏障的表现通常是 Debug Layer 报「资源状态不匹配」，或者干脆什么都不画（黑屏）。这也是排查树里「黑屏第一嫌疑」。</p>
        <p>另外两个容易漏的固定动作：清除渲染目标与深度缓冲，以及设置视口与剪裁矩形——<b>D3D12 不提供默认视口</b>。</p>
      </>}
      apply={<p>框架代码里对应 <code>D3DApp::Draw()</code> 的一段：屏障 → <code>ClearRenderTargetView</code> / <code>ClearDepthStencilView</code> → <code>RSSetViewports</code> → 绘制 → 屏障 → <code>Present</code>。</p>}
    >
      <OrderList label="一帧的渲染步骤" items={items.map((item) => ({ id: item.id, text: item.text }))}
        onChange={(next) => setItems(next.map((item) => ({ ...item, state: stateById.get(item.id) ?? '' })))} />

      <div className="activity__actions">
        <button className="button button--outline" type="button" onClick={() => setChecked(true)}>检查顺序</button>
      </div>

      {checked && <p className={`activity__feedback ${isCorrect ? 'is-correct' : 'is-incorrect'}`} role="status">
        {isCorrect ? '顺序正确。' : '顺序不对，请看右侧每一步执行后的资源状态。'}
      </p>}

      <Readout items={[
        ...items.map((_item, index) => [`第 ${index + 1} 步后状态`, trace[index]] as [string, string]),
        ['结束时状态', endsPresentable ? 'PRESENT（可呈现）' : '不是 PRESENT'],
        ['绘制在 RENDER_TARGET 期间', drewWhileTarget ? '是' : '否'],
      ]} />
    </ActivityFrame>
  );
}
