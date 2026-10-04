import { useEffect, useRef, useState } from 'react';
import { bookParts, chapters, type Chapter, type SectionLink } from '@/content/catalog';
import { pageHref } from '@/content/routes';
import { useProgress } from '@/progress/ProgressProvider';

type Props = { route: string; sections: SectionLink[]; chapter?: Chapter; mobileOpen: boolean; onNavigate?: () => void };

export function TableOfContents({ route, sections, chapter, mobileOpen, onNavigate }: Props) {
  const [activeSection, setActiveSection] = useState('');
  const asideRef = useRef<HTMLElement>(null);
  const { chapter: getChapterProgress } = useProgress();

  useEffect(() => {
    setActiveSection(window.location.hash.slice(1));
    const observed = sections.map(({ id }) => document.getElementById(id)).filter((element): element is HTMLElement => Boolean(element));
    if (!('IntersectionObserver' in window) || observed.length === 0) return;
    const observer = new IntersectionObserver((entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (visible?.target.id) setActiveSection(visible.target.id);
    }, { rootMargin: '-15% 0px -70% 0px', threshold: [0, 0.25, 0.6] });
    observed.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [route, sections]);

  useEffect(() => {
    if (!mobileOpen) return;
    asideRef.current?.querySelector<HTMLElement>('a')?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onNavigate?.();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [mobileOpen, onNavigate]);

  return (
    <>
      {mobileOpen && <button className="toc-scrim" aria-label="关闭目录" type="button" onClick={onNavigate} />}
      <aside ref={asideRef} id="site-toc" className={`toc ${mobileOpen ? 'toc--open' : ''}`} aria-label="全书目录">
        <div className="toc__topline"><a className="toc__brand" href={pageHref('index.html')}>DX12 学习工作台</a><span>目录</span></div>
        <a className={`toc__intro ${route === 'intro.html' ? 'is-current' : ''}`} href={pageHref('intro.html')} onClick={onNavigate}>开始之前 <span>导读</span></a>
        {bookParts.map((part) => (
          <section className="toc__part" key={part.id}>
            <div className="toc__part-heading"><span>第 {part.id} 部分</span><b>{part.title}</b></div>
            <nav aria-label={`${part.title}章节`}>
              {chapters.filter((item) => item.part === part.id).map((item) => {
                const progress = getChapterProgress(item.id);
                const current = item.route === route;
                return <div className={`toc__chapter ${current ? 'is-current' : ''}`} key={item.id}>
                  <a href={pageHref(item.route)} onClick={onNavigate} aria-current={current ? 'page' : undefined}>
                    <span className="toc__chapter-number">{String(item.number).padStart(2, '0')}</span>
                    <span className="toc__chapter-title">{item.title}</span>
                    <span className={`toc__status ${progress.conceptPassed ? 'is-passed' : progress.read ? 'is-read' : ''}`} aria-label={progress.conceptPassed ? '概念过关' : progress.read ? '已阅读' : '未开始'}>{progress.conceptPassed ? '✓' : progress.read ? '·' : ''}</span>
                  </a>
                  {current && <ol className="toc__sections">{sections.map((section) => <li key={section.id}>
                    <a className={activeSection === section.id ? 'is-active' : ''} href={`#${section.id}`} onClick={onNavigate}>{section.title}</a>
                  </li>)}</ol>}
                </div>;
              })}
            </nav>
          </section>
        ))}
        <a className={`toc__appendix ${route === 'appendix.html' ? 'is-current' : ''}`} href={pageHref('appendix.html')} onClick={onNavigate}>附录与速查 <span>A—E</span></a>
        {chapter && <div className="toc__legend"><i /> 已阅读 <i className="toc__legend-passed" /> 概念过关</div>}
      </aside>
    </>
  );
}
