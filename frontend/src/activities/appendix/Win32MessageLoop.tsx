import { useState } from 'react';
import { Readout } from '@/activities/controls';

type Step = {
  id: string;
  title: string;
  detail: string;
  next: string[];
  code?: string;
};

const steps: Record<string, Step> = {
  entry: {
    id: 'entry',
    title: 'WinMain：初始化 + 进入消息循环',
    detail: '先注册窗口类、创建窗口、初始化 Direct3D，然后调用 GetMessage 进入消息循环。',
    next: ['loop'],
    code: 'int WinMain(HINSTANCE, HINSTANCE, LPSTR, int)\n{\n    if (!InitDirect3D(hWnd)) return -1;\n    while (msg.message != WM_QUIT)\n    {\n        if (PeekMessage(&msg, nullptr, 0, 0, PM_REMOVE))\n        {\n            TranslateMessage(&msg);\n            DispatchMessage(&msg);\n        }\n        else { gameTimer.Tick(); Update(gameTimer); Draw(gameTimer); }\n    }\n    return 0;\n}',
  },
  loop: {
    id: 'loop',
    title: '消息循环：每轮先处理消息',
    detail: '有消息就取出来翻译并分发；没有消息（窗口空闲）才更新并绘制。顺序不能反——先画后取消息会让窗口显得卡顿。',
    next: ['message'],
  },
  message: {
    id: 'message',
    title: 'WindowProc：按消息类型处理',
    detail: 'WM_SIZE 需要重建交换链和深度缓冲；WM_DESTROY 才真正结束消息循环。',
    next: ['quit'],
    code: 'case WM_SIZE:\n    mClientWidth  = LOWORD(lParam);\n    mClientHeight = HIWORD(lParam);\n    return 0;\n\ncase WM_DESTROY:\n    PostQuitMessage(0);\n    return 0;',
  },
  quit: {
    id: 'quit',
    title: '清理与退出',
    detail: 'WM_DESTROY 调用 PostQuitMessage(0)，让 GetMessage 返回 WM_QUIT，循环结束、WinMain 返回。',
    next: [],
  },
};

/** 附录 A：Win32 消息循环流程图，可逐步展开每一步做什么。 */
export function Win32MessageLoop() {
  const [current, setCurrent] = useState('entry');
  const [visited, setVisited] = useState<string[]>(['entry']);
  const step = steps[current];
  const finished = current === 'quit';

  function go(next: string) {
    setCurrent(next);
    setVisited((list) => (list.includes(next) ? list : [...list, next]));
  }

  function restart() {
    setCurrent('entry');
    setVisited(['entry']);
  }

  return (
    <section className="activity" aria-labelledby="win32-loop">
      <div className="activity__eyebrow"><span className="activity__spark" aria-hidden="true">✳</span> 附录 A</div>
      <h3 id="win32-loop">Win32 消息循环走一遍</h3>
      <p className="activity__prompt">逐步展开这套框架的骨架。看完你应该能回答：为什么示例里用的是 <code>PeekMessage</code> 而不是 <code>GetMessage</code>。</p>

      <div className="activity__workbench">
        <ol className="order-list">
          {['entry', 'loop', 'message', 'quit'].map((id, index) => (
            <li key={id} className={current === id ? 'is-current' : ''}>
              <span className="order-list__index" aria-hidden="true">{index + 1}</span>
              <span className="order-list__text">
                <b>{steps[id].title}</b>
                {current === id && <span className="activity__step-done">　当前</span>}
              </span>
            </li>
          ))}
        </ol>

        <div style={{ marginTop: 12 }}>
          <p style={{ margin: '0 0 8px', color: '#33473a', fontSize: 12.5, fontWeight: 600 }}>{step.title}</p>
          <p style={{ margin: 0, color: '#4d5f54', fontSize: 11.5, lineHeight: 1.8 }}>{step.detail}</p>
          {step.code && <pre style={{ marginTop: 10, padding: '12px 14px', border: '1px solid #313b34', borderRadius: 8, background: '#202a25', color: '#e4eae1', font: '11px/1.7 var(--mono)', overflowX: 'auto' }}>
            <code>{step.code}</code>
          </pre>}
          <div className="activity__actions">
            {step.next.map((next) => <button key={next} className="button button--accent" type="button" onClick={() => go(next)}>下一步：{steps[next].title}</button>)}
            {step.id !== 'entry' && <button className="button button--quiet" type="button" onClick={() => go(steps[current].id === 'quit' ? 'message' : (Object.keys(steps).indexOf(current) > 0 ? ['entry', 'loop', 'message', 'quit'][Object.keys(steps).indexOf(current) - 1] : 'entry'))}>← 上一步</button>}
            <button className="button button--quiet" type="button" onClick={restart}>从头开始</button>
          </div>
        </div>
      </div>

      <Readout items={[
        ['当前步骤', `${visited.indexOf(current) + 1} / 4`],
        ['是否走完全程', finished ? '是' : '否'],
      ]} />
      {finished && <div className="activity__explanation">
        <b>为什么用 PeekMessage</b>
        <p><code>GetMessage</code> 是阻塞的：没有消息时线程会睡着，游戏画面就停住了。<code>PeekMessage</code> 不阻塞，可以在没有消息时立刻更新并绘制——这正是实时渲染需要的。</p>
        <p>代价是必须自己控制节奏：用 <code>GameTimer</code> 计算 <code>DeltaTime</code>，动画才不会被帧率影响。</p>
      </div>}
    </section>
  );
}
