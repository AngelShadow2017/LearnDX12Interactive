# Content tooling

这些脚本用于**内容阶段**，把 EPUB 与旧版中文页面对齐到新的 MDX 教材里。它们不参与前端构建。

前置：把 `10.1515_9781683922902.epub` 解压到仓库根目录的 `.epub/`（保持 `OEBPS/` 结构）。

## 一次性准备

```powershell
node tools/epub-text.mjs ch01      # 把一章 EPUB HTML 转成可读纯文本
node tools/epub-index.mjs          # 生成 .epub/figure-index.txt（图号 → 所在小节 → 原书图注）
```

`.epub/figure-captions.json` 是旧版页面图注的已保存清单。`figure-captions.mjs` 仅在旧版 HTML 来源仍存在时才可重新生成；当前前端构建不依赖这些 HTML 文件。

- `epub-text.mjs` 会把 `<p class="h1">` 这类 EPUB 专有的小节标记转成 Markdown 标题，因此插图能被归到正确的小节。
- `figure-index.txt` + `figure-captions.json` 合起来就是「312 张图该放在哪、配什么图注」的依据。

## 每次改动后核对

```powershell
node tools/check-figures.mjs
```

输出图注清单中的图片数、新 MDX 已放置张数与差集。目标：`缺少：0 张`。

```powershell
node tools/figures.mjs ch08 ch09   # 只看某几章的图号、小节与中文图注
```

## 为什么有这些脚本

312 张图不能按文件名顺序盲插。`epub-index.mjs` 给出每张图在原书里所属的小节，已保存的 `figure-captions.json` 提供中文图注，两者一拼就知道每张图该放在 MDX 的哪个位置、配哪句说明。

MDX 文件里插图的写法固定为：

```mdx
<Figure src="images/Fig8-1.jpg" alt="…" figureNumber="图 8.1" caption="…" />
```

`src` 必须是 `images/` 下的原文件名，构建会把该目录复制到 `frontend/dist/images/`。
