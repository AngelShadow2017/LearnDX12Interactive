import { lazy, Suspense, useCallback, useEffect, useRef, useState, type ComponentType } from 'react';
import { MDXProvider } from '@mdx-js/react';
import { bookParts, chapters, chapterByRoute, sampleUrl, type Chapter, type SectionLink } from '@/content/catalog';
import { referencePages } from '@/content/pages';
import { pageHref, routeFromLocation } from '@/content/routes';
import { mdxComponents } from '@/components/ContentBlocks';
import { ImageLightbox } from '@/components/InlineFigure';
import { OriginalBookText } from '@/components/OriginalBookText';
import { ProgressBackup } from '@/components/ProgressBackup';
import { TableOfContents } from '@/components/TableOfContents';
import { ProgressProvider, useProgress } from '@/progress/ProgressProvider';

type LessonModule = { default: ComponentType };
const lessonModules = import.meta.glob('../content/chapters/*.mdx', { eager: true }) as Record<string, LessonModule>;
const translationLoaders = import.meta.glob('../content/translations/*.mdx') as Record<string, () => Promise<LessonModule>>;
const translationModules = Object.fromEntries(
  Object.entries(translationLoaders).map(([path, loader]) => [path, lazy(loader)]),
) as Record<string, ComponentType>;
const translationProgress: Record<string, string> = {
  ch01: '已完成', ch02: '已完成', intro: '录入中', appendix: '录入中',
};
type ReadingMode = 'teaching' | 'translation' | 'original';

function currentMode(): ReadingMode {
  const requested = new URLSearchParams(window.location.search).get('mode');
  return requested === 'translation' || requested === 'original' ? requested : 'teaching';
}

function currentRoute(): string {
  return routeFromLocation(window.location.pathname, window.location.search);
}

function currentPage(route: string): { title: string; sections: SectionLink[]; chapter?: Chapter; reference?: typeof referencePages[keyof typeof referencePages] } {
  const chapter = chapterByRoute.get(route);
  if (chapter) return { title: `第 ${chapter.number} 章 ${chapter.title}`, sections: chapter.sections, chapter };
  if (route === 'intro.html') return { ...referencePages['intro.html'], reference: referencePages['intro.html'] };
  if (route === 'appendix.html') return { ...referencePages['appendix.html'], reference: referencePages['appendix.html'] };
  return { title: 'DirectX 12 交互教材', sections: [] };
}

function AppShell() {
  const route = currentRoute();
  const mode = currentMode();
  const page = currentPage(route);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrollPercent, setScrollPercent] = useState(0);
  const { setLastVisited } = useProgress();
  const mobileMenuButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    document.title = `${page.title} · DirectX 12 交互教材`;
    const update = () => {
      const root = document.documentElement;
      const distance = root.scrollHeight - root.clientHeight;
      setScrollPercent(distance > 0 ? Math.min(100, (root.scrollTop / distance) * 100) : 0);
    };
    window.addEventListener('scroll', update, { passive: true });
    update();
    return () => window.removeEventListener('scroll', update);
  }, [page.title]);

  useEffect(() => {
    setLastVisited(route, window.location.hash.slice(1) || undefined);
    const onHashChange = () => setLastVisited(route, window.location.hash.slice(1) || undefined);
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, [route, setLastVisited]);

  useEffect(() => {
    if (!window.location.hash) return;
    const timer = window.setTimeout(() => document.getElementById(window.location.hash.slice(1))?.scrollIntoView(), 80);
    return () => window.clearTimeout(timer);
  }, [route]);

  const onNavigate = useCallback(() => {
    setMobileMenuOpen(false);
    mobileMenuButtonRef.current?.focus();
  }, []);

  return (
    <div className="app-shell">
      <div className="read-progress" aria-hidden="true"><span style={{ width: `${scrollPercent}%` }} /></div>
      <header className="topbar">
        <button ref={mobileMenuButtonRef} className="mobile-menu-button" type="button" aria-expanded={mobileMenuOpen} aria-controls="site-toc" onClick={() => setMobileMenuOpen((open) => !open)}>
          <span aria-hidden="true">☰</span><span className="sr-only">{mobileMenuOpen ? '关闭目录' : '打开目录'}</span>
        </button>
        <a className="topbar__wordmark" href={pageHref('index.html')}><span className="wordmark-icon">D</span><span>DX12 <em>学习工作台</em></span></a>
        <div className="topbar__right"><span className="topbar__edition">交互教材 · 中文导读</span><ProgressBackup /></div>
      </header>

      <div className="workbench">
        <TableOfContents route={route} sections={page.sections} chapter={page.chapter} mobileOpen={mobileMenuOpen} onNavigate={onNavigate} />
        <main className="main-content" id="main-content">
          {page.chapter || page.reference
            ? <ReaderPage route={route} mode={mode} {...page} />
            : <HomePage />}
        </main>
      </div>
      <ImageLightbox />
      <footer className="site-footer"><span>DirectX 12 交互教材</span><span>沿着概念推演，再回到真实代码</span></footer>
    </div>
  );
}

function ReaderPage({ route, title, sections, chapter, reference, mode }: { route: string; title: string; sections: SectionLink[]; chapter?: Chapter; reference?: typeof referencePages[keyof typeof referencePages]; mode: ReadingMode }) {
  const { chapter: getProgress, markRead, markPracticeDone } = useProgress();
  const progress = chapter ? getProgress(chapter.id) : undefined;
  const sample = chapter ? sampleUrl(chapter) : undefined;
  const lessonPath = chapter ? `../content/chapters/${chapter.id}.mdx` : `../content/chapters/${route.replace('.html', '.mdx')}`;
  const Lesson = lessonModules[lessonPath]?.default;
  const contentId = chapter?.id ?? (route === 'intro.html' ? 'intro' : route === 'appendix.html' ? 'appendix' : undefined);
  const translationPath = contentId ? `../content/translations/${contentId}.mdx` : '';
  const Translation = translationModules[translationPath];

  useEffect(() => {
    const sentinel = document.getElementById('reading-complete-sentinel');
    if (!chapter || !sentinel || !('IntersectionObserver' in window)) return;
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) markRead(chapter.id);
    }, { threshold: 0.1 });
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [chapter, markRead]);

  return (
    <article className="reader-page">
      <div className="reader-crumbs"><a href={pageHref('index.html')}>课程首页</a><span aria-hidden="true">/</span><span>{chapter ? `第 ${chapter.number} 章 · ${bookParts[chapter.part - 1].title}` : reference?.title}</span></div>
      <header className="chapter-hero">
        <div className="chapter-hero__meta">
          {chapter ? <><span className="eyebrow">PART 0{chapter.part} / CHAPTER {String(chapter.number).padStart(2, '0')}</span><span className="time-pill">◷ {chapter.minutes} 分钟</span></> : <span className="eyebrow">学习指南</span>}
        </div>
        <h1>{title}</h1>
        <p className="chapter-hero__summary">{chapter?.summary ?? reference?.description}</p>
        {chapter && <>
          <div className="learning-goals">
            <div><span className="learning-goals__label">学完你可以</span><ul>{chapter.goals.map((goal) => <li key={goal}>{goal}</li>)}</ul></div>
            {sample ? <a className="sample-link" href={sample} target="_blank" rel="noreferrer"><span>查看本章示例代码</span><b aria-hidden="true">↗</b></a> : <span className="sample-link sample-link--muted">本章以网页推演和代码片段练习</span>}
          </div>
          {progress && <div className="chapter-status" aria-label="本章进度">
            <span className={progress.read ? 'is-complete' : ''}><i>{progress.read ? '✓' : '1'}</i> 已阅读</span>
            <span className={progress.conceptPassed ? 'is-complete' : ''}><i>{progress.conceptPassed ? '✓' : '2'}</i> 概念过关</span>
            <span className={progress.practiceDone ? 'is-complete' : ''}><i>{progress.practiceDone ? '✓' : '3'}</i> 代码实践</span>
          </div>}
        </>}
      </header>

      {(chapter || reference) && <nav className="reading-modes" aria-label="阅读模式">
        <a className={mode === 'teaching' ? 'is-current' : ''} href={pageHref(route)} aria-current={mode === 'teaching' ? 'page' : undefined}>互动讲解</a>
        <a className={mode === 'translation' ? 'is-current' : ''} href={pageHref(route, undefined, 'translation')} aria-current={mode === 'translation' ? 'page' : undefined}>完整译文{(!Translation || (contentId && translationProgress[contentId])) && <small>{(contentId && translationProgress[contentId]) ?? '录入中'}</small>}</a>
        <a className={mode === 'original' ? 'is-current' : ''} href={pageHref(route, undefined, 'original')} aria-current={mode === 'original' ? 'page' : undefined}>English 原文</a>
      </nav>}

      <div className="reading-grid">
        <div className="lesson-column">
          {mode === 'original' && (chapter || reference)
            ? <div className="lesson-content">{chapter ? <OriginalBookText chapterId={chapter.id} /> : <ReferenceOriginalBookText route={route} />}</div>
            : mode === 'translation' && contentId
              ? Translation
                ? <MDXProvider components={mdxComponents}><Suspense fallback={<p className="translation-loading" role="status">正在载入译文…</p>}><div className="lesson-content translation-content"><Translation /></div></Suspense></MDXProvider>
                : <div className="lesson-content translation-pending"><div className="callout callout--note"><b>{reference ? '本部分完整译文正在录入' : '本章完整译文正在录入'}</b><p>译文会按原书顺序保留正文、推导、示例、代码说明、图注、总结与练习；完成后可随时切回互动讲解或英文原文。</p></div></div>
              : Lesson
                ? <MDXProvider components={mdxComponents}><div className="lesson-content"><Lesson /></div></MDXProvider>
                : <FrameworkPlaceholder chapter={chapter} reference={reference} sections={sections} />}
          <div className="chapter-finish" id="chapter-finish">
            <span className="eyebrow">PAUSE & APPLY</span>
            <h2>{chapter ? '把这一章用出来' : '继续你的学习路线'}</h2>
            <p>{chapter ? '完成章节内容阶段加入的检查题，再去真实示例里改一次代码。你可以按自己的节奏学习，不需要解锁下一章。' : '章节正文和练习会在内容阶段填入；目录、页面布局、图片和学习状态接口已经准备好。'}</p>
            {chapter && <div className="chapter-finish__actions">
              {progress?.conceptPassed
                ? <span className="button button--done">✓ 概念过关（应用题达标）</span>
                : <span className="button button--outline button--static">完成上方应用题，答对 80% 自动标记概念过关</span>}
              <button className={`button ${progress?.practiceDone ? 'button--done' : 'button--outline'}`} type="button" onClick={() => markPracticeDone(chapter.id)}>{progress?.practiceDone ? '✓ 已完成实践' : '我已运行本章示例'}</button>
            </div>}
          </div>
          <div className="chapter-pager">
            {chapter ? <>
              {chapter.number > 1 ? <a href={pageHref(`ch${String(chapter.number - 1).padStart(2, '0')}.html`)}><small>上一章</small><span>第 {chapter.number - 1} 章 · {chapters[chapter.number - 2].title}</span></a> : <a href={pageHref('intro.html')}><small>开始之前</small><span>导读与工程准备</span></a>}
              {chapter.number < 23 ? <a className="chapter-pager__next" href={pageHref(`ch${String(chapter.number + 1).padStart(2, '0')}.html`)}><small>下一章</small><span>第 {chapter.number + 1} 章 · {chapters[chapter.number].title}</span></a> : <a className="chapter-pager__next" href={pageHref('appendix.html')}><small>继续查阅</small><span>附录与速查</span></a>}
            </> : <a href={pageHref('index.html')}><small>课程首页</small><span>选择一章开始学习</span></a>}
          </div>
          <div id="reading-complete-sentinel" className="reading-end" aria-label="本章阅读结束">本章阅读到这里</div>
        </div>
        <aside className="reader-aside" aria-label="学习提示">
          {chapter && <div className="aside-card aside-card--warm">
            <span className="eyebrow">本章小节</span>
            <h3>{chapter.title}</h3>
            <ol className="aside-outline">
              {chapter.sections.map((section) => <li key={section.id}><a href={`#${section.id}`}>{section.title}</a></li>)}
            </ol>
          </div>}
          <div className="aside-card">
            <span className="eyebrow">学习节奏</span>
            <h3>读一点，动一下</h3>
            <p>每看到一幅图或一段代码，先预测下一步会发生什么，再展开解释。</p>
          </div>
          {progress && <div className="aside-card">
            <span className="eyebrow">当前状态</span>
            <h3>{progress.conceptPassed ? '概念已过关' : progress.read ? '已读完，正在应用' : '还没开始'}</h3>
            <p>已完成的互动 {progress.activities.length} 项。章末应用题答对 80% 自动标记概念过关。</p>
          </div>}
          {sample && <a className="aside-toc-link" href={sample} target="_blank" rel="noreferrer">打开本章示例代码 <span>↗</span></a>}
          <a className="aside-toc-link" href="#chapter-finish">跳到本章练习 <span>↓</span></a>
        </aside>
      </div>
    </article>
  );
}

function ReferenceOriginalBookText({ route }: { route: string }) {
  if (route === 'intro.html') return <OriginalBookText chapterId="intro" />;

  const appendices = ['appA', 'appB', 'appC', 'appD', 'appE'];
  return <div className="original-appendices">
    {appendices.map((chapterId, index) => <section id={`appendix-${String.fromCharCode(97 + index)}`} key={chapterId}>
      <OriginalBookText chapterId={chapterId} />
    </section>)}
  </div>;
}

function FrameworkPlaceholder({ chapter, reference, sections }: { chapter?: Chapter; reference?: typeof referencePages[keyof typeof referencePages]; sections: SectionLink[] }) {
  return <div className="lesson-content framework-placeholder">
    <div className="callout callout--note"><b>教学内容接口已就绪</b><p>另一位 AI 可以在对应章节 MDX 文件中填入讲解、正文插图、动手推演和自测题。所有旧章节锚点已在目录清单中预留。</p></div>
    {chapter && <section className="lesson-section lesson-section--intro">
      <h2>本章学习路线</h2>
      <p>{chapter.summary}建议先回忆概念，再沿着小节目录逐步学习。每节会围绕一个图形问题展开，并连接到可运行的 D3D12 示例。</p>
      <ul>{chapter.goals.map((goal) => <li key={goal}>{goal}</li>)}</ul>
    </section>}
    {sections.map((section) => <section className="lesson-section lesson-section--stub" id={section.id} key={section.id}>
      <span className="eyebrow">{chapter ? `第 ${chapter.number} 章` : '参考资料'}</span>
      <h2>{section.title}</h2>
      <p>本节正文、相邻原书插图和互动练习将在内容阶段接入。</p>
    </section>)}
    {reference?.route === 'appendix.html' && <CalloutForAppendix />}
  </div>;
}

function CalloutForAppendix() {
  return <div className="callout callout--tip"><b>速查用途</b><p>遇到具体问题时从目录进入；附录内容不会阻断章节学习进度。</p></div>;
}

function HomePage() {
  const { state, chapter: getProgress } = useProgress();
  const resume = state.lastVisited?.route && state.lastVisited.route !== 'index.html' ? state.lastVisited.route : 'intro.html';
  const passedCount = chapters.filter((chapter) => getProgress(chapter.id).conceptPassed).length;
  const readCount = chapters.filter((chapter) => getProgress(chapter.id).read).length;

  return <div className="home-page">
    <section className="home-hero">
      <div className="home-hero__copy">
        <span className="eyebrow">INTERACTIVE STUDY GUIDE · DIRECTX 12</span>
        <h1>把图形学原理，<br /><em>重新接回代码。</em></h1>
        <p>先预测，再操作，再把结果带进 D3D12 示例。按自己的节奏，把这本书真正学会。</p>
        <div className="home-hero__actions"><a className="button button--accent" href={pageHref(resume)}>{resume === 'intro.html' ? '从导读开始' : '继续上次学习'} <span aria-hidden="true">→</span></a><a className="button button--outline" href="#course-map">查看全书路线</a></div>
      </div>
      <div className="orbit-art" aria-hidden="true"><div className="orbit-art__axis orbit-art__axis--x" /><div className="orbit-art__axis orbit-art__axis--y" /><div className="orbit-art__axis orbit-art__axis--z" /><div className="orbit-art__ring orbit-art__ring--one" /><div className="orbit-art__ring orbit-art__ring--two" /><div className="orbit-art__core" /><span className="orbit-art__label orbit-art__label--x">x</span><span className="orbit-art__label orbit-art__label--y">y</span><span className="orbit-art__label orbit-art__label--z">z</span></div>
      <div className="home-hero__progress"><span>你的学习记录</span><div><b>{readCount}</b><small>/ 23 章已读</small><i /><b>{passedCount}</b><small>/ 23 章概念过关</small></div></div>
    </section>

    <section className="course-map" id="course-map">
      <div className="section-heading"><div><span className="eyebrow">THE LEARNING PATH</span><h2>从公式到完整场景</h2></div><p>三部分循序渐进。每章都有可操作的图解，以及对应的 Windows 代码练习。</p></div>
      {bookParts.map((part) => <div className="home-part" key={part.id}>
        <div className="home-part__heading"><span className="home-part__number">0{part.id}</span><div><h3>{part.title}</h3><p>{part.description}</p></div><span className="home-part__range">CHAPTERS {part.range}</span></div>
        <div className="chapter-grid">{chapters.filter((chapter) => chapter.part === part.id).map((chapter) => {
          const progress = getProgress(chapter.id);
          const status = progress.conceptPassed ? '概念过关' : progress.read ? '已阅读' : '尚未开始';
          return <a className="course-card" href={pageHref(chapter.route)} key={chapter.id}>
            <div className="course-card__top"><span>第 {String(chapter.number).padStart(2, '0')} 章</span><span className={`course-card__status ${progress.conceptPassed ? 'is-passed' : ''}`}>{status}</span></div>
            <h4>{chapter.title}</h4><p>{chapter.summary}</p>
            <div className="course-card__bottom"><span>{chapter.minutes} 分钟</span><span aria-hidden="true">↗</span></div>
          </a>;
        })}</div>
      </div>)}
      <div className="home-extra-links"><a href={pageHref('intro.html')}>导读：环境和学习路线 <span>→</span></a><a href={pageHref('appendix.html')}>附录：需要时查阅 <span>→</span></a></div>
    </section>
  </div>;
}

export function App() {
  return <ProgressProvider><AppShell /></ProgressProvider>;
}
