import { useState } from 'react';

type Direction = 'math' | 'cpp' | 'pipeline';
type Question = {
  id: string;
  direction: Direction;
  question: string;
  options: string[];
  answer: number;
  explanation: string;
};

const questions: Question[] = [
  {
    id: 'd1',
    direction: 'math',
    question: 'u = (1, 2, 3)，v = (0, −1, 0)。u · v 的结果是什么符号？',
    options: ['正数', '零', '负数', '无法判断，要看坐标原点'],
    answer: 2,
    explanation: '点积只算对应分量相乘再相加：1·0 + 2·(−1) + 3·0 = −2。结果为负说明两向量夹角大于 90°。',
  },
  {
    id: 'd2',
    direction: 'math',
    question: '要“先把物体缩小到一半，再平移到 (5, 0, 0)”，用行向量 v 和矩阵相乘应该写成？',
    options: ['v · S · T', 'v · T · S', 'S · T · v', '两个顺序结果一样'],
    answer: 0,
    explanation: 'DirectXMath 用行向量，v · S · T 表示先施加 S 再施加 T。反过来写会变成“先平移再缩放”，平移量也被一起缩小了。',
  },
  {
    id: 'd3',
    direction: 'cpp',
    question: 'ComPtr<ID3D12Resource> 作为局部变量离开作用域时会发生什么？',
    options: ['什么都不做，需要手动 delete', '自动调用 Release()，引用计数减一', '自动释放 GPU 显存并立即回收', '抛异常，因为 COM 对象不能放在栈上'],
    answer: 1,
    explanation: 'ComPtr 是智能指针，析构时调用 Release()。显存是否真的回收要看引用计数和 GPU 是否还在用它，这也是为什么需要 Fence。',
  },
  {
    id: 'd4',
    direction: 'cpp',
    question: 'GPU 还在读取上传堆里的一块常量缓冲时，CPU 直接改写同一块内存，结果会怎样？',
    options: ['总是显示新数据', '总是显示旧数据', '结果不确定：可能 tearing、闪烁或读到半新半旧的数据', '驱动会抛异常并中断程序'],
    answer: 2,
    explanation: '这就是 CPU/GPU 数据竞争。书里的做法是给每一帧准备独立的帧资源，并用 Fence 等到 GPU 用完那一帧再复用。',
  },
  {
    id: 'd5',
    direction: 'pipeline',
    question: '光栅化阶段的输出是什么？',
    options: ['已经着色的最终像素', '覆盖三角形的像素片段（含插值后的顶点属性）', '裁剪空间的顶点', '深度缓冲里的一行数据'],
    answer: 1,
    explanation: '光栅化决定哪些像素被三角形覆盖，并为它们插值出顶点属性；真正的着色发生在随后的像素着色器里。',
  },
];

const directionCopy: Record<Direction, { title: string; review: string }> = {
  math: { title: '数学基础', review: '建议从第 1—3 章按向量、矩阵、变换的顺序重看，重点在运算顺序和坐标约定。' },
  cpp: { title: 'C++ 与资源生命周期', review: 'ComPtr、引用计数和 Fence 相关的部分需要补一遍，看第 4 章的 CPU/GPU 交互与帧资源。' },
  pipeline: { title: '图形管线', review: '先把第 5 章的管线总览走一遍，再回到出问题那一章，会省很多时间。' },
};

/** 导读页诊断：5 道题定位读者该回看哪一类内容。 */
export function IntroDiagnostic() {
  const [selected, setSelected] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const answered = questions.filter((question) => selected[question.id] !== undefined).length;
  const correctByDirection = (direction: Direction) =>
    questions.filter((question) => question.direction === direction && selected[question.id] === question.answer).length;
  const totalByDirection = (direction: Direction) => questions.filter((question) => question.direction === direction).length;

  return (
    <section className="activity" aria-labelledby="intro-diagnostic">
      <div className="activity__eyebrow"><span className="activity__spark" aria-hidden="true">✳</span> 起点诊断</div>
      <h3 id="intro-diagnostic">先花两分钟看看该从哪里补</h3>
      <p className="activity__prompt">五道题，分别对应数学、C++ 资源生命周期和图形管线。不记分，只用来告诉你会看哪一类内容。</p>

      <ol className="checkpoint__list">
        {questions.map((question) => {
          const choice = selected[question.id];
          return <li className="check-question" key={question.id}>
            <p className="check-question__title">{question.question}</p>
            <div className="check-question__options" role="radiogroup" aria-label={question.question}>
              {question.options.map((option, index) => <label key={option} className={`quiz-option ${choice === index ? 'is-selected' : ''} ${submitted && index === question.answer ? 'is-answer' : ''}`}>
                <input type="radio" name={`diag-${question.id}`} checked={choice === index} onChange={() => { setSelected((current) => ({ ...current, [question.id]: index })); setSubmitted(false); }} />
                <span>{option}</span>
              </label>)}
            </div>
          </li>;
        })}
      </ol>

      <div className="activity__actions">
        <button className="button button--accent" type="button" disabled={answered < questions.length} onClick={() => setSubmitted(true)}>
          {answered < questions.length ? `还有 ${questions.length - answered} 题没选` : '看看我的起点'}
        </button>
        <button className="button button--quiet" type="button" onClick={() => { setSelected({}); setSubmitted(false); }}>重做</button>
      </div>

      {submitted && <div className="activity__explanation">
        <b>你的起点</b>
        <div className="readout">
          {(['math', 'cpp', 'pipeline'] as Direction[]).map((direction) => <div key={direction}>
            <dt>{directionCopy[direction].title}</dt>
            <dd>{correctByDirection(direction)} / {totalByDirection(direction)}</dd>
          </div>)}
        </div>
        <ul>
          {(['math', 'cpp', 'pipeline'] as Direction[]).map((direction) => <li key={direction}>
            <b>{directionCopy[direction].title}：</b>
            {correctByDirection(direction) === totalByDirection(direction)
              ? '这部分没问题，可以直接往下学。'
              : directionCopy[direction].review}
          </li>)}
        </ul>
        <ul>
          {questions.map((question) => <li key={question.id}>
            <b>{selected[question.id] === question.answer ? '✓ ' : '✕ '}{question.question}</b>
            <p>{question.explanation}</p>
          </li>)}
        </ul>
      </div>}
    </section>
  );
}
