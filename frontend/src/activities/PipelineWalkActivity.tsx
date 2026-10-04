import { useState } from 'react';
import { ActivityFrame } from '@/activities/ActivityFrame';

type Station = {
  id: string;
  name: string;
  short: string;
  input: string;
  question: string;
  options: string[];
  answer: number;
  note: string;
};

const stations: Station[] = [
  {
    id: 'ia',
    name: '输入装配阶段（IA）',
    short: 'IA',
    input: '顶点缓冲 + 索引缓冲 + 图元拓扑',
    question: 'IA 这一站输出的是什么？',
    options: ['已经着色的像素', '按索引组装好的图元（顶点流）', '齐次裁剪空间的顶点', '后台缓冲里的一帧'],
    answer: 1,
    note: 'IA 负责读顶点与索引、按拓扑（点/线/三角形列表或条带）把顶点组装成图元，还不做任何数学变换。',
  },
  {
    id: 'vs',
    name: '顶点着色器阶段（VS）',
    short: 'VS',
    input: '本地空间的顶点（含位置、法线、UV 等属性）',
    question: 'VS 这一站输出的是什么？',
    options: ['屏幕像素坐标', '齐次裁剪空间的顶点（w 分量已就绪）', '最终颜色', '深度缓冲的一行'],
    answer: 1,
    note: 'VS 做世界、视图、投影变换，输出齐次裁剪空间坐标。注意它每个顶点跑一次，不知道三角形长什么样。',
  },
  {
    id: 'clip',
    name: '裁剪（Clipping）',
    short: '裁剪',
    input: '齐次裁剪空间的顶点（0 ≤ z ≤ w，−w ≤ x, y ≤ w）',
    question: '裁剪这一站输出的是什么？',
    options: ['完全丢弃所有超出视锥的图元', '只保留视锥内的部分，必要时生成新顶点', '把顶点吸附到视锥边界上', '把 w 归一化成 1'],
    answer: 1,
    note: '裁剪是逐图元做的：与视锥相交的三角形会被切掉外面那部分，并生成新的顶点（图 5.28）。完全在外面的才被丢弃。',
  },
  {
    id: 'rs',
    name: '光栅化阶段（RS）',
    short: 'RS',
    input: '裁剪后的三角形（NDC + 视口变换）',
    question: 'RS 这一站输出的是什么？',
    options: ['最终像素颜色', '被三角形覆盖的像素片段及其插值属性', '深度缓冲', '顶点索引列表'],
    answer: 1,
    note: 'RS 决定哪些像素被覆盖，并对顶点属性做透视正确的插值（重心坐标）。真正的着色在下一站的 PS 里。',
  },
  {
    id: 'ps',
    name: '像素着色器阶段（PS）',
    short: 'PS',
    input: '插值后的片段属性（颜色、法线、UV、深度……）',
    question: 'PS 这一站输出的是什么？',
    options: ['一个颜色值（也可以 discard 丢弃该片段）', '深度值', '顶点坐标', '模板掩码'],
    answer: 0,
    note: 'PS 每个像素片段跑一次，返回一个颜色；也可以直接 discard 把片段丢掉（第 10 章的 alpha 裁剪就用它）。',
  },
  {
    id: 'om',
    name: '输出合并阶段（OM）',
    short: 'OM',
    input: 'PS 返回的颜色 + 深度/模板缓冲中的现有值',
    question: 'OM 这一站决定什么？',
    options: ['顶点怎么变换', '三角形怎么组装', '这个像素最终是否写入后台缓冲、以及写入什么', '纹理怎么采样'],
    answer: 2,
    note: 'OM 做深度测试、模板测试和混合，决定像素最终是否写入后台缓冲以及写入的值。',
  },
];

/** 5.4 后的推演：让一个顶点逐站穿过管线，判断各站的输入输出。 */
export function PipelineWalkActivity() {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});

  const station = stations[index];
  const answeredCount = Object.keys(answers).length;
  const correctCount = stations.filter((item) => answers[item.id] === item.answer).length;

  function reset() {
    setIndex(0);
    setAnswers({});
  }

  return (
    <ActivityFrame
      id="ch05-pipeline-walk"
      chapterId="ch05"
      title="让一个顶点逐站穿过管线"
      prompt="沿管线一站一站往下走，每一站都判断它输出了什么。六站全部答对才算走完。"
      predict={{
        question: '在 D3D12 里，光栅化阶段的输出是什么？',
        options: ['已经着色的最终像素', '被三角形覆盖的像素片段（含插值后的顶点属性）', '裁剪空间的顶点', '深度缓冲里的一行数据'],
        answer: 1,
        hint: '光栅化只决定「哪些像素被覆盖 + 属性怎么插值」，不负责算颜色。',
        correctNote: '着色的活儿在像素着色器里，光栅化只负责覆盖判定与插值。',
        wrongNote: '光栅化输出的是像素片段及其插值属性，颜色要等像素着色器才算出来。',
      }}
      onReset={reset}
      check={() => {
        if (answeredCount < stations.length) return { passed: false, feedback: `还有 ${stations.length - answeredCount} 站没作答。用「上一站 / 下一站」走完六站再检查。` };
        if (correctCount < stations.length) return { passed: false, feedback: `答对 ${correctCount} / ${stations.length} 站。回到答错的那几站，看它的输入是什么再想一次。` };
        return { passed: true, feedback: '六站全对。记住这条链路：IA 组装图元 → VS 变换到齐次裁剪空间 → 裁剪 → RS 决定覆盖与插值 → PS 算颜色 → OM 决定最终写入。' };
      }}
      explanation={<>
        <p>图 5.11 是整条管线的总览。把每一站的<b>输入</b>和<b>输出</b>记牢，是后面排查「黑屏、物体倒置、纹理歪斜」这类现象的基础。</p>
        <p>一个容易记错的点：VS 输出的是<b>齐次裁剪空间</b>坐标（w 分量还在），透视除法发生在裁剪之后、光栅化之前。</p>
        <p>另一个：RS 输出的是<b>片段</b>而不是最终像素——深度测试和混合还没做。</p>
      </>}
      apply={<p>对应到代码：IA 是 <code>IASetVertexBuffers</code> + <code>IASetPrimitiveTopology</code>；VS/PS 在 PSO 里绑定；RS 由 <code>RSSetViewports</code> 与光栅器状态控制；OM 由 <code>OMSetRenderTargets</code>、深度/模板状态与混合状态控制。</p>}
    >
      <div className="ctl-panel">
        <span className="ctl-panel__title">第 {index + 1} / {stations.length} 站 · {station.name}</span>
        <div className="step-list">
          <li><b>输入：</b>{station.input}</li>
        </div>
        <p style={{ margin: '10px 0 8px', fontSize: 12.5, color: '#33473a', fontWeight: 600 }}>{station.question}</p>
        <div className="activity__options" role="radiogroup" aria-label={station.question}>
          {station.options.map((option, optionIndex) => {
            const picked = answers[station.id] === optionIndex;
            const revealed = answers[station.id] !== undefined;
            return <label key={option} className={`quiz-option ${picked ? 'is-selected' : ''} ${revealed && optionIndex === station.answer ? 'is-answer' : ''}`}>
              <input type="radio" name={`station-${station.id}`} checked={picked === true}
                onChange={() => setAnswers((current) => ({ ...current, [station.id]: optionIndex }))} />
              <span>{option}{revealed && optionIndex === station.answer ? ' ✓' : ''}</span>
            </label>;
          })}
        </div>
        {answers[station.id] !== undefined && <p className={`quiz-feedback ${answers[station.id] === station.answer ? 'is-correct' : 'is-incorrect'}`} role="status">
          {answers[station.id] === station.answer ? '正确。' : '再想一步：'}{station.note}
        </p>}
        <div className="activity__actions">
          <button className="button button--quiet" type="button" disabled={index === 0} onClick={() => setIndex((value) => value - 1)}>← 上一站</button>
          <button className="button button--outline" type="button" disabled={index === stations.length - 1} onClick={() => setIndex((value) => value + 1)}>下一站 →</button>
        </div>
      </div>

      <div className="readout">
        {stations.map((item, itemIndex) => <div key={item.id} style={{ opacity: itemIndex === index ? 1 : 0.6 }}>
          <dt>{item.short}</dt>
          <dd>{answers[item.id] === undefined ? '未作答' : answers[item.id] === item.answer ? '✓' : '✕'}</dd>
        </div>)}
      </div>
    </ActivityFrame>
  );
}
