import { useState, type ReactNode } from 'react';
import { pageHref } from '@/content/routes';

export type Exercise = { id: string; chapter: string; question: string; hint: string; answer: ReactNode };

type Props = { exercises: Exercise[] };

/** 附录 D：习题答案默认折叠，先给提示再给答案。 */
export function ExerciseAnswers({ exercises }: Props) {
  const [openHint, setOpenHint] = useState<string[]>([]);
  const [openAnswer, setOpenAnswer] = useState<string[]>([]);

  function toggle(list: string[], id: string, setter: (next: string[]) => void) {
    setter(list.includes(id) ? list.filter((item) => item !== id) : [...list, id]);
  }

  return (
    <section className="exercise-list" aria-labelledby="exercise-answers">
      {exercises.map((exercise) => {
        const hintOpen = openHint.includes(exercise.id);
        const answerOpen = openAnswer.includes(exercise.id);
        return <article className="exercise" key={exercise.id}>
          <header>
            <a className="exercise__chapter" href={pageHref(exercise.chapter)}>{exercise.chapter}</a>
            <p className="exercise__question">{exercise.question}</p>
          </header>
          <div className="activity__actions">
            <button className="button button--quiet" type="button" aria-expanded={hintOpen}
              onClick={() => toggle(openHint, exercise.id, setOpenHint)}>
              {hintOpen ? '收起提示' : '先看提示'}
            </button>
            <button className="button button--quiet" type="button" aria-expanded={answerOpen}
              onClick={() => toggle(openAnswer, exercise.id, setOpenAnswer)}>
              {answerOpen ? '收起答案' : '直接看答案'}
            </button>
          </div>
          {hintOpen && <p className="activity__hint"><b>提示</b>{exercise.hint}</p>}
          {answerOpen && <div className="activity__explanation"><b>答案与思路</b>{exercise.answer}</div>}
        </article>;
      })}
    </section>
  );
}
