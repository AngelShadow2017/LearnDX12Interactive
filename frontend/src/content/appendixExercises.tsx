import type { Exercise } from '@/activities/appendix/ExerciseAnswers';

/** 附录 D 的习题提示与答案。答案默认折叠，读者先看提示再展开。 */
const exercises: Exercise[] = [
  {
    id: 'ex-ch01',
    chapter: 'ch01',
    question: '习题：已知 u = (1, 2, 3)，v = (0, −1, 0)。求 u · v、‖u‖、以及 u 在 v 方向上的正交投影。',
    hint: '点积按分量相乘再相加；长度用两次勾股；投影是 (u·v̂)v̂，先把 v 归一化。',
    answer: <>
      <p>u · v = 1·0 + 2·(−1) + 3·0 = <b>−2</b>（为负，说明夹角大于 90°）。</p>
      <p>‖u‖ = √(1 + 4 + 9) = √14 ≈ <b>3.742</b>。</p>
      <p>v 的单位向量是 (0, −1, 0)，所以 u 在 v 上的投影是 (u · v̂)·v̂ = −2·(0, −1, 0) = <b>(0, 2, 0)</b>。正交化之后 u − (0, 2, 0) = (1, 0, 3)，它与 v 的点积恰好为 0。</p>
    </>,
  },
  {
    id: 'ex-ch03',
    chapter: 'ch03',
    question: '习题：S = scaling(2, 1, 1)、R = 绕 z 轴转 30°、T = translation(1, 0, 0)。写出「先缩放、再旋转、最后平移」的矩阵连乘，并说明写成 T · R · S 会发生什么。',
    hint: '行向量约定下，v · A · B 表示先施加 A 再施加 B。',
    answer: <>
      <p>正确写法是 <code>v · S · R · T</code>。</p>
      <p>换成 <code>v · T · R · S</code> 意味着「先平移，再旋转，最后缩放」：平移量 (1, 0, 0) 会先被旋转 30°，再被 x 方向放大 2 倍——落点完全不同。这就是 AB ≠ BA 的直接后果。</p>
    </>,
  },
  {
    id: 'ex-ch05',
    chapter: 'ch05',
    question: '习题：写出「清屏 → 绘制 → 呈现」这一 pass 的最小骨架，并说明每一步要求的资源状态。',
    hint: 'D3D12 不做隐式状态转换。',
    answer: <>
      <p>顺序是：资源屏障（后台缓冲 PRESENT → RENDER_TARGET、深度缓冲 → DEPTH_WRITE）→ <code>ClearRenderTargetView</code> / <code>ClearDepthStencilView</code> → <code>RSSetViewports</code> 与 <code>RSSetScissorRects</code> → 绘制 → 屏障（RENDER_TARGET → PRESENT）→ <code>Present</code>。</p>
      <p>关键点：清除必须在深度缓冲处于 DEPTH_WRITE 时调用；后台缓冲在 Present 前必须回到 PRESENT 状态。缺任何一个屏障，调试层都会报状态不匹配。</p>
    </>,
  },
  {
    id: 'ex-ch08',
    chapter: 'ch08',
    question: '习题：沿 x 轴缩放 3、沿 y 轴缩放 1/2 之后，为什么直接用世界矩阵变换法线会错？正确做法是什么？',
    hint: '要求：变换后的法线与变换后的切向仍然垂直。',
    answer: <>
      <p>非均匀缩放会破坏切向与法线的正交关系：<code>(t·M)·(n·M) ≠ (t·n)·|M|²</code>，两者不再为 0，法线因此不再垂直于表面。</p>
      <p>正确做法是用<strong>逆转置矩阵</strong> <code>(M⁻¹)ᵀ</code> 变换法线，再归一化：C++ 里是 <code>XMMatrixInverse(nullptr, world)</code> 之后再 <code>XMMatrixTranspose</code>。</p>
      <p>补充：只有旋转和平移时逆转置等于自身，可以省掉这一步。</p>
    </>,
  },
  {
    id: 'ex-ch13',
    chapter: 'ch13',
    question: '习题：一个 28 × 14 的纹理用 8×1 的水平线程组处理，模糊半径 R = 4。每个线程组需要从纹理读取多少个 texel？',
    hint: '除了组内线程自己的像素，还要补上两端各 R 个 halo。',
    answer: <>
      <p>组内 8 个线程各读 1 个 = 8 个，再加两端各 R = 4 个 halo，合计 <b>8 + 2×4 = 16 个 texel</b>。</p>
      <p>对比：不做共享内存时每个线程要读 2R+1 = 9 个，8 个线程共 72 次。16 对 72，节省约 78%。</p>
      <p>注意图像最边缘：读取坐标要用 <code>min(max(...))</code> 钳制，否则会读到缓冲之外的未定义内容。</p>
    </>,
  },
  {
    id: 'ex-ch20',
    chapter: 'ch20',
    question: '习题：地面上出现阴影痤疮，应该先调什么？如果痤疮没了但阴影「浮」起来了，又该调什么？',
    hint: '两个问题方向相反：一个是太小，一个是太大。',
    answer: <>
      <p>痤疮是<b>偏移太小</b>：深度图分辨率有限，一个纹素覆盖一块区域，块内更近的深度被写进阴影图，于是像素自遮挡。解决：加深度偏移（<code>DepthBias</code>），倾斜表面再加 <code>SlopeScaledDepthBias</code>。</p>
      <p>阴影浮起来是 <b>Peter-Panning</b>：偏移太大，连「本该在自己身上」的阴影也被判成被照亮，于是阴影整体后退。解决：把偏移调小。</p>
      <p>这两者之间没有万能值，只能按场景调；边界锯齿要靠 PCF，和偏移是两件独立的事。</p>
    </>,
  },
  {
    id: 'ex-ch22',
    chapter: 'ch22',
    question: '习题：从四元数 a 插值到 b 时，a · b = −0.9。不做任何修正会发生什么？',
    hint: '点积为负说明它们在四维空间里的夹角大于 90°，但实际旋转只差一点点。',
    answer: <>
      <p>acos(−0.9) ≈ 154°——这是<b>长弧</b>。而 a 与 b 实际只差约 26°，物体会先转 154° 走远路再回来，视觉上就是「转了一大圈」。</p>
      <p>修正：<code>if (a·b &lt; 0) b = −b;</code>。−b 与 b 表示同一旋转，但与 a 的点积变成 +0.9，插值改走短弧。DirectXMath 的 <code>XMQuaternionSlerp</code> 已经内建这个判断，自己实现时最容易漏掉。</p>
    </>,
  },
];

export default exercises;
