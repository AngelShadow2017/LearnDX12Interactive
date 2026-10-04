import { useMemo, useState } from 'react';
import { Readout } from '@/activities/controls';

type Row = { name: string; stage: string; type: string; note: string };

const semantics: Row[] = [
  { name: 'POSITION', stage: 'VS 输入', type: 'float3 / float4', note: '顶点位置。用 float4 时 w 才是真正的齐次坐标' },
  { name: 'NORMAL', stage: 'VS 输入', type: 'float3', note: '法线；法线贴图还需要 TANGENT 与 BINORMAL' },
  { name: 'TEXCOORD(n)', stage: 'VS 输入', type: 'float2 / float4', note: '第 n 套纹理坐标' },
  { name: 'COLOR', stage: 'VS 输入', type: 'float4', note: '顶点色' },
  { name: 'SV_VertexID', stage: 'VS 输入', type: 'uint', note: '顶点索引，可用于无顶点缓冲生成几何' },
  { name: 'SV_InstanceID', stage: 'VS 输入', type: 'uint', note: '实例索引，硬件实例化取世界矩阵用' },
  { name: 'SV_PrimitiveID', stage: 'GS 输入', type: 'uint', note: '图元索引，可用来选纹理数组的层' },
  { name: 'SV_GroupID', stage: 'CS 输入', type: 'uint3', note: '线程组编号' },
  { name: 'SV_GroupThreadID', stage: 'CS 输入', type: 'uint3', note: '组内线程编号' },
  { name: 'SV_DispatchThreadID', stage: 'CS 输入', type: 'uint3', note: '全局线程编号 = GroupID × GroupSize + GroupThreadID' },
  { name: 'SV_GroupIndex', stage: 'CS 输入', type: 'uint', note: '组内一维线性索引，用来索引共享内存数组' },
  { name: 'SV_Position', stage: 'VS/GS/DS 输出', type: 'float4', note: '裁剪空间坐标（不是 NDC）' },
  { name: 'SV_TessFactor', stage: 'HS 输出', type: 'float[4]', note: '边缘细分因子' },
  { name: 'SV_InsideTessFactor', stage: 'HS 输出', type: 'float[2]', note: '内部细分因子' },
  { name: 'SV_DomainLocation', stage: 'DS 输入', type: 'float2/3', note: '规范域上的 (u, v[, w])' },
  { name: 'SV_DispatchThreadID', stage: 'CS 输出', type: 'uint3', note: '同输入，GS 里也可用于发散' },
  { name: 'SV_Target(n)', stage: 'PS 输出', type: 'float4', note: '第 n 个渲染目标的颜色' },
  { name: 'SV_Depth', stage: 'PS 输出', type: 'float', note: '输出深度；用于写而不做深度测试的场景' },
  { name: 'SV_IsFrontFace', stage: 'PS 输入', type: 'bool', note: '该片元是正面吗；用于双面材质' },
];

const types: Row[] = [
  { name: 'float4x4', stage: '矩阵', type: '16 × float', note: 'DirectXMath 是行主序 + 行向量；HLSL 默认列主序，上传时要转置' },
  { name: 'float3x3', stage: '矩阵', type: '9 × float', note: '变换方向向量（w = 0）时用它，避免除以 w' },
  { name: 'Texture2D / SamplerState', stage: '资源', type: '—', note: '成对出现：Sample(sampler, uv)' },
  { name: 'Texture2DArray', stage: '资源', type: '—', note: 'Sample(sampler, float3(uv, index))' },
  { name: 'TextureCube', stage: '资源', type: '—', note: 'Sample(sampler, float3(dir, 0))，用于立方体贴图' },
  { name: 'SamplerState', stage: '资源', type: '—', note: '过滤 + 寻址模式 + 边界色，独立于纹理' },
  { name: 'StructuredBuffer<T>', stage: '资源', type: 'T', note: '按 stride 访问的结构数组，适合顶点/实例数据' },
  { name: 'groupshared float[]', stage: '计算', type: '—', note: '组内共享内存，读写之间必须 GroupMemoryBarrierWithGroupSync()' },
];

const stages = ['全部', 'VS 输入', 'VS/GS/DS 输出', 'GS 输入', 'HS 输出', 'DS 输入', 'CS 输入', 'PS 输入', 'PS 输出'];

/** 附录 B：HLSL 语义与类型速查，可按管线阶段筛选。 */
export function HlslReference() {
  const [stage, setStage] = useState('全部');
  const [query, setQuery] = useState('');

  const rows = useMemo(() => [...semantics, ...types].filter((row) => {
    const stageOk = stage === '全部' || row.stage === stage || row.stage === '资源' || row.stage === '矩阵' || row.stage === '计算';
    const textOk = query === '' || `${row.name}${row.stage}${row.type}${row.note}`.toLowerCase().includes(query.toLowerCase());
    return stageOk && textOk;
  }), [stage, query]);

  return (
    <section className="activity" aria-labelledby="hlsl-ref">
      <div className="activity__eyebrow"><span className="activity__spark" aria-hidden="true">✳</span> 附录 B</div>
      <h3 id="hlsl-ref">HLSL 语义与类型速查</h3>
      <p className="activity__prompt">按管线阶段筛选，或直接搜索关键字。语义名<b>大小写敏感</b>，拼错会让对应变量全变成 0。</p>

      <div className="activity__workbench">
        <div className="activity__actions" style={{ marginTop: 0 }}>
          <label className="ctl ctl--number" style={{ margin: 0, flex: '1 1 200px' }}>
            <span className="ctl__label">搜索</span>
            <input type="search" value={query} placeholder="例如 SV_ / float4 / 纹理"
              onChange={(event) => setQuery(event.target.value)} style={{ width: '100%', padding: '7px 8px', border: '1px solid #e0e6dc', borderRadius: 7, fontSize: 11 }} />
          </label>
        </div>
        <div className="ctl__segments" style={{ marginTop: 8 }}>
          {stages.map((item) => <button key={item} type="button" className={`segment ${stage === item ? 'is-active' : ''}`}
            onClick={() => setStage(item)}><span>{item}</span></button>)}
        </div>

        <table style={{ marginTop: 12 }}>
          <thead><tr><th>名称</th><th>阶段</th><th>类型</th><th>说明</th></tr></thead>
          <tbody>
            {rows.map((row) => <tr key={`${row.stage}-${row.name}`}>
              <td><code>{row.name}</code></td><td>{row.stage}</td><td>{row.type}</td><td>{row.note}</td>
            </tr>)}
          </tbody>
        </table>
        {rows.length === 0 && <p className="activity__hint">没有匹配项，换个关键字试试。</p>}
      </div>

      <Readout items={[['当前显示', `${rows.length} 条`]]} />
    </section>
  );
}
