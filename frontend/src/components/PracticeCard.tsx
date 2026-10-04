import { useState } from 'react';
import { chapterById, sampleUrl, type Chapter } from '@/content/catalog';
import { useProgress } from '@/progress/ProgressProvider';

type PracticeCardProps = {
  chapterId: string;
  title: string;
  /** 仓库内的具体目录；缺省用章节清单里的示例路径。 */
  repoPath?: string;
  /** 直接给出仓库地址（导读等非章节页面用）。 */
  repoUrl?: string;
  goal: string;
  steps: string[];
  expected: string;
  /** 读者自查清单，用来判断预期是否真的出现了。 */
  verify: string[];
  /** 没有独立仓库项目的章节，说明网页端怎么练。 */
  fallbackNote?: string;
};

/**
 * 章末 Windows 实践卡。
 * 网页只负责把原理讲清楚，真实 D3D12 代码一律回到书籍示例仓库里运行 —— 这里不假装能跑 D3D12。
 */
export function PracticeCard({ chapterId, title, repoPath, repoUrl, goal, steps, expected, verify, fallbackNote }: PracticeCardProps) {
  const { chapter, markPracticeDone } = useProgress();
  const done = chapter(chapterId).practiceDone;
  const base = chapterById.get(chapterId);
  const target: Chapter | undefined = repoPath && base ? { ...base, samplePath: repoPath } : base;
  const link = repoUrl ?? (target ? sampleUrl(target) : undefined);
  const [checked, setChecked] = useState<boolean[]>(() => verify.map(() => false));

  return (
    <section className="practice-card" aria-labelledby={`${chapterId}-practice`}>
      <div className="practice-card__head">
        <span className="eyebrow">WINDOWS PRACTICE</span>
        <h2 id={`${chapterId}-practice`}>{title}</h2>
        <p className="practice-card__goal"><b>目标：</b>{goal}</p>
        {link
          ? <a className="practice-card__repo" href={link} target="_blank" rel="noreferrer"><span>打开本章示例目录</span><b aria-hidden="true">↗</b></a>
          : <p className="practice-card__note">{fallbackNote ?? '示例仓库没有这一章的独立项目，请在网页内完成上面的推演与代码题。'}</p>}
      </div>

      <ol className="practice-card__steps">{steps.map((step) => <li key={step}>{step}</li>)}</ol>

      <div className="practice-card__block">
        <span className="practice-card__label">预期结果</span>
        <p>{expected}</p>
      </div>

      <div className="practice-card__block">
        <span className="practice-card__label">对照检查</span>
        <ul className="practice-card__verify">
          {verify.map((item, index) => <li key={item}>
            <label>
              <input type="checkbox" checked={checked[index]} onChange={(event) => setChecked((current) => current.map((value, at) => (at === index ? event.target.checked : value)))} />
              <span>{item}</span>
            </label>
          </li>)}
        </ul>
        <p className="practice-card__hint">示例练习由你自己核对，勾不勾选都不会阻止你继续下一章。</p>
      </div>

      <button className={`button ${done ? 'button--done' : 'button--outline'}`} type="button" onClick={() => markPracticeDone(chapterId)}>
        {done ? '✓ 已完成本章实践' : '我已在 Windows 上跑通'}
      </button>
    </section>
  );
}
