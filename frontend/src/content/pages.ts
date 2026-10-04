import type { SectionLink } from './catalog';

export type ReferencePage = { route: string; title: string; description: string; sections: SectionLink[] };

export const referencePages: Record<'intro.html' | 'appendix.html', ReferencePage> = {
  'intro.html': {
    route: 'intro.html',
    title: '导读：从哪里开始',
    description: '准备环境、确认基础，并把这本书放进一条能完成的学习路径。',
    sections: [
      { id: 'start-goals', title: '这本书会教会什么' },
      { id: 'start-background', title: '你的起点' },
      { id: 'start-tools', title: '工具与工程准备' },
      { id: 'start-route', title: '学习路线' },
    ],
  },
  'appendix.html': {
    route: 'appendix.html',
    title: '附录与速查',
    description: '需要时再查 Windows、HLSL、几何基础和延伸资料。',
    sections: [
      { id: 'appendix-a', title: '附录 A · Windows 编程' },
      { id: 'appendix-b', title: '附录 B · HLSL 速查' },
      { id: 'appendix-c', title: '附录 C · 数学与几何索引' },
      { id: 'appendix-d', title: '附录 D · 习题提示' },
      { id: 'appendix-e', title: '附录 E · 延伸阅读' },
    ],
  },
};
