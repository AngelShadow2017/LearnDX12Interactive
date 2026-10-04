import { useState } from 'react';
import { ActivityFrame } from '@/activities/ActivityFrame';
import { Choice, Readout } from '@/activities/controls';
import { CodeSample } from '@/components/CodeSample';

const MATERIALS = [
  { name: '材质 0 · 木板', color: '#a87b4a', diffuseMapIndex: 0 },
  { name: '材质 1 · 金属', color: '#8f9aa6', diffuseMapIndex: 1 },
  { name: '材质 2 · 石材', color: '#9c8e7b', diffuseMapIndex: 2 },
];

const ITEM_COUNT = 6;

/** 15.5 后的推演：逐项追踪 MaterialIndex → MaterialData → DiffuseMapIndex → 纹理描述符。 */
export function DynamicIndexActivity() {
  const [materialIndices, setMaterialIndices] = useState<number[]>([0, 1, 0, 1, 0, 1]);
  const [selected, setSelected] = useState(3);

  const target = 2;
  const solved = materialIndices[3] === target;

  function reset() {
    setMaterialIndices([0, 1, 0, 1, 0, 1]);
    setSelected(3);
  }

  return (
    <ActivityFrame
      id="ch15-dynamic-index"
      chapterId="ch15"
      title="沿索引链给绘制项换材质"
      prompt="每个绘制项的物体常量带 MaterialIndex；材质表里的 DiffuseMapIndex 再指向纹理描述符数组。选中一个绘制项并改它的 MaterialIndex。"
      predict={{
        question: '书中的动态索引示例怎样从绘制项找到漫反射贴图？',
        options: [
          '把所有贴图合成一个 Texture2DArray，直接用 MaterialIndex 选层',
          '用 MaterialIndex 查结构化材质表，再用 DiffuseMapIndex 查 Texture2D 资源数组',
          '把 MaterialIndex 当成纹理坐标',
          '每种材质创建一个 PSO',
        ],
        answer: 1,
        correctNote: '绘制项选材质，材质记录贴图索引，着色器再动态选择资源数组里的纹理。',
        wrongNote: '本例用的是 Texture2D 资源描述符数组和结构化材质缓冲，不是 Texture2DArray 的纹理层索引。',
      }}
      onReset={reset}
      check={() => {
        if (!solved) return { passed: false, feedback: `绘制项 3 当前的 MaterialIndex 是 ${materialIndices[3]}；把它改为材质 2，再沿材质表找到对应贴图。` };
        const material = MATERIALS[materialIndices[3]];
        return {
          passed: true,
          feedback: `正确：绘制项 3 的 MaterialIndex=${materialIndices[3]}，材质表给出 DiffuseMapIndex=${material.diffuseMapIndex}，最终选到纹理描述符 ${material.diffuseMapIndex}。`,
        };
      }}
      explanation={<>
        <p>本书把材质数据放进结构化缓冲，把可用贴图放进 HLSL 的 <code>Texture2D</code> 资源数组。每个绘制项单独带一个材质索引；材质中的 <code>DiffuseMapIndex</code> 再指出要采样的纹理。</p>
        <CodeSample
          title="从绘制项索引到纹理资源"
          language="hlsl"
          code={`struct MaterialData
{
    uint DiffuseMapIndex;
};

Texture2D gDiffuseMaps[NUM_TEXTURES] : register(t0, space0);
StructuredBuffer<MaterialData> gMaterialData : register(t0, space1);

cbuffer ObjectConstants : register(b0)
{
    uint gMaterialIndex;
};

float4 PS(float2 texC : TEXCOORD) : SV_Target
{
    MaterialData mat = gMaterialData[gMaterialIndex];
    return gDiffuseMaps[mat.DiffuseMapIndex].Sample(gSampler, texC);
}`}
          input={<>每帧绑定材质结构化缓冲和纹理 SRV 描述符数组；每个绘制项提供自己的 MaterialIndex。</>}
          keyLines={[
            { code: 'gMaterialData[gMaterialIndex]', note: '用物体常量选择材质记录。' },
            { code: 'mat.DiffuseMapIndex', note: '材质记录再给出要用的纹理资源索引。' },
            { code: 'gDiffuseMaps[index]', note: '这是 Texture2D 资源描述符数组；元素可引用不同尺寸或格式的纹理。' },
          ]}
          output={<>改变某个绘制项的 MaterialIndex 后，它沿两级索引切换到对应贴图；纹理数组和材质缓冲无需逐项重新绑定。</>}
          pitfalls={[
            '把 Texture2D 资源数组误写成 Texture2DArray：前者是一组独立资源，后者要求数组层共享兼容的尺寸和格式。',
            '把 MaterialIndex 与 DiffuseMapIndex 混为一谈：它们分别索引材质记录和纹理资源。',
            '忘记让根签名、寄存器空间和描述符表范围与着色器声明一致。',
          ]}
        />
        <p>本书的策略是每帧绑定材质与纹理资源数组，而每个绘制项仍设置自己的物体常量（其中含 <code>MaterialIndex</code>）。动态索引减少逐项切换材质数据和纹理 SRV 的需要。</p>
      </>}
      apply={<p>纹理资源数组声明为 <code>Texture2D gDiffuseMaps[N]</code>，使用 Shader Model 5.1 动态索引；C++ 侧通过 SRV 描述符数组和根签名描述符表绑定资源。它与要求数组纹理元素尺寸/格式兼容的 <code>Texture2DArray</code> 是不同机制。</p>}
    >
      <svg className="svg-stage" viewBox="0 0 320 220" role="img"
        aria-label={`6 个绘制项，当前选中第 ${selected + 1} 项，MaterialIndex 为 ${materialIndices[selected]}`}>
        <rect x={0} y={0} width={320} height={220} fill="#f4f7f0" />
        {Array.from({ length: ITEM_COUNT }, (_unused, index) => {
          const x = 18 + index * 49;
          const material = MATERIALS[materialIndices[index]];
          return <g key={index} style={{ cursor: 'pointer' }} onClick={() => setSelected(index)}>
            <rect x={x} y={38} width={40} height={64} rx={5} fill={material.color}
              stroke={selected === index ? '#2f6b8f' : '#c9d2c5'} strokeWidth={selected === index ? 2.4 : 1} />
            <text x={x + 20} y={119} textAnchor="middle">绘制项 {index}</text>
            <text x={x + 20} y={135} textAnchor="middle">MaterialIndex {materialIndices[index]}</text>
          </g>;
        })}
        <text x={12} y={20}>MaterialIndex → MaterialData → DiffuseMapIndex → Texture2D[]</text>
        {MATERIALS.map((material, index) => <g key={material.name}>
          <rect x={12} y={166 + index * 16} width={11} height={11} fill={material.color} stroke="#c9d2c5" />
          <text x={30} y={176 + index * 16} style={{ fontSize: 10 }}>{material.name.split('·')[1].trim()} → 纹理 {material.diffuseMapIndex}</text>
        </g>)}
      </svg>

      <Readout items={[
        ['当前选中', `绘制项 ${selected}`],
        ['MaterialIndex', String(materialIndices[selected])],
        ['DiffuseMapIndex', String(MATERIALS[materialIndices[selected]].diffuseMapIndex)],
        ['目标', '绘制项 3 使用材质 2'],
        ['是否达成', solved ? '是' : '否'],
      ]} />

      <Choice label={`把绘制项 ${selected} 的 MaterialIndex 设为`} options={MATERIALS.map((material, index) => ({ value: String(index), label: material.name }))}
        value={String(materialIndices[selected])}
        onChange={(value) => setMaterialIndices((current) => current.map((item, at) => (at === selected ? Number(value) : item)))} />
    </ActivityFrame>
  );
}
