import { useState } from 'react';
import { ActivityFrame } from '@/activities/ActivityFrame';
import { Readout, Slider, Toggle } from '@/activities/controls';

/** 13.6–13.7 后的推演：调模糊核与共享内存边界，比较读取次数与边缘处理。 */
export function BlurSharedMemoryActivity() {
  const [radius, setRadius] = useState(4);
  const [groupSize, setGroupSize] = useState(64);
  const [useShared, setUseShared] = useState(true);
  const [clampEdge, setClampEdge] = useState(true);
  const [touched, setTouched] = useState(false);

  const kernel = 2 * radius + 1;
  // 直接读：每个线程都要把整个核读一遍（分离滤波后每趟 kernel 次）
  const directPerThread = kernel;
  // 用共享内存：每个线程读自己那 1 个，组两端的线程再多读 radius 个（填充 halo）
  const sharedPerThread = 1 + (2 * radius) / groupSize;
  const directTotal = directPerThread * groupSize;
  const sharedTotal = groupSize + 2 * radius;
  const saving = directTotal > 0 ? (1 - sharedTotal / directTotal) : 0;
  const haloFits = groupSize >= kernel;

  function reset() {
    setRadius(4);
    setGroupSize(64);
    setUseShared(true);
    setClampEdge(true);
    setTouched(false);
  }

  return (
    <ActivityFrame
      id="ch13-blur-shared"
      chapterId="ch13"
      title="调模糊核，比较共享内存省下多少读取"
      prompt="把模糊半径从 1 拖到 8，看「整组读取次数」那一列怎么变；再关掉共享内存对比一次。"
      predict={{
        question: '模糊半径变大时，用共享内存相比直接读取，节省的读取次数会怎样？',
        options: ['节省变少（因为核更大）', '节省变多：直接读取随核线性增长，共享内存只多读 2R 个 halo', '完全没有差别', '节省比例固定不变'],
        answer: 1,
        hint: '直接读取：N × (2R+1)；共享内存：N + 2R。R 越大，两者的差距越大。',
        correctNote: '核越大，重复读取越多，共享内存的收益也越大——这正是图 13.10 要说明的。',
        wrongNote: '直接读取是 N×(2R+1)，随 R 线性增长；共享内存是 N + 2R，多出来的只有两端各 R 个 halo。所以 R 越大省得越多。',
      }}
      onReset={reset}
      check={() => {
        if (!touched) return { passed: false, feedback: '先把模糊半径拖大（比如到 8），观察两列读取次数的变化，再检查。' };
        if (!haloFits) return { passed: false, feedback: `现在组内线程数 ${groupSize} 小于核大小 ${kernel}，halo 装不下。把组内线程数调到至少 ${kernel}（通常是 256）。` };
        return {
          passed: true,
          feedback: `半径 ${radius}（核 ${kernel}）、组大小 ${groupSize}：直接读取 ${directTotal} 次，用共享内存 ${sharedTotal} 次，节省约 ${(saving * 100).toFixed(0)}%。线程组边界需要额外读 ${2 * radius} 个 halo 纹素（图 13.11、13.12）。`,
        };
      }}
      explanation={<>
        <p>模糊就是把每个像素换成以它为中心的 m × n 邻域的加权平均（图 13.5），权重常用高斯函数（图 13.6，σ 越大越散）。</p>
        <p><b>分离滤波</b>是关键优化：二维高斯可以拆成「先横向再纵向」两个一维核，复杂度从 O(m·n) 降到 O(m+n)。</p>
        <p>但即便如此，相邻线程的核仍然大量重叠（图 13.10）。把一块纹素先搬进<b>共享内存</b>（groupshared），线程再从共享内存读，就能把重复读取几乎全部消除。</p>
        <p>代价是要处理<b>组边界</b>：靠近组边缘的线程需要读组外的像素（图 13.11），所以组两端的线程要多读 R 个纹素填进 halo（图 13.12）。还要处理<b>图像边界</b>（图 13.13）——通常用 clamp 采样，把超界坐标钳到边缘。</p>
        <p>共享内存读写之间必须用 <code>GroupMemoryBarrierWithGroupSync()</code> 同步，否则会读到别的线程还没写完的数据。</p>
      </>}
      apply={<p>示例里的 <code>N = 256</code> 个线程要覆盖 <code>N + 2·BlurRadius</code> 个 texel；边界用 <code>min(max(...))</code> 钳制索引，配合 <code>GroupMemoryBarrierWithGroupSync()</code> 保证可见性。</p>}
    >
      <svg className="svg-stage" viewBox="0 0 320 200" role="img"
        aria-label={`模糊半径 ${radius}，组大小 ${groupSize}，${useShared ? '使用' : '不使用'}共享内存`}>
        <rect x={0} y={0} width={320} height={200} fill="#f4f7f0" />
        <text x={10} y={22}>线程组边缘与 halo（示意显示 16 个代表线程）</text>
        {Array.from({ length: 32 }, (_unused, index) => {
          const inGroup = index >= 8 && index < 24;
          const leftHalo = index >= 8 - radius && index < 8;
          const rightHalo = index >= 24 && index < 24 + radius;
          const isHalo = useShared && (leftHalo || rightHalo);
          const x = 10 + index * 9.2;
          return <rect key={index} x={x} y={36} width={8.4} height={34}
            fill={isHalo ? '#e8be68' : inGroup ? '#dfe8e1' : '#eef1ea'} stroke="#cfd8cb" />;
        })}
        <text x={10} y={90}>金色 = 组外 halo 纹素（左右各 {useShared ? radius : 0} 个）</text>

        <text x={10} y={124}>当前线程要读取的纹素数量：{useShared ? sharedPerThread.toFixed(2) : directPerThread}</text>
        <text x={10} y={148}>整组读取次数：{useShared ? sharedTotal : directTotal}</text>
        <text x={10} y={172}>图像边界外：{clampEdge ? '钳到边缘纹素' : '读到未定义内容（会出现黑边）'}</text>
      </svg>

      <Slider label="模糊半径 R" min={1} max={8} step={1} value={radius} onChange={(value) => { setRadius(value); setTouched(true); }} />
      <Slider label="组内线程数" min={8} max={256} step={8} value={groupSize} onChange={(value) => { setGroupSize(value); setTouched(true); }} />
      <Toggle label="使用共享内存" checked={useShared} onChange={(value) => { setUseShared(value); setTouched(true); }} />
      <Toggle label="边界使用 clamp 采样" checked={clampEdge} onChange={setClampEdge} />

      <Readout items={[
        ['核大小 2R+1', String(kernel)],
        ['每线程读取（当前）', useShared ? sharedPerThread.toFixed(2) : String(directPerThread)],
        ['整组读取（直接）', String(directTotal)],
        ['整组读取（共享内存）', String(sharedTotal)],
        ['节省比例', `${(saving * 100).toFixed(0)}%`],
      ]} />
    </ActivityFrame>
  );
}
