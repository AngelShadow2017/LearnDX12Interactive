import { useState, type ReactNode } from 'react';
import { useProgress } from '@/progress/ProgressProvider';

export type PredictStep = {
  question: string;
  options: string[];
  answer: number;
  hint?: string;
  /** 预测正确时的回应，说明“为什么你猜对了”。 */
  correctNote?: string;
  /** 预测错误时针对误解原因的说明。 */
  wrongNote: string;
};

type ActivityFrameProps = {
  id: string;
  chapterId: string;
  title: string;
  prompt: string;
  predict?: PredictStep;
  children: ReactNode;
  onReset?: () => void;
  check?: () => { passed: boolean; feedback: string };
  explanation: ReactNode;
  apply?: ReactNode;
  hint?: string;
};

/**
 * 全书互动的统一骨架：先预测 → 再操作 → 看解释 → 回到代码。
 * 每一步都单独记录状态，读者可以只做其中一段，也可以反复复位重来。
 */
export function ActivityFrame({
  id, chapterId, title, prompt, predict, children, onReset, check, explanation, apply, hint,
}: ActivityFrameProps) {
  const { chapter, markActivity, unmarkActivity } = useProgress();
  const done = chapter(chapterId).activities.includes(id);

  const [prediction, setPrediction] = useState<number | null>(null);
  const [predictionLocked, setPredictionLocked] = useState(false);
  const [result, setResult] = useState<{ passed: boolean; feedback: string } | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const predictionDone = chapter(chapterId).activities.includes(`${id}:predict`);

  function submitPrediction() {
    if (prediction === null) return;
    setPredictionLocked(true);
    if (prediction === predict?.answer) markActivity(chapterId, `${id}:predict`);
    else unmarkActivity(chapterId, `${id}:predict`);
  }

  function submitCheck() {
    if (!check) {
      setShowExplanation(true);
      return;
    }
    const next = check();
    setResult(next);
    setShowExplanation(true);
    if (next.passed) markActivity(chapterId, id);
    else unmarkActivity(chapterId, id);
  }

  const manipulationUnlocked = !predict || predictionLocked;

  return (
    <section className="activity" aria-labelledby={`${id}-title`} data-activity-id={id}>
      <div className="activity__eyebrow"><span className="activity__spark" aria-hidden="true">✳</span> 动手推演</div>
      <h3 id={`${id}-title`}>{title}</h3>
      <p className="activity__prompt">{prompt}</p>

      {predict && <div className="activity__step">
        <header><i aria-hidden="true">1</i><span>先预测</span>{predictionDone && <b className="activity__step-done">✓ 已预测</b>}</header>
        <p className="activity__question">{predict.question}</p>
        <div className="activity__options" role="radiogroup" aria-label={predict.question}>
          {predict.options.map((option, index) => <label key={option} className={`quiz-option ${prediction === index ? 'is-selected' : ''}`}>
            <input type="radio" name={`${id}-predict`} checked={prediction === index} onChange={() => { setPrediction(index); setPredictionLocked(false); }} />
            <span>{option}</span>
          </label>)}
        </div>
        <div className="activity__actions">
          <button className="button button--accent" type="button" disabled={prediction === null} onClick={submitPrediction}>确认预测</button>
          {!predictionLocked && <button className="button button--quiet" type="button" onClick={() => setPredictionLocked(true)}>跳过预测，直接操作</button>}
          {predict.hint && <button className="button button--quiet" type="button" onClick={() => setShowHint((value) => !value)}>{showHint ? '收起提示' : '给我一点提示'}</button>}
        </div>
        {showHint && predict.hint && <p className="activity__hint"><b>提示</b>{predict.hint}</p>}
        {predictionLocked && prediction !== null && <p className={`quiz-feedback ${prediction === predict.answer ? 'is-correct' : 'is-incorrect'}`} role="status">
          {prediction === predict.answer
            ? `预测正确。${predict.correctNote ?? predict.wrongNote}`
            : `先记住这个结论，下面动手验证：${predict.wrongNote}`}
        </p>}
      </div>}

      <div className={`activity__step ${manipulationUnlocked ? '' : 'is-locked'}`}>
        <header><i aria-hidden="true">2</i><span>动手操作</span>{done && <b className="activity__step-done">✓ 已完成</b>}</header>
        {manipulationUnlocked
          ? <>
            <div className="activity__workbench">{children}</div>
            <div className="activity__actions">
              <button className="button button--accent" type="button" onClick={submitCheck}>{check ? '检查我的推演' : '查看解释'}</button>
              {onReset && <button className="button button--quiet" type="button" onClick={() => { onReset(); setResult(null); }}>复位</button>}
              {hint && <button className="button button--quiet" type="button" onClick={() => setShowHint((value) => !value)}>{showHint ? '收起提示' : '给我一点提示'}</button>}
            </div>
            {showHint && hint && <p className="activity__hint"><b>提示</b>{hint}</p>}
            {result && <p className={`activity__feedback ${result.passed ? 'is-correct' : 'is-incorrect'}`} role="status">{result.feedback}</p>}
          </>
          : <p className="activity__locked">先在第 1 步给出一个预测，再回来操作；也可以点“跳过预测”。</p>}
      </div>

      <div className="activity__step">
        <header><i aria-hidden="true">3</i><span>为什么会这样</span></header>
        {showExplanation
          ? <div className="activity__explanation">{explanation}</div>
          : <div className="activity__actions"><button className="button button--outline" type="button" onClick={() => setShowExplanation(true)}>查看解释</button></div>}
      </div>

      {apply && <div className="activity__step">
        <header><i aria-hidden="true">4</i><span>回到代码</span></header>
        <div className="activity__apply">{apply}</div>
      </div>}
    </section>
  );
}
