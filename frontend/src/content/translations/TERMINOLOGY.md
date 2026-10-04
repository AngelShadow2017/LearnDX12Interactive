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
| light source | 光源 | 泛指；具体类型见下面平行光/点光源/聚光灯。 |
| local illumination model | 局部光照模型 | §8.1；不译“本地光照”。与 global illumination model（全局光照模型）对照。 |
| face normal | 面法线 | §8.2；多边形朝向，与 surface normal 区分。 |
| surface normal | 表面法线 | §8.2；与 vertex normal（顶点法线）区分。 |
| vertex normal averaging | 顶点法线平均 | §8.2.1；不译“法线插值”，插值是另一件事。 |
| inverse-transpose | 逆转置 | §8.2.2 法线变换；公式写作 $(\mathbf{A}^{-1})^T$。 |
| light vector | 光向量 | §8.3；指从表面点指向光源的单位向量（代码 `lightVec`），与光线行进方向 $\mathbf{I}$ 相反。不要简写成“光方向”。 |
| view vector / to-eye vector | 视线向量 / 指向眼睛的向量 | §8.3；首次括注 to-eye vector，后文可用“指向眼睛的向量”，代码 `toEye`。 |
| reflection vector | 反射向量 | §8.3；$\mathbf{r}=\mathbf{I}-2(\mathbf{n}\cdot\mathbf{I})\mathbf{n}$，代码中用 HLSL `reflect`。 |
| radiant flux | 辐射通量 | §8.4；每秒发出的光能。 |
| irradiance | 辐照度 | §8.4；首次括注 irradiance，后文用“辐照度”。 |
| Lambert's cosine law | 朗伯余弦定律 | §8.4；译名固定，不要写作“朗伯定律”。 |
| diffuse reflection | 漫反射 | §8.5；与 specular reflection（镜面反射）对照。 |
| diffuse light | 漫反射光 | §8.5。 |
| diffuse albedo | 漫反射反照率 | §8.5；代码 `DiffuseAlbedo`。 |
| ambient light | 环境光 | §8.6；间接光的近似项。 |
| specular reflection / specular light | 镜面反射 / 镜面光 | §8.7。 |
| specular lobe | 镜面波瓣 | §8.7.2；roughness 使反射散开的形状。 |
| specular highlight | 镜面高光 | §8.7.2、图 8.21；不译“高光点”。 |
| Fresnel effect | Fresnel 效应 | §8.7.1；保留人名英文，不译“菲涅尔”以外的写法。 |
| Schlick approximation | Schlick 近似 | §8.7.1；Fresnel 方程的近似。 |
| index of refraction | 折射率 | §8.7.1；代码注释中的 `n`。 |
| refraction / refract | 折射 | §8.7.1；与 reflection（反射）对照。 |
| roughness | 粗糙度 | §8.7.2、§8.9；[0, 1] 归一化，代码 `Roughness`。 |
| shininess | 光泽度 | §8.9；`shininess = 1 - roughness`，代码 `Shininess`；不要与 roughness 混用。 |
| microfacet | 微面元 | §8.7.2；microfacet model 译“微面模型”，微面法线/宏观法线按原文区分。 |
| halfway vector | 半程向量 | §8.7.2；$\mathbf{h}=\text{normalize}(\mathbf{L}+\mathbf{v})$，代码 `halfVec`。 |
| parallel light / directional light | 平行光 / 方向光 | §8.10；同一概念的两个名字，首次并列给出。 |
| point light | 点光源 | §8.11。 |
| spotlight | 聚光灯 | §8.12；不译“射灯”。 |
| attenuation | 衰减 | §8.11.1；`falloffStart`/`falloffEnd` 为代码标识符，保持原样不译。 |
| toon shading | 卡通着色 | §8.16 习题 6；也可称“卡通风格光照”。 |
| pixel lighting / phong lighting | 像素光照 / Phong 光照 | §8.2.1 提示框；per-vertex lighting 译“逐顶点光照”。 |
| texture mapping | 纹理映射 | §9 章首；不译“贴图”（贴图作普通动词/口语时可保留，但概念名用“纹理映射”）。 |
| texture coordinate | 纹理坐标 | §9.2；代码 `TexC`。 |
| texture space | 纹理空间 | §9.2；图 9.2。 |
| texel | 纹素 | §9.2；纹理元素，不译“纹理像素”。 |
| texture atlas | 纹理图集 | §9.2；把多张子纹理合并到一张大纹理。 |
| render-to-texture | 渲染到纹理 | §9.1；保留破折号连接的原词形式。 |
| typeless format | 无类型格式 | §9.1；对应 `DXGI_FORMAT_..._TYPELESS`。 |
| magnification | 放大 | §9.5.1；纹理放大，不译“放大倍数”。 |
| minification | 缩小 | §9.5.2；与 magnification 对照。 |
| point filtering / linear filtering | 点过滤 / 线性过滤 | §9.5.1；对应常值/线性插值，Direct3D 术语。 |
| bilinear interpolation | 双线性插值 | §9.5.1；图 9.6。 |
| trilinear filtering | 三线性过滤 | §9.7.1；`D3D12_FILTER_MIN_MAG_MIP_LINEAR`。 |
| anisotropic filtering | 各向异性过滤 | §9.5.3、§9.7.1。 |
| mipmap / mipmapping | mipmap / mipmapping | §9.5.2；保留英文，mipmap chain 译“mipmap 链”，mipmap level 译“mipmap 层级”。 |
| address mode | 寻址模式 | §9.6；具体模式 wrap/border color/clamp/mirror 保留英文或按叙述括注。 |
| sampler object | 采样器对象 | §9.7；不译“取样器”。 |
| static sampler | 静态采样器 | §9.7.2；`D3D12_STATIC_SAMPLER_DESC`。 |
| sampler heap | 采样器堆 | §9.7.1；`D3D12_DESCRIPTOR_HEAP_TYPE_SAMPLER`。 |
| shader resource view (SRV) | 着色器资源视图（SRV） | §9.4；首次给出全称，后文保留 SRV。 |
| DDS (DirectDraw Surface format) | DDS（DirectDraw Surface 格式） | §9.3；保留 DDS 缩写。 |

## 术语一致性检查

每批结束时检查本批新增术语是否已经在表中，以及是否和先前译文冲突。章节结束时检查本章所有英文首次定义、缩写和译名。全书完成前按术语表搜索旧译法；禁止只做机械全局替换，先判断每处语义。

`npm run check:translation-terms` 会检测已经明确登记的几种易混写法。它只是防回归哨兵，不会扫描并判断整张术语表；每个新会话仍须阅读本表并人工核对本轮术语。

## 译名变更记录

| 日期 | 旧写法 | 当前首选写法 | 原因与处理范围 |
|---|---|---|---|
| 2026-10-04 | 坐标系变更矩阵 | 坐标系转换矩阵 | 第 3 章同一概念出现两种写法，统一为后者；专门术语“坐标系转换变换”保留，以区别变换矩阵。 |
| 2026-10-04 | 坐标系统 | 坐标系 | 第 5 章图 5.17 图注的一般术语与全书首选统一。 |
| 2026-10-04 | 细分阶段（作为完整术语） | 曲面细分阶段 | 第 5 章把具体管线阶段名称统一；“细分几何/细分网格”等普通动作表述保留。 |
