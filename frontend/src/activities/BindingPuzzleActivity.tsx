import { useState } from 'react';
import { ActivityFrame } from '@/activities/ActivityFrame';
import { Readout } from '@/activities/controls';

type Slot = { id: string; role: string; answer: string };

const slots: Slot[] = [
  { id: 'layout', role: '描述顶点结构里每个字段的字节布局（位置、颜色、法线各占多少字节、偏移多少）', answer: 'layout' },
  { id: 'semantic', role: '让顶点缓冲里的字段与 HLSL 入口参数一一对应（POSITION / COLOR / NORMAL）', answer: 'semantic' },
  { id: 'cbuffer', role: '每帧从 CPU 传给着色器的只读参数（世界矩阵、视图投影矩阵、材质）', answer: 'cbuffer' },
  { id: 'rootsig', role: '声明「着色器需要哪些资源、分别绑在哪个寄存器、对哪个阶段可见」', answer: 'rootsig' },
  { id: 'pso', role: '把顶点/像素着色器、输入布局、光栅器状态、混合状态等一次性打包', answer: 'pso' },
];

const options = [
  { value: '', label: '（请选择）' },
  { value: 'layout', label: '输入布局 D3D12_INPUT_ELEMENT_DESC' },
  { value: 'semantic', label: '着色器语义（semantic）' },
  { value: 'cbuffer', label: '常量缓冲视图（CBV）' },
  { value: 'rootsig', label: '根签名 ID3D12RootSignature' },
  { value: 'pso', label: '管线状态对象 ID3D12PipelineState' },
];

/** 6.6–6.9 后的推演：输入布局—着色器语义—常量缓冲—根签名—PSO 的绑定拼图。 */
export function BindingPuzzleActivity() {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const correctCount = slots.filter((slot) => answers[slot.id] === slot.answer).length;

  function reset() {
    setAnswers({});
  }

  return (
    <ActivityFrame
      id="ch06-binding-puzzle"
      chapterId="ch06"
      title="把五个概念填回它们的位置"
      prompt="每一行的「职责」对应下面五个 D3D12 概念之一。逐行选择，全部选完再检查。"
      predict={{
        question: '根签名（Root Signature）的作用是？',
        options: ['描述顶点结构里每个字段的字节布局', '声明着色器需要哪些资源、绑在哪个寄存器', '把着色器编译成字节码', '决定三角形是否被剔除'],
        answer: 1,
        hint: '它是 CPU 与着色器之间的一份「契约」，两边必须逐项一致。',
        correctNote: '根签名是契约：声明资源类型、寄存器槽位与可见阶段。',
        wrongNote: '描述顶点字段布局的是输入布局；根签名声明的是着色器要用的资源与寄存器槽位。',
      }}
      onReset={reset}
      check={() => {
        if (correctCount < slots.length) return { passed: false, feedback: `答对 ${correctCount} / ${slots.length}。提示：输入布局管顶点字段的字节布局，语义管名字对号，常量缓冲管传参，根签名管声明，PSO 管打包。` };
        return { passed: true, feedback: '五个都对。这条链就是 D3D12 绘制前要做完的绑定工作：输入布局描述顶点 → 语义把字段对上着色器参数 → 常量缓冲传每帧参数 → 根签名声明资源 → PSO 把状态打包。' };
      }}
      explanation={<>
        <p>图 6.1 展示了顶点结构的每个元素如何由 <code>D3D12_INPUT_ELEMENT_DESC</code> 数组描述；图 6.4 展示了每个顶点元素的语义名如何与 VS 入口参数一一对应。</p>
        <p>这五件事容易混淆，因为它们在初始化阶段挨得很近。分清的办法是看各自<b>管什么</b>：</p>
        <ul>
          <li><b>输入布局</b>管「字节怎么读」；</li>
          <li><b>语义</b>管「读到的数据送到哪个形参」；</li>
          <li><b>常量缓冲</b>管「每帧变化的参数怎么传」；</li>
          <li><b>根签名</b>管「着色器需要什么资源」；</li>
          <li><b>PSO</b>管「这一次绘制用到的全部状态」。</li>
        </ul>
        <p>其中根签名是<b>契约</b>：着色器里写 <code>register(b0)</code>，根签名里就必须有一个对应的 CBV 参数，否则调试层会报错。</p>
      </>}
      apply={<p>初始化顺序大致是：编译着色器 → 定义输入布局 → 创建根签名 → 创建 PSO → 创建顶点/索引缓冲与常量缓冲 → 每帧更新常量缓冲并 <code>SetGraphicsRootDescriptorTable</code> / <code>SetGraphicsRootConstantBufferView</code>。</p>}
    >
      <div className="ctl-panel">
        {slots.map((slot) => <label className="ctl" key={slot.id}>
          <span className="ctl__label" style={{ display: 'block' }}>{slot.role}</span>
          <select value={answers[slot.id] ?? ''} onChange={(event) => setAnswers((current) => ({ ...current, [slot.id]: event.target.value }))}
            style={{ width: '100%', padding: '7px 8px', border: '1px solid #e0e6dc', borderRadius: 7, background: '#fff', fontSize: 11 }}>
            {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
        </label>)}
      </div>

      <Readout items={[['已答对', `${correctCount} / ${slots.length}`]]} />
    </ActivityFrame>
  );
}
