import { useState } from 'react';

type Branch = { label: string; next: string };
type Node = {
  id: string;
  prompt: string;
  branches?: Branch[];
  verdict?: string;
  fix?: string;
  rule?: string;
};

const tree: Record<string, Node> = {
  root: {
    id: 'root',
    prompt: '你遇到的现象属于哪一类？',
    branches: [
      { label: '编译或链接就过不去', next: 'compile' },
      { label: '程序启动失败，设备/交换链创建不了', next: 'create' },
      { label: '能运行，但画面不对', next: 'visual' },
      { label: 'Debug Layer 输出了看不懂的信息', next: 'debug' },
    ],
  },

  compile: {
    id: 'compile',
    prompt: '错误信息更接近哪一种？',
    branches: [
      { label: 'C1083：无法打开包括文件 d3d12.h', next: 'compile-header' },
      { label: 'LNK2019：无法解析的外部符号', next: 'compile-link' },
      { label: '提示某个 API 不存在（如 DXGI 1.6）', next: 'compile-sdk-version' },
    ],
  },
  'compile-header': {
    id: 'compile-header',
    prompt: '',
    verdict: '编译器找不到 D3D12 头文件。',
    fix: '在项目属性里确认「常规 → Windows SDK 版本」选中了 10.0.19041 或更高；不要去下载 June 2010 DirectX SDK，D3D12 的头文件就在 Windows SDK 里。',
    rule: 'D3D12 头文件由 Windows SDK 提供，与旧版 DirectX SDK 无关。',
  },
  'compile-link': {
    id: 'compile-link',
    prompt: '',
    verdict: '链接器找不到实现所在的库。',
    fix: '在「链接器 → 输入 → 附加依赖项」加入 d3d12.lib、dxgi.lib、dxguid.lib；如果用 D3DCompileFromFile 编译着色器，再加 d3dcompiler.lib。',
    rule: 'DirectXMath 是纯头文件、全内联实现，没有 DirectXMath.lib 这个东西要链接。',
  },
  'compile-sdk-version': {
    id: 'compile-sdk-version',
    prompt: '',
    verdict: 'SDK 版本比代码用到的接口旧。',
    fix: '把项目的 Windows SDK 版本切到最新；或者把代码里较新的接口（IDXGIFactory4 以上、dxgi1_6.h）退回对应版本。',
    rule: '接口版本和 SDK 版本必须匹配，混用 1_4 / 1_6 头文件是常见坑。',
  },

  create: {
    id: 'create',
    prompt: '是哪一步返回的失败？',
    branches: [
      { label: 'D3D12CreateDevice 返回 nullptr 设备', next: 'create-device' },
      { label: 'CreateSwapChain 失败', next: 'create-swapchain' },
      { label: '创建资源或描述符堆失败', next: 'create-resource' },
    ],
  },
  'create-device': {
    id: 'create-device',
    prompt: '',
    verdict: '没有可用的 D3D12 适配器，或者请求的功能级别太高。',
    fix: '先用 D3D_FEATURE_LEVEL_11_0 试；用 DXGI 枚举适配器打印描述；更新显卡驱动（核显也要更新）。也可临时退到 WARP 软件适配器验证代码本身是否正确。',
    rule: 'D3D12 要求适配器至少支持功能级别 11_0。',
  },
  'create-swapchain': {
    id: 'create-swapchain',
    prompt: '',
    verdict: '交换链的描述与设备或窗口不匹配。',
    fix: '检查 SampleDesc.Count 是否为 1（D3D12 不支持交换链 MSAA）、格式是否为 R8G8B8A8_UNORM、BufferCount ≥ 2，以及传入的窗口句柄有效。',
    rule: '交换链缓冲数量与后续「等待哪一帧」的 Fence 逻辑直接相关。',
  },
  'create-resource': {
    id: 'create-resource',
    prompt: '',
    verdict: '堆描述或资源描述不合法，通常伴随 Debug Layer 的 invalid parameter。',
    fix: '确认堆类型与资源维度匹配（上传堆不能做渲染目标）、大小按 256 字节对齐（常量缓冲尤其容易错）、描述符堆类型与视图类型一致。',
    rule: '常量缓冲的大小必须向上对齐到 256 字节，这是 D3D12 的硬要求。',
  },

  visual: {
    id: 'visual',
    prompt: '画面具体是怎么不对？',
    branches: [
      { label: '全黑，但清屏色不是黑色', next: 'visual-black' },
      { label: '物体缺失、上下颠倒或背面朝我', next: 'visual-orientation' },
      { label: '画面闪烁、撕裂或偶发花屏', next: 'visual-flicker' },
    ],
  },
  'visual-black': {
    id: 'visual-black',
    prompt: '',
    verdict: '命令没有被真正记录或执行，或者渲染目标没绑定好。',
    fix: '按顺序确认：资源屏障是否把后台缓冲从 PRESENT 转成 RENDER_TARGET；OMSetRenderTargets 是否绑定了正确的 RTV；RSSetViewports 与 RSSetScissorRects 是否设置；命令列表最后是否 Close 并 Execute，以及有没有 Signal + WaitForFence。',
    rule: 'D3D12 不会帮你做任何隐式转换，忘记资源屏障是黑屏第一嫌疑。',
  },
  'visual-orientation': {
    id: 'visual-orientation',
    prompt: '',
    verdict: '三角形的绕序与背面剔除设置不一致，或者纹理坐标方向反了。',
    fix: 'D3D12 默认剔除顺时针（从相机看）为背面；改顶点顺序或改 CullMode 二选一验证。纹理上下颠倒时检查 UV 的 v 分量要不要取 1 − v。',
    rule: '绕序是在光栅化阶段判定的，改矩阵或改相机不会改变绕序本身。',
  },
  'visual-flicker': {
    id: 'visual-flicker',
    prompt: '',
    verdict: 'CPU 改写了 GPU 还没用完的帧资源。',
    fix: '给每一帧准备独立的上传缓冲与常量缓冲，用 Fence 等到 GPU 完成该帧再复用；不要把帧资源数量调成 1。',
    rule: '这是典型的 CPU/GPU 数据竞争，现象随机，靠「多跑几次试试」是调不出来的。',
  },

  debug: {
    id: 'debug',
    prompt: '消息里反复出现的关键词是什么？',
    branches: [
      { label: 'RESOURCE_BARRIER / 状态不匹配', next: 'debug-barrier' },
      { label: 'ROOT SIGNATURE / DESCRIPTOR', next: 'debug-root' },
      { label: 'invalid parameter / nullptr', next: 'debug-param' },
    ],
  },
  'debug-barrier': {
    id: 'debug-barrier',
    prompt: '',
    verdict: '资源的当前状态与这一次操作要求的状态不一致。',
    fix: '按「写入前转目标状态、写完转回通用状态」补上 ResourceBarrier；上传堆到复制目标、复制目标到像素着色资源，每一步都要转。',
    rule: 'D3D12 的资源状态必须由开发者显式转换。',
  },
  'debug-root': {
    id: 'debug-root',
    prompt: '',
    verdict: '根签名声明的寄存器与着色器里用到的对不上。',
    fix: '对照着色器里的 register(b0) / register(t0) / register(s0)，检查根参数的序号、描述符范围和可见性；改任一侧都要同步另一侧。',
    rule: '根签名是 CPU 与着色器之间的契约，两边必须逐项一致。',
  },
  'debug-param': {
    id: 'debug-param',
    prompt: '',
    verdict: '某个对象还没创建成功就被传了进去。',
    fix: '在使用前检查返回值（HRESULT 是否 S_OK、指针是否为空），并把 Debug Layer 输出的第一条错误当起点 —— 后面的往往是连锁反应。',
    rule: 'Debug Layer 的第一条消息最有价值，先修它再重跑。',
  },
};

/** 错误排查树：从现象出发，逐层收敛到可执行的第一步。 */
export function ErrorTriage() {
  const [path, setPath] = useState<string[]>(['root']);
  const currentId = path[path.length - 1];
  const node = tree[currentId];

  return (
    <section className="activity" aria-labelledby="error-triage">
      <div className="activity__eyebrow"><span className="activity__spark" aria-hidden="true">✳</span> 错误排查</div>
      <h3 id="error-triage">从现象出发，找到第一步该做什么</h3>
      <p className="activity__prompt">不要一次改多个地方：先沿树走到叶子，按建议改一处，再重跑。</p>

      <div className="activity__workbench">
        {path.map((id, index) => {
          const step = tree[id];
          return <div key={`${id}-${index}`} style={{ marginBottom: 14 }}>
            <p style={{ margin: '0 0 8px', color: '#5b6c60', fontSize: 10, fontWeight: 600 }}>
              第 {index + 1} 步：{index === 0 ? '你遇到的现象属于哪一类？' : `你选择了「${tree[path[index - 1]].branches?.find((branch) => branch.next === id)?.label ?? ''}」`}
            </p>
            {step.prompt && <p style={{ margin: '0 0 8px', fontSize: 12.5, color: '#33473a' }}>{step.prompt}</p>}
            {step.branches && <div className="activity__options">
              {step.branches.map((branch) => <button
                key={branch.next}
                className={`quiz-option ${path[index + 1] === branch.next ? 'is-selected' : ''}`}
                type="button"
                onClick={() => setPath((current) => [...current.slice(0, index + 1), branch.next])}
              >
                <span aria-hidden="true">▸</span><span>{branch.label}</span>
              </button>)}
            </div>}
          </div>;
        })}

        {node.verdict && <div className="activity__explanation" style={{ marginTop: 4 }}>
          <b>结论</b>
          <p>{node.verdict}</p>
          <p><b>第一步做什么：</b>{node.fix}</p>
          <p><b>背后的规则：</b>{node.rule}</p>
        </div>}
      </div>

      <div className="activity__actions">
        <button className="button button--quiet" type="button" onClick={() => setPath(['root'])}>从头开始</button>
        {path.length > 1 && <button className="button button--quiet" type="button" onClick={() => setPath((current) => current.slice(0, -1))}>退回上一步</button>}
      </div>
    </section>
  );
}
