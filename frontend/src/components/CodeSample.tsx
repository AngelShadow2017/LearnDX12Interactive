import type { ReactNode } from 'react';

export type KeyLine = { code: string; note: string };
export type CodeSampleProps = {
  title: string;
  language?: string;
  code: string;
  /** 这段代码读什么、写什么 —— 对应“输入”。 */
  input?: ReactNode;
  keyLines?: KeyLine[];
  /** 预期画面或输出 —— 对应“预期结果”。 */
  output?: ReactNode;
  pitfalls?: string[];
};

/** 代码卡：始终配上输入、关键行解释、预期输出和常见错误四块。 */
export function CodeSample({ title, language = 'cpp', code, input, keyLines, output, pitfalls }: CodeSampleProps) {
  return (
    <section className="code-sample">
      <header><span className="code-sample__lang">{language}</span><h4>{title}</h4></header>
      <pre><code>{code}</code></pre>
      {input && <div className="code-sample__block"><span>输入 / 前置条件</span><div>{input}</div></div>}
      {keyLines && keyLines.length > 0 && <div className="code-sample__block">
        <span>关键行</span>
        <ul>{keyLines.map((line) => <li key={line.code}><code>{line.code}</code><p>{line.note}</p></li>)}</ul>
      </div>}
      {output && <div className="code-sample__block"><span>预期画面 / 输出</span><div>{output}</div></div>}
      {pitfalls && pitfalls.length > 0 && <div className="code-sample__block code-sample__block--warn">
        <span>常见错误</span>
        <ul>{pitfalls.map((pitfall) => <li key={pitfall}>{pitfall}</li>)}</ul>
      </div>}
    </section>
  );
}
