import type { ComponentProps, HTMLAttributes } from 'react';
import { renderToString } from 'katex';
import { LearningActivity, MiniQuiz } from './LearningActivity';
import { InlineFigure } from './InlineFigure';
import { ChapterCheckpoint } from './ChapterCheckpoint';
import { PracticeCard } from './PracticeCard';
import { CodeSample } from './CodeSample';

type CalloutProps = HTMLAttributes<HTMLDivElement> & { tone?: 'note' | 'tip' | 'warning' };

export function Callout({ tone = 'note', className = '', ...props }: CalloutProps) {
  return <aside className={`callout callout--${tone} ${className}`} {...props} />;
}

type FigureProps = ComponentProps<typeof InlineFigure>;
export function Figure(props: FigureProps) {
  return <InlineFigure {...props} />;
}

type MathBlockProps = { tex: string };
export function MathBlock({ tex }: MathBlockProps) {
  const html = renderToString(tex, { displayMode: true, throwOnError: false });
  return <div className="math-block" dangerouslySetInnerHTML={{ __html: html }} />;
}

export const mdxComponents = {
  Figure,
  MathBlock,
  Activity: LearningActivity,
  MiniQuiz,
  Callout,
  Checkpoint: ChapterCheckpoint,
  Practice: PracticeCard,
  CodeSample,
};
