import { useState } from 'react';
import { ActivityFrame } from '@/activities/ActivityFrame';
import { Choice, Readout } from '@/activities/controls';
import { CodeSample } from '@/components/CodeSample';

const MATERIALS = [
  { name: '材质 0 · 木板', color: '#a87b4a' },
  { name: '材质 1 · 金属', color: '#8f9aa6' },
  { name: '材质 2 · 玻璃', color: '#6fa8b8' },
];

const COUNT = 6;

/** 15.5 后的推演：切换材质索引，观察动态索引如何选择资源。 */
export function DynamicIndexActivity() {
  const [indices, setIndices] = useState<number[]>([0, 1, 0, 1, 0, 1]);
  const [selected, setSelected] = useState(3);

  const target = 2;
  const solved = indices[3] === target;

  function reset() {
    setIndices([0, 1, 0, 1, 0, 1]);
    setSelected(3);
  }

  return (
    <ActivityFrame
      id="ch15-dynamic-index"
      chapterId="ch15"
      title="让第 4 个实例用上材质 2"
      prompt="每个实例的数据里带一个材质索引，像素着色器用它去纹理数组里选一张贴图。点选实例，再切换它的材质索引。"
      predict={{
        question: '用「根常量」传材质索引数组，和用「描述符表 + 动态偏移」传纹理数组，各有什么取舍？',
        options: ['两者完全一样', '根常量简单但每实例要一份数据；描述符表一次绑定整张数组，靠偏移选资源', '根常量更快', '描述符表只能选整数常量，不能选纹理'],
        answer: 1,
        correctNote: '根常量适合小而每实例不同的数据；描述符表一次绑定整张资源数组，靠偏移选资源。',
        wrongNote: '描述符表当然能选纹理——它绑的是 SRV 描述符，动态偏移决定取哪一张。',
      }}
      onReset={reset}
      check={() => {
        if (!solved) return { passed: false, feedback: `第 4 个实例现在用的是「${MATERIALS[indices[3]].name}」。目标是材质 2。` };
        return {
          passed: true,
          feedback: '正确。着色器里用 gMatIndex[gInstanceID] 取到索引，再用它采样纹理数组的对应层；根描述符表只需要绑定一次，偏移随实例变化。',
        };
      }}
      explanation={<>
        <p>多个实例想用不同材质时，常见做法是把所有材质放进<b>纹理数组</b>，在实例数据里放一个索引。着色器读出索引后用它采样：</p>
        <CodeSample
          title="动态索引选材质"
          language="hlsl"
          code={`Texture2DArray gTextureArray : register(t0);

// 实例数据里带索引
StructuredBuffer<InstanceData> gObjects;
uint gMatIndex[MAX_INSTANCES];

float4 PS(VertexOut pin) : SV_Target
{
    uint matIndex = gMatIndex[pin.InstanceID];
    // float3(uv, arrayIndex) 三维坐标里最后一位就是选哪一张
    float4 c = gTextureArray.Sample(gSampler, float3(pin.TexC.xy, matIndex));
    return c;
}`}
          input={<>一张纹理数组（每个实例一层）与一份实例数据（包含材质索引）。</>}
          keyLines={[
            { code: 'float3(pin.TexC.xy, matIndex)', note: '纹理数组的采样用三维坐标，第三分量就是层索引。' },
            { code: 'gMatIndex[pin.InstanceID]', note: '索引从实例数据里取，所以一次绘制就能让不同实例用不同材质。' },
          ]}
          output={<>6 个实例分别显示不同材质，但只绑定了一次描述符表。</>}
          pitfalls={[
            '索引越界：gMatIndex 里没有对应值时采样会返回黑色或未定义。',
            '忘记用 SV_InstanceID 区分实例：所有实例会共用同一份材质索引。',
            '根描述符表与着色器里的数组大小不一致：调试层会报根签名不匹配。',
          ]}
        />
        <p>用<b>根常量</b>传索引数组最直观：它在每个线程组的常量缓冲里，索引访问很便宜。规模变大时根签名会超出 64 DWORD 的上限，那时才改用描述符表加动态偏移。</p>
      </>}
      apply={<p>对应 HLSL 里 <code>Texture2DArray</code> 与 <code>Sample(samp, float3(uv, index))</code>；C++ 侧用 <code>ID3D12ShaderResourceView::CreateView(..., D3D12_SRV_DIMENSION_TEXTURE2DARRAY, ...)</code> 建数组视图。</p>}
    >
      <svg className="svg-stage" viewBox="0 0 320 200" role="img"
        aria-label={`6 个实例，第 4 个被选中，材质索引为 ${indices[3]}`}>
        <rect x={0} y={0} width={320} height={200} fill="#f4f7f0" />
        {Array.from({ length: COUNT }, (_unused, index) => {
          const x = 18 + index * 49;
          const material = MATERIALS[indices[index]];
          return <g key={index} style={{ cursor: 'pointer' }} onClick={() => setSelected(index)}>
            <rect x={x} y={40} width={40} height={70} rx={5} fill={material.color}
              stroke={selected === index ? '#2f6b8f' : '#c9d2c5'} strokeWidth={selected === index ? 2.4 : 1} />
            <text x={x + 20} y={128} textAnchor="middle">实例 {index}</text>
            <text x={x + 20} y={144} textAnchor="middle">索引 {indices[index]}</text>
          </g>;
        })}
        <text x={12} y={24}>纹理数组的 3 层材质</text>
        {MATERIALS.map((material, index) => <g key={material.name}>
          <rect x={12 + index * 104} y={162} width={14} height={14} fill={material.color} stroke="#c9d2c5" />
          <text x={32 + index * 104} y={174}>{material.name}</text>
        </g>)}
      </svg>

      <Readout items={[
        ['当前选中', `实例 ${selected}`],
        ['它的材质索引', String(indices[selected])],
        ['目标', '第 4 个实例用材质 2'],
        ['是否达成', solved ? '是' : '否'],
      ]} />

      <Choice label={`把实例 ${selected} 的材质设为`} options={MATERIALS.map((material, index) => ({ value: String(index), label: material.name }))}
        value={String(indices[selected])}
        onChange={(value) => setIndices((current) => current.map((item, at) => (at === selected ? Number(value) : item)))} />
    </ActivityFrame>
  );
}
