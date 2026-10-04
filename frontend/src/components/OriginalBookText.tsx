import { useEffect, useState } from 'react';
import { renderToString } from 'katex';
import { InlineFigure } from './InlineFigure';
import { figureAssetHref } from './figurePath';

const sourceLoaders = import.meta.glob('../content/source/*.txt', {
  query: '?raw',
  import: 'default',
}) as Record<string, () => Promise<string>>;

// Equations transcribed while the corresponding chapter was being translated.
// Unreviewed formula artwork remains available as a zoomable source image.
const formulaLatex: Record<string, string> = {
  'eq42-01.jpg': '-\\frac{1}{2}\\mathbf{v}',
  'eq42-02.jpg': '-\\frac{1}{2}\\mathbf{v}=(-1,-\\frac{1}{2})',
  'eq42-03.jpg': '-\\frac{1}{2}\\mathbf{v}',
  'eq42-04.jpg': '-\\frac{1}{2}\\mathbf{v}',
  'eq42-05.jpg': '\\mathbf{u}=(2,\\frac{1}{2})',
  'eq42-06.jpg': '\\mathbf{u}+\\mathbf{v}=(3,\\frac{5}{2})',
  'eq42-07.jpg': '\\mathbf{u}=(2,\\frac{1}{2})',
  'eq42-08.jpg': '\\mathbf{v}-\\mathbf{u}=(-1,\\frac{3}{2})',
  'eq43-01.jpg': 'a=\\sqrt{x^2+z^2}',
  'eq43-02.jpg': '\\lVert\\mathbf{u}\\rVert=\\sqrt{y^2+a^2}=\\sqrt{x^2+y^2+z^2}',
  'eq44-01.jpg': '\\hat{\\mathbf{u}}=\\frac{\\mathbf{u}}{\\lVert\\mathbf{u}\\rVert}=\\left(\\frac{x}{\\lVert\\mathbf{u}\\rVert},\\frac{y}{\\lVert\\mathbf{u}\\rVert},\\frac{z}{\\lVert\\mathbf{u}\\rVert}\\right)',
  'eq44-02.jpg': '\\lVert\\hat{\\mathbf{u}}\\rVert=\\sqrt{\\frac{x^2}{\\lVert\\mathbf{u}\\rVert^2}+\\frac{y^2}{\\lVert\\mathbf{u}\\rVert^2}+\\frac{z^2}{\\lVert\\mathbf{u}\\rVert^2}}=1',
  'eq44-03.jpg': '\\lVert\\mathbf{v}\\rVert=\\sqrt{(-1)^2+3^2+4^2}=\\sqrt{26}',
  'eq44-04.jpg': '\\hat{\\mathbf{v}}=\\frac{\\mathbf{v}}{\\lVert\\mathbf{v}\\rVert}=\\left(-\\frac{1}{\\sqrt{26}},\\frac{3}{\\sqrt{26}},\\frac{4}{\\sqrt{26}}\\right)',
  'eq44-05.jpg': '\\lVert\\hat{\\mathbf{v}}\\rVert=\\sqrt{\\frac{1}{26}+\\frac{9}{26}+\\frac{16}{26}}=\\sqrt{1}=1',
  '44-0a.jpg': '\\mathbf{u}\\cdot\\mathbf{v}=u_xv_x+u_yv_y+u_zv_z',
  '44-0b.jpg': '\\mathbf{u}\\cdot\\mathbf{v}=\\lVert\\mathbf{u}\\rVert\\,\\lVert\\mathbf{v}\\rVert\\cos\\theta',
  '45-01.jpg': '\\mathbf{u}\\cdot\\mathbf{v}=-7,\\qquad \\lVert\\mathbf{u}\\rVert=\\sqrt{14},\\quad \\lVert\\mathbf{v}\\rVert=\\sqrt{17}',
  '45-02.jpg': '\\theta=\\cos^{-1}\\!\\left(\\frac{-7}{\\sqrt{14}\\sqrt{17}}\\right)\\approx117^\\circ',
  '46-0a.jpg': '\\mathbf{p}=(\\lVert\\mathbf{v}\\rVert\\cos\\theta)\\mathbf{n}=(\\mathbf{v}\\cdot\\mathbf{n})\\mathbf{n}',
  '46-0b.jpg': '\\mathbf{p}=\\operatorname{proj}_{\\mathbf{n}}(\\mathbf{v})',
  'eq46-01.jpg': '\\hat{\\mathbf{n}}=\\frac{\\mathbf{n}}{\\lVert\\mathbf{n}\\rVert}',
  'eq46-02.jpg': '\\mathbf{p}=\\operatorname{proj}_{\\mathbf{n}}(\\mathbf{v})=\\left(\\mathbf{v}\\cdot\\frac{\\mathbf{n}}{\\lVert\\mathbf{n}\\rVert}\\right)\\frac{\\mathbf{n}}{\\lVert\\mathbf{n}\\rVert}=\\frac{\\mathbf{v}\\cdot\\mathbf{n}}{\\lVert\\mathbf{n}\\rVert^2}\\mathbf{n}',
  '47-0a.jpg': '\\mathbf{w}_1=\\mathbf{v}_1-\\operatorname{proj}_{\\mathbf{w}_0}(\\mathbf{v}_1)',
  '48-0b.jpg': '\\mathbf{w}=\\mathbf{u}\\times\\mathbf{v}=(u_yv_z-u_zv_y,\\;u_zv_x-u_xv_z,\\;u_xv_y-u_yv_x)',
  '49-0a.jpg': '\\mathbf{w}\\cdot\\mathbf{u}=(0,6,-2)\\cdot(2,1,3)=0\\cdot2+6\\cdot1+(-2)\\cdot3=0',
  '50-0a.jpg': '\\mathbf{w}\\cdot\\mathbf{v}=(0,6,-2)\\cdot(2,0,0)=0\\cdot2+6\\cdot0+(-2)\\cdot0=0',
  '50-0b.jpg': '\\mathbf{u}\\cdot\\mathbf{v}=(u_x,u_y)\\cdot(-u_y,u_x)=-u_xu_y+u_yu_x=0',
  '50-0d.jpg': '\\mathbf{w}_2=\\frac{\\mathbf{w}_0\\times\\mathbf{v}_1}{\\lVert\\mathbf{w}_0\\times\\mathbf{v}_1\\rVert}',
  'eq51-01.jpg': '\\mathbf{w}_0=\\frac{\\mathbf{v}_0}{\\lVert\\mathbf{v}_0\\rVert}',
  '48-0a.jpg': '\\mathbf{w}_2=\\mathbf{v}_2-\\operatorname{proj}_{\\mathbf{w}_0}(\\mathbf{v}_2)-\\operatorname{proj}_{\\mathbf{w}_1}(\\mathbf{v}_2)',
  '48-0d.jpg': '\\begin{aligned}\\text{Base: }&\\mathbf{w}_0=\\mathbf{v}_0,\\\\1\\le i\\le n-1:\quad&\\mathbf{w}_i=\\mathbf{v}_i-\\sum_{j=0}^{i-1}\\operatorname{proj}_{\\mathbf{w}_j}(\\mathbf{v}_i),\\\\\\text{Normalize: }&\\mathbf{w}_i=\\frac{\\mathbf{w}_i}{\\lVert\\mathbf{w}_i\\rVert}.\\end{aligned}',
  'eq66-01.jpg': '\\lVert\\mathbf{u}\\rVert=\\sqrt{x^2+y^2+z^2}',
  'eq66-02.jpg': '\\hat{\\mathbf{u}}=\\frac{\\mathbf{u}}{\\lVert\\mathbf{u}\\rVert}=\\left(\\frac{x}{\\lVert\\mathbf{u}\\rVert},\\frac{y}{\\lVert\\mathbf{u}\\rVert},\\frac{z}{\\lVert\\mathbf{u}\\rVert}\\right)',
  'eq66-03.jpg': '\\mathbf{u}\\cdot\\mathbf{v}=\\lVert\\mathbf{u}\\rVert\\,\\lVert\\mathbf{v}\\rVert\\cos\\theta=u_xv_x+u_yv_y+u_zv_z',
  'eq66-04.jpg': '\\mathbf{u}\\times\\mathbf{v}=(u_yv_z-u_zv_y,\\;u_zv_x-u_xv_z,\\;u_xv_y-u_yv_x)',
  'eq67-01.jpg': '2\\mathbf{u}+\\frac{1}{2}\\mathbf{v}',
  '68-0b.jpg': 'u_xv_x+u_yv_y+u_zv_z=\\lVert\\mathbf{u}\\rVert\\,\\lVert\\mathbf{v}\\rVert\\cos\\theta',
  '68-0d.jpg': '\\lVert\\mathbf{u}\\times\\mathbf{v}\\rVert=\\lVert\\mathbf{u}\\rVert\\,\\lVert\\mathbf{v}\\rVert\\sin\\theta',
  '69-0a.jpg': '\\sqrt{\\lVert\\mathbf{u}\\rVert^2\\lVert\\mathbf{v}\\rVert^2-(\\mathbf{u}\\cdot\\mathbf{v})^2}',
  '69-0b.jpg': '\\cos^2\\theta+\\sin^2\\theta=1\\quad\\Longrightarrow\\quad\\sin\\theta=\\sqrt{1-\\cos^2\\theta}',
  '69-0c.jpg': '\\mathbf{u}\\times(\\mathbf{v}\\times\\mathbf{w})\\ne(\\mathbf{u}\\times\\mathbf{v})\\times\\mathbf{w}',
};

type SourceBlock = { kind: 'heading' | 'paragraph' | 'image' | 'code'; id: string; text: string };

export function OriginalBookText({ chapterId }: { chapterId: string }) {
  const [source, setSource] = useState('');
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let active = true;
    setSource('');
    setFailed(false);
    const loader = sourceLoaders[`../content/source/${chapterId}.txt`];
    if (!loader) {
      setFailed(true);
      return () => { active = false; };
    }
    loader().then((text) => {
      if (active) setSource(text);
    }).catch(() => {
      if (active) setFailed(true);
    });
    return () => { active = false; };
  }, [chapterId]);

  if (failed) return <div className="callout callout--warning"><b>暂时无法载入原文</b><p>请检查随书源文档是否包含在构建产物中。</p></div>;
  if (!source) return <p className="source-loading" role="status">正在载入本章原文…</p>;

  const blocks = parseSource(source, chapterId);
  return <div className="original-text">
    <div className="source-edition-note"><b>英文原文</b><span>按原书段落顺序排布；公式图可放大查看。</span></div>
    {blocks.map((block) => {
      if (block.kind === 'heading') {
        const level = block.text.startsWith('##') ? 3 : 2;
        const title = block.text.replace(/^#{1,3}\s*/, '');
        return level === 3
          ? <h3 id={block.id} key={block.id}>{decodeEntities(title)}</h3>
          : <h2 id={block.id} key={block.id}>{decodeEntities(title)}</h2>;
      }
      if (block.kind === 'image') {
        const filename = block.text;
        const latex = formulaLatex[filename];
        return latex
          ? <div id={block.id} key={block.id} className="source-equation" role="img" aria-label={`公式 ${filename}`} dangerouslySetInnerHTML={{ __html: renderToString(latex, { displayMode: true, throwOnError: false }) }} />
          : <InlineFigure key={block.id} src={`images/${filename}`} alt={`原书插图 ${filename}`} caption={`原书图片：${filename}`} />;
      }
      if (block.kind === 'code') return <pre id={block.id} key={block.id}><code>{decodeEntities(block.text)}</code></pre>;
      return <SourceParagraph id={block.id} key={block.id} text={block.text} />;
    })}
  </div>;
}

function SourceParagraph({ id, text }: { id: string; text: string }) {
  const parts = text.split(/(\[\[IMG\s+[^\]]+\]\])/g);
  return <p id={id}>{parts.map((part, index) => {
    const image = part.match(/^\[\[IMG\s+([^\]]+)\]\]$/);
    if (!image) return decodeEntities(part);
    const filename = image[1];
    const latex = formulaLatex[filename];
    if (latex) {
      return <span key={`${filename}-${index}`} className="source-inline-equation" role="img" aria-label={`公式 ${filename}`} dangerouslySetInnerHTML={{ __html: renderToString(latex, { displayMode: false, throwOnError: false }) }} />;
    }
    const src = figureAssetHref(`images/${filename}`);
    const caption = `原书图片：${filename}`;
    return <button
      key={`${filename}-${index}`}
      className="source-inline-image"
      type="button"
      data-figure="true"
      data-src={src}
      data-alt={`原书插图 ${filename}`}
      data-caption={caption}
      aria-label={`放大图片：${caption}`}
      onClick={() => window.dispatchEvent(new CustomEvent('dx12zh:open-image', { detail: { src } }))}
    ><img src={src} alt={`原书插图 ${filename}`} loading="lazy" /></button>;
  })}</p>;
}

function parseSource(source: string, chapterId: string): SourceBlock[] {
  const raw = source.replace(/\r/g, '').split(/\n\s*\n+/).map((item) => item.trim()).filter(Boolean);
  const blocks: SourceBlock[] = [];
  let blockNumber = 0;
  const add = (kind: SourceBlock['kind'], text: string) => {
    blockNumber += 1;
    blocks.push({ kind, text, id: `src-${chapterId}-p${String(blockNumber).padStart(4, '0')}` });
  };

  for (let index = 0; index < raw.length; index += 1) {
    const item = raw[index];
    if (/^#{1,3}\s/.test(item)) {
      const heading = item.replace(/^#+\s*/, '');
      add('heading', item);
      const chapterNumber = chapterId.match(/\d+/)?.[0] ?? '';
      const section = heading.match(/^(\d+)\.(\d+)(?:\.(\d+))?/);
      const existingHeading = blocks.at(-1);
      if (section && existingHeading) {
        existingHeading.id = section[3]
          ? `source-${chapterId}-${section[1]}-${section[2]}-${section[3]}`
          : `s${chapterNumber}${section[2]}`;
      }
      continue;
    }

    const image = item.match(/^\[\[IMG\s+([^\]]+)\]\]$/);
    if (image) {
      add('image', image[1]);
      continue;
    }

    if (isCodeLine(item)) {
      const code = [item];
      while (index + 1 < raw.length && isCodeLine(raw[index + 1])) {
        code.push(raw[index + 1]);
        index += 1;
      }
      add('code', code.join('\n'));
      continue;
    }

    add('paragraph', item.replace(/\s*\n\s*/g, ' '));
  }
  return blocks;
}

function isCodeLine(value: string): boolean {
  const text = value.trim();
  if (!text) return false;
  return /^(#include\b|using namespace\b|typedef\b|struct\s+\w|class\s+\w|template\s*<|inline\b|static const\b|XMVECTOR\b|XMFLOAT\d\b|FXMVECTOR\b|GXMVECTOR\b|HXMVECTOR\b|CXMVECTOR\b|void\s+\w+\s*\(|float\s+XM_CALLCONV\b|return\b|if\s*\(|else\b|for\s*\(|while\s*\(|cout\s*<<|std::|\{|\}|;\s*$|\/\/)/.test(text);
}

function decodeEntities(value: string): string {
  const named: Record<string, string> = {
    '&nbsp;': ' ', '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&apos;': "'",
    '&minus;': '−', '&ndash;': '–', '&mdash;': '—', '&times;': '×', '&middot;': '·',
    '&theta;': 'θ', '&pi;': 'π', '&alpha;': 'α', '&beta;': 'β', '&hellip;': '…',
    '&ldquo;': '“', '&rdquo;': '”', '&lsquo;': '‘', '&rsquo;': '’', '&deg;': '°',
    '&le;': '≤', '&ge;': '≥', '&ne;': '≠', '&plusmn;': '±', '&infin;': '∞',
  };
  return value
    .replace(/&(?:nbsp|amp|lt|gt|quot|apos|minus|ndash|mdash|times|middot|theta|pi|alpha|beta|hellip|ldquo|rdquo|lsquo|rsquo|deg|le|ge|ne|plusmn|infin);/g, (entity) => named[entity] ?? entity)
    .replace(/&#(\d+);/g, (_match, code: string) => String.fromCodePoint(Number(code)))
    .replace(/&#x([\da-f]+);/gi, (_match, code: string) => String.fromCodePoint(parseInt(code, 16)));
}
