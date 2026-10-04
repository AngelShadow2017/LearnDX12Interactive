import { useState } from 'react';

type CheckItem = {
  id: string;
  label: string;
  detail: string;
  /** 原书写作时的做法，与今天的推荐做法不同。 */
  bookVersion?: string;
  /** 检查失败时第一步该做什么。 */
  fix: string;
};

const groups: Array<{ title: string; items: CheckItem[] }> = [
  {
    title: '系统与编译器',
    items: [
      {
        id: 'os',
        label: 'Windows 10 或 Windows 11（64 位）',
        detail: 'D3D12 只支持 Windows 10 及以上。按 Win + R 输入 winver 可以看到版本号。',
        bookVersion: '原书以 Windows 10 初版为基准；今天直接用受支持的 Windows 10 21H2 以上或 Windows 11。',
        fix: '虚拟机的 GPU 通常不支持 D3D12，请在真实机器上配置环境。',
      },
      {
        id: 'vs',
        label: 'Visual Studio 2022，勾选「使用 C++ 的桌面开发」',
        detail: '安装器里确认右侧摘要包含 MSVC v143、C++ CMake 工具和 Windows 10/11 SDK。',
        bookVersion: '原书使用 Visual Studio 2015（v140）。用 VS2022 打开旧工程时会被提示升级平台工具集，直接接受即可。',
        fix: '如果已经装了 VS 但缺组件，运行 Visual Studio Installer → 修改 → 勾选「使用 C++ 的桌面开发」。',
      },
      {
        id: 'sdk',
        label: 'Windows SDK 版本 ≥ 10.0.19041',
        detail: 'd3d12.h、dxgi1_6.h 和 d3dcompiler 都由 SDK 提供，不需要额外下载 DirectX SDK。',
        bookVersion: '早期教程会让你装「DirectX SDK (June 2010)」，那是 D3D11 时代的做法，D3D12 的头文件已经在 Windows SDK 里。',
        fix: 'Visual Studio Installer → 单个组件 → 搜索 Windows SDK，勾选一个 10.0.19041 以上的版本。',
      },
    ],
  },
  {
    title: '运行时与调试',
    items: [
      {
        id: 'driver',
        label: '显卡驱动支持功能级别 11_0 以上',
        detail: '运行 dxdiag，在「显示」页看「功能级别」。D3D12 要求至少 11_0。',
        fix: '驱动太旧就去 NVIDIA / AMD / Intel 官网更新；核显也要更新，不能只看独显。',
      },
      {
        id: 'graphics-tools',
        label: '（可选）Windows 可选功能「Graphics Tools」',
        detail: 'Debug Layer 的消息和 PIX 抓帧都依赖它。设置 → 系统 → 可选功能 → 添加功能 → Graphics Tools。',
        bookVersion: '原书把 Graphics Tools 描述为调试必需；现在 D3D12 的调试层已随系统更新分发，但装上它仍然能拿到更完整的错误信息。',
        fix: '找不到这个可选功能时，先运行 Windows Update 再回来搜索。',
      },
      {
        id: 'repo',
        label: '克隆示例仓库 d3dcoder/d3d12book',
        detail: 'git clone https://github.com/d3dcoder/d3d12book.git，然后打开 Common 目录确认 d3dApp.h、d3dUtil.h 都在。',
        fix: '仓库里每个章节目录是一个独立的 .sln；示例共享 Common/ 下的框架代码，不要单独复制某个章节目录出来编译。',
      },
    ],
  },
  {
    title: '一个容易记错的点',
    items: [
      {
        id: 'directxmath',
        label: 'DirectXMath 不需要链接任何 .lib',
        detail: 'DirectXMath 是纯头文件实现，函数都是内联的，只要 #include <DirectXMath.h> 就能用。',
        bookVersion: '旧资料里写的「链接 DirectXMath.lib」并不存在；D3D12 程序要链接的是 d3d12.lib、dxgi.lib、dxguid.lib（以及用 D3DCompile 时的 d3dcompiler.lib）。',
        fix: '出现 LNK2019 未解析外部符号时，先看是不是缺这四个 .lib，而不是去找 DirectXMath 的库文件。',
      },
    ],
  },
];

const allItems = groups.flatMap((group) => group.items);

/** 可勾选的环境检查清单：勾选失败即展开排查建议。 */
export function EnvironmentChecklist() {
  const [state, setState] = useState<Record<string, 'ok' | 'stuck'>>({});
  const doneCount = allItems.filter((item) => state[item.id] === 'ok').length;
  const stuck = allItems.filter((item) => state[item.id] === 'stuck');

  return (
    <section className="activity" aria-labelledby="env-check">
      <div className="activity__eyebrow"><span className="activity__spark" aria-hidden="true">✳</span> 环境检查</div>
      <h3 id="env-check">逐项确认环境，卡住就看排查建议</h3>
      <p className="activity__prompt">已确认 <b>{doneCount}</b> / {allItems.length} 项。某一项做不到时点「这一步卡住了」，下面会给出排查建议。</p>

      {groups.map((group) => <div className="ctl-panel" key={group.title} style={{ marginBottom: 10 }}>
        <span className="ctl-panel__title">{group.title}</span>
        <ul className="step-list">
          {group.items.map((item) => <li key={item.id}>
            <div>
              <p style={{ margin: 0 }}><b>{item.label}</b></p>
              <p style={{ margin: '4px 0 0', fontSize: 11, color: '#6b7a6e', lineHeight: 1.8 }}>{item.detail}</p>
              {item.bookVersion && <p className="callout callout--tip" style={{ marginTop: 8, padding: '8px 11px', fontSize: 10.5 }}>
                <b>书中版本</b><p style={{ margin: '3px 0 0' }}>{item.bookVersion}</p>
              </p>}
              <div className="activity__actions" style={{ marginTop: 8 }}>
                <button className={`button ${state[item.id] === 'ok' ? 'button--done' : 'button--outline'}`} type="button"
                  onClick={() => setState((current) => ({ ...current, [item.id]: current[item.id] === 'ok' ? 'stuck' : 'ok' }))}>
                  {state[item.id] === 'ok' ? '✓ 已确认' : '这一项没问题'}
                </button>
                <button className="button button--quiet" type="button"
                  onClick={() => setState((current) => ({ ...current, [item.id]: current[item.id] === 'stuck' ? 'ok' : 'stuck' }))}>
                  {state[item.id] === 'stuck' ? '收起排查建议' : '这一步卡住了'}
                </button>
              </div>
              {state[item.id] === 'stuck' && <p className="activity__hint" style={{ marginTop: 8 }}><b>先做这一步</b>{item.fix}</p>}
            </div>
          </li>)}
        </ul>
      </div>)}

      {stuck.length > 0 && <div className="activity__explanation">
        <b>卡住的 {stuck.length} 项</b>
        <ul>{stuck.map((item) => <li key={item.id}><b>{item.label}：</b>{item.fix}</li>)}</ul>
        <p>环境是这本书最容易劝退的地方。一次只解决一项，不要同时改多个设置。</p>
      </div>}
    </section>
  );
}
