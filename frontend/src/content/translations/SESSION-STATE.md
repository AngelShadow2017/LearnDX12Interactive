# 会话续传状态

新会话从这里恢复。更新时间：2026-10-05（第 8 章全文录入完成）。工作范围仍是完整译入 EPUB 导读、正文 1–23 章和附录 A–E；当前用户希望复制模型每次用新会话，因此任何下一步都必须能只凭仓库文件恢复。

## 新会话先读

1. `README.md`：规则和会话协议。
2. `TERMINOLOGY.md`：全书固定译名。
3. 本文件：当前队列和精确游标。
4. 做第 1–6 章时读 `REVIEW-CH01-CH06.md`；处理图像时读 `uncertain-images.md`。
5. 用对应 `.epub/OEBPS/chNN.html` 与当前目标 MDX 检验本文件的断点。状态文件是交接索引，不是原书证据。

## 总体状态

- 已存在文件：`intro.mdx`、`ch01.mdx`（需与 `translation-parts/ch01-remainder.mdx` 合读）、`ch02.mdx`、`ch03.mdx`、`ch04.mdx`、`ch05.mdx`、`ch06.mdx`、`ch07.mdx`、`ch08.mdx`。
- 结构扫描确认第 1–5 章目录层级基本对应原书；这**不等于**逐段翻译已审或全文忠实。第 1–5 章仍要完成 EPUB 顺序的内容核验。
- 第 6 章已全文录入（6.1–6.13，含 BoxApp.cpp 全文与习题 1–16），文件结构闭合，构建通过；内容为"已录入待审校"，尚未逐段独立审校。原书多处代码笔误已按原文照录，清单见 `REVIEW-CH01-CH06.md` 第 6 章一节。
- 第 7 章已全文录入（7.1–7.9，含 FrameResource/RenderItem、ShapesApp、Land/Waves 代码与习题 1–3），文件结构闭合（9 个 section 配对、11 张编号图齐全），构建通过；内容为"已录入待审校"。5 张公式图已识图转 LaTeX 并经代码上下文核验；原书多处笔误照录加注，清单见"当前具体审计边界"第 7 章一节。
- 第 8 章已全文录入（8.1–8.16，含 Light/Material 结构、LightingUtil.hlsl 与 Default.hlsl 全文、LitWaves 光照演示代码与习题 1–6），文件结构闭合（16 个 section 配对、34 个 `<Figure>` 覆盖 33 个 Fig8-* 图片与 tbl363），构建通过；内容为"已录入待审校"。23 张公式图全部识图转 LaTeX 并经上下文校验，无新增不确定图片；原书笔误照录加注，清单见"当前具体审计边界"第 8 章一节。
- 目前的下一阶段原则（2026-10-05 用户指示）：录入完第 8 章后继续向后录入第 9 章；第 1–7 章逐段审校继续顺延，之后按用户安排进行。每次新会话只处理一个连续小批次，不能跳章或拼接不连续来源。
- 所有目标正文应以 `.epub/OEBPS/*.html` 为准。TXT 仅定位，不作译文底稿。

## 下一会话的唯一任务

**录入第 9 章"纹理"，从 §9.1 开始，尽量在一次会话内完成全章（9.1–9.13）。**第 8 章已于上一会话按用户指示录完，按顺序向后推进。

- 原文：`.epub/OEBPS/ch09.html`。小节与源文行号：9.1 TEXTURE AND RESOURCE RECAP（32–68）、9.2 TEXTURE COORDINATES（69–114）、9.3 TEXTURE DATA SOURCES（115–192，含 9.3.1 DDS Overview 128–166、9.3.2 Creating DDS Files 167–192）、9.4 CREATING AND ENABLING A TEXTURE（193–391，含 9.4.1 Loading DDS Files 195–228、9.4.2 SRV Heap 229–236、9.4.3 Creating SRV Descriptors 237–310、9.4.4 Binding Textures to the Pipeline 311–391）、9.5 FILTERS（392–447，含 9.5.1 Magnification 394–421、9.5.2 Minification 422–441、9.5.3 Anisotropic Filtering 442–447）、9.6 ADDRESS MODES（448–484）、9.7 SAMPLER OBJECTS（485–670，含 9.7.1 Creating Samplers 488–559、9.7.2 Static Samplers 560–670）、9.8 SAMPLING TEXTURES IN A SHADER（671–706）、9.9 CRATE DEMO（707–914，含 9.9.1 Specifying Texture Coordinates 710–741、9.9.2 Creating the Texture 742–769、9.9.3 Setting the Texture 770–781、9.9.4 Updated HLSL 782–914）、9.10 TRANSFORMING TEXTURES（915–931）、9.11 TEXTURED HILLS AND WAVES DEMO（932–1015，含 9.11.1 Grid Texture Coordinate Generation 939–980、9.11.2 Texture Tiling 981–990、9.11.3 Texture Animation 991–1015）、9.12 SUMMARY（1016–1024）、9.13 EXERCISES（1025–文件末尾）。
- 目标：新建 `frontend/src/content/translations/ch09.mdx`，小节锚点按源文编号 `s91`–`s913`（目录 `catalog.ts` ch09 已有条目：s92、s94、s95、s96、s97、s99、s910、s911、s912；目录未列的 s91、s93、s98、s913 自拟，做法同第 8 章的 s83/s88）；文件顶部加进度条（参照 ch08.mdx）。注意 `catalog.ts` 的 ch09 条目与 `frontend/src/content/chapters/ch09.mdx`（互动讲解版）一致，**不要修改 catalog**，本译文多出的锚点只是译文页内小节。
- 已知图片资源（来自 `images/`）：编号图 Fig9-1、Fig9-2、Fig9-3、Fig9-4、Fig9-5a、Fig9-5b、Fig9-6、Fig9-7、Fig9-8、Fig9-9、Fig9-10、Fig9-11、Fig9-12、Fig9-13、Fig9-14、Fig9-15、Fig9-16、Fig9-17、Fig9-18、Fig9-19（共 20 张，其中 Fig9-5 拆成 a/b 两张、Fig9-16/17/18/19 在正文后部）；公式图仅 `eq397-01.jpg`（9.2 纹理坐标）与 `eq425-01.jpg`（9.11.1 网格纹理坐标生成）两张。公式图按流程识图转 LaTeX 并用上下文核验；不能确认的原位保留 `<Figure>` 并登记 `uncertain-images.md`。
- `catalog.ts` 的 ch09 标题写作"9.9 Crate 演示"，源文 9.9 为 CRATE DEMO（此处"Crate"为板条箱模型名，不是"克雷特"）——排版时保持与目录一致的简写，小节体内按原文 "Crate" 处理即可。
- 本章说明多、代码多（DDS 加载、SRV 描述符、采样器描述、Crate 演示的 HLSL）。代码按原文逐字抄录，保留宏、签名、注释与紧邻说明；原书笔误照录并加"译者注"，登记到审计边界。注意 `Figure` 组件的 `caption`/`alt` 是纯文本属性，**不要在其中写 `$...$`、反引号或 `*强调*`，也不要内嵌 `<a id="..."/>`**（双引号会截断属性），需要页面锚点时把 `<a id="pageNNN"/>` 放在 `<Figure ... />` 之外。
- 若单次会话无法完成全章，在完整小节/代码块边界停下，把本指针改写到具体小节、源行号、页码与开头短语；未完成时进度条保持"录入中"。
- 保存后运行 `npm run check:figures`、`npm run check:translation-terms`、`npm run check:translations`；构建验证按"最近验证结果"的说明（临时配置 `emptyOutDir: false` 跑 vite build 可行，验证后必须删除临时配置与日志）。

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
| 第6章 | 有译稿（6.1–6.13 全部录入） | 待审（仅结构与图注检查通过） | 全章依据 ch06.html 逐段录入；图 6.1–6.8 已放置；tbl272/tbl273 已读图译成中文表格并保留原图；原书多处笔误已照录加注 | 审校顺延（当前先向后录入第 8 章）；回到审校阶段时按第 1–6 章顺序进行 |
| 第7章 | 有译稿（7.1–7.9 全部录入） | 待审（仅结构与图注检查通过） | 全章依据 ch07.html 逐段录入；图 7.1–7.11 已放置；eq309/eq311/eq314/eq336/eq338 五张公式图已识图转 LaTeX 并经代码核验；原书笔误照录清单见审计边界第 7 章一节 | 审校顺延；正文第 8 章录入完后按第 1–7 章顺序审校 |
| 第8章 | 有译稿（8.1–8.16 全部录入） | 待审（仅结构与图注检查通过） | 全章依据 ch08.html 逐段录入；34 个 `<Figure>` 覆盖 images/ 中 33 个 Fig8-* 图片与 tbl363；23 张公式图（eq353-01、eq354-01、eq356-01、eq358-01/02、eq362-01、eq365-01、eq366-01、eq367-01/02、eq368-01、eq374-01–04、eq375-01、eq376-01、eq387-01–04、eq388-01、eq392-01）已识图转 LaTeX 并经上下文校验；tbl355 推导表、tbl363 材质表已读图译成中文表格并保留原图 | 审校顺延；正文第 9 章录入完后按第 1–8 章顺序审校 |
| 第9–23章 | 未开始（第 9 章为下一任务） | 未开始（第 9 章源结构已盘点：9.1–9.13，20 张编号图 + 2 张公式图） | 无 | 按"下一会话唯一任务"从 §9.1 起录入，尽量一次完成全章 |
| 附录 A–E | 未开始 | 未开始 | 无 | 正文第 23 章完成后按 A→E 顺序录入 |

## 当前具体审计边界

- 第 1、2 章：本轮只确认标题/子标题结构与编号插图，不声称段落、代码或公式已全面校验。
- 第 3 章：核验过台账列出的若干原图和对应公式；整章正文、其余公式、代码及习题尚未逐段完成。
- 第 4 章：核验深度表、`eq170-01.jpg`、`eq190-01.jpg`；整章代码和正文尚未逐段完成。原书 §4.5.4 有 `n/t=n` 的错误，译文目前忠实保留。
- 第 5 章：核验 `eq221-02.jpg`、`eq221-03.jpg`、`eq222-02.jpg`、`eq233-01.jpg`、`eq234-02.jpg`；删去重复推导并修复 MDX；整章剩余公式/文本/代码/15 道习题尚未逐项完成。
- 第 6 章：全章 6.1–6.13 已按 ch06.html 逐段录入；图 6.1–6.8、tbl272、tbl273 均已处理，note.jpg 提示框按全书惯例只译文字。全章仍是"已录入待审校"，未做独立逐段复核。已照录的原书笔误清单见 `REVIEW-CH01-CH06.md` 第 6 章一节，审校时不得把它们当作录入错误改掉。
- 第 8 章：全章 8.1–8.16 已按 ch08.html 逐段录入（源 1055 行）；34 个 `<Figure>` 与 `images/` 中 Fig8-1–Fig8-30（Fig8-7 拆 a/b/c、Fig8-16 拆 a/b）及 tbl363 一一对应，无遗漏无多余。23 张公式图转 LaTeX：eq353-01 → $\mathbf{n}=\frac{\mathbf{u}\times\mathbf{v}}{\lVert\mathbf{u}\times\mathbf{v}\rVert}$（与 `XMVector3Cross`+`XMVector3Normalize` 一致）、eq354-01 → 顶点法线平均式、eq356-01 → 缩放+平移矩阵 A 与其 $(\mathbf{A}^{-1})^T$（第四列 $[-1,-2,-2,1]$，与正文"转置后平移泄漏"论述一致）、eq358-01/02 → 朗伯余弦推导、eq362-01 → Schlick 近似、eq365-01 → $S(\theta_h)=\frac{m+8}{8}(\mathbf{n}\cdot\mathbf{h})^m$（与 `BlinnPhong` 的 `(m+8)/8*pow(...)` 一致）、eq367-01/02 → 式 8.3/8.4、eq374-01/375-01 → $\mathbf{L}=(\mathbf{Q}-\mathbf{P})/\lVert\mathbf{Q}-\mathbf{P}\rVert$（与 `ComputePointLight` 中 `L.Position - pos` 再归一化一致）、eq374-02 → 平方反比、eq374-03 → 线性衰减（原图漏写参数 $d$ 与等号，已加译者注）、eq374-04 → `saturate` 分段、eq376-01 → $k_{spot}=\max(-\mathbf{L}\cdot\mathbf{d},0)^s$（与 `pow(max(dot(-lightVec, L.Direction),0), L.SpotPower)` 一致）、eq387-01/02/03/04 与 eq388-01 → 地形法线的偏导与叉积推导（与 `GetHillsNormal` 的 `-0.03f*z*cosf(0.1f*x) - 0.3f*cosf(0.1f*z)` 一致）、eq392-01 → 卡通着色分段函数。tbl355 的推导表、tbl363 的 $\mathbf{R}_F(0°)$ 表已读图译成中文表格并保留原图。全章"已录入待审校"，未做独立逐段复核。已照录的原书笔误/存疑点：① §8.2.1 伪代码末行 `Normalize(&mVertices[i].normal))` 多一个右括号；② tbl355 推导表第 5 行"转置性质"与步骤的对应不严密（译文照录并加译者注）；③ §8.7.2 "Figure 8.19 shows $\rho(\theta_h) = \cos_h(\theta_h)$" 上标误作下标（应为 $\cos^m$，译文取 $\cos^m$ 并加注）；④ §8.8 列表第 11 项 "$(\mathbf{n}\cdot\mathbf{h})_h$" 上标误作下标（应为 $^m$，译文取 $^m$ 并加注）；⑤ §8.13.2 `BlinnPhong` 漏掉 `float3 specAlbedo = roughnessFactor * fresnelFactor;` 一行却直接使用 `specAlbedo`（照录并加注）；⑥ §8.11.1 衰减公式图 `att( ) saturate(...)` 漏写 $d$ 与等号（译文补足并加注）；⑦ §8.13.6 `cbPass` 前注释写作 "Constant data that varies per material."（应为 per frame，照录并加注）；⑧ §8.13.7 `VS` 中 `VertexOut vout = (VertexOut)0.0f;` 前有 3 个多余空格（照录）；⑨ §8.7.2 原书 "The shape of the of the specular reflection" 重复 "of the"（译文按通顺译出）。审校时不得把这些当作录入错误改掉。
- 第 7 章：全章 7.1–7.9 已按 ch07.html 逐段录入（源 1744 行）；图 7.1–7.11 共 11 张编号图全部原位放置，5 张公式图转 LaTeX：eq309-01 → $h_i=-\frac{h}{2}+i\Delta h$（与 CreateCylinder 代码 `y=-0.5f*height+i*stackHeight` 一致）、eq311-01 → ΔABC/ΔACD 索引式（与 push_back 顺序 A,B,C / A,C,D 一致）、eq314-01 → $r:\mathbf{v}'=r\mathbf{v}/\lVert\mathbf{v}\rVert$（与 CreateGeosphere 归一化×radius 一致）、eq336-01 → $\mathbf{v}_{ij}=[-0.5w+j\cdot dx,\ 0.0,\ 0.5d-i\cdot dz]$（与 CreateGrid 一致）、eq338-01 → ΔABC/ΔCBD 索引式（与 k/k+1…k+5 顺序一致）；note.jpg 提示框只译文字。全章"已录入待审校"，未做独立逐段复核。已照录的原书笔误清单：① §7.2 RenderItem 注释 "obect data"；② §7.5.2 左/右圆柱世界矩阵实参互换 + `rightCylRitem-> Geo` 多空格；③ §7.5.3 "three 3n object constant buffers" 表述（译文取 3n 并注）；④ §7.6.4 段首误写 "A descriptor table root parameter…"（译文加注）；⑤ §7.6.5 注释 "Perfomance"；⑥ §7.6.6 伪代码 `ri.CbIndex` 与本章 RenderItem 的 `ObjCBIndex` 命名不一致；⑦ §7.7.3 `GetHillsHeight` 调用与 `GetHeight` 定义不一致；⑧ §7.7.5 "can add tessellate geometry"；⑨ §7.9 习题列表仅 3 题而图 7.11 图注写 "Exercise 4"（习题 3 即骷髅）。审校时不得把这些当作录入错误改掉。

本轮还建立了统一术语表，并把已发现的"坐标系转换矩阵/坐标系变更矩阵"混用统一为"坐标系转换矩阵"；第 5 章图注中的"坐标系统"统一为"坐标系"，管线阶段用"曲面细分阶段"。后续如需改术语，按术语表的变更记录规则回查，不静默扩改。

## 最近验证结果

- **构建/预览以 VS Code 的 launch.json 流程为准**：`launch.json` 的 preLaunchTask `vite:build-preview` 运行 `npm run preview:build`，用户已确认本项目构建跑通。后续会话验证构建/测试优先请用户用该流程执行。
- 复制模型的命令行环境会向 node 进程注入安全删除护栏与 require 钩子，产生两类**环境假象**（不是译文问题）：直接 `npm run build` 被 `SAFE_DELETE_BULK_CONFIRM_REQUIRED` 拦截（vite 清空 `frontend/dist/images` 的 930 个文件超过护栏阈值）；`npm test` 的 3 个套件在 `describe()` 处报 `Cannot read properties of undefined (reading 'config')`，0 个用例被收集。清空 `NODE_OPTIONS` 后测试仍然报错，故此环境中不以下列命令的结果为准。
- 在复制模型环境中用临时配置（关闭 `emptyOutDir`）执行 vite build 本会话再次通过：168 个模块全部转换，含第 8 章全文的 `ch08.mdx` 编译正常（上轮 167 模块 + 本轮新增 1 个），产出 `ch08-*.js` 两个 chunk（互动讲解版与译文版）；仅剩既有的 chunk 体积警告；验证后临时配置 `frontend/vite.config.verify.ts` 与日志 `build-verify.log` 均已删除。
- 本会话首次构建在 ch08.mdx 第 224 行失败：`<Figure>` 的 `caption` 属性里内嵌了 `<a id="page325"/>`，其双引号截断了属性导致 MDX 解析错误。修复方式是把该页面锚点移到 `<Figure ... />` 之外。**后续章节的 `caption`/`alt` 一律不得内嵌 `"`、`$`、反引号或 `*强调*`**（`Figure` 组件的 caption 按纯文本渲染，写 LaTeX 会原样显示）。
- `npm.cmd run check:translation-terms`：通过，扫描 11 个 MDX 文件中的已登记易混译名；它不能替代人工按完整术语表核对。
- `npm.cmd run check:figures`：312 张图注资源全部放置，缺少 0 张（该检查清单未含第 7、8 章编号图；已另行核实 ch08.mdx 内 34 个 `<Figure>` 与 `images/` 中 33 个 Fig8-* 及 tbl363 一一对应且文件存在）。
- `npm.cmd run check:translations`：10 个译文 MDX，图片引用 158 张（124 + 第 8 章 34 张）；全书目标 25 个文件，缺 16 个（附录和第 9–23 章）。
- ch08.mdx 自检：16 个 `<section>` 与 16 个 `</section>` 配对闭合；页码锚点 page315–page358（与源 ch08.html 的 44 处 `page` 锚点数量一致，逐一按顺序放置）；`[[IMG` 残留 0 处；linter 无错误。

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
