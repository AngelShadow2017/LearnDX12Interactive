import { useEffect, useMemo, useState } from 'react';
import { useProgress } from '@/progress/ProgressProvider';

export type CheckQuestion = {
  id: string;
  question: string;
  options: string[];
  answer: number;
  explanation: string;
};

const PASS_RATIO = 0.8;

/** 章末应用题：答对率到 80% 就自动标记“概念过关”。 */
export function ChapterCheckpoint({ chapterId, questions, intro }: { chapterId: string; questions: CheckQuestion[]; intro?: string }) {
  const { chapter, markActivity, unmarkActivity, markConceptPassed } = useProgress();
  const progress = chapter(chapterId);

  const stored = useMemo(() => {
    const map = new Map<string, { index: number; correct: boolean }>();
    for (const entry of progress.activities) {
      const match = /^chk:([^:]+):(\d+):([01])$/.exec(entry);
      if (match) map.set(match[1], { index: Number(match[2]), correct: match[3] === '1' });
    }
    return map;
  }, [progress.activities]);

  const [answers, setAnswers] = useState<Record<string, number | null>>(() => {
    const initial: Record<string, number | null> = {};
    for (const question of questions) initial[question.id] = stored.get(question.id)?.index ?? null;
    return initial;
  });

  const correctCount = questions.filter((question) => stored.get(question.id)?.correct).length;
  const ratio = questions.length === 0 ? 0 : correctCount / questions.length;
  const passed = ratio >= PASS_RATIO;

  useEffect(() => {
    if (passed) markConceptPassed(chapterId);
  }, [passed, chapterId, markConceptPassed]);

  function submit(question: CheckQuestion) {
    const index = answers[question.id];
    if (index === null) return;
    const stale = progress.activities.find((entry) => entry.startsWith(`chk:${question.id}:`));
    if (stale) unmarkActivity(chapterId, stale);
    markActivity(chapterId, `chk:${question.id}:${index}:${index === question.answer ? 1 : 0}`);
  }

  return (
    <section className="checkpoint" aria-labelledby={`${chapterId}-checkpoint`}>
      <div className="checkpoint__head">
        <span className="eyebrow">CHAPTER CHECKPOINT</span>
        <h2 id={`${chapterId}-checkpoint`}>应用题</h2>
        {intro && <p>{intro}</p>}
        <p className="checkpoint__score" role="status">
          已答对 <b>{correctCount}</b> / {questions.length} 题（{Math.round(PASS_RATIO * 100)}% 即标记概念过关）
          {passed && <span className="checkpoint__badge">✓ 概念过关</span>}
        </p>
      </div>
      <ol className="checkpoint__list">
        {questions.map((question) => {
          const record = stored.get(question.id);
          const selected = answers[question.id];
          return <li className="check-question" key={question.id}>
            <p className="check-question__title">{question.question}</p>
            <div className="check-question__options" role="radiogroup" aria-label={question.question}>
              {question.options.map((option, index) => {
                const chosen = selected === index;
                const revealed = record && record.index === index;
                const mark = revealed && index === question.answer ? ' ✓' : revealed && record.correct === false ? ' ✕' : '';
                return <label key={option} className={`quiz-option ${chosen ? 'is-selected' : ''} ${revealed && index === question.answer ? 'is-answer' : ''}`}>
                  <input type="radio" name={`${chapterId}-${question.id}`} checked={chosen === true} onChange={() => setAnswers((current) => ({ ...current, [question.id]: index }))} />
                  <span>{option}{mark}</span>
                </label>;
              })}
            </div>
            <div className="check-question__actions">
              <button className="button button--accent" type="button" disabled={selected === null} onClick={() => submit(question)}>
                {record ? '重新提交' : '确认答案'}
              </button>
            </div>
            {record && <p className={`quiz-feedback ${record.correct ? 'is-correct' : 'is-incorrect'}`} role="status">
              {record.correct ? '答对了。' : '再想一步：'}{question.explanation}
            </p>}
          </li>;
        })}
      </ol>
    </section>
  );
}
