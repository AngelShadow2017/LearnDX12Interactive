import type { ReactNode } from 'react';

/** 滑块：始终显示当前数值，键盘可用（原生 range）。 */
export function Slider({ label, min, max, step = 1, value, onChange, format }: {
  label: string;
  min: number;
  max: number;
  step?: number;
  value: number;
  onChange: (next: number) => void;
  format?: (value: number) => string;
}) {
  return <label className="ctl ctl--slider">
    <span className="ctl__label">{label}<b>{format ? format(value) : value}</b></span>
    <input type="range" min={min} max={max} step={step} value={value} onChange={(event) => onChange(Number(event.target.value))} />
  </label>;
}

export type ChoiceOption<T extends string> = { value: T; label: string; hint?: string };

/** 分段选择：用单选按钮实现，方向键可切换，选中状态不只靠颜色区分。 */
export function Choice<T extends string>({ label, options, value, onChange }: {
  label: string;
  options: ReadonlyArray<ChoiceOption<T>>;
  value: T;
  onChange: (next: T) => void;
}) {
  return <fieldset className="ctl ctl--choice">
    <legend className="ctl__label">{label}</legend>
    <div className="ctl__segments">
      {options.map((option) => <label key={option.value} className={`segment ${value === option.value ? 'is-active' : ''}`}>
        <input type="radio" name={`${label}-${option.value}`} checked={value === option.value} onChange={() => onChange(option.value)} />
        <span>{option.label}</span>
        {option.hint && <small>{option.hint}</small>}
      </label>)}
    </div>
  </fieldset>;
}

export function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (next: boolean) => void }) {
  return <label className="ctl ctl--toggle">
    <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} />
    <span>{label}</span>
  </label>;
}

/** 数字输入框：用于「填写某个坐标」这类需要读者自己算的任务。 */
export function NumberField({ label, value, onChange, step = 0.1 }: {
  label: string;
  value: number;
  onChange: (next: number) => void;
  step?: number;
}) {
  return <label className="ctl ctl--number">
    <span className="ctl__label">{label}</span>
    <input type="number" step={step} value={Number.isFinite(value) ? value : ''} onChange={(event) => onChange(Number(event.target.value))} />
  </label>;
}

/**
 * 可重排的步骤列表。用「上移 / 下移」按钮而不是拖拽，
 * 这样键盘和读屏用户也能完成同样的任务。
 */
export function OrderList({ items, onChange, label }: {
  items: { id: string; text: string }[];
  onChange: (next: { id: string; text: string }[]) => void;
  label: string;
}) {
  function move(index: number, delta: number) {
    const target = index + delta;
    if (target < 0 || target >= items.length) return;
    const next = [...items];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  }
  return <ol className="order-list" aria-label={label}>
    {items.map((item, index) => <li key={item.id}>
      <span className="order-list__index" aria-hidden="true">{index + 1}</span>
      <span className="order-list__text">{item.text}</span>
      <span className="order-list__buttons">
        <button type="button" className="button button--quiet" disabled={index === 0} onClick={() => move(index, -1)} aria-label={`把「${item.text}」上移`}>↑</button>
        <button type="button" className="button button--quiet" disabled={index === items.length - 1} onClick={() => move(index, 1)} aria-label={`把「${item.text}」下移`}>↓</button>
      </span>
    </li>)}
  </ol>;
}

/** 只读数值面板：把互动中的关键量摆在一起，便于对照公式。 */
export function Readout({ items }: { items: ReadonlyArray<[string, string]> }) {
  return <dl className="readout">{items.map(([key, value]) => <div key={key}><dt>{key}</dt><dd>{value}</dd></div>)}</dl>;
}

export function Panel({ title, children }: { title?: string; children: ReactNode }) {
  return <div className="ctl-panel">{title && <span className="ctl-panel__title">{title}</span>}{children}</div>;
}

/** 数学坐标 → SVG 坐标：y 轴向上，原点在画布中心。 */
export const svgPoint = (x: number, y: number, unit = 40): { x: number; y: number } => ({ x: 160 + x * unit, y: 160 - y * unit });

/** SVG 画布坐标 → 数学坐标（处理指针拖动）。 */
export function svgToMath(event: { clientX: number; clientY: number }, svg: SVGSVGElement, unit = 40): { x: number; y: number } {
  const rect = svg.getBoundingClientRect();
  const scaleX = 320 / rect.width;
  const scaleY = 320 / rect.height;
  const px = (event.clientX - rect.left) * scaleX;
  const py = (event.clientY - rect.top) * scaleY;
  return { x: (px - 160) / unit, y: (160 - py) / unit };
}

/** 4×4 行主序矩阵的可读展示。highlight 里传要强调的格子下标（0..15）。 */
export function MatrixGrid({ matrix, highlight = [] }: { matrix: ReadonlyArray<number>; highlight?: number[] }) {
  return <>
    <div className="matrix-grid">
      {Array.from({ length: 16 }, (_unused, index) => <span key={index} className={highlight.includes(index) ? 'is-highlight' : undefined}>
        {formatCell(matrix[index])}
      </span>)}
    </div>
    <p className="matrix-caption">按行主序显示：m[r·4 + c]，与 DirectXMath 的 r[0]…r[3] 一致</p>
  </>;
}

function formatCell(value: number): string {
  if (Number.isInteger(value)) return String(value);
  return String(Number(value.toFixed(3)));
}

/** 二维 SVG 场景的公共外框，含网格与坐标轴说明。 */
export function PlaneGrid({ size = 220, step = 20 }: { size?: number; step?: number }) {
  const lines: ReactNode[] = [];
  for (let index = -size; index <= size; index += step) {
    lines.push(<line key={`v${index}`} x1={index} y1={-size} x2={index} y2={size} />);
    lines.push(<line key={`h${index}`} x1={-size} y1={index} x2={size} y2={index} />);
  }
  return <g className="plane-grid">{lines}</g>;
}
