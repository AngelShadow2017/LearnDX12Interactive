import type { ComponentProps, HTMLAttributes } from 'react';
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

export const mdxComponents = {
  Figure,
  Activity: LearningActivity,
  MiniQuiz,
  Callout,
  Checkpoint: ChapterCheckpoint,
  Practice: PracticeCard,
  CodeSample,
};
