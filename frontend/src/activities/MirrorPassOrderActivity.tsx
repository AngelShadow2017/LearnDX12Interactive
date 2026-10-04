import { useState } from 'react';
import { ActivityFrame } from '@/activities/ActivityFrame';
import { OrderList, Readout } from '@/activities/controls';

type Step = { id: string; text: string; hint: string };

const correct: Step[] = [
  { id: 'opaque', text: '绘制不透明场景（地板、墙、骷髅），同时清空模板缓冲', hint: '先把背景画好' },
  { id: 'mask', text: '只写模板、不写颜色：把镜面覆盖的像素标成 1', hint: 'StencilFunc = ALWAYS，StencilPassOp = REPLACE' },
  { id: 'reflect', text: '绘制反射后的骷髅，模板测试 EQUAL 1、参考值 1', hint: '只在镜面像素上画' },
  { id: 'mirror', text: '把镜面本身以半透明方式混合上去', hint: '最后画，盖住倒影' },
];

const shuffled: Step[] = [correct[2], correct[0], correct[3], correct[1]];

/** 11.4 后的推演：调整镜面渲染各 pass 的顺序，解释倒影穿墙或消失的原因。 */
export function MirrorPassOrderActivity() {
  const [items, setItems] = useState<Step[]>(shuffled);
  const [checked, setChecked] = useState(false);

  const order = items.map((item) => item.id);
  const expected = correct.map((item) => item.id);
  const isCorrect = order.every((id, index) => id === expected[index]);

  const maskIndex = order.indexOf('mask');
  const reflectIndex = order.indexOf('reflect');
  const mirrorIndex = order.indexOf('mirror');

  const leak = reflectIndex < maskIndex;
  const hidden = mirrorIndex < reflectIndex;

  function reset() {
    setItems(shuffled);
    setChecked(false);
  }

  return (
    <ActivityFrame
      id="ch11-mirror-passes"
      chapterId="ch11"
      title="排出镜面渲染的四个 pass"
      prompt="四个 pass 被打乱了。按正确顺序排好，再故意把「画倒影」挪到「写掩码」之前，看会发生什么。"
      predict={{
        question: '如果先画倒影、后写模板掩码，画面会出现什么问题？',
        options: ['没有倒影', '倒影不受限制，会「穿墙」出现在镜子之外', '镜子变成不透明', '深度测试失效'],
        answer: 1,
        hint: '模板掩码还没写进去时，模板测试无从限制倒影的落点。',
        correctNote: '掩码没写好就画倒影，模板测试挡不住任何像素，倒影会画到镜子外面去（穿墙）。',
        wrongNote: '顺序反了意味着画倒影时模板里还没有掩码，测试形同虚设，倒影会画到镜面之外。',
      }}
      onReset={reset}
      check={() => {
        if (!isCorrect) {
          if (leak) return { passed: false, feedback: '现在「画倒影」排在「写掩码」之前：模板里还没有掩码，倒影会穿墙。把写掩码挪到画倒影之前。' };
          if (hidden) return { passed: false, feedback: '现在「画镜子」排在「画倒影」之前：不透明（或不够透明）的镜面会把倒影盖住，倒影消失。把画镜子挪到最后。' };
          return { passed: false, feedback: '顺序还不对。正确顺序是：不透明场景 → 写掩码 → 画倒影 → 画镜子。' };
        }
        return {
          passed: true,
          feedback: '正确。先画不透明场景并清模板，再把镜面写进模板，然后只在掩码内画倒影，最后把镜面本身半透明混合上去。少任何一步都会出现穿墙或消失。',
        };
      }}
      explanation={<>
        <p>图 11.3—11.4 说明了这个流程：先画地板、墙壁和骷髅，同时把模板清 0；再把镜面覆盖的像素标成 1；然后绘制关于镜面反射后的骷髅（图 11.2），并用模板测试把它限制在镜面内。</p>
        <p>顺序错了会怎样：</p>
        <ul>
          <li><b>倒影在掩码之前</b>：模板里还没有掩码，倒影会画到镜子之外，看起来像「穿墙」。</li>
          <li><b>镜子在倒影之前</b>：镜面把倒影盖住，倒影消失。</li>
        </ul>
        <p>还有一个容易忽略的点（图 11.5）：反射<b>不会自动翻转多边形法线</b>。反射矩阵会翻转绕序，所以要在这一 pass 里把剔除方向反过来，否则倒影的背面被剔除、正面被画错。</p>
      </>}
      apply={<p>代码里的做法是给反射物体单独一个 PSO：<code>FrontCounterClockwise</code> 取反、模板函数设成 EQUAL，并用 <code>OMSetStencilRef(1)</code> 给参考值。</p>}
    >
      <OrderList label="镜面渲染 pass 顺序" items={items.map((item) => ({ id: item.id, text: item.text }))}
        onChange={(next) => setItems(next.map((item) => ({ ...item, hint: correct.find((c) => c.id === item.id)?.hint ?? '' })))} />

      <div className="activity__actions">
        <button className="button button--outline" type="button" onClick={() => setChecked(true)}>检查顺序</button>
      </div>

      {checked && <p className={`activity__feedback ${isCorrect ? 'is-correct' : 'is-incorrect'}`} role="status">
        {isCorrect
          ? '顺序正确。'
          : leak
            ? '倒影会穿墙：模板掩码还没写进去。'
            : hidden
              ? '倒影会消失：镜面把它盖住了。'
              : '顺序不对，请对照每一步的说明。'}
      </p>}

      <Readout items={[
        ['写掩码的位置', `第 ${maskIndex + 1} 步`],
        ['画倒影的位置', `第 ${reflectIndex + 1} 步`],
        ['画镜子的位置', `第 ${mirrorIndex + 1} 步`],
        ['是否穿墙', leak ? '是' : '否'],
        ['倒影是否被遮住', hidden ? '是' : '否'],
      ]} />
    </ActivityFrame>
  );
}
