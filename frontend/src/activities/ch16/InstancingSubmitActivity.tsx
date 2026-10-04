import { useState } from 'react';
import { ActivityFrame } from '@/activities/ActivityFrame';
import { Readout, Slider } from '@/activities/controls';

/** 16.1 后的概念示意：对比 100 个物体逐次绘制与实例化的提交方式；绑定次数是演示假设，不是固定 API 计数。 */
export function InstancingSubmitActivity() {
  const [instances, setInstances] = useState(100);
  const [useInstancing, setUseInstancing] = useState(false);
  const [visited, setVisited] = useState(false);

  // 逐次绘制：每个物体一次 DrawIndexedInstanced；实例化：一次 DrawIndexedInstanced(…, N)
  const naiveDrawCalls = instances;
  const instancedDrawCalls = 1;
  const naiveSetup = instances * 3;   // 每次都要设根描述符、顶点缓冲、索引缓冲
  const instancedSetup = 3;

  function reset() {
    setInstances(100);
    setUseInstancing(false);
    setVisited(false);
  }

  const switched = useInstancing;

  return (
    <ActivityFrame
      id="ch16-instancing"
      chapterId="ch16"
      title="100 个物体：逐次绘制还是实例化"
      prompt="把两种提交方式都切一次，比较绘制调用次数和每次需要重设的状态。"
      predict={{
        question: '硬件实例化主要省掉的是哪一类开销？',
        options: ['减少了每个物体的顶点数', '减少了绘制调用与状态设置次数，GPU 能用一次命令处理所有实例', '减少了显存占用', '减少了光照计算'],
        answer: 1,
        correctNote: 'CPU 侧的绘制调用与状态设置被合成了一次命令——这通常是真正的瓶颈。',
        wrongNote: '实例化不改变顶点数，也不改变顶点着色器的执行次数；它省的是 CPU 提交与状态切换的开销。',
      }}
      onReset={reset}
      check={() => {
        if (!visited) return { passed: false, feedback: '把「提交方式」在「逐次绘制」和「实例化」之间切换一次，比较两个数字，再检查。' };
        return {
          passed: true,
          feedback: `${instances} 个物体：逐次绘制需要 ${naiveDrawCalls} 次绘制调用与约 ${naiveSetup} 次状态设置；实例化只要 ${instancedDrawCalls} 次绘制调用与 ${instancedSetup} 次状态设置。注意：实例化并不减少顶点着色器的执行次数——每个实例的每个顶点仍然要跑一次。`,
        };
      }}
      explanation={<>
        <p>书中的实现把几何数据只上传一份，把 N 条 <code>InstanceData</code> 放入 <code>StructuredBuffer</code>，再调用一次 <code>DrawIndexedInstanced(indexCount, N, 0, 0, 0)</code>。</p>
        <p>顶点着色器用系统值 <code>SV_InstanceID</code> 读取当前实例数据：</p>
        <div className="math-block">InstanceData inst = gInstanceData[instanceID];<br />float4 posW = mul(float4(vin.PosL, 1.0f), inst.World);</div>
        <p><b>省掉的是什么：</b>逐个物体发起绘制和重复设置资源的 CPU 开销。图中按每次提交设置三项状态来估算；这只是便于比较的假设，实际哪些绑定能复用、状态调用有多少，取决于渲染器如何组织绘制。</p>
        <p><b>没有省掉的是：</b>顶点着色器的工作量。N 个实例 × 每个物体的顶点数仍要处理；如果顶点着色器是瓶颈，应考虑减少顶点处理工作或降低细节层级。</p>
        <p>Direct3D 也支持把 per-instance 数据放进第二个顶点缓冲流；本书示例采用结构化缓冲，并在下一步用动态索引选择每个实例的材质和贴图。</p>
      </>}
      apply={<p>本书用 <code>StructuredBuffer&lt;InstanceData&gt;</code> 与 <code>SV_InstanceID</code>；旧式输入布局也能声明 per-instance 顶点流。</p>}
    >
      <svg className="svg-stage" viewBox="0 0 320 200" role="img"
        aria-label={`${instances} 个物体，当前使用${useInstancing ? '实例化' : '逐次绘制'}`}>
        <rect x={0} y={0} width={320} height={200} fill="#f4f7f0" />
        {Array.from({ length: Math.min(instances, 100) }, (_unused, index) => {
          const columns = 20;
          const col = index % columns;
          const row = Math.floor(index / columns);
          return <rect key={index} x={20 + col * 14} y={26 + row * 14} width={9} height={9}
            fill={useInstancing ? '#2f6b8f' : '#b1712f'} />;
        })}
        <text x={12} y={14}>{useInstancing ? '一次 DrawIndexedInstanced 画全部实例' : '每个物体一次 DrawIndexedInstanced'}</text>
        <text x={12} y={186}>CPU 侧工作：{useInstancing ? `${instancedSetup} 次状态设置 + ${instancedDrawCalls} 次绘制` : `${naiveSetup} 次状态设置 + ${naiveDrawCalls} 次绘制`}</text>
      </svg>

      <Slider label="物体数量" min={1} max={200} step={1} value={instances} onChange={setInstances} />
      <div className="activity__actions">
        <button className={`button ${!useInstancing ? 'button--accent' : 'button--outline'}`} type="button"
          onClick={() => { setUseInstancing(false); setVisited(true); }}>逐次绘制</button>
        <button className={`button ${useInstancing ? 'button--accent' : 'button--outline'}`} type="button"
          onClick={() => { setUseInstancing(true); setVisited(true); }}>硬件实例化</button>
      </div>

      <Readout items={[
        ['物体数量', String(instances)],
        ['绘制调用次数', String(switched ? instancedDrawCalls : naiveDrawCalls)],
        ['状态设置次数', String(switched ? instancedSetup : naiveSetup)],
        ['顶点着色器执行次数', `${instances} × 顶点数（两种方式相同）`],
      ]} />
    </ActivityFrame>
  );
}
