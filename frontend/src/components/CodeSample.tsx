import type { ReactNode } from 'react';
import hljs from 'highlight.js/lib/core';
import bash from 'highlight.js/lib/languages/bash';
import cpp from 'highlight.js/lib/languages/cpp';
import glsl from 'highlight.js/lib/languages/glsl';
import javascript from 'highlight.js/lib/languages/javascript';
import json from 'highlight.js/lib/languages/json';
import powershell from 'highlight.js/lib/languages/powershell';
import typescript from 'highlight.js/lib/languages/typescript';
import xml from 'highlight.js/lib/languages/xml';

hljs.registerLanguage('bash', bash);
hljs.registerLanguage('cpp', cpp);
hljs.registerLanguage('glsl', glsl);
hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('json', json);
hljs.registerLanguage('powershell', powershell);
hljs.registerLanguage('typescript', typescript);
hljs.registerLanguage('xml', xml);

const languageAliases: Record<string, string> = {
  'c++': 'cpp',
  c: 'cpp',
  hlsl: 'cpp',
  js: 'javascript',
  ts: 'typescript',
  sh: 'bash',
  shell: 'bash',
  html: 'xml',
};

function highlightCode(code: string, language: string): string {
  const requested = language.toLowerCase();
  const resolved = languageAliases[requested] ?? requested;
  if (!hljs.getLanguage(resolved)) return escapeHtml(code);
  return hljs.highlight(code, { language: resolved }).value;
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
  })[character]!);
}

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
  const highlightedCode = highlightCode(code, language);
  return (
    <section className="code-sample">
      <header><span className="code-sample__lang">{language}</span><h4>{title}</h4></header>
      <pre><code className={`hljs language-${language}`} dangerouslySetInnerHTML={{ __html: highlightedCode }} /></pre>
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
