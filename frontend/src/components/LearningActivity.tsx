import { useState, type ReactNode } from 'react';
import { useProgress } from '@/progress/ProgressProvider';

export type ActivityCheckResult = { passed: boolean; feedback: string };

type LearningActivityProps = {
  id: string;
  chapterId: string;
  title: string;
  prompt: string;
  hint?: string;
  explanation: string;
  check?: () => ActivityCheckResult;
  children: ReactNode;
};

export function LearningActivity({ id, chapterId, title, prompt, hint, explanation, check, children }: LearningActivityProps) {
  const { chapter, markActivity } = useProgress();
  const [showHint, setShowHint] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [result, setResult] = useState<ActivityCheckResult | null>(null);
  const done = chapter(chapterId).activities.includes(id);

  function submit() {
    if (!check) {
      setShowExplanation(true);
      return;
    }
    const nextResult = check();
    setResult(nextResult);
    if (nextResult.passed) markActivity(chapterId, id);
  }

  return (
    <section className="activity" aria-labelledby={`${id}-title`} data-activity-id={id}>
      <div className="activity__eyebrow"><span className="activity__spark" aria-hidden="true">✳</span> 动手推演</div>
      <h3 id={`${id}-title`}>{title}</h3>
      <p className="activity__prompt">{prompt}</p>
      <div className="activity__workbench">{children}</div>
      <div className="activity__actions">
        {hint && <button className="button button--quiet" type="button" onClick={() => setShowHint((value) => !value)}>{showHint ? '收起提示' : '给我一点提示'}</button>}
        <button className="button button--accent" type="button" onClick={submit}>{check ? '检查我的推演' : '查看解释'}</button>
        {done && <span className="activity__done">✓ 已完成</span>}
      </div>
      {showHint && hint && <p className="activity__hint"><b>提示</b>{hint}</p>}
      {result && <p className={`activity__feedback ${result.passed ? 'is-correct' : 'is-incorrect'}`} role="status">{result.feedback}</p>}
      {showExplanation && <div className="activity__explanation"><b>为什么会这样</b><p>{explanation}</p></div>}
      {!check && showExplanation && !done && <button className="button button--quiet" type="button" onClick={() => markActivity(chapterId, id)}>我已完成这次推演</button>}
    </section>
  );
}

type MiniQuizProps = {
  id: string;
  chapterId: string;
  question: string;
  options: string[];
  answer: number;
  explanation: string;
};

export function MiniQuiz({ id, chapterId, question, options, answer, explanation }: MiniQuizProps) {
  const { chapter, markActivity } = useProgress();
  const [selected, setSelected] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const done = chapter(chapterId).activities.includes(id);
  const correct = submitted && selected === answer;

  return (
    <section className="mini-quiz" aria-labelledby={`${id}-question`} data-activity-id={id}>
      <p className="mini-quiz__label">停下来想一想</p>
      <h3 id={`${id}-question`}>{question}</h3>
      <div className="mini-quiz__options" role="radiogroup" aria-labelledby={`${id}-question`}>
        {options.map((option, index) => (
          <label className={`quiz-option ${selected === index ? 'is-selected' : ''}`} key={option}>
            <input type="radio" name={id} value={index} checked={selected === index} onChange={() => { setSelected(index); setSubmitted(false); }} />
            <span>{option}</span>
          </label>
        ))}
      </div>
      <button className="button button--accent" type="button" disabled={selected === null} onClick={() => {
        setSubmitted(true);
        if (selected === answer) markActivity(chapterId, id);
      }}>确认答案</button>
      {submitted && <p className={`quiz-feedback ${correct ? 'is-correct' : 'is-incorrect'}`} role="status">
        {correct ? `答对了。${explanation}` : `再想一步：${explanation}`}
      </p>}
      {done && <span className="sr-only">本题已完成</span>}
    </section>
  );
}
