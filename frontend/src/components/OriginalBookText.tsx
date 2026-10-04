import { useEffect, useState } from 'react';
import { renderToString } from 'katex';
import hljs from 'highlight.js/lib/core';
import cpp from 'highlight.js/lib/languages/cpp';
import { InlineFigure } from './InlineFigure';
import { figureAssetHref } from './figurePath';

hljs.registerLanguage('cpp', cpp);

const sourceLoaders = import.meta.glob('../content/source/*.txt', {
  query: '?raw',
  import: 'default',
}) as Record<string, () => Promise<string>>;

// Equations transcribed while the corresponding chapter was being translated.
// Unreviewed formula artwork remains available as a zoomable source image.
const formulaLatex: Record<string, string> = {
  'eq82-01.jpg': 'A^{-1}=\\frac{A^*}{\\det A}\\tag{2.6}',
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
  'eq45-01.jpg': '\\mathbf{u}\\cdot\\mathbf{v}=-7,\\qquad \\lVert\\mathbf{u}\\rVert=\\sqrt{14},\\quad \\lVert\\mathbf{v}\\rVert=\\sqrt{17}',
  'eq45-02.jpg': '\\cos\\theta=\\frac{\\mathbf{u}\\cdot\\mathbf{v}}{\\lVert\\mathbf{u}\\rVert\\,\\lVert\\mathbf{v}\\rVert}=\\frac{-7}{\\sqrt{14}\\sqrt{17}},\\quad \\theta=\\cos^{-1}\\!\\left(\\frac{-7}{\\sqrt{14}\\sqrt{17}}\\right)\\approx117^\\circ',
  '46-0a.jpg': '\\mathbf{p}=(\\lVert\\mathbf{v}\\rVert\\cos\\theta)\\mathbf{n}=(\\mathbf{v}\\cdot\\mathbf{n})\\mathbf{n}',
  '46-0b.jpg': '\\mathbf{p}=\\operatorname{proj}_{\\mathbf{n}}(\\mathbf{v})',
  '46-0d.jpg': '\\mathbf{v}=\\mathbf{p}+\\mathbf{w}=\\operatorname{proj}_{\\mathbf{n}}(\\mathbf{v})+\\operatorname{perp}_{\\mathbf{n}}(\\mathbf{v})',
  'eq46-01.jpg': '\\hat{\\mathbf{n}}=\\frac{\\mathbf{n}}{\\lVert\\mathbf{n}\\rVert}',
  'eq46-02.jpg': '\\mathbf{p}=\\operatorname{proj}_{\\mathbf{n}}(\\mathbf{v})=\\left(\\mathbf{v}\\cdot\\frac{\\mathbf{n}}{\\lVert\\mathbf{n}\\rVert}\\right)\\frac{\\mathbf{n}}{\\lVert\\mathbf{n}\\rVert}=\\frac{\\mathbf{v}\\cdot\\mathbf{n}}{\\lVert\\mathbf{n}\\rVert^2}\\mathbf{n}',
  '47-0a.jpg': '\\mathbf{w}_1=\\mathbf{v}_1-\\operatorname{proj}_{\\mathbf{w}_0}(\\mathbf{v}_1)',
  '48-0b.jpg': '\\mathbf{w}=\\mathbf{u}\\times\\mathbf{v}=(u_yv_z-u_zv_y,\\;u_zv_x-u_xv_z,\\;u_xv_y-u_yv_x)',
  '49-0a.jpg': '\\mathbf{w}\\cdot\\mathbf{u}=(0,6,-2)\\cdot(2,1,3)=0\\cdot2+6\\cdot1+(-2)\\cdot3=0',
  '50-0a.jpg': '\\mathbf{w}\\cdot\\mathbf{v}=(0,6,-2)\\cdot(2,0,0)=0\\cdot2+6\\cdot0+(-2)\\cdot0=0',
  '50-0b.jpg': '\\mathbf{u}\\cdot\\mathbf{v}=(u_x,u_y)\\cdot(-u_y,u_x)=-u_xu_y+u_yu_x=0',
  '50-0d.jpg': '\\mathbf{w}_2=\\frac{\\mathbf{w}_0\\times\\mathbf{v}_1}{\\lVert\\mathbf{w}_0\\times\\mathbf{v}_1\\rVert}',
  'eq51-01.jpg': '\\mathbf{w}_0=\\frac{\\mathbf{v}_0}{\\lVert\\mathbf{v}_0\\rVert}',
  'eq52-01.jpg': '\\mathbf{u}+\\mathbf{v}=(u_x+v_x,\\;u_y+v_y,\\;u_z+v_z)',
  '48-0a.jpg': '\\mathbf{w}_2=\\mathbf{v}_2-\\operatorname{proj}_{\\mathbf{w}_0}(\\mathbf{v}_2)-\\operatorname{proj}_{\\mathbf{w}_1}(\\mathbf{v}_2)',
  '48-0d.jpg': '\\begin{aligned}\\text{Base: }&\\mathbf{w}_0=\\mathbf{v}_0,\\\\1\\le i\\le n-1:\quad&\\mathbf{w}_i=\\mathbf{v}_i-\\sum_{j=0}^{i-1}\\operatorname{proj}_{\\mathbf{w}_j}(\\mathbf{v}_i),\\\\\\text{Normalize: }&\\mathbf{w}_i=\\frac{\\mathbf{w}_i}{\\lVert\\mathbf{w}_i\\rVert}.\\end{aligned}',
  'eq66-01.jpg': '\\lVert\\mathbf{u}\\rVert=\\sqrt{x^2+y^2+z^2}',
  'eq66-02.jpg': '\\hat{\\mathbf{u}}=\\frac{\\mathbf{u}}{\\lVert\\mathbf{u}\\rVert}=\\left(\\frac{x}{\\lVert\\mathbf{u}\\rVert},\\frac{y}{\\lVert\\mathbf{u}\\rVert},\\frac{z}{\\lVert\\mathbf{u}\\rVert}\\right)',
  'eq66-03.jpg': '\\mathbf{u}\\cdot\\mathbf{v}=\\lVert\\mathbf{u}\\rVert\\,\\lVert\\mathbf{v}\\rVert\\cos\\theta=u_xv_x+u_yv_y+u_zv_z',
  'eq66-04.jpg': '\\mathbf{u}\\times\\mathbf{v}=(u_yv_z-u_zv_y,\\;u_zv_x-u_xv_z,\\;u_xv_y-u_yv_x)',
  'eq67-01.jpg': '2\\mathbf{u}+\\frac{1}{2}\\mathbf{v}',
  '68-0b.jpg': 'u_xv_x+u_yv_y+u_zv_z=\\lVert\\mathbf{u}\\rVert\\,\\lVert\\mathbf{v}\\rVert\\cos\\theta',
  'eq68-01.jpg': '\\begin{aligned}\\mathbf{v}\\cdot\\mathbf{v}&=v_xv_x+v_yv_y+v_zv_z\\\\&=v_x^2+v_y^2+v_z^2\\\\&=\\left(\\sqrt{v_x^2+v_y^2+v_z^2}\\right)^2=\\lVert\\mathbf{v}\\rVert^2.\\end{aligned}',
  '68-0d.jpg': '\\lVert\\mathbf{u}\\times\\mathbf{v}\\rVert=\\lVert\\mathbf{u}\\rVert\\,\\lVert\\mathbf{v}\\rVert\\sin\\theta',
  '69-0a.jpg': '\\sqrt{\\lVert\\mathbf{u}\\rVert^2\\lVert\\mathbf{v}\\rVert^2-(\\mathbf{u}\\cdot\\mathbf{v})^2}',
  '69-0b.jpg': '\\cos^2\\theta+\\sin^2\\theta=1\\quad\\Longrightarrow\\quad\\sin\\theta=\\sqrt{1-\\cos^2\\theta}',
  '69-0c.jpg': '\\mathbf{u}\\times(\\mathbf{v}\\times\\mathbf{w})\\ne(\\mathbf{u}\\times\\mathbf{v})\\times\\mathbf{w}',
};

export type SourceBlock =
  | { kind: 'heading' | 'paragraph' | 'code' | 'example' | 'caption' | 'marker'; id: string; text: string }
  | { kind: 'image'; id: string; text: string; caption?: string; figureNumber?: string }
  | { kind: 'list' | 'objectives'; id: string; ordered: boolean; items: string[] };

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
          : <InlineFigure key={block.id} src={`images/${filename}`} alt={block.caption ?? `Original book figure ${filename}`} caption={block.caption ?? `Original book image: ${filename}`} figureNumber={block.figureNumber} />;
      }
      if (block.kind === 'marker') return <span className="source-marker" aria-label={block.text.replace('.jpg', '')} title={block.text.replace('.jpg', '')} key={block.id}>{block.text === 'hand.jpg' ? 'Example' : block.text.replace('.jpg', '')}</span>;
      if (block.kind === 'example') return <h4 className="source-example-heading" id={block.id} key={block.id}><span>Worked example</span>{block.text}</h4>;
      if (block.kind === 'caption') return <p className="source-caption" id={block.id} key={block.id}>{renderInline(block.text)}</p>;
      if (block.kind === 'code') return <pre id={block.id} key={block.id}><code className="hljs language-cpp" dangerouslySetInnerHTML={{ __html: hljs.highlight(decodeEntities(block.text), { language: 'cpp' }).value }} /></pre>;
      if (block.kind === 'list' || block.kind === 'objectives') {
        const List = block.ordered ? 'ol' : 'ul';
        return <section id={block.id} key={block.id} className={block.kind === 'objectives' ? 'source-objectives' : 'source-list'}>
          {block.kind === 'objectives' && <h3>Chapter objectives</h3>}
          <List>{block.items.map((item, index) => <li key={`${block.id}-${index}`}>{renderInline(item)}</li>)}</List>
        </section>;
      }
      if (block.kind !== 'paragraph') return null;
      return <SourceParagraph id={block.id} key={block.id} text={block.text} />;
    })}
  </div>;
}

function SourceParagraph({ id, text }: { id: string; text: string }) {
  return <p id={id}>{renderInline(text)}</p>;
}

function renderInline(text: string) {
  const parts = text.split(/(\[\[IMG\s+[^\]]+\]\])/g);
  return parts.map((part, index) => {
    const image = part.match(/^\[\[IMG\s+([^\]]+)\]\]$/);
    if (!image) return decodeEntities(part);
    const filename = image[1];
    const latex = formulaLatex[filename];
    if (latex) {
      return <span key={`${filename}-${index}`} className="source-inline-equation" role="img" aria-label={`公式 ${filename}`} dangerouslySetInnerHTML={{ __html: renderToString(latex, { displayMode: false, throwOnError: false }) }} />;
    }
    const src = figureAssetHref(`images/${filename}`);
    const caption = `原书图片：${filename}`;
    if (/^(hand|note|hint|cabarij)\.jpg$/i.test(filename)) return <span className="source-marker" key={`${filename}-${index}`} aria-label={filename.replace('.jpg', '')} title={filename.replace('.jpg', '')}>{filename === 'hand.jpg' ? '✎' : filename === 'note.jpg' ? 'Note' : filename === 'hint.jpg' ? 'Hint' : 'Definition'}</span>;
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
  });
}

export function parseSource(source: string, chapterId: string): SourceBlock[] {
  const raw = source.replace(/\r/g, '').split(/\n\s*\n+/).map((item) => item.trim()).filter(Boolean);
  const blocks: SourceBlock[] = [];
  let blockNumber = 0;
  const add = (kind: 'heading' | 'paragraph' | 'image' | 'code' | 'example' | 'caption' | 'marker', text: string) => {
    blockNumber += 1;
    blocks.push({ kind, text, id: `src-${chapterId}-p${String(blockNumber).padStart(4, '0')}` });
  };

  // The app already displays the chapter title. Drop only the repeated masthead;
  // retain the chapter's introductory paragraphs and objectives.
  const objectivesIndex = raw.findIndex((item) => /^Objectives\s*:/i.test(item));
  const chapterMarkerIndex = raw.findIndex((item) => /^Chapter\s+\d+\s*$/i.test(item));
  let startAt = chapterMarkerIndex >= 0 ? chapterMarkerIndex + 1 : 0;
  while (startAt < raw.length && (/^[-–—]+$/.test(raw[startAt]) || /^[A-Z\d][A-Z\d\s:&',.()/-]*$/.test(raw[startAt]))) startAt += 1;
  if (objectivesIndex >= 0) startAt = Math.min(startAt, objectivesIndex);

  for (let index = startAt; index < raw.length; index += 1) {
    let item = raw[index];
    const itemLines = item.split('\n');
    if (itemLines.length > 1 && /^(-\s+|\d+\.\s+|\([a-z]\)\s+)/i.test(itemLines[0]) && itemLines.slice(1).some(isCodeLine)) {
      raw.splice(index, 1, ...itemLines);
      item = raw[index];
    }
    if (/^Objectives\s*:/i.test(item)) {
      const objectiveItems: string[] = [];
      while (index + 1 < raw.length && /^-\s+/.test(raw[index + 1])) {
        index += 1;
        objectiveItems.push(raw[index].replace(/^-\s+/, '').replace(/\s*\n\s*/g, ' '));
      }
      if (objectiveItems.length) {
        blockNumber += 1;
        blocks.push({ kind: 'objectives', items: objectiveItems, ordered: false, id: `src-${chapterId}-objectives` });
      }
      continue;
    }
    if (/^#{1,3}\s/.test(item)) {
      const heading = item.replace(/^#+\s*/, '');
      add('heading', item);
      const chapterNumber = String(Number(chapterId.match(/\d+/)?.[0] ?? 0));
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
      if (image[1] === 'hand.jpg' && /^Example\s+\d+(?:\.\d+)?\s*$/i.test(raw[index + 1] ?? '')) continue;
      if (/^(hand|note|hint|cabarij)\.jpg$/i.test(image[1])) add('marker', image[1]);
      else {
        const figure = raw[index + 1]?.match(/^Figure\s+(\d+(?:\.\d+)?)\.?\s+(.+)$/is);
        if (/^Fig\d+-\d+\.jpg$/i.test(image[1]) && figure) {
          blockNumber += 1;
          blocks.push({ kind: 'image', text: image[1], figureNumber: `Figure ${figure[1]}`, caption: figure[2].replace(/\s*\n\s*/g, ' '), id: `src-${chapterId}-p${String(blockNumber).padStart(4, '0')}` });
          index += 1;
        } else {
          blockNumber += 1;
          blocks.push({ kind: 'image', text: image[1], id: `src-${chapterId}-p${String(blockNumber).padStart(4, '0')}` });
        }
      }
      continue;
    }

    if (/^Example\s+\d+(?:\.\d+)?\s*$/i.test(item)) {
      add('example', item.replace(/^Example\s+/i, ''));
      continue;
    }

    if (/^Figure\s+\d+(?:\.\d+)?\.?\s/i.test(item)) {
      add('caption', item.replace(/\s*\n\s*/g, ' '));
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

    const normalized = item.replace(/\s*\n\s*/g, ' ');
    if (/^(-\s+|\d+\.\s+|\([a-z]\)\s+)/i.test(normalized)) {
      const firstMarker = normalized.match(/^(-\s+|\d+\.\s+|\([a-z]\)\s+)/i)?.[0] ?? '';
      const ordered = /^\d+\./.test(firstMarker);
      const items = [normalized.replace(/^(-\s+|\d+\.\s+|\([a-z]\)\s+)/i, '').trim()];
      const previous = blocks.at(-1);
      if (previous?.kind === 'list' && previous.ordered === ordered) previous.items.push(...items);
      else {
        blockNumber += 1;
        blocks.push({ kind: 'list', items, ordered, id: `src-${chapterId}-list${String(blockNumber).padStart(4, '0')}` });
      }
      continue;
    }

    add('paragraph', normalized);
  }
  return blocks;
}

function isCodeLine(value: string): boolean {
  const text = value.trim();
  if (!text) return false;
  return /^(#\s*(include|if|ifdef|ifndef|elif|else|endif|define|pragma)\b|using namespace\b|namespace\b|typedef\b|struct(?:\s+\w+)?\b|union\b|class\s+\w|template\s*<|inline\b|static const\b|XMVECTOR\b|XMFLOAT\d\b|FXMVECTOR\b|GXMVECTOR\b|HXMVECTOR\b|CXMVECTOR\b|void\s+\w+\s*\(|float\s+XM_CALLCONV\b|return\b|operator\b|if\s*\(|else\b|for\s*\(|while\s*\(|cout\s*<<|std::|ComPtr\s*<|\.{3}$|\{|\}|;\s*(?:\/\/.*)?$|\/\/)/.test(text)
    || /^(?:u?int(?:8|16|32|64)_t|float\d?|double|bool|char|HRESULT|BOOL|UINT|auto|const|static|explicit|__declspec)\b/.test(text)
    || /^[A-Z_]\w*\s*(?:\([^;]*\)|&\s*operator\b)/.test(text)
    // Function signatures may be wrapped across source paragraphs before the
    // closing parenthesis. Keep the opening line in the same code block.
    || /^[A-Z_]\w*\s*\([^;]*$/.test(text)
    // The source text extractor separates code lines with blank lines. These
    // syntax markers keep common Direct3D declarations and calls together as
    // code instead of rendering them as ordinary prose paragraphs.
    || /^(?:[A-Za-z_]\w*(?:->|::)|(?:HRESULT|void|BOOL|UINT)\s+\w+::\w+\s*\()/.test(text)
    || /^[A-Z][A-Z0-9_]+[,)]?$/.test(text);
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
