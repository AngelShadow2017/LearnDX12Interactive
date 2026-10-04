# 全书统一术语表

新会话开始前必读。这里的中文译名是全书默认写法，已出现的英文术语可在首次出现时括注；之后优先用中文。API 类型、函数、枚举、字段、变量和代码中的标识符保持原样，不翻译。

如果语境要求不同含义，先在本轮记录上下文并说明理由，再新增有范围限制的术语条目。不要为了逐字统一而混淆概念；确定要改标准译名时，必须记录旧译法、新译法、原因和需要回查的章节，并回改所有受影响译文。

| English term | 全书首选译名 | 使用范围 / 防混淆说明 |
|---|---|---|
| vector | 向量 | 不与 point（点）混用。 |
| point | 点 | 表示位置；和作为位移/方向量的向量区分。 |
| coordinate system | 坐标系 | 不写作“坐标系统”，除非引用原文固定名称。 |
| vector operation | 向量运算 | 具体运算使用点积、叉积等固定术语。 |
| dot product | 点积 | 不与矩阵乘法混称。 |
| cross product | 叉积 | 不译作“向量积”，除非原文明确采用该泛称。 |
| unit vector | 单位向量 |  |
| linear transformation | 线性变换 | transformation 统一译“变换”。 |
| affine transformation | 仿射变换 |  |
| transformation matrix | 变换矩阵 | 表示对几何对象施加的变换。 |
| coordinate transformation / change of coordinates | 坐标系转换 | 强调同一对象在不同坐标系间的坐标映射。 |
| change-of-coordinate transformation | 坐标系转换变换 | 本书 §3.4 的专门概念名；保留“变换”以和普通的坐标表示变化相区分。 |
| change-of-coordinate matrix | 坐标系转换矩阵 | 统一替代现稿中的“坐标系变更矩阵”；不要与变换矩阵混为一谈。 |
| row vector / column vector | 行向量 / 列向量 | 保留原书的行向量乘矩阵约定，不擅自转置。 |
| homogeneous coordinates | 齐次坐标 |  |
| local space | 局部空间 |  |
| object space | 物体空间 | 与 local space 接近，但若原文并列使用，不合并术语；按上下文注明。 |
| world space | 世界空间 |  |
| view space | 视图空间 | 首次可注明也称 eye/camera space（眼空间/摄像机空间）；后文固定用“视图空间”。 |
| projection space | 投影空间 |  |
| homogeneous clip space / clip space | 齐次裁剪空间 | 首次定义后可简称裁剪空间，但公式/关键区别处保留全称。 |
| normalized device coordinates (NDC) | 归一化设备坐标（NDC） | 后文简称 NDC；不要误写为屏幕坐标。 |
| viewport | 视口 | Direct3D 的 viewport；viewport transform 译“视口变换”。 |
| render pipeline | 渲染管线 | 不与单个 pipeline stage 混淆。 |
| pipeline stage | 管线阶段 | 具体阶段见下列术语。 |
| input assembler (IA) stage | 输入装配阶段 |  |
| vertex shader (VS) | 顶点着色器 | stage 用“顶点着色器阶段”。 |
| pixel shader (PS) | 像素着色器 | Direct3D 术语；不要自行替换为“片元着色器”。 |
| geometry shader (GS) | 几何着色器 | stage 用“几何着色器阶段”。 |
| hull shader / domain shader | 外壳着色器 / 域着色器 | 依 Direct3D 常用译法；英文缩写 HS/DS 保留。 |
| tessellation | 曲面细分 | tessellation stage 统一译“曲面细分阶段”；后文可用“该阶段”避免重复。 |
| primitive | 图元 | 例如点图元、线图元、三角形图元。 |
| primitive topology | 图元拓扑 |  |
| clipping | 裁剪 |  |
| rasterization | 光栅化 |  |
| rasterizer state | 光栅器状态 | 不译为“光栅化状态”。 |
| backface culling | 背面剔除 |  |
| output merger (OM) stage | 输出合并阶段 | 首次可附 OM。 |
| vertex buffer | 顶点缓冲 |  |
| index buffer | 索引缓冲 |  |
| constant buffer | 常量缓冲 |  |
| depth buffer | 深度缓冲 |  |
| depth/stencil buffer | 深度/模板缓冲 | 保留斜线表示同一资源用途。 |
| resource | 资源 | Direct3D GPU resource；不泛化成文件或资产。 |
| descriptor | 描述符 |  |
| descriptor heap | 描述符堆 |  |
| descriptor table | 描述符表 |  |
| root signature | 根签名 |  |
| input layout | 输入布局 | input layout description 译“输入布局描述”。 |
| semantic | 语义 | shader/input layout 语境；SemanticName 保持代码原文。 |
| command queue | 命令队列 |  |
| command list | 命令列表 |  |
| command allocator | 命令分配器 |  |
| fence | 围栏 | 沿用第 4 章现译；首次可括注 fence。 |
| pipeline state object (PSO) | 管线状态对象（PSO） | 保留 Direct3D 缩写。 |
| anti-aliasing | 抗锯齿 |  |
| multisampling / MSAA | 多重采样 / 多重采样抗锯齿（MSAA） | 按原文是技术还是整体方法选择短译名。 |
| supersampling | 超采样 |  |
| resolve (MSAA) | 解析（resolve） | 指多重采样结果解析；不要按普通动词误译。 |
| frame rate / frames per second (FPS) | 帧率 / 每秒帧数（FPS） | FPS 首次定义后保留缩写。 |
| low-poly | 低多边形 | 讨论网格复杂度时使用；不写成“低聚”。 |
| frame resource | 帧资源 | 第 7 章引入的循环数组资源；不要译成“帧缓冲资源”以免与 framebuffer 混淆。 |
| render item | 渲染项 | 第 7 章引入；不译“渲染元素/绘制项”。 |
| pass / rendering pass | pass / 渲染遍 | 目录已定“Pass 常量”；正文保留英文 pass（如“逐 pass 常量”“每次渲染遍（pass）”），不译“通道/趟”。 |
| root descriptor | 根描述符 | inline descriptor 括注“内联描述符”。 |
| root constant | 根常量 |  |
| root argument | 根实参 | 与“根参数”（root parameter）区分：参数是签名定义，实参是传入的值。 |
| slice / stack | 切片 / 层 | 圆柱、球体网格生成语境（§7.4）；不译“扇区/堆叠”。 |
| cap | 端盖 | 圆柱顶盖/底盖几何；不译“帽子/盖子”。 |
| geosphere | 测地球 | 与 icosahedron（二十面体）配套；不译“地球体”。 |
| base vertex location | 基顶点位置 | DrawIndexedInstanced 参数语境；保持与第 6 章 SubmeshGeometry 译法一致。 |
| dynamic vertex buffer | 动态顶点缓冲 | 与“静态缓冲”相对；§7.7.5。 |
| instancing | 实例化 | §7.5.1 “实例化几何”；第 16 章 hardware instancing 沿用“硬件实例化”。 |

## 术语一致性检查

每批结束时检查本批新增术语是否已经在表中，以及是否和先前译文冲突。章节结束时检查本章所有英文首次定义、缩写和译名。全书完成前按术语表搜索旧译法；禁止只做机械全局替换，先判断每处语义。

`npm run check:translation-terms` 会检测已经明确登记的几种易混写法。它只是防回归哨兵，不会扫描并判断整张术语表；每个新会话仍须阅读本表并人工核对本轮术语。

## 译名变更记录

| 日期 | 旧写法 | 当前首选写法 | 原因与处理范围 |
|---|---|---|---|
| 2026-10-04 | 坐标系变更矩阵 | 坐标系转换矩阵 | 第 3 章同一概念出现两种写法，统一为后者；专门术语“坐标系转换变换”保留，以区别变换矩阵。 |
| 2026-10-04 | 坐标系统 | 坐标系 | 第 5 章图 5.17 图注的一般术语与全书首选统一。 |
| 2026-10-04 | 细分阶段（作为完整术语） | 曲面细分阶段 | 第 5 章把具体管线阶段名称统一；“细分几何/细分网格”等普通动作表述保留。 |
