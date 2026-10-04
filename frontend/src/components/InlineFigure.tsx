import { useEffect, useRef, useState } from 'react';
import { figureAssetHref } from './figurePath';

export type InlineFigureProps = { src: string; alt: string; caption: string; figureNumber?: string };

export function InlineFigure({ src, alt, caption, figureNumber }: InlineFigureProps) {
  const normalizedSrc = figureAssetHref(src);
  const [failed, setFailed] = useState(false);

  useEffect(() => setFailed(false), [normalizedSrc]);

  return (
    <figure className="inline-figure">
      {failed ? (
        <div className="inline-figure__missing" role="img" aria-label={`${alt}（图片暂不可用）`}>
          <span>图片暂不可用</span><small>{figureNumber ?? caption}</small>
        </div>
      ) : (
        <button
          className="inline-figure__open"
          type="button"
          data-figure="true"
          data-src={normalizedSrc}
          data-alt={alt}
          data-caption={caption}
          aria-label={`放大图片：${caption}`}
          onClick={() => window.dispatchEvent(new CustomEvent('dx12zh:open-image', { detail: { src: normalizedSrc } }))}
        >
          <img src={normalizedSrc} alt={alt} loading="lazy" onError={() => setFailed(true)} />
          <span className="inline-figure__zoom" aria-hidden="true">放大查看</span>
        </button>
      )}
      <figcaption>{figureNumber && <span className="inline-figure__number">{figureNumber}　</span>}{caption}</figcaption>
    </figure>
  );
}

type FigureRecord = { src: string; alt: string; caption: string };

function currentFigures(): FigureRecord[] {
  return Array.from(document.querySelectorAll<HTMLButtonElement>('[data-figure="true"]')).map((button) => ({
    src: button.dataset.src ?? '',
    alt: button.dataset.alt ?? '',
    caption: button.dataset.caption ?? '',
  }));
}

export function ImageLightbox() {
  const [figures, setFigures] = useState<FigureRecord[]>([]);
  const [index, setIndex] = useState(0);
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const returnFocusRef = useRef<HTMLElement | null>(null);
  const dialogRef = useRef<HTMLElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onOpen = (event: Event) => {
      const detail = (event as CustomEvent<{ src: string }>).detail;
      const items = currentFigures();
      const foundIndex = items.findIndex((item) => item.src === detail.src);
      returnFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      setFigures(items);
      setIndex(Math.max(0, foundIndex));
      setScale(1);
      setOffset({ x: 0, y: 0 });
    };
    window.addEventListener('dx12zh:open-image', onOpen);
    return () => window.removeEventListener('dx12zh:open-image', onOpen);
  }, []);

  const active = figures[index];
  useEffect(() => {
    if (!active) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeViewer();
      if (event.key === 'ArrowRight') setIndex((current) => (current + 1) % figures.length);
      if (event.key === 'ArrowLeft') setIndex((current) => (current - 1 + figures.length) % figures.length);
      if (event.key === 'Tab') {
        const focusable = dialogRef.current?.querySelectorAll<HTMLElement>('button:not(:disabled)') ?? [];
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [active, figures.length]);

  useEffect(() => {
    if (!active) {
      returnFocusRef.current?.focus();
      return;
    }
    closeButtonRef.current?.focus();
    setScale(1);
    setOffset({ x: 0, y: 0 });
  }, [active?.src]);

  if (!active) return null;
  function closeViewer() {
    setFigures([]);
  }
  const changeScale = (next: number) => setScale(Math.min(4, Math.max(0.5, next)));

  return (
    <div className="lightbox" role="presentation" onClick={closeViewer}>
      <section ref={dialogRef} className="lightbox__dialog" role="dialog" aria-modal="true" aria-label="图片查看器" onClick={(event) => event.stopPropagation()}>
        <div className="lightbox__toolbar">
          <span>{index + 1} / {figures.length}</span>
          <div className="lightbox__tools">
            <button type="button" aria-label="缩小图片" onClick={() => changeScale(scale - 0.25)}>−</button>
            <button type="button" aria-label="放大图片" onClick={() => changeScale(scale + 0.25)}>＋</button>
            <button type="button" onClick={() => { setScale(1); setOffset({ x: 0, y: 0 }); }}>原始大小</button>
            <button ref={closeButtonRef} className="lightbox__close" type="button" aria-label="关闭图片" onClick={closeViewer}>关闭 <span aria-hidden="true">×</span></button>
          </div>
        </div>
        <div className="lightbox__stage" onWheel={(event) => { event.preventDefault(); changeScale(scale + (event.deltaY < 0 ? 0.1 : -0.1)); }}>
          {figures.length > 1 && <button className="lightbox__nav lightbox__nav--prev" aria-label="上一张" type="button" onClick={() => setIndex((index - 1 + figures.length) % figures.length)}>‹</button>}
          <img
            src={active.src}
            alt={active.alt}
            draggable={false}
            style={{ transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})` }}
            onPointerDown={(event) => {
              if (scale <= 1) return;
              const start = { x: event.clientX, y: event.clientY, offsetX: offset.x, offsetY: offset.y };
              event.currentTarget.setPointerCapture(event.pointerId);
              const move = (moveEvent: PointerEvent) => setOffset({ x: start.offsetX + moveEvent.clientX - start.x, y: start.offsetY + moveEvent.clientY - start.y });
              const stop = () => {
                window.removeEventListener('pointermove', move);
                window.removeEventListener('pointerup', stop);
              };
              window.addEventListener('pointermove', move);
              window.addEventListener('pointerup', stop, { once: true });
            }}
          />
          {figures.length > 1 && <button className="lightbox__nav lightbox__nav--next" aria-label="下一张" type="button" onClick={() => setIndex((index + 1) % figures.length)}>›</button>}
        </div>
        <p className="lightbox__caption">{active.caption}</p>
        <p className="lightbox__keyboard-hint">滚轮缩放 · 放大后拖动 · ← / → 切换 · Esc 关闭</p>
      </section>
    </div>
  );
}
