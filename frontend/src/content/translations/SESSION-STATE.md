# 会话续传状态

新会话从这里恢复。更新时间：2026-10-05（第 9 章全文录入完成；**下一次会话按批次录入第 10–14 章共 5 章**）。工作范围仍是完整译入 EPUB 导读、正文 1–23 章和附录 A–E；当前用户希望复制模型每次用新会话，因此任何下一步都必须能只凭仓库文件恢复。

## 新会话先读

1. `README.md`：规则和会话协议。
2. `TERMINOLOGY.md`：全书固定译名。
3. 本文件：当前队列和精确游标。
4. 做第 1–6 章时读 `REVIEW-CH01-CH06.md`；处理图像时读 `uncertain-images.md`。
5. 用对应 `.epub/OEBPS/chNN.html` 与当前目标 MDX 检验本文件的断点。状态文件是交接索引，不是原书证据。

## 总体状态

- 已存在文件：`intro.mdx`、`ch01.mdx`（需与 `translation-parts/ch01-remainder.mdx` 合读）、`ch02.mdx`、`ch03.mdx`、`ch04.mdx`、`ch05.mdx`、`ch06.mdx`、`ch07.mdx`、`ch08.mdx`、`ch09.mdx`。
- 第 1–5 章已按 EPUB 顺序完成中文说明逐段忠实度复核，习题数核为 19/19/28/0/14；修正第 1 章小结向量分量、第 3 章齐次坐标和 `w_B` 记号、第 4 章命令列表类型名。第 4 章 FPS 通式错误来自原书，译文照录并标注。详见 `REVIEW-CH01-CH06.md` 的 2026-10-05 复核记录。
- 第 6 章已全文录入并完成独立审校（6.1–6.13，含 BoxApp.cpp 全文与习题 1–16）；中文说明逐句对照 EPUB，复核代码标识符、图片和练习。原书笔误按原文照录并加注，详见 `REVIEW-CH01-CH06.md` 的 2026-10-05 补记。
- 第 7 章已全文录入并完成独立审校（7.1–7.9，含 FrameResource/RenderItem、ShapesApp、Land/Waves 代码与习题 1–3）；逐句核对正文、核验代码 token、11 张插图和 5 张公式图。详见 `REVIEW-CH07.md`。
- 第 8 章已全文录入并完成中文说明逐段忠实度复核（8.1–8.16，含 Light/Material 结构说明、光照公式解释、LitWaves 演示说明和习题 1–6）；术语与光照推导逐项对照通过。小结中“逐顶点材质”与 §8.9 按绘制调用变化材质是原书内部矛盾，译文已加注。复核见 `REVIEW-CH08.md`。23 张公式图全部识图转 LaTeX 并经上下文校验，无新增不确定图片；原书笔误照录加注，清单见“当前具体审计边界”第 8 章一节。
- 第 9 章已全文录入（9.1–9.13，含 DDS 加载、SRV 描述符、采样器与静态采样器、Crate 演示与 Textured Land/Waves 的代码与 HLSL 全文、习题 1–6），文件结构闭合（13 个 section 配对、20 个 `<Figure>` 覆盖 images/ 中全部 20 个 Fig9-* 图片、18 个 h3 子小节、36 个页码锚点 page359–page396 与源文顺序一致），构建通过；内容为"已录入待审校"。2 张公式图（eq397-01、eq425-01）识图转 LaTeX 并经代码上下文校验，无新增不确定图片；原书笔误照录加注，清单见"当前具体审计边界"第 9 章一节。
- 目前的下一阶段原则（**2026-10-05 用户最新指示**）：第 9 章录完后，用户认为单次会话上下文足够大，改为**一次会话连续录入 5 章**——下一批为第 10–14 章（按 ch10→ch11→ch12→ch13→ch14 顺序，合计 3850 行源文）。批次规模虽放大，但每章内部仍必须按完整小节/代码块边界推进，禁止跨段拼接、跳节或混用来源；每章新文件写完立即落盘。第 1–5 章和第 8–9 章仍待逐段审校，第 6–7 章已完成本轮审校；全部正文录完后统一进入审校阶段。
- 所有目标正文应以 `.epub/OEBPS/*.html` 为准。TXT 仅定位，不作译文底稿。

## 下一会话的唯一任务

**录入第 10–14 章共 5 章，按 ch10 → ch11 → ch12 → ch13 → ch14 的顺序在一个会话内完成全文。**这是用户 2026-10-05 调整后的批次规模（此前规定每会话一章）；仍然禁止跨段拼接、跳节或换源，每章内必须按完整小节/代码块边界推进。第 9 章已于上一会话录完，按顺序向后推进。本批源文合计 **3850 行**（585+604+678+1348+635）、**56 张编号图**、**66 处公式图引用**、**138 个页码锚点**。

| 章 | 源文件 / 行数 | 小节与源文行号 | 目标文件与锚点 | 图片资源 | 页码锚点 |
|---|---|---|---|---|---|
| 10 | `.epub/OEBPS/ch10.html` / 585 行 | 10.1 THE BLENDING EQUATION（41–58）、10.2 BLEND OPERATIONS（59–99）、10.3 BLEND FACTORS（100–142）、10.4 BLEND STATE（143–222）、10.5 EXAMPLES（223–274，含 10.5.1 No Color Write 226–233、10.5.2 Adding/Subtracting 234–244、10.5.3 Multiplying 245–253、10.5.4 Transparency 254–266、10.5.5 Blending and the Depth Buffer 267–274）、10.6 ALPHA CHANNELS（275–289）、10.7 CLIPPING PIXELS（290–350）、10.8 FOG（351–559）、10.9 SUMMARY（560–571）、10.10 EXERCISES（572–585） | 新建 `ch10.mdx`；锚点 `s101`–`s1010`。`catalog.ts` 已列 s101、s103、s104、s105、s106、s107、s108、s109（`s109` = 本章小结 → 源 10.9 SUMMARY）；**目录未列 s102（10.2 混合运算）、s1010（10.10 习题），自拟** | 编号图 Fig10-1–Fig10-10（10 张）；公式图 15 张：eq432-01、eq433-01、eq433-02、eq435-01、eq438-01、eq439-01、eq439-02、eq440-01、eq440-02、eq441-01、eq445-01、eq445-02、eq446-01、eq450-01、eq451-02 | 21 处（page397–page418） |
| 11 | `.epub/OEBPS/ch11.html` / 604 行 | 11.1 DEPTH/STENCIL FORMATS AND CLEARING（35–60）、11.2 THE STENCIL TEST（61–91）、11.3 DESCRIBING THE DEPTH/STENCIL STATE（92–171，含 11.3.1 Depth Settings 110–113、11.3.2 Stencil Settings 114–167、11.3.3 Creating and Binding a Depth/Stencil State 168–171）、11.4 IMPLEMENTING PLANAR MIRRORS（172–357，含 11.4.1 Mirror Overview 177–229、11.4.2 Defining the Mirror Depth/Stencil States 230–297、11.4.3 Drawing the Scene 298–349、11.4.4 Winding Order and Reflections 350–357）、11.5 IMPLEMENTING PLANAR SHADOWS（358–488，含 11.5.1 Parallel Light Shadows 377–398、11.5.2 Point Light Shadows 399–416、11.5.3 General Shadow Matrix 417–429、11.5.4 Using the Stencil Buffer to Prevent Double Blending 430–438、11.5.5 Shadow Code 439–488）、11.6 SUMMARY（489–499）、11.7 EXERCISES（500–604） | 新建 `ch11.mdx`；锚点 `s111`–`s117`。`catalog.ts` 已列 s111、s112、s113、s114、s115、s116（`s116` = 本章小结 → 源 11.6 SUMMARY）；**目录未列 s117（11.7 习题），自拟**；11.3.1–11.3.3、11.4.1–11.4.4、11.5.1–11.5.5 为 `<h3>` 子小节 | 编号图 Fig11-1–Fig11-13（13 张）；公式图 13 处引用（eq462-01、eq467-01/02、eq468-01/02/03/04、eq469-01/02/03、eq470-01、eq473-01；**注意 eq468-02 在源文中出现两次，前后文意不同，必须分别按各自上下文转写**） | 25 处（page419–page443） |
| 12 | `.epub/OEBPS/ch12.html` / 678 行 | 12.1 PROGRAMMING GEOMETRY SHADERS（34–247）、12.2 TREE BILLBOARDS DEMO（248–556，含 12.2.1 Overview 250–287、12.2.2 Vertex Structure 288–307、12.2.3 The HLSL File 308–518、12.2.4 SV_PrimitiveID 519–556）、12.3 TEXTURE ARRAYS（557–615，含 12.3.1 Overview 559–570、12.3.2 Sampling a Texture Array 571–595、12.3.3 Loading Texture Arrays 596–600、12.3.4 Texture Subresources 601–615）、12.4 ALPHA-TO-COVERAGE（616–624）、12.5 SUMMARY（625–637）、12.6 EXERCISES（638–678） | 新建 `ch12.mdx`；锚点 `s121`–`s126`。`catalog.ts` 已列 s121、s122、s123、s124、s125（`s125` = 本章小结 → 源 12.5 SUMMARY）；**目录未列 s126（12.6 习题），自拟** | 编号图 Fig12-1–Fig12-10（10 张）；公式图 2 张：eq486-01、eq500-01 | 24 处（page445–page468） |
| 13 | `.epub/OEBPS/ch13.html` / 1348 行（本批最长） | 13.1 THREADS AND THREAD GROUPS（41–66）、13.2 A SIMPLE COMPUTE SHADER（67–112，含 13.2.1 Compute PSO 98–112）、13.3 DATA INPUT AND OUTPUT RESOURCES（113–548，含 13.3.1 Texture Inputs 116–123、13.3.2 Texture Outputs and UAVs 124–221、13.3.3 Indexing and Sampling Textures 222–323、13.3.4 Structured Buffer Resources 324–414、13.3.5 Copying CS Results to System Memory 415–548）、13.4 THREAD IDENTIFICATION SYSTEM VALUES（549–587）、13.5 APPEND AND CONSUME BUFFERS（588–631）、13.6 SHARED MEMORY AND SYNCHRONIZATION（632–686）、13.7 BLUR DEMO（687–1149，含 13.7.1 Blurring Theory 692–723、13.7.2 Render-to-Texture 724–775、13.7.3 Blur Implementation Overview 776–976、13.7.4 Compute Shader Program 977–1149）、13.8 FURTHER RESOURCES（1150–1162）、13.9 SUMMARY（1163–1182）、13.10 EXERCISES（1183–1348） | 新建 `ch13.mdx`；锚点 `s131`–`s1310`。`catalog.ts` 已列 s131、s132、s133、s134、s135、s136、s137（13.7 Blur 演示）、s139（`s139` = 本章小结 → 源 13.9 SUMMARY）；**目录未列 s138（13.8 更多资源）与 s1310（13.10 习题），自拟** | 编号图 Fig13-1–Fig13-15（15 张）；公式图 14 张：eq512-01、eq524-01/02/03、eq525-01/02/03/04、eq526-01/02、eq532-01/02/03、eq533-01 | 44 处（page469–page512） |
| 14 | `.epub/OEBPS/ch14.html` / 635 行 | 14.1 TESSELLATION PRIMITIVE TYPES（38–64，含 14.1.1 Tessellation and the Vertex Shader 63–64）、14.2 THE HULL SHADER（65–176，含 14.2.1 Constant Hull Shader 70–128、14.2.2 Control Point Hull Shader 129–176）、14.3 THE TESSELLATION STAGE（177–187，含 14.3.1 Quad Patch Tessellation Examples 180–182、14.3.2 Triangle Patch Tessellation Examples 183–187）、14.4 THE DOMAIN SHADER（188–231）、14.5 TESSELLATING A QUAD（232–412）、14.6 CUBIC BÉZIER QUAD PATCHES（413–610，含 14.6.1 Bézier Curves 416–472、14.6.2 Cubic Bézier Surfaces 473–486、14.6.3 Cubic Bézier Surface Evaluation Code 487–505、14.6.4 Defining the Patch Geometry 506–610）、14.7 SUMMARY（611–619）、14.8 EXERCISES（620–635） | 新建 `ch14.mdx`；锚点 `s141`–`s148`。`catalog.ts` 已列 s141–s147（`s147` = 本章小结 → 源 14.7 SUMMARY）；**目录未列 s148（14.8 习题），自拟**；注意源文 §14.6 标题中的 Bézier 为实体转义 `&#x00C9;`/`&#x00E9;`，译文写作"三次贝塞尔" | 编号图 Fig14-1–Fig14-8（8 张）；公式图 22 处引用（eq561-01/02/03/04、eq562-01/03/04/05、eq563-01/02/03/04/05、eq564-01/02/03、eq565-01/02、eq566-01、eq570-01/02；**注意 eq562-05 在源文中出现两次**，两组贝塞尔递推式要分别按各自上下文转写） | 24 处（page513–page536） |

- 通用规则：**不要修改 `catalog.ts`**（目录锚点与互动讲解版 `frontend/src/content/chapters/ch1N.mdx` 一致）。每章顶部加进度条（照 `ch09.mdx`）。第一级小节用 `<section className="lesson-section ...">`，`sNN1` 带 `lesson-section--intro`；`<h3>` 子小节沿用第 8–9 章的做法（`s1011`、`s1131` 之类）。公式图先识图再转 `$...$`/`$$...$$`，并用公式前后变量定义、推导步骤或紧邻代码核验；不能确认的原位保留 `<Figure>` 并登记 `uncertain-images.md`。
- 装饰性小图标 `note.jpg`、`hint.jpg`、`plusbox.jpg`、`uleftarw.jpg`（第 11 章多处）按既有惯例**只译文字**，`Ltilde.jpg`（第 11 章 General Shadow Matrix）属内联符号，按上下文处理；这些都不计入编号图清单。
- 代码按原文逐字抄录，保留宏、签名、枚举、注释与紧邻说明；原书笔误照录并加"译者注"，每章登记到审计边界。`Figure` 的 `caption`/`alt` 是纯文本属性，不得内嵌 `$...$`、反引号、`*强调*` 或 `<a id="..."/>`；页面锚点 `<a id="pageNNN"/>` 一律放在 `<Figure ... />` 之外。第 11–14 章有大量 HLSL/HLSL-Include 代码，注意 `hlsl`/`cpp` 语言标记。
- **批次规模放大后的续传要求**：若上下文确实不够，必须在某个完整小节或代码块边界停下，并把本文件改写成精确到"源文件 + 小节 + 源行号 + 页码 + 开头短语"的续传指针；未完成的文件进度条保持"录入中"。每新建一个 `.mdx` 后立即写盘，不要攒到最后一次性保存。
- 全部完成后一次性运行 `npm run check:figures`、`npm run check:translation-terms`、`npm run check:translations`；构建验证按"最近验证结果"的说明（临时配置 `emptyOutDir: false` 跑 vite build 可行，验证后必须删除临时配置与日志）。

## 章节进度矩阵

状态含义：**待核** = 尚无独立源文逐段核对；**部分核验** = 只完成所列项目，其他内容不能推定通过；**录入中** = 文件截断或仍缺内容；**未开始** = 无目标译文。

| 范围 | 录入状态 | 独立核验状态 | 已确认事项 | 下一步 |
|---|---|---|---|---|
| 导读 | 有译稿 | 待核 | 结构和图片未在本轮审计 | EPUB 顺序逐段审校 |
| 第1章 | 有译稿，分两个 MDX 文件 | 部分核验 | 目录及编号插图对应；第 1 章和 remainder 必须合读 | （顺延，先录入第 7 章）从 1.1 开始逐段核正文、公式、代码、提示和习题；不沿用旧 README 的过时缺代码说法 |
| 第2章 | 有译稿 | 部分核验 | 目录对应；保留两张编号插图；其余公式映射未逐图重证 | 从 2.1 开始逐式及逐段核对 |
| 第3章 | 有译稿 | 部分核验 | 若干公式图已直接读取；习题图数据记录已更正；式 3.4 箭头已补 | 核余下图片、代码和正文；按节完成顺序审校 |
| 第4章 | 有译稿 | 部分核验 | 深度缓冲表译文已补；两张公式图已核；发现原书 FPS 通式错误 | 逐段核查 Direct3D 说明及代码；错误如需注释，单独标译者注 |
| 第5章 | 有译稿 | 部分核验 | 五组台账公式图已核；删掉重复推导；修好 MDX 图注和闭合标签 | 核其余公式、代码、全部习题和正文 |
| 第6章 | 有译稿（6.1–6.13 全部录入） | **逐句审校完成** | 正文说明逐句对照；16 道习题、8 张编号图、2 张表图、资源引用和代码标识符已核验；发现项见 `REVIEW-CH01-CH06.md` | 完成 |
| 第7章 | 有译稿（7.1–7.9 全部录入） | **逐句审校完成** | 正文、小结与 3 道习题逐段对照；11 张图、5 张公式、资源引用和代码 token 已核验；见 `REVIEW-CH07.md` | 完成 |
| 第8章 | 有译稿（8.1–8.16 全部录入） | 待审（仅结构与图注检查通过） | 全章依据 ch08.html 逐段录入；34 个 `<Figure>` 覆盖 images/ 中 33 个 Fig8-* 图片与 tbl363；23 张公式图（eq353-01、eq354-01、eq356-01、eq358-01/02、eq362-01、eq365-01、eq366-01、eq367-01/02、eq368-01、eq374-01–04、eq375-01、eq376-01、eq387-01–04、eq388-01、eq392-01）已识图转 LaTeX 并经上下文校验；tbl355 推导表、tbl363 材质表已读图译成中文表格并保留原图 | 审校顺延；正文第 10–14 章录入完后按第 1–8 章顺序审校 |
| 第9章 | 有译稿（9.1–9.13 全部录入） | 待审（仅结构与图注检查通过） | 全章依据 ch09.html 逐段录入；20 个 `<Figure>` 覆盖 images/ 中全部 20 个 Fig9-* 图片（Fig9-5 拆 a/b）；2 张公式图（eq397-01 纹理坐标、eq425-01 网格纹理坐标生成）已识图转 LaTeX 并经 §9.2/§9.11.1 代码上下文校验；36 个页码锚点 page359–page396 与源文顺序一致 | 审校顺延；正文第 10–14 章录入完后按第 1–9 章顺序审校 |
| 第10–14章 | 未开始（**下一批，一次会话连录 5 章**） | 未开始（5 章源结构已全部盘点：10.1–10.10 / 11.1–11.7 / 12.1–12.6 / 13.1–13.10 / 14.1–14.8；合计 3850 行源文、56 张编号图、66 处公式图引用、138 个页码锚点；各章行号、锚点、Catalog 已列/未列清单见"下一会话的唯一任务"表格） | 无 | 按 ch10→ch11→ch12→ch13→ch14 顺序录入；每章文首加进度条，写完一个文件立即落盘 |
| 第15–23章 | 未开始 | 未开始（未盘点，届时按同一流程先做节/locator/图片清单再录） | 无 | 第 14 章完成后按第 15–19 章、第 20–23 章继续分批 |
| 附录 A–E | 未开始 | 未开始 | 无 | 正文第 23 章完成后按 A→E 顺序录入 |

## 当前具体审计边界

- 第 1、2 章：本轮只确认标题/子标题结构与编号插图，不声称段落、代码或公式已全面校验。
- 第 3 章：核验过台账列出的若干原图和对应公式；整章正文、其余公式、代码及习题尚未逐段完成。
- 第 4 章：核验深度表、`eq170-01.jpg`、`eq190-01.jpg`；整章代码和正文尚未逐段完成。原书 §4.5.4 有 `n/t=n` 的错误，译文目前忠实保留。
- 第 5 章：核验 `eq221-02.jpg`、`eq221-03.jpg`、`eq222-02.jpg`、`eq233-01.jpg`、`eq234-02.jpg`；删去重复推导并修复 MDX；整章剩余公式/文本/代码/15 道习题尚未逐项完成。
- 第 6 章：全章 6.1–6.13 已按 ch06.html 逐句核对中文说明；图 6.1–6.8、tbl272、tbl273 已处理，note.jpg 提示框按全书惯例只译文字。习题 1–16 均已对照；修正 `BufferLocation` 误称及习题 13 漏"后"字；习题 11 的 D3D11 标识符及 `OffsetInBytes` 原书错误均保留原文并加译者注。核验记录见 `REVIEW-CH01-CH06.md`。
- 第 8 章：全章 8.1–8.16 已按 ch08.html 逐段录入（源 1055 行）；34 个 `<Figure>` 与 `images/` 中 Fig8-1–Fig8-30（Fig8-7 拆 a/b/c、Fig8-16 拆 a/b）及 tbl363 一一对应，无遗漏无多余。23 张公式图转 LaTeX：eq353-01 → $\mathbf{n}=\frac{\mathbf{u}\times\mathbf{v}}{\lVert\mathbf{u}\times\mathbf{v}\rVert}$（与 `XMVector3Cross`+`XMVector3Normalize` 一致）、eq354-01 → 顶点法线平均式、eq356-01 → 缩放+平移矩阵 A 与其 $(\mathbf{A}^{-1})^T$（第四列 $[-1,-2,-2,1]$，与正文"转置后平移泄漏"论述一致）、eq358-01/02 → 朗伯余弦推导、eq362-01 → Schlick 近似、eq365-01 → $S(\theta_h)=\frac{m+8}{8}(\mathbf{n}\cdot\mathbf{h})^m$（与 `BlinnPhong` 的 `(m+8)/8*pow(...)` 一致）、eq367-01/02 → 式 8.3/8.4、eq374-01/375-01 → $\mathbf{L}=(\mathbf{Q}-\mathbf{P})/\lVert\mathbf{Q}-\mathbf{P}\rVert$（与 `ComputePointLight` 中 `L.Position - pos` 再归一化一致）、eq374-02 → 平方反比、eq374-03 → 线性衰减（原图漏写参数 $d$ 与等号，已加译者注）、eq374-04 → `saturate` 分段、eq376-01 → $k_{spot}=\max(-\mathbf{L}\cdot\mathbf{d},0)^s$（与 `pow(max(dot(-lightVec, L.Direction),0), L.SpotPower)` 一致）、eq387-01/02/03/04 与 eq388-01 → 地形法线的偏导与叉积推导（与 `GetHillsNormal` 的 `-0.03f*z*cosf(0.1f*x) - 0.3f*cosf(0.1f*z)` 一致）、eq392-01 → 卡通着色分段函数。tbl355 的推导表、tbl363 的 $\mathbf{R}_F(0°)$ 表已读图译成中文表格并保留原图。全章"已录入待审校"，未做独立逐段复核。已照录的原书笔误/存疑点：① §8.2.1 伪代码末行 `Normalize(&mVertices[i].normal))` 多一个右括号；② tbl355 推导表第 5 行"转置性质"与步骤的对应不严密（译文照录并加译者注）；③ §8.7.2 "Figure 8.19 shows $\rho(\theta_h) = \cos_h(\theta_h)$" 上标误作下标（应为 $\cos^m$，译文取 $\cos^m$ 并加注）；④ §8.8 列表第 11 项 "$(\mathbf{n}\cdot\mathbf{h})_h$" 上标误作下标（应为 $^m$，译文取 $^m$ 并加注）；⑤ §8.13.2 `BlinnPhong` 漏掉 `float3 specAlbedo = roughnessFactor * fresnelFactor;` 一行却直接使用 `specAlbedo`（照录并加注）；⑥ §8.11.1 衰减公式图 `att( ) saturate(...)` 漏写 $d$ 与等号（译文补足并加注）；⑦ §8.13.6 `cbPass` 前注释写作 "Constant data that varies per material."（应为 per frame，照录并加注）；⑧ §8.13.7 `VS` 中 `VertexOut vout = (VertexOut)0.0f;` 前有 3 个多余空格（照录）；⑨ §8.7.2 原书 "The shape of the of the specular reflection" 重复 "of the"（译文按通顺译出）。审校时不得把这些当作录入错误改掉。
- 第 7 章：全章 7.1–7.9 已逐句对照 ch07.html；5 张公式图的 LaTeX 与周围代码/上下文一致，Fig7-1–Fig7-11 均原位放置且资源存在，习题 1–3 齐全。代码标识符、数值和字符串 token 对照无源文缺项；不声称空白与标点逐字符相同。原书笔误清单及本轮修正见 `REVIEW-CH07.md`。
- 第 9 章：全章 9.1–9.13 已按 ch09.html 逐段录入（源 1049 行）；13 个 `<section>` 配对，20 个 `<Figure>` 与 `images/` 中 Fig9-1–Fig9-19（Fig9-5 拆 a/b）一一对应，无遗漏无多余；36 个页码锚点 page359–page396 与源文数量、顺序一致（源文缺 page383、page388，译文同样不设）。2 张公式图转 LaTeX：eq397-01 → $(x,y,z)=\mathbf{p}=\mathbf{p}_0+s(\mathbf{p}_1-\mathbf{p}_0)+t(\mathbf{p}_2-\mathbf{p}_0)$、$s\ge0,t\ge0,s+t\le1$ 时 $(u,v)=\mathbf{q}=\mathbf{q}_0+s(\mathbf{q}_1-\mathbf{q}_0)+t(\mathbf{q}_2-\mathbf{q}_0)$（与正文"用同样的 s、t 参数插值"一致）；eq425-01 → $u_{ij}=j\cdot\Delta u$、$v_{ij}=i\cdot\Delta v$，其中 $\Delta u=\frac{1}{n-1}$、$\Delta v=\frac{1}{m-1}$（与 `CreateGrid` 的 `j*du`、`i*dv`、`du=1.0f/(n-1)`、`dv=1.0f/(m-1)` 一致）。全章"已录入待审校"，未做独立逐段复核。已照录的原书笔误/存疑点：① §9.2 `struct Vertex` 代码块在源 HTML 中结尾 `};` 后带噪声串 `>>>>>>>>>>>>>>>>>>>>`（判断为转换噪声，未录入并加译者注）；② §9.3.2 原文 "outpts"（应为 outputs），且正文 *bricks.bmp*/*bricks.dds* 与示例命令 `treeArray.dds` 不一致（照录加注）；③ §9.4.1 正文 *WoodCreate01.dds* 与代码 `L"Textures/WoodCrate01.dds"` 不一致（照录加注）；④ §9.4.4 "so that to does not modify"（"to" 应为 "it"，照录加注）；⑤ §9.4.3 第 1 条 Format 末尾源文多出孤立残片 "typeless format when creating"（照录加注）；⑥ §9.5.1 提示框 "also called called linear filtering" 重复 "called"，且源 HTML 的 `</i>` 标签错位（译文按通顺处理）；⑦ §9.7.2 "you can only define 2032 number of static samplers" 表述不规范（照译加注）；⑧ §9.8 "texture registers use specified by tn"（应为 "registers are"，照译加注）；⑨ §9.8 "texture registers use specified by sn"（应为 "sampler registers are specified by sn"，照译加注）；⑩ §9.10 `vin.Tex` 与 `vin.TexC` 不一致（照录加注）；⑪ §9.9.3 代码第二行 `mSrvDescriptorHeap->...` 无缩进，按源文照录。审校时不得把这些当作录入错误改掉。

本轮还建立了统一术语表，并把已发现的"坐标系转换矩阵/坐标系变更矩阵"混用统一为"坐标系转换矩阵"；第 5 章图注中的"坐标系统"统一为"坐标系"，管线阶段用"曲面细分阶段"。后续如需改术语，按术语表的变更记录规则回查，不静默扩改。

## 最近验证结果

- **构建/预览以 VS Code 的 launch.json 流程为准**：`launch.json` 的 preLaunchTask `vite:build-preview` 运行 `npm run preview:build`，用户已确认本项目构建跑通。后续会话验证构建/测试优先请用户用该流程执行。
- 复制模型的命令行环境会向 node 进程注入安全删除护栏与 require 钩子，产生两类**环境假象**（不是译文问题）：直接 `npm run build` 被 `SAFE_DELETE_BULK_CONFIRM_REQUIRED` 拦截（vite 清空 `frontend/dist/images` 的 930 个文件超过护栏阈值）；`npm test` 的 3 个套件在 `describe()` 处报 `Cannot read properties of undefined (reading 'config')`，0 个用例被收集。清空 `NODE_OPTIONS` 后测试仍然报错，故此环境中不以下列命令的结果为准。
- 在复制模型环境中用临时配置（关闭 `emptyOutDir`）执行 vite build 本会话再次通过：169 个模块全部转换，含第 9 章全文的 `ch09.mdx` 编译正常（上轮 168 模块 + 本轮新增 1 个），产出 `ch09-*.js` 两个 chunk（互动讲解版 `ch09-CpuYIzsO.js` 与译文版 `ch09-hEAg3u5H.js`）；仅剩既有的 chunk 体积警告；验证后临时配置 `frontend/vite.config.verify.ts` 与日志 `build-verify.log` 均已删除。本会话首次构建在 ch09.mdx 第 408 行失败：`<h3 id="s951">9.5.1 放大</h2>` 用 `</h2>` 关闭了 `<h3>`，导致 MDX 解析错误；已改为 `</h3>`。
- 本会话（第 8 章）首次构建曾在 ch08.mdx 第 224 行失败：`<Figure>` 的 `caption` 属性里内嵌了 `<a id="page325"/>`，其双引号截断了属性导致 MDX 解析错误。修复方式是把该页面锚点移到 `<Figure ... />` 之外。**后续章节的 `caption`/`alt` 一律不得内嵌 `"`、`$`、反引号或 `*强调*`**（`Figure` 组件的 caption 按纯文本渲染，写 LaTeX 会原样显示）。
- `npm.cmd run check:translation-terms`：通过，扫描 12 个 MDX 文件中的已登记易混译名；它不能替代人工按完整术语表核对。
- `npm.cmd run check:figures`：312 张图注资源全部放置，缺少 0 张（该检查清单未含第 7–9 章编号图；已另行核实 ch09.mdx 内 20 个 `<Figure>` 与 `images/` 中 20 个 Fig9-*（Fig9-5 拆 a/b）一一对应且文件存在）。
- `npm.cmd run check:translations`：11 个译文 MDX，图片引用 178 张（158 + 第 9 章 20 张）；全书目标 25 个文件，缺 15 个（附录和第 10–23 章）。
- ch09.mdx 自检：13 个 `<section>` 与 13 个 `</section>` 配对闭合；18 个 `<h3>` 子小节；页码锚点 page359–page396 共 36 处（与源 ch09.html 的 `page` 锚点数量、顺序一致，源文缺 page383/page388）；`[[IMG` 残留 0 处；20 个图片引用文件全部存在；linter 无错误。

## 每次会话完成时覆盖本区块

新会话结束时把顶部日期、下一会话唯一任务、章节矩阵、审计边界和验证结果改成最新事实；并在下方日志追加一行，不删除旧记录。最终回复简报已保存内容、精确续传位置、未决项和命令结果。确认文件已保存后再结束会话。

## 已结束会话日志

| 日期 | 工作范围 | 已保存结果 | 下一会话游标 |
|---|---|---|---|
| 2026-10-04 | 第 1–6 章结构审查及第 3–5 章指定公式图复核；建立新会话续传方案 | 修正第 3 章箭头及术语；补译第 4 章深度表；核验并更新第 3–5 章图片台账；移除第 5 章重复推导并修复 MDX；创建术语表和本续传状态 | 续录 `ch06.mdx` §6.1，接在 `AlignedByteOffset` 示例段后，从 `InputSlotClass` 列表项开始 |
| 2026-10-04 | 续录第 6 章 §6.1 至小节完成 | 补录第 5 项内嵌 Vertex2 偏移代码块、第 6/7 项（`InputSlotClass`/`InstanceDataStepRate`）与 `desc1`/`desc2` 示例；闭合 s61；进度条更新为"6.1 完整"；原书 desc2 缺逗号按原文照录并加译者注；确认 §6.1 仅含图 6.1、无公式图；确认构建/测试失败为复制模型环境假象，用户侧 launch.json 流程跑通 | 录入 `ch06.mdx` §6.2 顶点缓冲：`ch06.html` 第 110–303 行（印刷页 207–213），首段 "In order for the GPU to access an array of vertices…" |
| 2026-10-04 | 按用户指示一次完成第 6 章全文（6.2–6.13） | 录入 §6.2–§6.13 全部小节、BoxApp.cpp 全文与习题 1–16；放置图 6.2–6.8，tbl272/tbl273 已读图译成中文表格并保留原图；照录原书笔误并按需加译者注；修复图 6.7 caption 引号引发的 MDX 解析错误；构建通过、图注 312/312、术语检查通过 | 录入 `ch07.mdx`：`ch07.html` §7.1 FRAME RESOURCES（第 29 行起），尽量一次完成全章 7.1–7.9 |
| 2026-10-04 | 按用户指示调整下一会话计划 | 续传指针从"第 1–6 章审校（自 §1.1 起）"改为"录入第 7 章"；第 7 章源结构（7.1–7.9）与 Fig7-1–Fig7-11 资源盘点结果写入任务；第 1–6 章审校标记为顺延 | 录入 `ch07.mdx`：`ch07.html` §7.1 FRAME RESOURCES（第 29 行起），尽量一次完成全章 7.1–7.9 |
| 2026-10-04 | 按用户指示一次完成第 7 章全文（7.1–7.9） | 新建 `ch07.mdx`（约 1508 行），录入全部小节、ShapesApp/Land/Waves 代码与习题 1–3；放置图 7.1–7.11；5 张公式图识图转 LaTeX 并经代码上下文核验；9 处原书笔误照录加注；术语沿用"清空命令队列"等既有译法，pass 相关沿用目录"Pass 常量"；check:figures/check:translation-terms/check:translations 通过，临时配置 vite build 167 模块通过 | 录入 `ch08.mdx`：`ch08.html` §8.1 LIGHT AND MATERIAL INTERACTION（第 40 行起），尽量一次完成全章 8.1–8.16 |
| 2026-10-05 | 按用户指示一次完成第 8 章全文（8.1–8.16） | 新建 `ch08.mdx`（约 1230 行），16 个小节全部录入；34 个 `<Figure>` 覆盖 Fig8-1–Fig8-30（Fig8-7 拆 a/b/c、Fig8-16 拆 a/b）与 tbl363；23 张公式图识图转 LaTeX 并经代码/上下文核验；tbl355 推导表与 tbl363 材质表读图译成中文表格并保留原图；9 处原书笔误照录加注；修复 caption 内嵌 `<a id>` 导致的 MDX 解析错误；check:translations（158 图）、check:translation-terms（11 文件）通过，临时配置 vite build 168 模块通过 | 录入 `ch09.mdx`：`ch09.html` §9.1 TEXTURE AND RESOURCE RECAP（第 32 行起），尽量一次完成全章 9.1–9.13 |

| 2026-10-05 | 对第 6、7 章完成独立忠实度审校；复测第 8 章修复后的生产编译 | 更新第 6 章两处译文并补原书笔误注；逐句审校第 7 章并记录于 `REVIEW-CH07.md`；53 项测试通过、图注 312/312、术语检查通过；不清空 dist 的生产编译 168 模块成功，仅有既有大 chunk 警告 | 录入 `ch09.mdx`：`ch09.html` §9.1 TEXTURE AND RESOURCE RECAP（第 32 行起），尽量一次完成全章 9.1–9.13 |
| 2026-10-05 | 按用户指示一次完成第 9 章全文（9.1–9.13） | 新建 `ch09.mdx`（约 1160 行），13 个小节全部录入；20 个 `<Figure>` 覆盖 Fig9-1–Fig9-19（Fig9-5 拆 a/b）；2 张公式图（eq397-01、eq425-01）识图转 LaTeX 并经 §9.2/§9.11.1 代码上下文核验；36 个页码锚点与源文顺序一致；11 处原书笔误/存疑点照录加注并写入审计边界；修复 `<h3>` 误用 `</h2>` 关闭的 MDX 解析错误；check:figures（312/312）、check:translation-terms（12 文件）、check:translations（178 图）通过，临时配置 vite build 169 模块通过 | 录入 `ch10.mdx`：`ch10.html` §10.1 THE BLENDING EQUATION（第 41 行起），尽量一次完成全章 10.1–10.10 |
| 2026-10-05 | 用户调整批次规模（每会话 1 章 → 每会话 5 章），据此改写本续传状态的下一任务 | 盘点 ch10–ch14 全部源结构：行数（585/604/678/1348/635，合计 3850）、每章小节与源文行号、`<h3>` 子小节、Catalog 已列与未列锚点（未列项：s102、s1010、s117、s126、s138、s1310、s148）、56 张编号图与 66 处公式图引用清单、138 个页码锚点范围；把"下一会话的唯一任务"改成 5 章对照表并补充通用规则、装饰性图标处理、续传 fallback 要求；进度矩阵拆分为"第10–14章（下一批）"与"第15–23章" | 一次会话连续录入第 10–14 章：`ch10.mdx`→`ch11.mdx`→`ch12.mdx`→`ch13.mdx`→`ch14.mdx`，各章从 `ch1N.html` §10.1 / §11.1 / §12.1 / §13.1 / §14.1 起 |

| 2026-10-05 | 对第 1–5 章和第 8 章完成中文说明逐段忠实度审校，并落实以后并行做术语与原文核验的流程 | 修正 ch01 小结分量、ch03 齐次坐标与 w_B、ch04 D3D12 类型名；记录 ch04 原书 FPS 公式错误及 ch08 原书内部不一致；新增 REVIEW-CH08.md，并更新 REVIEW-CH01-CH06.md 与 README.md；check:translation-terms 通过，check:translations 发现缺少附录及 ch10–23（正等待录入） | 继续录入第 10–14 章；之后每章分别记录术语一致性和 EPUB 逐段忠实度状态 |
