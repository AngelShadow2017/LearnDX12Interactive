import { useEffect, useMemo, useState } from 'react';
import { renderToString } from 'katex';
import hljs from 'highlight.js/lib/core';
import cpp from 'highlight.js/lib/languages/cpp';
import { pageHref } from '@/content/routes';
import { InlineFigure } from './InlineFigure';
import { figureAssetHref } from './figurePath';
import { isSourceCodeParagraph, parseCodeBlock } from './sourceCodeParser';

hljs.registerLanguage('cpp', cpp);

const sourceLoaders = import.meta.glob('../content/source/*.txt', {
  query: '?raw',
  import: 'default',
}) as Record<string, () => Promise<string>>;
const oebpsSourceLoaders = import.meta.glob('../content/source-html/*.html', {
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

type LoadedSource = { format: 'oebps' | 'text'; content: string };

export function OriginalBookText({ chapterId }: { chapterId: string }) {
  const [source, setSource] = useState<LoadedSource>();
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let active = true;
    setSource(undefined);
    setFailed(false);
    const oebpsLoader = oebpsSourceLoaders[`../content/source-html/${chapterId}.html`];
    if (oebpsLoader) {
      oebpsLoader().then((content) => {
        if (active) setSource({ format: 'oebps', content });
      }).catch(() => {
        if (active) setFailed(true);
      });
      return () => { active = false; };
    }
    const loader = sourceLoaders[`../content/source/${chapterId}.txt`];
    if (!loader) {
      setFailed(true);
      return () => { active = false; };
    }
    loader().then((content) => {
      if (active) setSource({ format: 'text', content });
    }).catch(() => {
      if (active) setFailed(true);
    });
    return () => { active = false; };
  }, [chapterId]);

  if (failed) return <div className="callout callout--warning"><b>暂时无法载入原文</b><p>请检查随书源文档是否包含在构建产物中。</p></div>;
  if (!source) return <p className="source-loading" role="status">正在载入本章原文…</p>;

  if (source.format === 'oebps') {
    return <OebpsBookText html={source.content} chapterId={chapterId} />;
  }

  const blocks = parseSource(source.content, chapterId);
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

function OebpsBookText({ html, chapterId }: { html: string; chapterId: string }) {
  const renderedHtml = useMemo(() => prepareOebpsHtml(html, chapterId), [html, chapterId]);
  return <div className="original-text oebps-text">
    <div className="source-edition-note"><b>English 原文</b><span>直接采用 EPUB 的段落、代码、公式和插图结构；插图可放大查看。</span></div>
    <div
      className="oebps-content"
      onClick={(event) => {
        const target = event.target;
        if (!(target instanceof Element)) return;
        const button = target.closest<HTMLButtonElement>('[data-figure="true"]');
        if (button?.dataset.src) window.dispatchEvent(new CustomEvent('dx12zh:open-image', { detail: { src: button.dataset.src } }));
      }}
      dangerouslySetInnerHTML={{ __html: renderedHtml }}
    />
  </div>;
}

const safeBookTags = new Set([
  'A', 'B', 'BLOCKQUOTE', 'BR', 'BUTTON', 'CITE', 'CODE', 'DD', 'DIV', 'DL', 'DT',
  'EM', 'FIGCAPTION', 'FIGURE', 'H2', 'H3', 'H4', 'HR', 'I', 'LI', 'OL',
  'P', 'PRE', 'SMALL', 'SPAN', 'STRONG', 'SUB', 'SUP', 'TABLE', 'TBODY',
  'TD', 'TFOOT', 'TH', 'THEAD', 'TR', 'UL', 'IMG',
]);

function prepareOebpsHtml(source: string, chapterId: string): string {
  const document = new DOMParser().parseFromString(source, 'text/html');
  const { body } = document;
  body.querySelectorAll('script, style, link, meta, iframe, object, embed, form, input, button, svg, video, audio, source').forEach((element) => element.remove());

  // The chapter title is already shown in the app's chapter header. Keep its
  // original page and TOC anchors while dropping the EPUB's separate title page.
  if (/^ch\d{2}$/.test(chapterId)) {
    const cover = Array.from(body.children).find((element) => {
      if (element.tagName !== 'TABLE') return false;
      return Array.from(element.querySelectorAll('a[id]')).some((anchor) => anchor.id.startsWith('chap'));
    });
    if (cover) {
      const aliases = Array.from(cover.querySelectorAll<HTMLAnchorElement>('a[id]')).flatMap((anchor) => [anchor.id, ...Array.from(cover.querySelectorAll<HTMLAnchorElement>(`a[href*="#${anchor.id}"]`)).map((link) => link.hash.slice(1))]);
      const target = cover.querySelector('a[id^="chap"]');
      const tocHash = target?.getAttribute('href')?.split('#')[1];
      if (tocHash) aliases.push(tocHash);
      const afterCover = cover.nextSibling;
      cover.remove();
      for (const alias of new Set(aliases)) {
        if (!/^[\w:.-]+$/.test(alias) || document.getElementById(alias)) continue;
        const anchor = document.createElement('span');
        anchor.id = alias;
        anchor.className = 'source-anchor-alias';
        body.insertBefore(anchor, afterCover);
      }
    }
  }

  for (const paragraph of Array.from(body.querySelectorAll('p'))) {
    if (paragraph.classList.contains('h1-rule') || paragraph.classList.contains('h1-rule1') || paragraph.classList.contains('h1-rule2esbhd')) {
      paragraph.remove();
      continue;
    }
    if (paragraph.classList.contains('h1') || paragraph.classList.contains('h2')) {
      const isMajor = paragraph.classList.contains('h1');
      const heading = document.createElement(isMajor ? 'h2' : 'h3');
      const originalId = paragraph.id;
      if (originalId) heading.id = originalId;
      while (paragraph.firstChild) heading.append(paragraph.firstChild);
      heading.className = isMajor ? 'source-heading source-heading--major' : 'source-heading source-heading--minor';
      paragraph.replaceWith(heading);

      const tocHref = heading.querySelector('a[href*="toc.html#"]')?.getAttribute('href');
      const tocAlias = tocHref?.split('#')[1];
      if (tocAlias) insertSourceAnchor(document, body, heading, tocAlias);
      if (isMajor && /^ch\d{2}$/.test(chapterId)) {
        const section = heading.textContent?.match(/^(\d+)\.(\d+)\b/);
        if (section) insertSourceAnchor(document, body, heading, `s${section[1]}${section[2]}`);
      }
      if (heading.id) insertSourceAnchor(document, body, heading, originalId);
      continue;
    }
    if (!paragraph.textContent?.replace(/\u00a0/g, ' ').trim() && !paragraph.querySelector('img, a[id]')) paragraph.remove();
  }

  for (const link of Array.from(body.querySelectorAll<HTMLAnchorElement>('a[href*="toc.html#"]'))) {
    const alias = link.getAttribute('href')?.split('#')[1];
    const target = link.closest('h2, h3, p') ?? link;
    if (alias && target.parentElement) insertSourceAnchor(document, target.parentElement, target, alias);
  }

  for (const element of Array.from(body.querySelectorAll('*'))) {
    const tag = element.tagName;
    const originalClasses = Array.from(element.classList);
    if (tag === 'P') {
      if (originalClasses.includes('tx1')) element.className = 'source-prose source-prose--lead';
      else if (originalClasses.includes('tx')) element.className = 'source-prose';
      else if (originalClasses.includes('code')) element.className = 'source-code-row';
      else if (originalClasses.includes('eq')) element.className = 'source-equation';
      else if (originalClasses.includes('caption')) element.className = 'source-caption';
      else if (originalClasses.includes('example')) element.className = 'source-example-heading';
      else if (originalClasses.includes('note')) element.className = 'source-note';
      else if (originalClasses.includes('obj')) element.className = 'source-objectives-label';
      else element.removeAttribute('class');
    } else if (tag === 'SPAN' && originalClasses.includes('code')) {
      element.className = 'source-inline-code';
    } else if (tag === 'SPAN' && originalClasses.includes('sc')) {
      element.className = 'source-small-caps';
    } else if (tag === 'TABLE') {
      element.className = element.querySelector('.source-note') ? 'source-table source-table--note' : 'source-table';
    } else if (tag === 'OL' || tag === 'UL') {
      const previous = element.previousElementSibling;
      element.className = previous?.classList.contains('source-objectives-label') ? 'source-list source-list--objectives' : 'source-list';
    } else if (tag !== 'H2' && tag !== 'H3') {
      element.removeAttribute('class');
    }

    if (tag === 'A') {
      const href = element.getAttribute('href');
      if (href) {
        const safeHref = resolveBookHref(href, chapterId);
        if (safeHref) element.setAttribute('href', safeHref);
        else element.removeAttribute('href');
      }
    }

    for (const attribute of Array.from(element.attributes)) {
      const name = attribute.name.toLowerCase();
      const value = attribute.value;
      if (name === 'id' && /^[\w:.-]+$/.test(value)) continue;
      if (name === 'class' && /^source-[\w\s-]+$/.test(value)) continue;
      if (tag === 'A' && name === 'href' && /^(?:#|\.\/\?page=|https?:|mailto:)/i.test(value)) continue;
      if (tag === 'IMG' && name === 'src' && /^images\/[A-Za-z0-9_.-]+$/.test(value)) continue;
      if (tag === 'IMG' && name === 'alt') continue;
      if ((name === 'width' || name === 'height') && /^\d+(?:\.\d+)?(?:%|px)?$/.test(value)) continue;
      if ((name === 'colspan' || name === 'rowspan') && /^\d+$/.test(value)) continue;
      element.removeAttribute(attribute.name);
    }
  }

  unwrapUnsupportedElements(body);
  convertCodeRows(document, body);
  convertBookImages(document, body);
  return body.innerHTML;
}

function insertSourceAnchor(document: Document, parent: Element, before: Node, id: string): void {
  if (!/^[\w:.-]+$/.test(id) || document.getElementById(id)) return;
  const anchor = document.createElement('span');
  anchor.id = id;
  anchor.className = 'source-anchor-alias';
  anchor.setAttribute('aria-hidden', 'true');
  parent.insertBefore(anchor, before);
}

function resolveBookHref(href: string, chapterId: string): string | undefined {
  if (/^(?:https?:|mailto:)/i.test(href)) return href;
  if (href.startsWith('#')) return href;
  const [path, fragment = ''] = href.split('#', 2);
  const fileName = path.split('/').at(-1) ?? '';
  const section = fragment ? decodeURIComponent(fragment) : undefined;
  if (fileName === 'toc.html') return section ? `#${encodeURIComponent(section)}` : undefined;
  if (!fileName || fileName === `${chapterId}.html`) return section ? `#${encodeURIComponent(section)}` : undefined;
  if (/^app[A-E]\.html$/i.test(fileName)) return pageHref('appendix.html', section, 'original');
  if (/^(?:ch\d{2}|intro)\.html$/i.test(fileName)) return pageHref(fileName, section, 'original');
  if (fileName === 'index.html') return pageHref('index.html', section, 'original');
  return undefined;
}

function convertCodeRows(document: Document, container: Element): void {
  let current: ChildNode | null = container.firstChild;
  while (current) {
    if (current.nodeType === Node.ELEMENT_NODE && (current as Element).classList.contains('source-code-row')) {
      const first = current as Element;
      const rows: Element[] = [];
      const skippedWhitespace: ChildNode[] = [];
      let cursor: ChildNode | null = current;
      while (cursor) {
        if (cursor.nodeType === Node.TEXT_NODE && !cursor.textContent?.trim()) {
          skippedWhitespace.push(cursor);
          cursor = cursor.nextSibling;
          continue;
        }
        if (cursor.nodeType !== Node.ELEMENT_NODE || !(cursor as Element).classList.contains('source-code-row')) break;
        rows.push(cursor as Element);
        cursor = cursor.nextSibling;
      }

      const codeText = rows.map((row) => (row.textContent ?? '').replace(/\u00a0/g, ' ').replace(/[\t ]+$/g, '')).join('\n');
      const pre = document.createElement('pre');
      pre.className = 'source-code-block';
      if (first.id) pre.id = first.id;
      const code = document.createElement('code');
      code.className = 'hljs language-cpp';
      code.innerHTML = hljs.highlight(codeText, { language: 'cpp' }).value;
      pre.append(code);
      const pageIds = new Set(rows.flatMap((row) => [row.id, ...Array.from(row.querySelectorAll('[id]')).map((anchor) => anchor.id)]));
      for (const id of pageIds) {
        if (!id || id === pre.id) continue;
        const anchor = document.createElement('span');
        anchor.id = id;
        anchor.className = 'source-anchor-alias';
        pre.append(anchor);
      }
      container.insertBefore(pre, first);
      for (const row of rows) row.remove();
      for (const whitespace of skippedWhitespace) whitespace.remove();
      current = cursor;
      continue;
    }
    if (current.nodeType === Node.ELEMENT_NODE) convertCodeRows(document, current as Element);
    current = current.nextSibling;
  }
}

function convertBookImages(document: Document, body: Element): void {
  for (const image of Array.from(body.querySelectorAll('img'))) {
    const rawPath = image.getAttribute('src') ?? '';
    const fileName = rawPath.split('/').at(-1) ?? '';
    if (!/^[A-Za-z0-9_.-]+$/.test(fileName)) {
      image.remove();
      continue;
    }
    if (/^(hand|note|hint|cabarij)\.jpg$/i.test(fileName)) {
      if (fileName.toLowerCase() === 'hand.jpg') {
        image.remove();
      } else {
        const marker = document.createElement('span');
        marker.className = 'source-marker';
        marker.textContent = fileName.replace(/\.jpg$/i, '');
        image.replaceWith(marker);
      }
      continue;
    }

    const latex = formulaLatex[fileName];
    if (latex) {
      const displayMode = image.closest('.source-equation') !== null;
      const formula = document.createElement(displayMode ? 'div' : 'span');
      formula.className = displayMode ? 'source-equation--latex' : 'source-inline-equation';
      formula.setAttribute('role', 'img');
      formula.setAttribute('aria-label', `Formula ${fileName}`);
      formula.innerHTML = renderToString(latex, { displayMode, throwOnError: false });
      image.replaceWith(formula);
      continue;
    }

    const captionElement = image.closest('.source-caption');
    const followingCaption = captionElement?.nextElementSibling?.classList.contains('source-caption')
      ? captionElement.nextElementSibling
      : undefined;
    const caption = (followingCaption?.textContent ?? captionElement?.textContent ?? '').replace(/\s+/g, ' ').trim() || `Original book image ${fileName}`;
    const alt = image.getAttribute('alt');
    const accessibleAlt = alt && alt.toLowerCase() !== 'image' ? alt : caption;
    const width = image.getAttribute('width');
    if (width && /^\d+(?:\.\d+)?(?:%|px)?$/.test(width)) image.style.width = /^\d/.test(width) && !/[a-z%]$/i.test(width) ? `${width}px` : width;
    image.setAttribute('src', figureAssetHref(`images/${fileName}`));
    image.setAttribute('alt', accessibleAlt);
    image.setAttribute('loading', 'lazy');

    const blockImage = Boolean(image.closest('.source-caption, .source-equation'));
    const button = document.createElement('button');
    button.type = 'button';
    button.className = blockImage ? 'source-image-open source-image-open--block' : 'source-inline-image';
    button.dataset.figure = 'true';
    button.dataset.src = figureAssetHref(`images/${fileName}`);
    button.dataset.alt = accessibleAlt;
    button.dataset.caption = caption;
    button.setAttribute('aria-label', `Enlarge image: ${caption}`);
    button.append(image);
    image.replaceWith(button);
  }
}

function unwrapUnsupportedElements(container: Element): void {
  for (const element of Array.from(container.querySelectorAll('*')).reverse()) {
    if (safeBookTags.has(element.tagName)) continue;
    if (['SCRIPT', 'STYLE', 'IFRAME', 'OBJECT', 'EMBED', 'SVG', 'VIDEO', 'AUDIO'].includes(element.tagName)) {
      element.remove();
      continue;
    }
    element.replaceWith(...Array.from(element.childNodes));
  }
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
    if (itemLines.length > 1 && /^(-\s+|\d+\.\s+|\([a-z]\)\s+)/i.test(itemLines[0]) && itemLines.slice(1).some(isSourceCodeParagraph)) {
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

    const codeBlock = parseCodeBlock(raw, index);
    if (codeBlock) {
      add('code', codeBlock.text);
      index = codeBlock.nextIndex - 1;
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
