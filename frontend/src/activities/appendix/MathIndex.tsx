import { useState } from 'react';
import { pageHref } from '@/content/routes';

type Topic = { symptom: string; chapter: string; route: string; section: string; reason: string };

const topics: Topic[] = [
  { symptom: '物体转了 180°，或者前后颠倒', chapter: '第 1 章 向量', route: 'ch01.html', section: '#s11', reason: '左手系与右手系搞混了。Direct3D 是左手系，+z 指向屏幕内部。' },
  { symptom: '法线看起来不对，缩放后光照明显偏了', chapter: '第 8 章 光照', route: 'ch08.html', section: '#s82', reason: '非均匀缩放后必须用逆转置矩阵变换法线。' },
  { symptom: '物体位置跑掉了 / 平移量被缩放', chapter: '第 3 章 变换', route: 'ch03.html', section: '#s33', reason: '矩阵相乘顺序写反了。行向量下 v · S · R · T 是「先缩放、再旋转、最后平移」。' },
  { symptom: '画面随机闪烁、撕裂，重跑一次又好了', chapter: '第 4 章 初始化', route: 'ch04.html', section: '#s42', reason: 'CPU 改写了 GPU 还在用的资源。帧资源数量必须大于 CPU 领先帧数。' },
  { symptom: '全黑，但清屏色不是黑色', chapter: '第 4 章 初始化', route: 'ch04.html', section: '#s43', reason: '资源屏障缺失，或忘了 RSSetViewports（D3D12 没有默认视口）。' },
  { symptom: '物体不见了，Debug Layer 报状态不匹配', chapter: '第 5 章 管线', route: 'ch05.html', section: '#s510', reason: '绕序翻转后被背面剔除。改顶点顺序就要改 CullMode / FrontCounterClockwise。' },
  { symptom: '想理解顶点着色器输出到底是什么', chapter: '第 5 章 管线', route: 'ch05.html', section: '#s56', reason: 'VS 输出齐次裁剪空间坐标，透视除法在裁剪之后。' },
  { symptom: '顶点数据全变成 0，或者颜色串了', chapter: '第 6 章 绘图', route: 'ch06.html', section: '#s61', reason: '输入布局的语义名或字节偏移写错。语义大小写敏感。' },
  { symptom: '立方体形状扭曲（不是整体旋转）', chapter: '第 6 章 绘图', route: 'ch06.html', section: '#s611', reason: '矩阵上传时忘了转置：DirectXMath 行主序，HLSL 默认列主序。' },
  { symptom: '物体沉在地下 / 一半被切掉', chapter: '第 7 章 变换格网', route: 'ch07.html', section: '#s77', reason: '顶点数与索引数算错：(m+1)(n+1) 个顶点、m·n·6 个索引。' },
  { symptom: '球看起来是平的、没有立体感', chapter: '第 8 章 光照', route: 'ch08.html', section: '#s85', reason: '只用了环境光。立体感来自漫反射（朗伯余弦定律）。' },
  { symptom: '画面一半亮一半黑、明暗像台阶', chapter: '第 8 章 光照', route: 'ch08.html', section: '#s84', reason: '漫反射忘了 max(L·n, 0)，背面被照亮。' },
  { symptom: '纹理上下颠倒', chapter: '第 9 章 纹理', route: 'ch09.html', section: '#s92', reason: 'v 方向反了。D3D 原点在左上角、v 向下。' },
  { symptom: '远处纹理闪烁 / 摩尔纹', chapter: '第 9 章 纹理', route: 'ch09.html', section: '#s95', reason: '缩小采样率不足。用 mipmap 与各向异性过滤。' },
  { symptom: '半透明物体前后关系错乱', chapter: '第 10 章 混合', route: 'ch10.html', section: '#s101', reason: '混合依赖绘制顺序：先画不透明物体，半透明按从后往前排序。' },
  { symptom: '倒影穿墙 / 倒影消失', chapter: '第 11 章 模板', route: 'ch11.html', section: '#s114', reason: '镜面渲染的四个 pass 顺序不对，或没有反转绕序。' },
  { symptom: '树叶边缘锯齿，且排序开销很大', chapter: '第 12 章 几何着色器', route: 'ch12.html', section: '#s124', reason: '用 clip + Alpha-to-Coverage 代替 alpha 混合（必须同时开 MSAA）。' },
  { symptom: '计算着色器读到别人的旧数据', chapter: '第 13 章 计算着色器', route: 'ch13.html', section: '#s136', reason: '共享内存读写之间漏了 GroupMemoryBarrierWithGroupSync()。' },
  { symptom: '地形边缘三角形数量对不上', chapter: '第 14 章 曲面细分', route: 'ch14.html', section: '#s142', reason: '边缘因子与内部因子不匹配，相邻 patch 出现裂缝。' },
  { symptom: '相机跑偏 / 长时间运行后歪掉', chapter: '第 15 章 相机', route: 'ch15.html', section: '#s153', reason: '每帧累乘旋转矩阵导致漂移。改用基轴（right/up/look）重建。' },
  { symptom: '帧率上不去，Draw call 数量很高', chapter: '第 16 章 实例化', route: 'ch16.html', section: '#s161', reason: '可以先用硬件实例化把同几何的物体合成一次绘制。' },
  { symptom: '拾取选中了被遮挡的物体', chapter: '第 17 章 拾取', route: 'ch17.html', section: '#s173', reason: '没有比较 t，必须取视线前方最近的交点。' },
  { symptom: '反射随相机移动「跟不上」', chapter: '第 18 章 立方体贴图', route: 'ch18.html', section: '#s185', reason: '静态环境贴图是预过滤的；需要实时正确就用动态立方体贴图。' },
  { symptom: '凹凸感很假，高光浮在表面', chapter: '第 19 章 法线贴图', route: 'ch19.html', section: '#s196', reason: '法线强度过大，或忘了 2·c−1 解包、切线没有逐顶点传入。' },
  { symptom: '地面长满黑点条纹 / 阴影脱离物体', chapter: '第 20 章 阴影贴图', route: 'ch20.html', section: '#s205', reason: '前者偏移太小，后者偏移太大；锯齿要靠 PCF。' },
  { symptom: '屏幕全是颗粒噪点 / 假遮挡', chapter: '第 21 章 环境光遮蔽', route: 'ch21.html', section: '#s212', reason: '前者采样数太少，后者半径太大。' },
  { symptom: '动画里物体会「转一大圈再回来」', chapter: '第 22 章 四元数', route: 'ch22.html', section: '#s224', reason: '四元数插值前忘了判断 a·b < 0 并取反，没走短弧。' },
  { symptom: '关节处肢体忽长忽短', chapter: '第 23 章 角色动画', route: 'ch23.html', section: '#s233', reason: '蒙皮权重之和不为 1。' },
];

/** 附录 C：「缺哪段数学，返回哪章」索引。 */
export function MathIndex() {
  const [query, setQuery] = useState('');
  const [onlyMath, setOnlyMath] = useState(false);

  const mathChapters = new Set(['ch01.html', 'ch02.html', 'ch03.html', 'ch22.html']);
  const rows = topics.filter((topic) => {
    const textOk = query === '' || `${topic.symptom}${topic.chapter}${topic.reason}`.toLowerCase().includes(query.toLowerCase());
    return textOk && (!onlyMath || mathChapters.has(topic.route));
  });

  return (
    <section className="activity" aria-labelledby="math-index">
      <div className="activity__eyebrow"><span className="activity__spark" aria-hidden="true">✳</span> 附录 C</div>
      <h3 id="math-index">缺哪段数学，返回哪章</h3>
      <p className="activity__prompt">按症状反查。勾选「只看数学相关」可以筛出第 1—3 章与第 22 章。</p>

      <div className="activity__workbench">
        <label className="ctl ctl--number" style={{ marginTop: 0 }}>
          <span className="ctl__label">症状 / 关键词</span>
          <input type="search" value={query} placeholder="例如 闪烁 / 顺序 / 权重 / 绕序"
            onChange={(event) => setQuery(event.target.value)} style={{ width: '100%', padding: '7px 8px', border: '1px solid #e0e6dc', borderRadius: 7, fontSize: 11 }} />
        </label>
        <label className="ctl ctl--toggle" style={{ marginTop: 8 }}>
          <input type="checkbox" checked={onlyMath} onChange={(event) => setOnlyMath(event.target.checked)} />
          <span>只看数学相关章节</span>
        </label>

        <ul className="order-list" style={{ marginTop: 10 }}>
          {rows.map((topic) => <li key={topic.symptom}>
            <span className="order-list__index" aria-hidden="true">·</span>
            <span className="order-list__text">
              <b>{topic.symptom}</b>
              <p style={{ margin: '3px 0 5px', fontSize: 10.5, color: '#6b7a6e', lineHeight: 1.7 }}>{topic.reason}</p>
              <a href={pageHref(topic.route, topic.section)} style={{ color: '#2f6b47', fontSize: 10.5, fontWeight: 600 }}>{topic.chapter} →</a>
            </span>
          </li>)}
        </ul>
        {rows.length === 0 && <p className="activity__hint">没有匹配项，换个说法试试（例如「黑屏」「抖动」「太慢」）。</p>}
      </div>
    </section>
  );
}
