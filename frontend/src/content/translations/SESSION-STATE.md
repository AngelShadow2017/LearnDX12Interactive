# 会话续传状态

新会话从这里恢复。更新时间：2026-10-05（第 10–14 章译文已录入；第 10–14 章审校完成；英文原文现优先使用 OEBPS XHTML 的语义标记和排版；第 1 章 §1.4.2 损坏公式图已依据原书后文公式恢复并加注；第 14 章尚有一处公式图文冲突列入 `uncertain-images.md`）。工作范围仍是完整译入 EPUB 导读、正文 1–23 章和附录 A–E；当前用户希望复制模型每次用新会话，因此任何下一步都必须能只凭仓库文件恢复。

## 新会话先读

1. `README.md`：规则和会话协议。
2. `TERMINOLOGY.md`：全书固定译名。
3. 本文件：当前队列和精确游标。
4. 做第 1–6 章时读 `REVIEW-CH01-CH06.md`；处理图像时读 `uncertain-images.md`。
5. 用对应 `.epub/OEBPS/chNN.html` 与当前目标 MDX 检验本文件的断点。状态文件是交接索引，不是原书证据。

## 总体状态

- 已存在文件：`intro.mdx`、`ch01.mdx`（需与 `translation-parts/ch01-remainder.mdx` 合读）、`ch02.mdx` 至 `ch14.mdx`。
- 第 1–5 章已按 EPUB 顺序完成中文说明逐段忠实度复核，习题数核为 19/19/28/0/14；修正第 1 章小结向量分量、第 3 章齐次坐标和 `w_B` 记号、第 4 章命令列表类型名。第 4 章 FPS 通式错误来自原书，译文照录并标注。详见 `REVIEW-CH01-CH06.md` 的 2026-10-05 复核记录。
- 第 6 章已全文录入并完成独立审校（6.1–6.13，含 BoxApp.cpp 全文与习题 1–16）；中文说明逐句对照 EPUB，复核代码标识符、图片和练习。原书笔误按原文照录并加注，详见 `REVIEW-CH01-CH06.md` 的 2026-10-05 补记。
- 第 7 章已全文录入并完成独立审校（7.1–7.9，含 FrameResource/RenderItem、ShapesApp、Land/Waves 代码与习题 1–3）；逐句核对正文、核验代码 token、11 张插图和 5 张公式图。详见 `REVIEW-CH07.md`。
- 第 8 章已全文录入并完成中文说明逐段忠实度复核（8.1–8.16，含 Light/Material 结构说明、光照公式解释、LitWaves 演示说明和习题 1–6）；术语与光照推导逐项对照通过。小结中“逐顶点材质”与 §8.9 按绘制调用变化材质是原书内部矛盾，译文已加注。复核见 `REVIEW-CH08.md`。23 张公式图全部识图转 LaTeX 并经上下文校验，无新增不确定图片；原书笔误照录加注，清单见“当前具体审计边界”第 8 章一节。
- 第 9 章已全文录入（9.1–9.13，含 DDS 加载、SRV 描述符、采样器与静态采样器、Crate 演示与 Textured Land/Waves 的代码与 HLSL 全文、习题 1–6），文件结构闭合（13 个 section 配对、20 个 `<Figure>` 覆盖 images/ 中全部 20 个 Fig9-* 图片、18 个 h3 子小节、36 个页码锚点 page359–page396 与源文顺序一致），构建通过；内容为"已录入待审校"。2 张公式图（eq397-01、eq425-01）识图转 LaTeX 并经代码上下文校验，无新增不确定图片；原书笔误照录加注，清单见"当前具体审计边界"第 9 章一节。
- 第 10–14 章已录入并完成逐章对照审校；第 10–13 章记录见 `REVIEW-CH10-CH13.md`，第 14 章见 `REVIEW-CH14.md`。第 14 章 14.1–14.8 的正文、代码、公式、插图、图注和习题已核对；修正了 §14.3 标题、重复措辞及一条不正确的原书 API 注记，并统一了显示公式格式。§14.6.1 重复引用的 `eq562-05.jpg` 与伯恩斯坦基函数定义上下文冲突，保留原图并待对照原版版面。第 1–5 章中文说明逐段核对已完成但部分公式/代码仍需独立复核；第 8–9 章仍待逐段审校，第 6–7 章已完成审校。
- 所有目标正文应以 `.epub/OEBPS/*.html` 为准。TXT 仅定位，不作译文底稿。

## 第 10–14 章原文结构索引

第 10–14 章译文已录入。本表保留当时建立的原书章节、资源及锚点索引，供继续审校时定位。2026-10-05 已独立审校第 10–14 章。原书合计 **3850 行**（585+604+678+1348+635）、**56 张编号图**、**66 处公式/代码图片引用**、**138 个页码锚点**。

| 章 | 源文件 / 行数 | 小节与源文行号 | 目标文件与锚点 | 图片资源 | 页码锚点 |
|---|---|---|---|---|---|
| 10 | `.epub/OEBPS/ch10.html` / 585 行 | 10.1 THE BLENDING EQUATION（41–58）、10.2 BLEND OPERATIONS（59–99）、10.3 BLEND FACTORS（100–142）、10.4 BLEND STATE（143–222）、10.5 EXAMPLES（223–274，含 10.5.1 No Color Write 226–233、10.5.2 Adding/Subtracting 234–244、10.5.3 Multiplying 245–253、10.5.4 Transparency 254–266、10.5.5 Blending and the Depth Buffer 267–274）、10.6 ALPHA CHANNELS（275–289）、10.7 CLIPPING PIXELS（290–350）、10.8 FOG（351–559）、10.9 SUMMARY（560–571）、10.10 EXERCISES（572–585） | 已有 `ch10.mdx`；锚点 `s101`–`s1010`。`catalog.ts` 已列 s101、s103、s104、s105、s106、s107、s108、s109（`s109` = 本章小结 → 源 10.9 SUMMARY）；**目录未列 s102（10.2 混合运算）、s1010（10.10 习题），自拟** | 编号图 Fig10-1–Fig10-10（10 张）；公式图 15 张：eq432-01、eq433-01、eq433-02、eq435-01、eq438-01、eq439-01、eq439-02、eq440-01、eq440-02、eq441-01、eq445-01、eq445-02、eq446-01、eq450-01、eq451-02 | 21 处（page397–page418） |
| 11 | `.epub/OEBPS/ch11.html` / 604 行 | 11.1 DEPTH/STENCIL FORMATS AND CLEARING（35–60）、11.2 THE STENCIL TEST（61–91）、11.3 DESCRIBING THE DEPTH/STENCIL STATE（92–171，含 11.3.1 Depth Settings 110–113、11.3.2 Stencil Settings 114–167、11.3.3 Creating and Binding a Depth/Stencil State 168–171）、11.4 IMPLEMENTING PLANAR MIRRORS（172–357，含 11.4.1 Mirror Overview 177–229、11.4.2 Defining the Mirror Depth/Stencil States 230–297、11.4.3 Drawing the Scene 298–349、11.4.4 Winding Order and Reflections 350–357）、11.5 IMPLEMENTING PLANAR SHADOWS（358–488，含 11.5.1 Parallel Light Shadows 377–398、11.5.2 Point Light Shadows 399–416、11.5.3 General Shadow Matrix 417–429、11.5.4 Using the Stencil Buffer to Prevent Double Blending 430–438、11.5.5 Shadow Code 439–488）、11.6 SUMMARY（489–499）、11.7 EXERCISES（500–604） | 已有 `ch11.mdx`；锚点 `s111`–`s117`。`catalog.ts` 已列 s111、s112、s113、s114、s115、s116（`s116` = 本章小结 → 源 11.6 SUMMARY）；**目录未列 s117（11.7 习题），自拟**；11.3.1–11.3.3、11.4.1–11.4.4、11.5.1–11.5.5 为 `<h3>` 子小节 | 编号图 Fig11-1–Fig11-13（13 张）；公式图 13 处引用（eq462-01、eq467-01/02、eq468-01/02/03/04、eq469-01/02/03、eq470-01、eq473-01；**注意 eq468-02 在源文中出现两次，前后文意不同，必须分别按各自上下文转写**） | 25 处（page419–page443） |
| 12 | `.epub/OEBPS/ch12.html` / 678 行 | 12.1 PROGRAMMING GEOMETRY SHADERS（34–247）、12.2 TREE BILLBOARDS DEMO（248–556，含 12.2.1 Overview 250–287、12.2.2 Vertex Structure 288–307、12.2.3 The HLSL File 308–518、12.2.4 SV_PrimitiveID 519–556）、12.3 TEXTURE ARRAYS（557–615，含 12.3.1 Overview 559–570、12.3.2 Sampling a Texture Array 571–595、12.3.3 Loading Texture Arrays 596–600、12.3.4 Texture Subresources 601–615）、12.4 ALPHA-TO-COVERAGE（616–624）、12.5 SUMMARY（625–637）、12.6 EXERCISES（638–678） | 已有 `ch12.mdx`；锚点 `s121`–`s126`。`catalog.ts` 已列 s121、s122、s123、s124、s125（`s125` = 本章小结 → 源 12.5 SUMMARY）；**目录未列 s126（12.6 习题），自拟** | 编号图 Fig12-1–Fig12-10（10 张）；公式图 2 张：eq486-01、eq500-01 | 24 处（page445–page468） |
| 13 | `.epub/OEBPS/ch13.html` / 1348 行（本批最长） | 13.1 THREADS AND THREAD GROUPS（41–66）、13.2 A SIMPLE COMPUTE SHADER（67–112，含 13.2.1 Compute PSO 98–112）、13.3 DATA INPUT AND OUTPUT RESOURCES（113–548，含 13.3.1 Texture Inputs 116–123、13.3.2 Texture Outputs and UAVs 124–221、13.3.3 Indexing and Sampling Textures 222–323、13.3.4 Structured Buffer Resources 324–414、13.3.5 Copying CS Results to System Memory 415–548）、13.4 THREAD IDENTIFICATION SYSTEM VALUES（549–587）、13.5 APPEND AND CONSUME BUFFERS（588–631）、13.6 SHARED MEMORY AND SYNCHRONIZATION（632–686）、13.7 BLUR DEMO（687–1149，含 13.7.1 Blurring Theory 692–723、13.7.2 Render-to-Texture 724–775、13.7.3 Blur Implementation Overview 776–976、13.7.4 Compute Shader Program 977–1149）、13.8 FURTHER RESOURCES（1150–1162）、13.9 SUMMARY（1163–1182）、13.10 EXERCISES（1183–1348） | 已有 `ch13.mdx`；锚点 `s131`–`s1310`。`catalog.ts` 已列 s131、s132、s133、s134、s135、s136、s137（13.7 Blur 演示）、s139（`s139` = 本章小结 → 源 13.9 SUMMARY）；**目录未列 s138（13.8 更多资源）与 s1310（13.10 习题），自拟** | 编号图 Fig13-1–Fig13-15（15 张）；公式图 14 张：eq512-01、eq524-01/02/03、eq525-01/02/03/04、eq526-01/02、eq532-01/02/03、eq533-01 | 44 处（page469–page512） |
| 14 | `.epub/OEBPS/ch14.html` / 635 行 | 14.1 TESSELLATION PRIMITIVE TYPES（38–64，含 14.1.1 Tessellation and the Vertex Shader 63–64）、14.2 THE HULL SHADER（65–176，含 14.2.1 Constant Hull Shader 70–128、14.2.2 Control Point Hull Shader 129–176）、14.3 THE TESSELLATION STAGE（177–187，含 14.3.1 Quad Patch Tessellation Examples 180–182、14.3.2 Triangle Patch Tessellation Examples 183–187）、14.4 THE DOMAIN SHADER（188–231）、14.5 TESSELLATING A QUAD（232–412）、14.6 CUBIC BÉZIER QUAD PATCHES（413–610，含 14.6.1 Bézier Curves 416–472、14.6.2 Cubic Bézier Surfaces 473–486、14.6.3 Cubic Bézier Surface Evaluation Code 487–505、14.6.4 Defining the Patch Geometry 506–610）、14.7 SUMMARY（611–619）、14.8 EXERCISES（620–635） | 已有 `ch14.mdx`；锚点 `s141`–`s148`。`catalog.ts` 已列 s141–s147（`s147` = 本章小结 → 源 14.7 SUMMARY）；**目录未列 s148（14.8 习题），自拟**；注意源文 §14.6 标题中的 Bézier 为实体转义 `&#x00C9;`/`&#x00E9;`，译文写作"三次贝塞尔" | 编号图 Fig14-1–Fig14-8（8 张）；22 处非插图公式/代码图片引用（20 次公式图引用、2 张代码截图；`eq562-05` 重复一次），其中一处冲突保留原图待查 | 24 处（page513–page536） |

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
| 第8章 | 有译稿（8.1–8.16 全部录入） | 待审（仅结构与图注检查通过） | 全章依据 ch08.html 逐段录入；35 个 `<Figure>` 覆盖 images/ 中 33 个 Fig8-* 图片与 tbl355、tbl363；23 张公式图（eq353-01、eq354-01、eq356-01、eq358-01/02、eq362-01、eq365-01、eq366-01、eq367-01/02、eq368-01、eq374-01–04、eq375-01、eq376-01、eq387-01–04、eq388-01、eq392-01）已识图转 LaTeX 并经上下文校验；tbl355 推导表、tbl363 材质表已读图译成中文表格并保留原图 | 审校顺延；正文第 10–14 章录入完后按第 1–8 章顺序审校 |
| 第9章 | 有译稿（9.1–9.13 全部录入） | 待审（仅结构与图注检查通过） | 全章依据 ch09.html 逐段录入；20 个 `<Figure>` 覆盖 images/ 中全部 20 个 Fig9-* 图片（Fig9-5 拆 a/b）；2 张公式图（eq397-01 纹理坐标、eq425-01 网格纹理坐标生成）已识图转 LaTeX 并经 §9.2/§9.11.1 代码上下文校验；36 个页码锚点 page359–page396 与源文顺序一致 | 审校顺延；正文第 10–14 章录入完后按第 1–9 章顺序审校 |
| 第10–14章 | 已录入（ch10–ch14） | 第10–14章已逐章对照 EPUB 完成构建与译文审校；见 REVIEW-CH10-CH13.md、REVIEW-CH14.md | ch10–ch14 结构与图片覆盖已核；ch14 尚有 eq562-05 第二次引用的图文冲突待查 | 按用户队列继续复核第1–5、8–9章遗留的公式/代码或正文项目 |
| 第15–23章 | 未开始 | 未开始（未盘点，届时按同一流程先做节/locator/图片清单再录） | 无 | 第 14 章完成后按第 15–19 章、第 20–23 章继续分批 |
| 附录 A–E | 未开始 | 未开始 | 无 | 正文第 23 章完成后按 A→E 顺序录入 |

## 当前具体审计边界

- 2026-10-05 对第 1–8 章进行图片覆盖与公式显示格式盘点：EPUB 中 151 张编号插图/表图均有相对路径 `<Figure>` 引用，资源存在；发现并补回 ch08 的 tbl355。ch01 §1.4.2 的 `50-0c.jpg` 图像本身损坏；现依据同一算法后文的原书公式图 `eq51-01.jpg` 确认 `w₀=v₀/‖v₀‖`，已在译文原位写成 LaTeX 并加译者注。此项公式含义已核实，但不表示损坏图片本身可读。
- 2026-10-05 对第 14 章逐节核对 14.1–14.8：正文和章节结构、8 张编号图、20 次公式图片引用、2 张代码截图、8 道习题及显示公式格式均已审查；译文修正与唯一遗留问题见 `REVIEW-CH14.md`。`eq562-05.jpg` 在源中第二次引用时与段落主题不符，原图保留、暂不猜补 LaTeX，列入 `uncertain-images.md`。
- 2026-10-05 修复中文译文显示公式格式：将 ch02 的 21 处、ch07 的 5 处、ch08 的 30 处单行/行内显示公式边界改为独立多行 `$$` 块；包括 ch02 式 (2.1)、(2.6)。已用 remark-math + rehype-katex 独立编译 ch01、ch01-remainder、ch02、ch07、ch08 成功。
- 2026-10-05 修复英文原文解析器：DirectXMath 返回类型、XM_CALLCONV 及 operator 签名现在识别为代码；ch02 的 XMMATRIX 与 XMFLOAT4X4 声明分别用回归测试确保完整参数段不脱离代码块。
- 本轮验证：`npm.cmd test -- --reporter=dot` 55 项通过；`check:figures` 312/312、`check:translation-terms` 通过。`check:translations` 另报 ch13 重复锚点 s1333–s1335，并提示尚缺附录及 ch14–ch23。非清空 dist 的生产编译因正在录入的 ch10–ch13 文件有未闭合 `<section>` 失败；未修改这些并行文件。
- 第 1、2 章：本轮只确认标题/子标题结构与编号插图，不声称段落、代码或公式已全面校验。
- 第 3 章：核验过台账列出的若干原图和对应公式；整章正文、其余公式、代码及习题尚未逐段完成。
- 第 4 章：核验深度表、`eq170-01.jpg`、`eq190-01.jpg`；整章代码和正文尚未逐段完成。原书 §4.5.4 有 `n/t=n` 的错误，译文目前忠实保留。
- 第 5 章：核验 `eq221-02.jpg`、`eq221-03.jpg`、`eq222-02.jpg`、`eq233-01.jpg`、`eq234-02.jpg`；删去重复推导并修复 MDX；整章剩余公式/文本/代码/15 道习题尚未逐项完成。
- 第 6 章：全章 6.1–6.13 已按 ch06.html 逐句核对中文说明；图 6.1–6.8、tbl272、tbl273 已处理，note.jpg 提示框按全书惯例只译文字。习题 1–16 均已对照；修正 `BufferLocation` 误称及习题 13 漏"后"字；习题 11 的 D3D11 标识符及 `OffsetInBytes` 原书错误均保留原文并加译者注。核验记录见 `REVIEW-CH01-CH06.md`。
- 第 8 章：全章 8.1–8.16 已按 ch08.html 逐段录入（源 1055 行）；35 个 `<Figure>` 与 `images/` 中 Fig8-1–Fig8-30（Fig8-7 拆 a/b/c、Fig8-16 拆 a/b）及 tbl355、tbl363 一一对应，无遗漏无多余。23 张公式图转 LaTeX：eq353-01 → $\mathbf{n}=\frac{\mathbf{u}\times\mathbf{v}}{\lVert\mathbf{u}\times\mathbf{v}\rVert}$（与 `XMVector3Cross`+`XMVector3Normalize` 一致）、eq354-01 → 顶点法线平均式、eq356-01 → 缩放+平移矩阵 A 与其 $(\mathbf{A}^{-1})^T$（第四列 $[-1,-2,-2,1]$，与正文“转置后平移泄漏”论述一致）、eq358-01/02 → 朗伯余弦推导、eq362-01 → Schlick 近似、eq365-01 → $S(\theta_h)=\frac{m+8}{8}(\mathbf{n}\cdot\mathbf{h})^m$（与 `BlinnPhong` 的 `(m+8)/8*pow(...)` 一致）、eq367-01/02 → 式 8.3/8.4、eq374-01/375-01 → $\mathbf{L}=(\mathbf{Q}-\mathbf{P})/\lVert\mathbf{Q}-\mathbf{P}\rVert$（与 `ComputePointLight` 中 `L.Position - pos` 再归一化一致）、eq374-02 → 平方反比、eq374-03 → 线性衰减（原图漏写参数 $d$ 与等号，已加译者注）、eq374-04 → `saturate` 分段、eq376-01 → $k_{spot}=\max(-\mathbf{L}\cdot\mathbf{d},0)^s$（与 `pow(max(dot(-lightVec, L.Direction),0), L.SpotPower)` 一致）、eq387-01/02/03/04 与 eq388-01 → 地形法线的偏导与叉积推导（与 `GetHillsNormal` 的 `-0.03f*z*cosf(0.1f*x) - 0.3f*cosf(0.1f*z)` 一致）、eq392-01 → 卡通着色分段函数。tbl355 的推导表、tbl363 的 $\mathbf{R}_F(0°)$ 表已读图译成中文表格并保留原图。全章“已录入待审校”，未做独立逐段复核。已照录的原书笔误/存疑点：① §8.2.1 伪代码末行 `Normalize(&mVertices[i].normal))` 多一个右括号；② tbl355 推导表第 5 行“转置性质”与步骤的对应不严密（译文照录并加译者注）；③ §8.7.2 “Figure 8.19 shows $\rho(\theta_h) = \cos_h(\theta_h)$” 上标误作下标（应为 $\cos^m$，译文取 $\cos^m$ 并加注）；④ §8.8 列表第 11 项 “$(\mathbf{n}\cdot\mathbf{h})_h$” 上标误作下标（应为 $^m$，译文取 $^m$ 并加注）；⑤ §8.13.2 `BlinnPhong` 漏掉 `float3 specAlbedo = roughnessFactor * fresnelFactor;` 一行却直接使用 `specAlbedo`（照录并加注）；⑥ §8.11.1 衰减公式图 `att( ) saturate(...)` 漏写 $d$ 与等号（译文补足并加注）；⑦ §8.13.6 `cbPass` 前注释写作 “Constant data that varies per material.”（应为 per frame，照录并加注）；⑧ §8.13.7 `VS` 中 `VertexOut vout = (VertexOut)0.0f;` 前有 3 个多余空格（照录）；⑨ §8.7.2 原书 “The shape of the of the specular reflection” 重复 “of the”（译文按通顺译出）。审校时不得把这些当作录入错误改掉。
- 第 7 章：全章 7.1–7.9 已逐句对照 ch07.html；5 张公式图的 LaTeX 与周围代码/上下文一致，Fig7-1–Fig7-11 均原位放置且资源存在，习题 1–3 齐全。代码标识符、数值和字符串 token 对照无源文缺项；不声称空白与标点逐字符相同。原书笔误清单及本轮修正见 `REVIEW-CH07.md`。
- 第 9 章：全章 9.1–9.13 已按 ch09.html 逐段录入（源 1049 行）；13 个 `<section>` 配对，20 个 `<Figure>` 与 `images/` 中 Fig9-1–Fig9-19（Fig9-5 拆 a/b）一一对应，无遗漏无多余；36 个页码锚点 page359–page396 与源文数量、顺序一致（源文缺 page383、page388，译文同样不设）。2 张公式图转 LaTeX：eq397-01 → $(x,y,z)=\mathbf{p}=\mathbf{p}_0+s(\mathbf{p}_1-\mathbf{p}_0)+t(\mathbf{p}_2-\mathbf{p}_0)$、$s\ge0,t\ge0,s+t\le1$ 时 $(u,v)=\mathbf{q}=\mathbf{q}_0+s(\mathbf{q}_1-\mathbf{q}_0)+t(\mathbf{q}_2-\mathbf{q}_0)$（与正文"用同样的 s、t 参数插值"一致）；eq425-01 → $u_{ij}=j\cdot\Delta u$、$v_{ij}=i\cdot\Delta v$，其中 $\Delta u=\frac{1}{n-1}$、$\Delta v=\frac{1}{m-1}$（与 `CreateGrid` 的 `j*du`、`i*dv`、`du=1.0f/(n-1)`、`dv=1.0f/(m-1)` 一致）。全章"已录入待审校"，未做独立逐段复核。已照录的原书笔误/存疑点：① §9.2 `struct Vertex` 代码块在源 HTML 中结尾 `};` 后带噪声串 `>>>>>>>>>>>>>>>>>>>>`（判断为转换噪声，未录入并加译者注）；② §9.3.2 原文 "outpts"（应为 outputs），且正文 *bricks.bmp*/*bricks.dds* 与示例命令 `treeArray.dds` 不一致（照录加注）；③ §9.4.1 正文 *WoodCreate01.dds* 与代码 `L"Textures/WoodCrate01.dds"` 不一致（照录加注）；④ §9.4.4 "so that to does not modify"（"to" 应为 "it"，照录加注）；⑤ §9.4.3 第 1 条 Format 末尾源文多出孤立残片 "typeless format when creating"（照录加注）；⑥ §9.5.1 提示框 "also called called linear filtering" 重复 "called"，且源 HTML 的 `</i>` 标签错位（译文按通顺处理）；⑦ §9.7.2 "you can only define 2032 number of static samplers" 表述不规范（照译加注）；⑧ §9.8 "texture registers use specified by tn"（应为 "registers are"，照译加注）；⑨ §9.8 "texture registers use specified by sn"（应为 "sampler registers are specified by sn"，照译加注）；⑩ §9.10 `vin.Tex` 与 `vin.TexC` 不一致（照录加注）；⑪ §9.9.3 代码第二行 `mSrvDescriptorHeap->...` 无缩进，按源文照录。审校时不得把这些当作录入错误改掉。

本轮还建立了统一术语表，并把已发现的"坐标系转换矩阵/坐标系变更矩阵"混用统一为"坐标系转换矩阵"；第 5 章图注中的"坐标系统"统一为"坐标系"，管线阶段用"曲面细分阶段"。后续如需改术语，按术语表的变更记录规则回查，不静默扩改。

- 第 10–13 章：已对照 ch10.html–ch13.html 检查全部章节结构、正文、小结、习题、插图、代码上下文和公式。四章 section 配对数为 10/10、7/7、6/6、15/15；`<Figure>` 数为 10/13/10/15；页码锚点分别 21/25/24/44；显示公式共 38 处并全部经 KaTeX 渲染检查。审校记录见 `REVIEW-CH10-CH13.md`。原书笔误保留并标注：第 13 章“60 个线程”应为 600；第 12 章 `NUM_POINT_LIGHT` 少 `S`；第 13 章四分之一尺寸及 Sobel `Gy` 原文错误等。修正第 11 章两处重复“注意”措辞和第 13 章 SRV 中文全称缺漏。

## 最近验证结果

- 本轮非清空目录的生产编译：`npm.cmd exec -- vite build --config frontend/vite.config.ts --outDir "$env:TEMP\dx12zh-build-check-20261005b" --emptyOutDir false` 成功，174 个模块转换；包括 ch10–ch13 中文译文模块。Vite 仍提示若干 chunk 超过 500 kB。
- 英文原文现优先加载 `frontend/src/content/source-html/*.html`（从用户提供的 `.epub/OEBPS` 逐文件复制 29 个正文 HTML），以 EPUB 的 `<p class="code">` 等结构标记确定代码与段落边界；EPUB 图片文件名与根目录 `images/` 的 929 个资源全部对应。原始 XHTML 经标签/属性白名单处理后显示，代码按原始段落顺序合并并高亮；图像继续支持放大，已确认公式沿用 KaTeX 映射。仅缺少 XHTML 时才退回 TXT 与小型语法识别器。
- TXT 降级代码识别器历史验证：TypeScript 检查通过；当时 `npm.cmd test -- --reporter=dot` 为 4 个测试文件、59 项通过；自然语言负向判定覆盖全书 29 个 TXT 源文件。OEBPS 接入后的当前 TypeScript 检查通过，临时目录生产构建成功（175 个模块）；未使用截图。
- 第 10–13 章审校时的历史测试结果：`npm.cmd test -- --reporter=dot` 通过，4 个测试文件、55 项测试；后续统一代码解析器改动后的最新结果为 59 项测试（见上）。
- `npm.cmd run check:translations`：16 个译文 MDX、237 个图片引用通过；仍缺 appendix.mdx 与 ch15–ch23.mdx，共 10 个后续目标文件。
- `npm.cmd run check:translation-terms`：通过，扫描 17 个 MDX 文件；它不替代人工术语审校。
- ch10–ch13 结构检查：48 个 `<Figure>` 引用、38 个 `<MathBlock>`，所有 section 配对、ID 唯一、未处理图片标记为零；图片均为相对路径且资源存在。
- 此前发生过的 npm 环境拦截和 ch08/ch09 构建错误均为已解决的历史记录；本轮实际命令结果以上述构建与测试为准。用户的 VS Code `launch.json` 预览流程仍是最终本地预览入口。

## 每次会话完成时覆盖本区块

新会话结束时把顶部日期、下一会话唯一任务、章节矩阵、审计边界和验证结果改成最新事实；并在下方日志追加一行，不删除旧记录。最终回复简报已保存内容、精确续传位置、未决项和命令结果。确认文件已保存后再结束会话。

## 已结束会话日志

| 日期 | 工作范围 | 已保存结果 | 下一会话游标 |
|---|---|---|---|
| 2026-10-05 | 英文原文改用 EPUB OEBPS XHTML | 从 `.epub/OEBPS` 复制 intro、ch01–ch23、appA–appE 共 29 个 HTML 到 `frontend/src/content/source-html/`；英文模式优先按 EPUB class 语义呈现，`p.code` 行按相邻节点合并，高亮代码；原文内部链接改为站内 original 模式路由；图片继续支持放大、已确认公式映射 KaTeX，TXT 仅作缺少 XHTML 时的 fallback；929 张图片与项目 `images/` 同名齐全；tsc 和 175 模块生产构建通过 | 审校已有译文 `ch14.mdx`；PDF 文本提取仍不可用，本轮依据解压 OEBPS XHTML；未使用截图 |
| 2026-10-05 | 统一英文原文 C++/HLSL 代码识别 | 新增词法扫描和小型语法 recognizer，按通用声明/函数/表达式结构识别未知类型，并依据括号状态合并换行参数；移除 DirectXMath 类型与 `XM_CALLCONV` 特判；追加自然语言负向判定，修复含引用、分号、括号或 `u = v` 的正文误判；全书 29 个英文源文件扫描、tsc、59 项测试与 175 模块生产编译通过 | 审校已有译文 `ch14.mdx`；PDF 本地抽取工具不可用，参考解压 EPUB 原文；未使用截图 |
| 2026-10-05 | 审校第 10–13 章的生产构建与中文译文 | 修正 ch12 section 闭合、ch11 两处重复措辞、ch13 的 SRV 译名；给 ch12/13 原书代码与线程数笔误加译者注；38 个公式通过 KaTeX；174 模块生产编译、55 项测试、译文图片与术语检查通过；详见 `REVIEW-CH10-CH13.md` | 审校已有译文 `ch14.mdx`；按用户后续指示接续第 1–5、8–9 章待审校内容 |
| 2026-10-05 | 统一核查第 1–8 章公式显示和插图覆盖，并修复英文原文代码分块 | 将 ch02/ch07/ch08 的 56 处显示公式改为标准多行块，含 ch02 式 (2.1)、(2.6)；ch01 待确认图 50-0c 原位恢复且撤掉猜测公式；补回 ch08 tbl355；151 张 Fig/tbl 资源逐章覆盖检查通过；修复 DirectXMath 声明代码识别；55 项测试、312 图注、术语检查通过。构建/译文完整检查受并行录入中的 ch10–ch13 未闭合 section 和重复锚点阻断，未修改并行文件 | 继续 ch10→ch11→ch12→ch13→ch14 录入；其后按第 1–8 章公式内容审计边界逐项复核 |
| 2026-10-05 | 复核第1章 §1.4.2 损坏公式图并审校第14章 | ch01 依 eq51-01 明确恢复 w₀=v₀/‖v₀‖ 并加译者注；ch14 逐节核对和格式检查完成，修正文案/标题/API 注释问题，记录 eq562-05 第二次引用的源图文冲突；本轮构建与测试结果见对话交付 | 按剩余队列继续审校第1–5章公式/代码边界及第8–9章全文；先读 REVIEW-CH14.md 与 uncertain-images.md |
| 2026-10-04 | 第 1–6 章结构审查及第 3–5 章指定公式图复核；建立新会话续传方案 | 修正第 3 章箭头及术语；补译第 4 章深度表；核验并更新第 3–5 章图片台账；移除第 5 章重复推导并修复 MDX；创建术语表和本续传状态 | 续录 `ch06.mdx` §6.1，接在 `AlignedByteOffset` 示例段后，从 `InputSlotClass` 列表项开始 |
| 2026-10-04 | 续录第 6 章 §6.1 至小节完成 | 补录第 5 项内嵌 Vertex2 偏移代码块、第 6/7 项（`InputSlotClass`/`InstanceDataStepRate`）与 `desc1`/`desc2` 示例；闭合 s61；进度条更新为"6.1 完整"；原书 desc2 缺逗号按原文照录并加译者注；确认 §6.1 仅含图 6.1、无公式图；确认构建/测试失败为复制模型环境假象，用户侧 launch.json 流程跑通 | 录入 `ch06.mdx` §6.2 顶点缓冲：`ch06.html` 第 110–303 行（印刷页 207–213），首段 "In order for the GPU to access an array of vertices…" |
| 2026-10-04 | 按用户指示一次完成第 6 章全文（6.2–6.13） | 录入 §6.2–§6.13 全部小节、BoxApp.cpp 全文与习题 1–16；放置图 6.2–6.8，tbl272/tbl273 已读图译成中文表格并保留原图；照录原书笔误并按需加译者注；修复图 6.7 caption 引号引发的 MDX 解析错误；构建通过、图注 312/312、术语检查通过 | 录入 `ch07.mdx`：`ch07.html` §7.1 FRAME RESOURCES（第 29 行起），尽量一次完成全章 7.1–7.9 |
| 2026-10-04 | 按用户指示调整下一会话计划 | 续传指针从"第 1–6 章审校（自 §1.1 起）"改为"录入第 7 章"；第 7 章源结构（7.1–7.9）与 Fig7-1–Fig7-11 资源盘点结果写入任务；第 1–6 章审校标记为顺延 | 录入 `ch07.mdx`：`ch07.html` §7.1 FRAME RESOURCES（第 29 行起），尽量一次完成全章 7.1–7.9 |
| 2026-10-04 | 按用户指示一次完成第 7 章全文（7.1–7.9） | 新建 `ch07.mdx`（约 1508 行），录入全部小节、ShapesApp/Land/Waves 代码与习题 1–3；放置图 7.1–7.11；5 张公式图识图转 LaTeX 并经代码上下文核验；9 处原书笔误照录加注；术语沿用"清空命令队列"等既有译法，pass 相关沿用目录"Pass 常量"；check:figures/check:translation-terms/check:translations 通过，临时配置 vite build 167 模块通过 | 录入 `ch08.mdx`：`ch08.html` §8.1 LIGHT AND MATERIAL INTERACTION（第 40 行起），尽量一次完成全章 8.1–8.16 |
| 2026-10-05 | 按用户指示一次完成第 8 章全文（8.1–8.16） | 新建 `ch08.mdx`（约 1230 行），16 个小节全部录入；当前 35 个 `<Figure>` 覆盖 Fig8-1–Fig8-30（Fig8-7 拆 a/b/c、Fig8-16 拆 a/b）与 tbl355、tbl363；23 张公式图识图转 LaTeX 并经代码/上下文核验；tbl355 推导表与 tbl363 材质表读图译成中文表格并保留原图（tbl355 图片后经本轮盘点补回）；9 处原书笔误照录加注；修复 caption 内嵌 `<a id>` 导致的 MDX 解析错误；check:translations（158 图）、check:translation-terms（11 文件）通过，临时配置 vite build 168 模块通过 | 录入 `ch09.mdx`：`ch09.html` §9.1 TEXTURE AND RESOURCE RECAP（第 32 行起），尽量一次完成全章 9.1–9.13 |

| 2026-10-05 | 对第 6、7 章完成独立忠实度审校；复测第 8 章修复后的生产编译 | 更新第 6 章两处译文并补原书笔误注；逐句审校第 7 章并记录于 `REVIEW-CH07.md`；53 项测试通过、图注 312/312、术语检查通过；不清空 dist 的生产编译 168 模块成功，仅有既有大 chunk 警告 | 录入 `ch09.mdx`：`ch09.html` §9.1 TEXTURE AND RESOURCE RECAP（第 32 行起），尽量一次完成全章 9.1–9.13 |
| 2026-10-05 | 按用户指示一次完成第 9 章全文（9.1–9.13） | 新建 `ch09.mdx`（约 1160 行），13 个小节全部录入；20 个 `<Figure>` 覆盖 Fig9-1–Fig9-19（Fig9-5 拆 a/b）；2 张公式图（eq397-01、eq425-01）识图转 LaTeX 并经 §9.2/§9.11.1 代码上下文核验；36 个页码锚点与源文顺序一致；11 处原书笔误/存疑点照录加注并写入审计边界；修复 `<h3>` 误用 `</h2>` 关闭的 MDX 解析错误；check:figures（312/312）、check:translation-terms（12 文件）、check:translations（178 图）通过，临时配置 vite build 169 模块通过 | 录入 `ch10.mdx`：`ch10.html` §10.1 THE BLENDING EQUATION（第 41 行起），尽量一次完成全章 10.1–10.10 |
| 2026-10-05 | 用户调整批次规模（每会话 1 章 → 每会话 5 章），据此改写本续传状态的下一任务 | 盘点 ch10–ch14 全部源结构：行数（585/604/678/1348/635，合计 3850）、每章小节与源文行号、`<h3>` 子小节、Catalog 已列与未列锚点（未列项：s102、s1010、s117、s126、s138、s1310、s148）、56 张编号图与 66 处公式图引用清单、138 个页码锚点范围；把"下一会话的唯一任务"改成 5 章对照表并补充通用规则、装饰性图标处理、续传 fallback 要求；进度矩阵拆分为"第10–14章（下一批）"与"第15–23章" | 一次会话连续录入第 10–14 章：`ch10.mdx`→`ch11.mdx`→`ch12.mdx`→`ch13.mdx`→`ch14.mdx`，各章从 `ch1N.html` §10.1 / §11.1 / §12.1 / §13.1 / §14.1 起 |

| 2026-10-05 | 对第 1–5 章和第 8 章完成中文说明逐段忠实度审校，并落实以后并行做术语与原文核验的流程 | 修正 ch01 小结分量、ch03 齐次坐标与 w_B、ch04 D3D12 类型名；记录 ch04 原书 FPS 公式错误及 ch08 原书内部不一致；新增 REVIEW-CH08.md，并更新 REVIEW-CH01-CH06.md 与 README.md；check:translation-terms 通过，check:translations 发现缺少附录及 ch10–23（正等待录入） | 继续录入第 10–14 章；之后每章分别记录术语一致性和 EPUB 逐段忠实度状态 |
