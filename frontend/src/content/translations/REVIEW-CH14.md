# 第 14 章审校记录

日期：2026-10-05  
依据：`.epub/OEBPS/ch14.html`、`.epub/OEBPS/images/`、`frontend/src/content/translations/ch14.mdx`。没有使用截图。

## 核对范围

- 按原书顺序核对 §14.1–§14.8、所有列出的子节、正文说明、公式、代码及代码周围解释、图注、总结和习题。
- 子节范围包括 14.1.1、14.2.1–14.2.2、14.3.1–14.3.2、14.6.1–14.6.4。
- 8 张编号插图 Fig14-1–Fig14-8 均在译文中对应出现。源文件共有 22 处非编号插图的公式/代码图片引用：20 次公式图引用（其中 `eq562-05.jpg` 重复一次）和 2 张代码截图；章节页码锚点覆盖 page513–page536。
- 20 次公式图引用中，19 次已转成 LaTeX 并结合前后变量、推导或代码核验；`eq562-05.jpg` 第二次引用仍作为可放大原图显示，并在 `uncertain-images.md` 登记。两张代码截图 `eq565-02.jpg`、`eq566-01.jpg` 已转录为 HLSL 代码块。
- 习题 1–8 均按源文核对题干和子项；未将教学补充混写为原书内容。

## 本轮修正

1. §14.3 源标题是 “THE TESSELLATION STAGE”，原译标题曾写成“镶嵌器”，容易与单个 tessellator 硬件单元混淆；现改为“曲面细分阶段”，与本节内容一致。
2. §14.6.3 清除了重复的“注意：注意”，顺了一处重复措辞。
3. 删除了关于 `D3D11_PRIMITIVE_TOPOLOGY_16_CONTROL_POINT_PATCHLIST` 不存在的译者注。该枚举值确实存在于 Microsoft Direct3D 11 文档；仅凭其与前文代码的前缀不同，不能判定原书写错。[Microsoft 文档：D3D11_PRIMITIVE_TOPOLOGY](https://learn.microsoft.com/en-us/windows/win32/direct3d11/d3d11-primitive-topology)
4. 将 25 个单行显示公式统一改成 KaTeX 支持的独立多行 `$$` 块，便于稳定渲染和阅读。

## 忠实度与遗留项

- §14.1–§14.8 的段落顺序、术语解释、步骤和练习均已与 EPUB 对读；没有发现漏掉整节、图注或练习子项的情况。
- `eq565-02.jpg` 与 `eq566-01.jpg` 是代码截图，转录时保留代码内容与大小写。译文注记说明截图中的 `dbasisU`/`dBasisV` 与前文变量命名存在大小写差异。
- 原文可见的 `intermediate pints`、不完整的 “interpolating between … and … by t” 及习题 2 的 `iscoahedron` 均作为源文问题处理；译文保留必要的译者注，不把源文错误悄悄改成正常正文。
- 唯一未能确认的公式图是 §14.6.1 第二次引用的 `eq562-05.jpg`：上下文称其为 n 次 Bernstein 基函数定义，但 EPUB 实际再次展示了上文的三次 Bézier 插值展开式。译文保留图片并明确标注冲突；可能的一般式只作为待核猜测，不当作原书原式。位置、来源和疑点见 `uncertain-images.md`。

## 工程核验

本轮运行结果由交付摘要记录。构建可验证 MDX、KaTeX、资源导入及应用打包；它不等同于浏览器截图检查，也不能取代上述逐节原文核对。
