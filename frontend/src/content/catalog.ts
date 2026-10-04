export type SectionLink = { id: string; title: string };

export type Chapter = {
  id: string;
  route: string;
  number: number;
  part: 1 | 2 | 3;
  title: string;
  englishTitle?: string;
  summary: string;
  minutes: number;
  goals: string[];
  sections: SectionLink[];
  samplePath?: string;
};

export const bookParts = [
  { id: 1, title: '数学基础', range: '01—03', description: '把向量、矩阵和变换重新接回图形代码。' },
  { id: 2, title: 'Direct3D 基础', range: '04—11', description: '从设备初始化走到光照、纹理、混合和模板。' },
  { id: 3, title: '进阶主题', range: '12—23', description: '用 D3D12 实现相机、剔除、阴影和角色动画。' },
] as const;

export const chapters: Chapter[] = [
  {
    id: 'ch01', route: 'ch01.html', number: 1, part: 1, title: '向量代数', englishTitle: 'Vector Algebra',
    summary: '用向量描述位置变化、方向、光线和表面。', minutes: 35,
    goals: ['解释向量运算的几何意义', '用点积和叉积处理图形问题', '在 DirectXMath 中安全地加载、计算和存储向量'],
    sections: [
      { id: 's11', title: '1.1 向量' }, { id: 's12', title: '1.2 长度与单位向量' }, { id: 's13', title: '1.3 点积' },
      { id: 's14', title: '1.4 叉积' }, { id: 's15', title: '1.5 点' }, { id: 's16', title: '1.6 DirectXMath 向量库' }, { id: 's17', title: '本章小结' },
    ], samplePath: 'Chapter 1 Vector Algebra/XMVECTOR',
  },
  {
    id: 'ch02', route: 'ch02.html', number: 2, part: 1, title: '矩阵代数', englishTitle: 'Matrix Algebra',
    summary: '读懂矩阵乘法、逆矩阵以及 DirectXMath 的矩阵表示。', minutes: 40,
    goals: ['解释矩阵乘法的行列含义', '判断矩阵是否可逆', '把数学矩阵操作对应到 XMMATRIX'],
    sections: [
      { id: 's21', title: '2.1 矩阵的定义' }, { id: 's22', title: '2.2 矩阵乘法' }, { id: 's23', title: '2.3 转置矩阵' },
      { id: 's24', title: '2.4 单位矩阵' }, { id: 's25', title: '2.5 行列式' }, { id: 's26', title: '2.6 伴随矩阵' },
      { id: 's27', title: '2.7 逆矩阵' }, { id: 's28', title: '2.8 DirectXMath 矩阵' }, { id: 's29', title: '本章小结' },
    ], samplePath: 'Chapter 2 Matrix Algebra/XMMATRIX',
  },
  {
    id: 'ch03', route: 'ch03.html', number: 3, part: 1, title: '变换', englishTitle: 'Transformations',
    summary: '组合缩放、旋转和平移，并区分变换物体与变换坐标系。', minutes: 40,
    goals: ['判断变换的先后顺序', '解释齐次坐标的作用', '用 DirectXMath 构造常见变换'],
    sections: [
      { id: 's31', title: '3.1 线性变换' }, { id: 's32', title: '3.2 仿射变换' }, { id: 's33', title: '3.3 变换的组合' },
      { id: 's34', title: '3.4 坐标系变换' }, { id: 's36', title: '3.6 DirectXMath 变换函数' }, { id: 's37', title: '本章小结' },
    ],
  },
  {
    id: 'ch04', route: 'ch04.html', number: 4, part: 2, title: 'Direct3D 初始化', englishTitle: 'Direct3D Initialization',
    summary: '理解 CPU/GPU 协作、资源状态、Fence 与渲染循环。', minutes: 55,
    goals: ['画出 CPU 提交到 GPU 执行的时序', '解释 Fence 如何防止资源过早复用', '定位初始化和资源转换错误'],
    sections: [
      { id: 's41', title: '4.1 预备知识' }, { id: 's42', title: '4.2 CPU/GPU 交互' }, { id: 's43', title: '4.3 初始化 Direct3D' },
      { id: 's44', title: '4.4 计时与动画' }, { id: 's45', title: '4.5 演示程序框架' }, { id: 's46', title: '4.6 调试 Direct3D 应用' },
    ], samplePath: 'Chapter 4 Direct3D Initialization/Init Direct3D',
  },
  {
    id: 'ch05', route: 'ch05.html', number: 5, part: 2, title: '渲染管线', englishTitle: 'The Rendering Pipeline',
    summary: '沿着一个顶点和像素，走完从输入装配到输出合并的路径。', minutes: 45,
    goals: ['按顺序说出主要管线阶段', '判断裁剪、光栅化和像素着色各自的职责', '从屏幕现象定位可能的阶段'],
    sections: [
      { id: 's51', title: '5.1 3D 视觉的原理' }, { id: 's52', title: '5.2 模型表示' }, { id: 's53', title: '5.3 基本颜色' }, { id: 's54', title: '5.4 渲染管线总览' },
      { id: 's55', title: '5.5 输入装配阶段' }, { id: 's56', title: '5.6 顶点着色器阶段' }, { id: 's58', title: '5.7/5.8 曲面细分与几何着色器' },
      { id: 's59', title: '5.9 裁剪' }, { id: 's510', title: '5.10 光栅化阶段' }, { id: 's511', title: '5.11 像素着色器阶段' },
      { id: 's512', title: '5.12 输出合并阶段' }, { id: 's513', title: '本章小结' },
    ],
  },
  {
    id: 'ch06', route: 'ch06.html', number: 6, part: 2, title: '用 Direct3D 绘图', englishTitle: 'Drawing in Direct3D',
    summary: '从顶点缓冲和着色器绑定开始，画出第一个立方体。', minutes: 60,
    goals: ['读懂顶点布局与索引缓冲', '追踪根签名和常量缓冲绑定', '解释 PSO 如何组合绘制状态'],
    sections: [
      { id: 's61', title: '6.1 顶点与输入布局' }, { id: 's62', title: '6.2 顶点缓冲' }, { id: 's63', title: '6.3 索引与索引缓冲' },
      { id: 's66', title: '6.6 常量缓冲' }, { id: 's67', title: '6.7 编译着色器' }, { id: 's68', title: '6.8 光栅器状态' },
      { id: 's69', title: '6.9 管线状态对象' }, { id: 's611', title: '6.11 Box 演示' }, { id: 's612', title: '本章小结' },
    ], samplePath: 'Chapter 6 Drawing in Direct3D/Box',
  },
  {
    id: 'ch07', route: 'ch07.html', number: 7, part: 2, title: '用 Direct3D 绘图（二）', englishTitle: 'Drawing in Direct3D Part II',
    summary: '把帧资源、渲染项和几何数据组织成可扩展的示例程序。', minutes: 50,
    goals: ['解释每帧独立资源的用途', '从网格参数推导顶点和索引', '追踪 Pass 常量到着色器'],
    sections: [
      { id: 's71', title: '7.1 帧资源' }, { id: 's72', title: '7.2 渲染项' }, { id: 's73', title: '7.3 Pass 常量' },
      { id: 's74', title: '7.4 形状几何' }, { id: 's75', title: '7.5 Shapes 演示' }, { id: 's76', title: '7.6 根签名进阶' },
      { id: 's77', title: '7.7 Land 与 Waves 演示' }, { id: 's78', title: '本章小结' },
    ], samplePath: 'Chapter 7 Drawing in Direct3D Part II',
  },
  {
    id: 'ch08', route: 'ch08.html', number: 8, part: 2, title: '光照', englishTitle: 'Lighting',
    summary: '把法线、材质和光源组合成可解释的表面明暗。', minutes: 55,
    goals: ['拆分环境光、漫反射和镜面光', '判断法线变换为何需要特殊处理', '关联光照公式与 HLSL 数据'],
    sections: [
      { id: 's81', title: '8.1 光与材质的交互' }, { id: 's82', title: '8.2 法向量' }, { id: 's84', title: '8.4 朗伯余弦定律' },
      { id: 's85', title: '8.5 漫反射光' }, { id: 's86', title: '8.6 环境光' }, { id: 's87', title: '8.7 镜面光' },
      { id: 's89', title: '8.9 实现材质' }, { id: 's810', title: '8.10–8.12 三种光源' }, { id: 's813', title: '8.13 光照实现' }, { id: 's814', title: '本章小结' },
    ], samplePath: 'Chapter 8 Lighting/LitColumns',
  },
  {
    id: 'ch09', route: 'ch09.html', number: 9, part: 2, title: '纹理', englishTitle: 'Texturing',
    summary: '从 UV 到采样器，解释纹理为何会拉伸、闪烁或重复。', minutes: 45,
    goals: ['读懂 UV 映射', '选择过滤与寻址模式', '解释 mipmap 如何改善远处纹理'],
    sections: [
      { id: 's92', title: '9.2 纹理坐标' }, { id: 's94', title: '9.4 创建并启用纹理' }, { id: 's95', title: '9.5 过滤器' },
      { id: 's96', title: '9.6 寻址模式' }, { id: 's97', title: '9.7 采样器' }, { id: 's99', title: '9.9 Crate 演示' },
      { id: 's910', title: '9.10 纹理变换' }, { id: 's911', title: '9.11 Land Tex 与 Waves 演示' }, { id: 's912', title: '本章小结' },
    ], samplePath: 'Chapter 9 Texturing',
  },
  {
    id: 'ch10', route: 'ch10.html', number: 10, part: 2, title: '混合', englishTitle: 'Blending',
    summary: '用混合方程解释透明、裁剪像素和雾效。', minutes: 40,
    goals: ['计算源色与目标色的混合结果', '区分 alpha 混合与 alpha 裁剪', '说明混合状态控制的操作'],
    sections: [
      { id: 's101', title: '10.1 混合方程' }, { id: 's103', title: '10.3 混合因子' }, { id: 's104', title: '10.4 混合状态' },
      { id: 's105', title: '10.5 例子' }, { id: 's106', title: '10.6 Alpha 通道' }, { id: 's107', title: '10.7 裁剪像素' },
      { id: 's108', title: '10.8 雾效' }, { id: 's109', title: '本章小结' },
    ], samplePath: 'Chapter 10 Blending/BlendDemo',
  },
  {
    id: 'ch11', route: 'ch11.html', number: 11, part: 2, title: '模板测试', englishTitle: 'Stenciling',
    summary: '用模板缓冲限制像素绘制区域，实现平面镜和阴影。', minutes: 45,
    goals: ['逐步追踪模板测试', '排出镜面渲染 pass 顺序', '解释反射后的绕序与阴影伪影'],
    sections: [
      { id: 's111', title: '11.1 深度/模板格式与清除' }, { id: 's112', title: '11.2 模板测试' },
      { id: 's113', title: '11.3 描述深度/模板状态' }, { id: 's114', title: '11.4 平面镜实现' },
      { id: 's115', title: '11.5 平面阴影实现' }, { id: 's116', title: '本章小结' },
    ], samplePath: 'Chapter 11 Stenciling/StencilDemo',
  },
  {
    id: 'ch12', route: 'ch12.html', number: 12, part: 3, title: '几何着色器', englishTitle: 'The Geometry Shader',
    summary: '认识几何着色器、树广告牌、纹理数组和 Alpha-to-Coverage。', minutes: 40,
    goals: ['描述 GS 的输入和输出图元', '解释广告牌如何朝向相机', '区分纹理数组与单张纹理'],
    sections: [
      { id: 's121', title: '12.1 编写几何着色器' }, { id: 's122', title: '12.2 树广告牌演示' },
      { id: 's123', title: '12.3 纹理数组' }, { id: 's124', title: '12.4 Alpha-to-Coverage' }, { id: 's125', title: '本章小结' },
    ], samplePath: 'Chapter 12 The Geometry Shader/TreeBillboards',
  },
  {
    id: 'ch13', route: 'ch13.html', number: 13, part: 3, title: '计算着色器', englishTitle: 'The Compute Shader',
    summary: '从线程 ID 到共享内存，拆解一次 GPU 图像模糊。', minutes: 50,
    goals: ['计算 Dispatch 中的线程坐标', '解释线程组内同步边界', '比较直接滤波与分离滤波'],
    sections: [
      { id: 's131', title: '13.1 线程与线程组' }, { id: 's132', title: '13.2 一个简单的计算着色器' },
      { id: 's133', title: '13.3 数据输入输出资源' }, { id: 's134', title: '13.4 线程 ID 系统值' },
      { id: 's135', title: '13.5 Append 与 Consume 缓冲' }, { id: 's136', title: '13.6 共享内存与同步' },
      { id: 's137', title: '13.7 Blur 演示' }, { id: 's139', title: '本章小结' },
    ], samplePath: 'Chapter 13 The Compute Shader',
  },
  {
    id: 'ch14', route: 'ch14.html', number: 14, part: 3, title: '曲面细分阶段', englishTitle: 'The Tessellation Stages',
    summary: '用 Hull、固定功能镶嵌器和 Domain 阶段细分曲面。', minutes: 45,
    goals: ['说明三个细分阶段如何协作', '预测细分因子对网格的影响', '读懂三次贝塞尔 patch'],
    sections: [
      { id: 's141', title: '14.1 细分图元类型' }, { id: 's142', title: '14.2 外壳着色器' },
      { id: 's143', title: '14.3 镶嵌器' }, { id: 's144', title: '14.4 域着色器' },
      { id: 's145', title: '14.5 四边形细分' }, { id: 's146', title: '14.6 三次贝塞尔四边形' }, { id: 's147', title: '本章小结' },
    ], samplePath: 'Chapter 14 The Tessellation Stages',
  },
  {
    id: 'ch15', route: 'ch15.html', number: 15, part: 3, title: '第一人称相机与动态索引', englishTitle: 'First Person Camera and Dynamic Indexing',
    summary: '把视图变换封装为可操作相机，并按材质动态选择资源。', minutes: 45,
    goals: ['追踪相机局部轴与视图矩阵', '解释相机移动如何更新状态', '读懂动态资源索引'],
    sections: [
      { id: 's151', title: '15.1 视图变换回顾' }, { id: 's152', title: '15.2 Camera 类' },
      { id: 's153', title: '15.3 关键方法实现' }, { id: 's155', title: '15.5 动态索引' }, { id: 's156', title: '本章小结' },
    ], samplePath: 'Chapter 15 First Person Camera and Dynamic Indexing/CameraAndDynamicIndexing',
  },
  {
    id: 'ch16', route: 'ch16.html', number: 16, part: 3, title: '实例化与视锥剔除', englishTitle: 'Instancing and Frustum Culling',
    summary: '高效绘制大量物体，并跳过相机看不到的对象。', minutes: 45,
    goals: ['解释硬件实例化减少了什么开销', '用包围体测试平面关系', '预测视锥变化对可见数的影响'],
    sections: [
      { id: 's161', title: '16.1 硬件实例化' }, { id: 's162', title: '16.2 包围体与视锥' },
      { id: 's163', title: '16.3 视锥剔除' }, { id: 's164', title: '本章小结' },
    ], samplePath: 'Chapter 16 Instancing and Frustum Culling/InstancingAndCulling',
  },
  {
    id: 'ch17', route: 'ch17.html', number: 17, part: 3, title: '拾取', englishTitle: 'Picking',
    summary: '把屏幕点击变成射线，再找到射线命中的三角形。', minutes: 40,
    goals: ['从屏幕坐标构造拾取射线', '在空间间变换射线', '比较多个三角形的命中距离'],
    sections: [
      { id: 's171', title: '17.1 屏幕点到投影窗口' }, { id: 's172', title: '17.2 世界/本地空间拾取射线' },
      { id: 's173', title: '17.3 射线与网格求交' }, { id: 's174', title: '17.4 演示程序' }, { id: 's175', title: '本章小结' },
    ], samplePath: 'Chapter 17 Picking/Picking',
  },
  {
    id: 'ch18', route: 'ch18.html', number: 18, part: 3, title: '立方体贴图', englishTitle: 'Cube Mapping',
    summary: '用立方体贴图呈现天空、反射和动态环境。', minutes: 40,
    goals: ['从 3D 方向选择立方体贴图面', '从法线和视线求反射方向', '说明动态立方体贴图的更新代价'],
    sections: [
      { id: 's181', title: '18.1 立方体贴图' }, { id: 's183', title: '18.3 天空绘制' },
      { id: 's184', title: '18.4 模拟反射' }, { id: 's185', title: '18.5 动态立方体贴图' }, { id: 's186', title: '本章小结' },
    ], samplePath: 'Chapter 18 Cube Mapping',
  },
  {
    id: 'ch19', route: 'ch19.html', number: 19, part: 3, title: '法线贴图', englishTitle: 'Normal Mapping',
    summary: '在不增加网格细节的情况下，用贴图改变光照法线。', minutes: 45,
    goals: ['解释切线空间的三个轴', '把法线从贴图空间变换到着色空间', '追踪 HLSL 中法线贴图的采样和缩放'],
    sections: [
      { id: 's191', title: '19.1 动机' }, { id: 's192', title: '19.2 法线图' }, { id: 's193', title: '19.3 纹理/切线空间' },
      { id: 's194', title: '19.4 顶点切线空间' }, { id: 's195', title: '19.5 切线空间与物体空间' },
      { id: 's196', title: '19.6 法线贴图着色器代码' }, { id: 's197', title: '本章小结' },
    ], samplePath: 'Chapter 19 Normal Mapping/NormalMap',
  },
  {
    id: 'ch20', route: 'ch20.html', number: 20, part: 3, title: '阴影贴图', englishTitle: 'Shadow Mapping',
    summary: '从光源深度图推导阴影，并用偏移和 PCF 处理伪影。', minutes: 50,
    goals: ['说明阴影贴图的两次绘制', '比较场景深度与光源深度', '识别阴影痤疮、悬浮和锯齿'],
    sections: [
      { id: 's201', title: '20.1 渲染场景深度' }, { id: 's202', title: '20.2 正交投影' },
      { id: 's203', title: '20.3 投影纹理坐标' }, { id: 's204', title: '20.4 阴影贴图' },
      { id: 's205', title: '20.5 大 PCF 核' }, { id: 's206', title: '本章小结' },
    ], samplePath: 'Chapter 20 Shadow Mapping/Shadows',
  },
  {
    id: 'ch21', route: 'ch21.html', number: 21, part: 3, title: '环境光遮蔽', englishTitle: 'Ambient Occlusion',
    summary: '用遮挡采样增加接触区域的深度感，并理解 SSAO 的限制。', minutes: 40,
    goals: ['把遮蔽理解为半球可见比例', '说明 SSAO 怎样用深度缓冲近似遮挡', '识别噪点与屏幕空间伪影'],
    sections: [
      { id: 's211', title: '21.1 射线法环境光遮蔽' }, { id: 's212', title: '21.2 屏幕空间环境光遮蔽' }, { id: 's213', title: '本章小结' },
    ], samplePath: 'Chapter 21 Ambient Occlusion/Ssao',
  },
  {
    id: 'ch22', route: 'ch22.html', number: 22, part: 3, title: '四元数', englishTitle: 'Quaternions',
    summary: '用单位四元数表达旋转，并沿短弧插值姿态。', minutes: 45,
    goals: ['把单位四元数理解为旋转', '解释 q 与 −q 表示相同旋转', '选择合适的球面插值路径'],
    sections: [
      { id: 's221', title: '22.1 复数回顾' }, { id: 's222', title: '22.2 四元数代数' },
      { id: 's223', title: '22.3 单位四元数与旋转' }, { id: 's224', title: '22.4 四元数插值' },
      { id: 's225', title: '22.5 DirectXMath 四元数函数' }, { id: 's226', title: '22.6 旋转演示' }, { id: 's227', title: '本章小结' },
    ], samplePath: 'Chapter 22 Quaternions/QuatDemo',
  },
  {
    id: 'ch23', route: 'ch23.html', number: 23, part: 3, title: '角色动画', englishTitle: 'Character Animation',
    summary: '从骨骼层级和蒙皮权重走到角色动画播放。', minutes: 50,
    goals: ['从父子层级计算骨骼变换', '解释绑定姿势与蒙皮矩阵', '追踪顶点的骨骼索引和权重'],
    sections: [
      { id: 's231', title: '23.1 层级框架' }, { id: 's232', title: '23.2 蒙皮网格' },
      { id: 's233', title: '23.3 顶点混合' }, { id: 's234', title: '23.4 从文件加载动画数据' },
      { id: 's235', title: '23.5 角色动画演示' }, { id: 's236', title: '本章小结' },
    ], samplePath: 'Chapter 23 Character Animation/SkinnedMesh',
  },
];

export const chapterByRoute = new Map(chapters.map((chapter) => [chapter.route, chapter]));
export const chapterById = new Map(chapters.map((chapter) => [chapter.id, chapter]));

export function sampleUrl(chapter: Chapter): string | undefined {
  if (!chapter.samplePath) return undefined;
  return `https://github.com/d3dcoder/d3d12book/tree/master/${chapter.samplePath.split('/').map(encodeURIComponent).join('/')}`;
}
